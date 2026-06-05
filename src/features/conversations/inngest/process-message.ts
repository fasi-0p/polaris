import { Id } from "../../../../convex/_generated/dataModel";
import { inngest } from "@/inngest/client";
import { NonRetriableError } from "inngest";
import {convex} from '@/lib/convex-client'
import { api } from "../../../../convex/_generated/api";


interface MessageEvent {
  messageId: Id<"messages">;
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
      const {messageId} = event.data.event.data as MessageEvent
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
    const{messageId}=event.data as MessageEvent
    const internalKey = process.env.POLARIS_CONVEX_INTERNAL_KEY;
    if (!internalKey) {
      throw new NonRetriableError("Internal key not configured");
    }

    await step.sleep('wait-for-ai-processing', '5s')
    await step.run("update-assistant-message", async () => {
        await convex.mutation(api.system.updateMessageContent, {
            internalKey,
            messageId,
            content: "AI processed this message (TODO)",
        });
        });
  }
);