# Coding Assistant Bot 🤖

A Telegram bot that provides AI-powered coding assistance using Groq's LLaMA model. Get instant help with programming questions, code explanations, debugging, and best practices.

## Prerequisites

- Node.js (v16 or higher)
- pnpm package manager
- Telegram Bot Token (from [@BotFather](https://t.me/botfather))
- Groq API Key (from [Groq Console](https://console.groq.com/))

- Docker and Docker Compose (for containerized)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ZahidMollik/codingBot.git
   cd codingBot
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   BOT_TOKEN=your_telegram_bot_token_here
   GROQ_API_KEY=your_groq_api_key_here
   ```

## Usage

### Development
```bash
pnpm run dev
```

### Production
```bash
pnpm run build
pnpm start
```

### For Docker

1. **Build and run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

2. **Stop the bot**
   ```bash
   docker-compose down
   ```

## Bot Commands

- `/start` - Welcome message and bot introduction
- `/help` - Show available commands and bot capabilities
- `/clear` - Clear your conversation history and start fresh
- `/history` - Show summary of your conversation
- `/exit` - End conversation with goodbye message

## How to Use

1. Start a chat with your bot on Telegram
2. Send `/start` to see the welcome message
3. Ask any programming-related question
4. Get instant AI-powered responses

### Example Interactions

- "How do I reverse a string in Python?"
- "Explain async/await in JavaScript"
- "What's the difference between SQL joins?"
- "Help me debug this React component"
- "Best practices for API design"


## Project Structure

```
src/
├── index.ts          # Main bot logic and message handling
├── llm-model.ts      # Groq LLM configuration and connection
├── prompt.ts         # Prompt templates for AI responses
├── chat-history.ts   # Chat history management and context
└── telegraf.ts       # Telegram bot setup and error handling
```

## Technologies Used

- **[Telegraf](https://telegraf.js.org/)** - Telegram Bot API framework
- **[LangChain](https://langchain.com/)** - LLM application framework
- **[Groq](https://groq.com/)** - High-performance AI inference
- **TypeScript** - Type-safe JavaScript
- **Node.js** - Runtime environment

