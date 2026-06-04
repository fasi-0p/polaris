import { generateText, Output } from "ai";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { google } from "@ai-sdk/google"; // Swapped provider

const suggestionSchema = z.object({
  suggestion: z
    .string()
    .describe(
      "The code to insert at cursor, or empty string if no completion needed"
    ),
});

const SUGGESTION_PROMPT = `You are an elite, low-latency code completion engine. Your job is to suggest the exact code that should be inserted at the cursor position, or return ABSOLUTELY NOTHING if completion is unnecessary.

=== CONTEXT ===
File Name: {fileName}
Line Number: {lineNumber}

[Code Before Cursor]
{previousLines}
{textBeforeCursor}

[Current Line Draft]
{currentLine}

[Cursor Position]

[Code After Cursor]
{textAfterCursor}
{nextLines}

[Full File Reference]
{code}
=== END CONTEXT ===

=== CRITICAL RULES ===
You must evaluate these conditions in order before generating any text:

1. CHECK NEXT LINES: Look at [Code After Cursor]. If the code immediately following the cursor already contains the logic the user is trying to write, you must output an empty string. Do not duplicate existing code.
2. CHECK COMPLETION: If [Code Before Cursor] ends with a complete statement (e.g., a semicolon ';', a closing brace '}', or a closing parenthesis ')') and no new expression has started, output an empty string.
3. NO COMMENTARY: Do not include markdown code blocks (\`\`\`), do not include explanations, and do not write conversational text. Your entire response must ONLY be the code to insert, or a completely blank response.

=== OUTPUT FORMAT ===
If a suggestion is needed, output the exact string to insert at [Cursor Position] and nothing else.
If conditions 1 or 2 are met, output ABSOLUTELY NOTHING (zero characters).`;

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 },
      );
    }

    const {
      fileName,
      code,
      currentLine,
      previousLines,
      textBeforeCursor,
      textAfterCursor,
      nextLines,
      lineNumber,
    } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: "Code is required" },
        { status: 400 }
      );
    }

    // Fixed: Added {currentLine} and {lineNumber} to the prompt context so these replacements do work
    const prompt = SUGGESTION_PROMPT
      .replace("{fileName}", fileName || "unknown")
      .replace("{code}", code)
      .replace("{currentLine}", currentLine || "")
      .replace("{previousLines}", previousLines || "")
      .replace("{textBeforeCursor}", textBeforeCursor || "")
      .replace("{textAfterCursor}", textAfterCursor || "")
      .replace("{nextLines}", nextLines || "")
      .replace("{lineNumber}", lineNumber ? lineNumber.toString() : "0");

    const { output } = await generateText({
      // Swapped to Google's highly efficient, free-credits eligible tier
      model: google("gemini-2.5-flash-lite"), 
      output: Output.object({ schema: suggestionSchema }),
      prompt,
    });

    return NextResponse.json({ suggestion: output.suggestion });
  } catch (error) {
    console.error("Suggestion error: ", error);
    return NextResponse.json(
      { error: "Failed to generate suggestion" },
      { status: 500 },
    );
  }
}



//DEEPSEEK API BASED
// import { generateText, Output } from "ai";
// import { auth } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";
// import { z } from "zod";
// import { deepseek } from "@ai-sdk/deepseek"; // Swapped provider to DeepSeek

// const suggestionSchema = z.object({
//   suggestion: z
//     .string()
//     .describe(
//       "The exact code snippet to insert at the cursor position. Return an empty string if no completion is needed."
//     ),
// });

// // Prompt engineered specifically for DeepSeek's coding strengths
// const SUGGESTION_PROMPT = `You are an elite, low-latency code completion engine operating in a Fill-in-the-Middle (FIM) context. Your job is to analyze the provided code structure and return the exact code that should be inserted at the cursor position.

// <file_context>
// File Name: {fileName}
// Line Number: {lineNumber}
// </file_context>

// <code_before_cursor>
// {previousLines}
// {textBeforeCursor}
// </code_before_cursor>

// <current_line_draft>
// {currentLine}
// </current_line_draft>

// [CURSOR IS HERE]

// <code_after_cursor>
// {textAfterCursor}
// {nextLines}
// </code_after_cursor>

// <full_file_reference>
// {code}
// </full_file_reference>

// CRITICAL RULES FOR GENERATION:
// 1. PREVENT DUPLICATION: Analyze <code_after_cursor>. If the code immediately following the cursor already contains or completes the logic the user is typing, you must return an empty string "" for the suggestion. Do not repeat existing tokens.
// 2. CHECK FOR COMPLETENESS: If <code_before_cursor> ends with a structurally complete statement (e.g., a trailing semicolon, closing brace, or bracket) and no new expression or block has been initiated, provide an empty string "".
// 3. NO EXPLANATIONS: Do not include markdown blocks, commentary, or natural language. Provide only the code insertion string inside the structured JSON format.`;

// export async function POST(request: Request) {
//   try {
//     const { userId } = await auth();

//     if (!userId) {
//       return NextResponse.json(
//         { error: "Unauthorized" },
//         { status: 403 },
//       );
//     }

//     const {
//       fileName,
//       code,
//       currentLine,
//       previousLines,
//       textBeforeCursor,
//       textAfterCursor,
//       nextLines,
//       lineNumber,
//     } = await request.json();

//     if (!code) {
//       return NextResponse.json(
//         { error: "Code is required" },
//         { status: 400 }
//       );
//     }

//     const prompt = SUGGESTION_PROMPT
//       .replace("{fileName}", fileName || "unknown")
//       .replace("{code}", code)
//       .replace("{currentLine}", currentLine || "")
//       .replace("{previousLines}", previousLines || "")
//       .replace("{textBeforeCursor}", textBeforeCursor || "")
//       .replace("{textAfterCursor}", textAfterCursor || "")
//       .replace("{nextLines}", nextLines || "")
//       .replace("{lineNumber}", lineNumber ? lineNumber.toString() : "0");

//     const { output } = await generateText({
//       // Using deepseek-coder which is fast and incredibly accurate for autocompletion
//       model: deepseek("deepseek-coder"), 
//       output: Output.object({ schema: suggestionSchema }),
//       prompt,
//       // Optional: Lower temperature ensures deterministic code snippets
//       temperature: 0.1, 
//     });

//     return NextResponse.json({ suggestion: output.suggestion });
//   } catch (error) {
//     console.error("Suggestion error: ", error);
//     return NextResponse.json(
//       { error: "Failed to generate suggestion" },
//       { status: 500 },
//     );
//   }
// }