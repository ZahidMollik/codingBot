import { Telegraf,Context } from 'telegraf';

export const bot: Telegraf = new Telegraf(process.env.BOT_TOKEN!);

export function setupGracefulShutdown(): void {
  process.once('SIGINT', () => {
    console.info('Received SIGINT, stopping bot gracefully...');
    bot.stop('SIGINT');
  });

  process.once('SIGTERM', () => {
    console.info('Received SIGTERM, stopping bot gracefully...');
    bot.stop('SIGTERM');
  });
}

export function errorHandler(err: any, ctx: Context) {
  console.error("Unhandled error in bot", {
    error: err.message,
    stack: err.stack,
    userId: ctx.from?.id,
    chatId: ctx.chat?.id,
  });

  ctx.reply("Sorry, something went wrong. Please try again later.").catch((replyErr) => {
    console.error("Failed to send error message to user", {
      error: replyErr.message,
      userId: ctx.from?.id,
    });
  });
}