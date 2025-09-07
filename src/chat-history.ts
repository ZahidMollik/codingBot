interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatSession {
  userId: number;
  messages: ChatMessage[];
  lastActivity: Date;
}

export class ChatHistoryManager {
  private sessions: Map<number, ChatSession> = new Map();
  private readonly maxMessagesPerUser: number; 
  private readonly sessionTimeoutMs: number ;

  constructor(maxMessages: number = 10, sessionTimeoutHours: number = 1) {
    this.maxMessagesPerUser = maxMessages;
    this.sessionTimeoutMs = sessionTimeoutHours * 60 * 60 * 1000;

    setInterval(() => this.cleanupOldSessions(), 30 * 60 * 1000);
  }

  addUserMessage(userId: number, content: string): void {
    this.ensureSession(userId);
    const session = this.sessions.get(userId)!;

    session.messages.push({
      role: 'user',
      content,
      timestamp: new Date()
    });

    session.lastActivity = new Date();
    this.trimMessages(userId);
  }

  addAssistantMessage(userId: number, content: string): void {
    this.ensureSession(userId);
    const session = this.sessions.get(userId)!;

    session.messages.push({
      role: 'assistant',
      content,
      timestamp: new Date()
    });

    session.lastActivity = new Date();
    this.trimMessages(userId);
  }


  getChatHistory(userId: number): Array<{ role: string; content: string }> {
    const session = this.sessions.get(userId);
    if (!session || session.messages.length === 0) {
      return [];
    }

    const messages = session.messages.slice(0, -1);

    return messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  }

  getLastUserMessage(userId: number): string | null {
    const session = this.sessions.get(userId);
    if (!session || session.messages.length === 0) {
      return null;
    }

    for (let i = session.messages.length - 1; i >= 0; i--) {
      const message = session.messages[i];
      if (message && message.role === 'user') {
        return message.content;
      }
    }

    return null;
  }

  clearUserHistory(userId: number): void {
    this.sessions.delete(userId);
  }

  getConversationSummary(userId: number): string {
    const session = this.sessions.get(userId);
    if (!session || session.messages.length === 0) {
      return "No conversation history";
    }

    const messageCount = session.messages.length;
    const userMessages = session.messages.filter(m => m.role === 'user').length;
    const assistantMessages = session.messages.filter(m => m.role === 'assistant').length;

    return `Conversation: ${messageCount} messages (${userMessages} from user, ${assistantMessages} from assistant)`;
  }


  private ensureSession(userId: number): void {
    if (!this.sessions.has(userId)) {
      this.sessions.set(userId, {
        userId,
        messages: [],
        lastActivity: new Date()
      });
    }
  }


  private trimMessages(userId: number): void {
    const session = this.sessions.get(userId);
    if (!session) return;

    if (session.messages.length > this.maxMessagesPerUser) {
      // Keep the most recent messages
      session.messages = session.messages.slice(-this.maxMessagesPerUser);
    }
  }

  private cleanupOldSessions(): void {
    const now = new Date();
    const expiredSessions: number[] = [];

    for (const [userId, session] of this.sessions.entries()) {
      const timeSinceLastActivity = now.getTime() - session.lastActivity.getTime();
      if (timeSinceLastActivity > this.sessionTimeoutMs) {
        expiredSessions.push(userId);
      }
    }

    expiredSessions.forEach(userId => {
      this.sessions.delete(userId);
      console.log(`Cleaned up expired session for user ${userId}`);
    });

    if (expiredSessions.length > 0) {
      console.log(`Cleaned up ${expiredSessions.length} expired chat sessions`);
    }
  }

  getStats(): { totalSessions: number; totalMessages: number } {
    let totalMessages = 0;
    for (const session of this.sessions.values()) {
      totalMessages += session.messages.length;
    }

    return {
      totalSessions: this.sessions.size,
      totalMessages
    };
  }
}

export const chatHistory = new ChatHistoryManager();
