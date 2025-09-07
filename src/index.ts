import { llm, testLLMConnection } from "./llm-model";
import { createDynamicTemplate, invokeWithTemplate } from "./prompt";
import { chatHistory } from "./chat-history";
import { bot, setupGracefulShutdown, errorHandler } from "./telegraf";
import { message } from "telegraf/filters";

async function main() {
  try {
    const llmConnected = await testLLMConnection();
    if (!llmConnected) {
      console.error("LLM connection failed. Exiting.");
      process.exit(1);
    }

    bot.start(async (ctx) => {
      const userId = ctx.from?.id;
      if (userId) {
        chatHistory.clearUserHistory(userId);
      }

      const welcomeMessage = `🤖 Welcome to the Coding Assistant Bot!

I'm here to help you with programming and software development questions.

💡 What I can help with:
• Code examples and explanations
• Debugging assistance
• Algorithm questions
• Best practices
• Framework/library usage
• Code reviews

📝 Just send me your coding question and I'll help you out!

⚠️ Note: I only answer programming-related questions.

🧠 **New**: I now remember our conversation history to provide better contextual responses!`;

      await ctx.reply(welcomeMessage);
    });

    bot.command("exit", async (ctx) => {
      console.log(`User ${ctx.from?.id} used /exit command`);
      await ctx.reply(
        "👋 Goodbye! Thanks for using the Coding Assistant Bot.\n\nFeel free to come back anytime with your coding questions!\n\nTo start fresh, just send /start"
      );
    });

    bot.command("clear", async (ctx) => {
      const userId = ctx.from?.id;
      if (userId) {
        chatHistory.clearUserHistory(userId);
        console.log(`Cleared chat history for user ${userId}`);
        await ctx.reply("🧹 Chat history cleared! Starting fresh conversation.");
      }
    });

    bot.command("help", async (ctx) => {
      const helpMessage = `🤖 Coding Assistant Bot Commands

Main Commands:
• Send any coding question directly (no command needed)
• /start - Welcome message and restart conversation
• /help - Show this help message

Chat Management:
• /clear - Clear your conversation history
• /history - Show conversation summary
• /exit - Say goodbye

What I can help with:
• Code examples & explanations
• Debugging assistance  
• Algorithm questions
• Best practices
• Framework/library usage
• Code reviews

Just send me your programming question and I'll help! 🚀`;

      await ctx.reply(helpMessage);
    });

    bot.command("history", async (ctx) => {
      const userId = ctx.from?.id;
      if (userId) {
        const summary = chatHistory.getConversationSummary(userId);
        await ctx.reply(`📊 ${summary}`);
      }
    });

    bot.on(message("text"), async (ctx) => {
      try {
        const userMessage = ctx.message.text;
        const userId = ctx.from?.id;

        if (userMessage.startsWith("/")) {
          return;
        }

        if (!userId) {
          await ctx.reply("Unable to identify user. Please try again.");
          return;
        }

        if (!userMessage || userMessage.trim().length === 0) {
          await ctx.reply("Please send a valid message.");
          return;
        }

        if (userMessage.length > 4000) {
          await ctx.reply(
            "Your message is too long. Please keep it under 4000 characters."
          );
          return;
        }

        await ctx.sendChatAction("typing");

        // Add user message to chat history
        chatHistory.addUserMessage(userId, userMessage);

        // Get chat history for context
        const previousMessages = chatHistory.getChatHistory(userId);

        let response: any;
        if (previousMessages.length > 0) {
          const dynamicTemplate = createDynamicTemplate(previousMessages);
          const chain = dynamicTemplate.pipe(llm);
          response = await chain.invoke({ user_input: userMessage });
        } else {
          response = await invokeWithTemplate(llm, userMessage);
        }

        const responseText = Array.isArray(response.content)
          ? response.content
            .map((item: any) => item.text ?? String(item))
            .join("\n")
          : String(response.content);

        chatHistory.addAssistantMessage(userId, responseText);

        if (responseText.length > 4096) {
          const chunks = responseText.match(/.{1,4000}/g) || [responseText];
          for (const chunk of chunks) {
            await ctx.reply(chunk);
          }
        } else {
          await ctx.reply(responseText);
        }
      } catch (error) {
        console.error("Error processing message", {
          userId: ctx.from?.id,
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });

        await ctx.reply(
          "Sorry, I encountered an error processing your request. Please try again later."
        );
      }
    });

    bot.catch(errorHandler);
    setupGracefulShutdown();

    // Log chat history stats periodically
    setInterval(() => {
      const stats = chatHistory.getStats();
      console.log(`Chat History Stats: ${stats.totalSessions} active sessions, ${stats.totalMessages} total messages`);
    }, 5 * 60 * 1000); 

    await bot.launch();
    console.log("🤖 Bot launched successfully with chat history support!");
  } catch (error) {
    console.error("Fatal error in main:", error);
    process.exit(1);
  }
}

main();
