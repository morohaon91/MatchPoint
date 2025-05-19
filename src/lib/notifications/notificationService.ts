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
  updateDoc,
  deleteDoc,
  DocumentData
} from "firebase/firestore";

export enum NotificationType {
  GAME_INVITATION = 'game_invitation',
  WAITLIST_PROMOTION = 'waitlist_promotion',
  GAME_REMINDER = 'game_reminder',
  GAME_CANCELED = 'game_canceled',
  GAME_UPDATED = 'game_updated',
  GROUP_INVITATION = 'group_invitation',
  GROUP_ROLE_CHANGE = 'group_role_change',
  TEAM_ASSIGNMENT = 'team_assignment',
  GAME_RESULT = 'game_result'
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: {
    gameId?: string;
    groupId?: string;
    teamId?: string;
    senderId?: string;
  };
  isRead: boolean;
  createdAt: any; // Timestamp
}

/**
 * Create a notification for a user
 * 
 * @param userId - The ID of the user to notify
 * @param type - The type of notification
 * @param title - The notification title
 * @param message - The notification message
 * @param data - Additional data for the notification
 * @returns A promise that resolves to the created notification
 */
export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  data?: {
    gameId?: string;
    groupId?: string;
    teamId?: string;
    senderId?: string;
  }
): Promise<Notification> {
  try {
    // Create a new notification document
    const notificationRef = collection(db, "notifications");
    
    // Prepare the notification data
    const notificationData: Omit<Notification, 'id'> = {
      userId,
      type,
      title,
      message,
      data,
      isRead: false,
      createdAt: serverTimestamp()
    };
    
    // Add the notification to the collection
    const docRef = await addDoc(notificationRef, notificationData);
    
    return {
      id: docRef.id,
      ...notificationData,
      createdAt: Timestamp.now() // Replace serverTimestamp with actual Timestamp for return value
    };
  } catch (error) {
    console.error("Error creating notification:", error);
    throw new Error("Failed to create notification");
  }
}

/**
 * Get notifications for a user
 * 
 * @param userId - The ID of the user
 * @param limit - Maximum number of notifications to retrieve
 * @returns A promise that resolves to an array of notifications
 */
export async function getUserNotifications(
  userId: string,
  notificationLimit: number = 20
): Promise<Notification[]> {
  try {
    const notificationsQuery = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(notificationLimit)
    );
    
    const notificationDocs = await getDocs(notificationsQuery);
    
    return notificationDocs.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Notification[];
  } catch (error) {
    console.error("Error getting notifications:", error);
    throw new Error("Failed to get notifications");
  }
}

/**
 * Mark a notification as read
 * 
 * @param notificationId - The ID of the notification
 * @returns A promise that resolves when the notification is marked as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    await updateDoc(doc(db, "notifications", notificationId), {
      isRead: true
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw new Error("Failed to mark notification as read");
  }
}

/**
 * Mark all notifications as read for a user
 * 
 * @param userId - The ID of the user
 * @returns A promise that resolves when all notifications are marked as read
 */
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  try {
    const notificationsQuery = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      where("isRead", "==", false)
    );
    
    const notificationDocs = await getDocs(notificationsQuery);
    
    const updatePromises = notificationDocs.docs.map(doc => 
      updateDoc(doc.ref, { isRead: true })
    );
    
    await Promise.all(updatePromises);
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw new Error("Failed to mark all notifications as read");
  }
}

/**
 * Delete a notification
 * 
 * @param notificationId - The ID of the notification
 * @returns A promise that resolves when the notification is deleted
 */
export async function deleteNotification(notificationId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "notifications", notificationId));
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw new Error("Failed to delete notification");
  }
}

/**
 * Create a game invitation notification
 * 
 * @param userId - The ID of the user to notify
 * @param gameId - The ID of the game
 * @param gameTitle - The title of the game
 * @param senderId - The ID of the user sending the invitation
 * @param senderName - The name of the user sending the invitation
 * @returns A promise that resolves to the created notification
 */
export async function createGameInvitationNotification(
  userId: string,
  gameId: string,
  gameTitle: string,
  senderId: string,
  senderName: string
): Promise<Notification> {
  return createNotification(
    userId,
    NotificationType.GAME_INVITATION,
    'Game Invitation',
    `${senderName} has invited you to join "${gameTitle}"`,
    {
      gameId,
      senderId
    }
  );
}

/**
 * Create a waitlist promotion notification
 * 
 * @param userId - The ID of the user to notify
 * @param gameId - The ID of the game
 * @param gameTitle - The title of the game
 * @returns A promise that resolves to the created notification
 */
export async function createWaitlistPromotionNotification(
  userId: string,
  gameId: string,
  gameTitle: string
): Promise<Notification> {
  return createNotification(
    userId,
    NotificationType.WAITLIST_PROMOTION,
    'Waitlist Promotion',
    `You've been promoted from the waitlist for "${gameTitle}"`,
    {
      gameId
    }
  );
}

/**
 * Create a game reminder notification
 * 
 * @param userId - The ID of the user to notify
 * @param gameId - The ID of the game
 * @param gameTitle - The title of the game
 * @param timeUntilGame - The time until the game (e.g., "1 hour")
 * @returns A promise that resolves to the created notification
 */
export async function createGameReminderNotification(
  userId: string,
  gameId: string,
  gameTitle: string,
  timeUntilGame: string
): Promise<Notification> {
  return createNotification(
    userId,
    NotificationType.GAME_REMINDER,
    'Game Reminder',
    `Your game "${gameTitle}" is starting in ${timeUntilGame}`,
    {
      gameId
    }
  );
}

/**
 * Create a game canceled notification
 * 
 * @param userId - The ID of the user to notify
 * @param gameId - The ID of the game
 * @param gameTitle - The title of the game
 * @returns A promise that resolves to the created notification
 */
export async function createGameCanceledNotification(
  userId: string,
  gameId: string,
  gameTitle: string
): Promise<Notification> {
  return createNotification(
    userId,
    NotificationType.GAME_CANCELED,
    'Game Canceled',
    `The game "${gameTitle}" has been canceled`,
    {
      gameId
    }
  );
}

/**
 * Create a team assignment notification
 * 
 * @param userId - The ID of the user to notify
 * @param gameId - The ID of the game
 * @param gameTitle - The title of the game
 * @param teamId - The ID of the team
 * @param teamName - The name of the team
 * @returns A promise that resolves to the created notification
 */
export async function createTeamAssignmentNotification(
  userId: string,
  gameId: string,
  gameTitle: string,
  teamId: string,
  teamName: string
): Promise<Notification> {
  return createNotification(
    userId,
    NotificationType.TEAM_ASSIGNMENT,
    'Team Assignment',
    `You've been assigned to team "${teamName}" for the game "${gameTitle}"`,
    {
      gameId,
      teamId
    }
  );
}
