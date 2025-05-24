/**
 * MatchPoint Application Models
 *
 * This file contains TypeScript interfaces and enums for the core data models
 * used throughout the MatchPoint application.
 */

import { Timestamp as ClientTimestamp } from "firebase/firestore";
import { Timestamp as AdminTimestamp } from "firebase-admin/firestore";

// Union type to handle both client and admin Timestamps
export type FirestoreTimestamp = ClientTimestamp | AdminTimestamp;

/**
 * Sport types supported by the application
 */
export enum SportType {
  TENNIS = "Tennis",
  BASKETBALL = "Basketball",
  SOCCER = "Soccer",
  VOLLEYBALL = "Volleyball",
  BASEBALL = "Baseball",
}

/**
 * Game status types
 */
export enum GameStatus {
  UPCOMING = "Upcoming",
  IN_PROGRESS = "In Progress",
  COMPLETED = "Completed",
  CANCELED = "Canceled",
}

/**
 * Participant status types
 */
export enum ParticipantStatus {
  CONFIRMED = "Confirmed",
  WAITLIST = "Waitlist",
  INVITED = "Invited",
  DECLINED = "Declined",
}

/**
 * GameParticipant model
 */
export interface GameParticipant {
  id: string;
  gameId: string;
  userId: string;
  status: ParticipantStatus;
  joinedAt: FirestoreTimestamp;
  registeredAt: FirestoreTimestamp;
  role: "host" | "player" | "organizer";
  isGuest: boolean;
  // Optional user details for quick access
  displayName?: string;
  photoURL?: string;
}

/**
 * User role types
 */
export enum UserRole {
  ADMIN = "admin",
  USER = "user",
  MODERATOR = "moderator",
}

/**
 * User model
 */
export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  createdAt: string | Date;
  updatedAt: string | Date;
  phoneNumber?: string;
  bio?: string;
  preferences?: UserPreferences;
  sportPreferences?: SportPreference[];
  isActive: boolean;
}

/**
 * User preferences
 */
export interface UserPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  theme: "light" | "dark" | "system";
  language: string;
}

/**
 * Sport preference
 */
export interface SportPreference {
  sport: SportType;
  skillLevel: number; // 1-5 scale
  yearsExperience?: number;
  preferredPosition?: string;
}

/**
 * Group model
 */
export interface Group {
  id: string;
  name: string;
  description?: string;
  sport: SportType;
  createdAt: string | Date;
  updatedAt: string | Date;
  createdBy: string; // User ID
  photoURL?: string;
  location?: string;
  isPublic: boolean;
  memberCount: number;
  memberIds: string[];
  adminIds: string[];
  tags?: string[];
  invitationCode?: string;
  invitedUserIds?: string[]; // For targeted invites to appear on user's dashboard
}

/**
 * Game model
 */
export interface Game {
  id: string;
  title: string;
  description?: string;
  sport: SportType;
  groupId?: string;
  groupName?: string; // Name of the group this game belongs to
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  createdBy: string; // User ID
  hostId: string; // User ID
  hostName: string;
  photoURL?: string;
  location?: string;
  currentParticipants: number;
  scheduledTime: FirestoreTimestamp;
  endTime?: FirestoreTimestamp;
  status: GameStatus;
  maxParticipants?: number;
  minParticipants?: number;
  participantIds: string[];
  waitlistIds: string[];
  isRecurring: boolean;
  recurringSeriesId?: string;
  skillLevel?: number; // 1-5 scale
  isPrivate: boolean;
  isOpenToGuests?: boolean;
  inviteCode?: string;
  teams?: Team[];
  results?: GameResults;
}

/**
 * Team model
 */
export interface Team {
  id: string;
  name: string;
  playerIds: string[];
  score?: number;
  color?: string;
}

/**
 * Game results
 */
export interface GameResults {
  winningTeamId?: string;
  scores: { [teamId: string]: number };
  stats?: { [key: string]: any };
  notes?: string;
  recordedBy: string; // User ID
  recordedAt: string | Date;
}

/**
 * Recurring series model
 */
export interface RecurringSeries {
  id: string;
  title: string;
  description?: string;
  sport: SportType;
  groupId?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  createdBy: string; // User ID
  hostId: string; // User ID
  location?: string;
  frequency: "daily" | "weekly" | "biweekly" | "monthly";
  dayOfWeek?: number; // 0-6, Sunday to Saturday
  startDate: string | Date;
  endDate?: string | Date;
  startTime: string;
  duration: number; // in minutes
  maxParticipants?: number;
  minParticipants?: number;
  isActive: boolean;
  gameIds: string[];
}

/**
 * Notification model
 */
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "game" | "group" | "system" | "friend";
  relatedId?: string;
  createdAt: string | Date;
  isRead: boolean;
  action?: string;
}

/**
 * Chat message model
 */
export interface ChatMessage {
  id: string;
  groupId: string;
  userId: string;
  userName: string;
  userPhotoURL?: string;
  content: string;
  createdAt: string | Date;
  attachments?: Attachment[];
  reactions?: Reaction[];
}

/**
 * Attachment model
 */
export interface Attachment {
  id: string;
  type: "image" | "file" | "link";
  url: string;
  name: string;
  size?: number;
  mimeType?: string;
}

/**
 * Reaction model
 */
export interface Reaction {
  emoji: string;
  count: number;
  userIds: string[];
}

/**
 * GroupMember model
 */
export interface GroupMember {
  userId: string;
  role: string;
  user?: {
    name?: string;
    email?: string;
    photoURL?: string;
  };
}

/**
 * Invite model
 */
export interface Invite {
  id: string;
  code: string;
  type: "group" | "game";
  relatedId: string;
  createdBy: string;
  createdAt: string | Date;
  expiresAt?: string | Date;
  maxUses?: number;
  useCount: number;
  isActive: boolean;
}
