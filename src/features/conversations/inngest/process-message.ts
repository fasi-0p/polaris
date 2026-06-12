import {createAgent, gemini} from '@inngest/agent-kit'
import { Id } from "../../../../convex/_generated/dataModel";
import { inngest } from "@/inngest/client";
import { NonRetriableError } from "inngest";
import {convex} from '@/lib/convex-client'
import { api } from "../../../../convex/_generated/api";
import { CODING_AGENT_SYSTEM_PROMPT, TITLE_GENERATOR_SYSTEM_PROMPT } from "./constants";
import { DEFAULT_CONVERSATION_TITLE } from "../constants";
import { createReadFilesTool } from "./tools/read-files";


interface MessageEvent {
  messageId: Id<"messages">;
  conversationId: Id<"conversations">;
  projectId: Id<"projects">;
  message: string
}; 

export const processMessage = inngest.createFunction(
  {
    id: "process-message",
    cancelOn: [
      {
        event: "message/cancel",
        if: "event.data.messageId == async.data.messageId",
      },
    ],
    onFailure: async({event, step})=>{
      const {messageId} = event.data.event.data  as MessageEvent
      const internalKey = process.env.POLARIS_CONVEX_INTERNAL_KEY;

      if (internalKey){
        await step.run('update-message-on-failure', async()=>{
          await convex.mutation(api.system.updateMessageContent, {
            internalKey, messageId, content: "My bad, i encountered an error while processing your request. try again maybe?"
          })
        })
      }
    }
  },
  {
    event: "message/sent",
  },
  async ({event, step }) => {
    const{messageId, conversationId, projectId, message}=event.data as MessageEvent
    
    const internalKey = process.env.POLARIS_CONVEX_INTERNAL_KEY;
    if (!internalKey) {
      throw new NonRetriableError("Internal key not configured");
    }

    //todo check if its really needed 
    await step.sleep('wait-for-db-sync', '1s')

    //get convo for title gen check
    const conversation  =await step.run('get-conversation', async()=>{
      return await convex.query(api.system.getConversationById, {
        conversationId,
        internalKey,
      })
    })
    if (!conversation) throw new NonRetriableError('Conversation not found ')

    const recentMessages = await step.run('get-recent-messages', async()=>{
      return await convex.query(api.system.getRecentMessages, {
        internalKey,
        conversationId,
        limit: 10,
      })
    })

    //build system prompt with convo history by excluding current processing message
    let systemPrompt = CODING_AGENT_SYSTEM_PROMPT

    //filter out current processing message and empty messages
    const contextMessages = recentMessages.filter((msg)=> msg._id!==messageId && msg.content.trim()!!=='')
    if (contextMessages.length>0){
      const historyText = contextMessages.map((msg)=> `${msg.role.toUpperCase()}: ${msg.content}`).join("\n\n")

      systemPrompt += `\n\n## Previous Conversation (for context only - do NOT repeat these responses):\n${historyText}\n\n## Current Request:\nRespond ONLY to the user's new message below. Do not repeat or reference your previous responses.`;
    }

    //generate convo title
    const shouldGenerateTitle= conversation.title===DEFAULT_CONVERSATION_TITLE 
    if (shouldGenerateTitle) {
       const titleAgent = createAgent({
        name: "title-generator",
        system: TITLE_GENERATOR_SYSTEM_PROMPT,
        model: gemini({
          model: "gemini-2.5-flash-lite",
          apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
        }),
      });

       const { output } = await titleAgent.run(message, { step });

       const textMessage = output.find(
        (m) => m.type === "text" && m.role === "assistant"
      );

      if (textMessage?.type === "text") {
         const title = 
          typeof textMessage.content === "string"
            ? textMessage.content.trim()
            : textMessage.content
              .map((c) => c.text)
              .join("")
              .trim();

        if (title) {
          await step.run("update-conversation-title", async () => {
            await convex.mutation(api.system.updateConversationTitle, {
              internalKey,
              conversationId,
              title,
            });
          });
        }
      }
    }

    //coding agent with file tools
    const codingAgent = createAgent({
      name: 'polaris',
      description: "An expert AI coding assistant",
      system: systemPrompt,
      model: gemini({
          model: "gemini-2.5-flash-lite",
          apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
        }),
        tools:[
          createReadFilesTool({internalKey })
        ]
    })

    await step.run("update-assistant-message", async () => {
        await convex.mutation(api.system.updateMessageContent, {
            internalKey,
            messageId,
            content: "AI processed this message (TODO)",
        });
        });
  }
);