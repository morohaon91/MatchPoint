import { db } from "@/lib/firebase/firebaseClient";
import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp, 
  Timestamp,
  onSnapshot,
  DocumentData
} from "firebase/firestore";
import { ChatMessage } from "@/lib/types/models";

/**
 * Send a chat message for a game
 * 
 * @param gameId - The ID of the game
 * @param userId - The ID of the user sending the message
 * @param content - The message content
 * @returns A promise that resolves to the sent message
 */
export async function sendGameChatMessage(
  gameId: string,
  userId: string,
  content: string
): Promise<ChatMessage> {
  try {
    // Create a new chat message document
    const chatRef = collection(db, "gameChats", gameId, "messages");
    
    // Prepare the message data
    const messageData: Omit<ChatMessage, 'id'> = {
      gameId,
      userId,
      content,
      createdAt: serverTimestamp()
    };
    
    // Add the message to the collection
    const docRef = await addDoc(chatRef, messageData);
    
    return {
      id: docRef.id,
      ...messageData,
      createdAt: Timestamp.now() // Replace serverTimestamp with actual Timestamp for return value
    };
  } catch (error) {
    console.error("Error sending chat message:", error);
    throw new Error("Failed to send chat message");
  }
}

/**
 * Get chat messages for a game
 * 
 * @param gameId - The ID of the game
 * @param limit - Maximum number of messages to retrieve
 * @returns A promise that resolves to an array of chat messages
 */
export async function getGameChatMessages(
  gameId: string,
  messageLimit: number = 50
): Promise<ChatMessage[]> {
  try {
    const chatQuery = query(
      collection(db, "gameChats", gameId, "messages"),
      orderBy("createdAt", "desc"),
      limit(messageLimit)
    );
    
    const chatDocs = await getDocs(chatQuery);
    
    const messages = chatDocs.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ChatMessage[];
    
    // Return messages in chronological order (oldest first)
    return messages.reverse();
  } catch (error) {
    console.error("Error getting chat messages:", error);
    throw new Error("Failed to get chat messages");
  }
}

/**
 * Subscribe to chat messages for a game
 * 
 * @param gameId - The ID of the game
 * @param callback - Callback function to handle new messages
 * @param messageLimit - Maximum number of messages to retrieve initially
 * @returns An unsubscribe function
 */
export function subscribeToGameChat(
  gameId: string,
  callback: (messages: ChatMessage[]) => void,
  messageLimit: number = 50
): () => void {
  const chatQuery = query(
    collection(db, "gameChats", gameId, "messages"),
    orderBy("createdAt", "desc"),
    limit(messageLimit)
  );
  
  const unsubscribe = onSnapshot(chatQuery, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ChatMessage[];
    
    // Return messages in chronological order (oldest first)
    callback(messages.reverse());
  }, (error) => {
    console.error("Error subscribing to chat:", error);
  });
  
  return unsubscribe;
}

/**
 * Send a chat message for a group
 * 
 * @param groupId - The ID of the group
 * @param userId - The ID of the user sending the message
 * @param content - The message content
 * @returns A promise that resolves to the sent message
 */
export async function sendGroupChatMessage(
  groupId: string,
  userId: string,
  content: string
): Promise<ChatMessage> {
  try {
    // Create a new chat message document
    const chatRef = collection(db, "groupChats", groupId, "messages");
    
    // Prepare the message data
    const messageData: Omit<ChatMessage, 'id' | 'gameId'> & { groupId: string } = {
      groupId,
      userId,
      content,
      createdAt: serverTimestamp()
    };
    
    // Add the message to the collection
    const docRef = await addDoc(chatRef, messageData);
    
    return {
      id: docRef.id,
      gameId: '', // Not applicable for group chats
      ...messageData,
      createdAt: Timestamp.now() // Replace serverTimestamp with actual Timestamp for return value
    };
  } catch (error) {
    console.error("Error sending group chat message:", error);
    throw new Error("Failed to send group chat message");
  }
}

/**
 * Get chat messages for a group
 * 
 * @param groupId - The ID of the group
 * @param limit - Maximum number of messages to retrieve
 * @returns A promise that resolves to an array of chat messages
 */
export async function getGroupChatMessages(
  groupId: string,
  messageLimit: number = 50
): Promise<ChatMessage[]> {
  try {
    const chatQuery = query(
      collection(db, "groupChats", groupId, "messages"),
      orderBy("createdAt", "desc"),
      limit(messageLimit)
    );
    
    const chatDocs = await getDocs(chatQuery);
    
    const messages = chatDocs.docs.map(doc => ({
      id: doc.id,
      gameId: '', // Not applicable for group chats
      ...doc.data()
    })) as ChatMessage[];
    
    // Return messages in chronological order (oldest first)
    return messages.reverse();
  } catch (error) {
    console.error("Error getting group chat messages:", error);
    throw new Error("Failed to get group chat messages");
  }
}

/**
 * Subscribe to chat messages for a group
 * 
 * @param groupId - The ID of the group
 * @param callback - Callback function to handle new messages
 * @param messageLimit - Maximum number of messages to retrieve initially
 * @returns An unsubscribe function
 */
export function subscribeToGroupChat(
  groupId: string,
  callback: (messages: ChatMessage[]) => void,
  messageLimit: number = 50
): () => void {
  const chatQuery = query(
    collection(db, "groupChats", groupId, "messages"),
    orderBy("createdAt", "desc"),
    limit(messageLimit)
  );
  
  const unsubscribe = onSnapshot(chatQuery, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      gameId: '', // Not applicable for group chats
      ...doc.data()
    })) as ChatMessage[];
    
    // Return messages in chronological order (oldest first)
    callback(messages.reverse());
  }, (error) => {
    console.error("Error subscribing to group chat:", error);
  });
  
  return unsubscribe;
}
