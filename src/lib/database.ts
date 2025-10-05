import { db } from '@/db';
import { users, messages, sessions, type NewUser, type NewMessage, type NewSession } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function findOrCreateUser(phone: string) {
  // Try to find existing user
  const existingUser = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
  
  if (existingUser.length > 0) {
    return existingUser[0];
  }

  // Create new user
  const newUser: NewUser = { phone };
  const [createdUser] = await db.insert(users).values(newUser).returning();
  
  return createdUser;
}

export async function saveMessage(userId: number, text: string, role: 'user' | 'ai') {
  const newMessage: NewMessage = {
    userId,
    text,
    role,
  };
  
  const [savedMessage] = await db.insert(messages).values(newMessage).returning();
  return savedMessage;
}

export async function getConversationHistory(userId: number, limit: number = 10) {
  const conversation = await db
    .select()
    .from(messages)
    .where(eq(messages.userId, userId))
    .orderBy(desc(messages.createdAt))
    .limit(limit);
  
  return conversation.reverse(); // Return in chronological order
}

export async function updateUserSession(userId: number) {
  // Check if session exists
  const existingSession = await db.select().from(sessions).where(eq(sessions.userId, userId)).limit(1);
  
  if (existingSession.length > 0) {
    // Update existing session
    await db.update(sessions).set({ lastActive: new Date() }).where(eq(sessions.userId, userId));
  } else {
    // Create new session
    const newSession: NewSession = { userId };
    await db.insert(sessions).values(newSession);
  }
}
