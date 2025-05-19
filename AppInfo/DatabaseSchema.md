Comprehensive MatchPoint Database Schema
Users and Profiles

users collection

uid (string, PK): Firebase Authentication user ID
email (string): User's email address
createdAt (timestamp): When account was created
lastLogin (timestamp): Time of most recent login
photoURL (string, optional): URL to profile picture


userProfiles collection

uid (string, PK, FK → users.uid): Firebase Auth user ID
username (string): Display name
preferredSports (array): List of sports user is interested in
availabilityPreferences (object): When user typically plays

mornings (boolean)
afternoons (boolean)
evenings (boolean)
weekends (boolean)


city (string, optional): User's general location
neighborhood (string, optional): More specific area
privacySettings (object): User's privacy preferences

showEmail (boolean)
showLocation (boolean)


lastActive (timestamp): Last platform activity



Groups and Membership

groups collection

groupId (string, PK): Unique group identifier
name (string): Group name
sportType (string): Primary sport type
description (string): Group description
isPublic (boolean): Whether group is discoverable
invitationCode (string): Code for joining private group
createdAt (timestamp): Creation date
createdBy (string, FK → users.uid): Creator's ID
adminUids (array): List of admin user IDs
organizerUids (array): List of organizer user IDs
groupRules (object): Group-specific rules

skillLevel (string): Beginner/Intermediate/Advanced
ageRange (string): Age restrictions if any
otherRules (string): Additional group guidelines




groupMembers collection

groupId (string, PK part, FK → groups.groupId): Group ID
userId (string, PK part, FK → users.uid): User ID
role (string): "admin", "organizer", or "player"
joinedAt (timestamp): When user joined group
isActive (boolean): Whether membership is active
Document ID pattern: {groupId}_{userId}



Games and Scheduling

games collection

gameId (string, PK): Unique game identifier
groupId (string, FK → groups.groupId): Group hosting game
title (string): Game title/name
dateTime (timestamp): When game occurs
location (string): Game location
maxPlayers (number): Player capacity
isRecurring (boolean): If part of recurring series
recurrencePattern (string, optional): "weekly", "biweekly", etc.
recurrenceEndDate (timestamp, optional): When series ends
isOpenToGuests (boolean): If non-members can be invited
status (string): "upcoming", "in-progress", "completed", "cancelled"
createdBy (string, FK → users.uid): Creator's ID
createdAt (timestamp): Creation date
gameDetails (object): Additional information

requiredEquipment (string)
meetingPoint (string)
notes (string)


isException (boolean): If this is an exception to recurring pattern
parentGameId (string, optional, FK → games.gameId): For recurring instances


gameParticipants collection

gameId (string, PK part, FK → games.gameId): Game ID
userId (string, PK part, FK → users.uid): Participant ID
status (string): "registered", "waitlist", "cancelled", "attended"
registeredAt (timestamp): When user registered
isGuest (boolean): If user is not a group member
invitedBy (string, optional, FK → users.uid): If guest, who invited
teamId (string, optional, FK → teams.teamId): Assigned team
Document ID pattern: {gameId}_{userId}



Teams and Scoring

teams collection

teamId (string, PK): Unique team identifier
gameId (string, FK → games.gameId): Associated game
teamName (string): Team name
teamColor (string): Color identifier for the team
playerIds (array): List of user IDs on team
score (number, optional): Team's score in the game



Communication

gameMessages collection

messageId (string, PK): Unique message identifier
gameId (string, FK → games.gameId): Associated game
userId (string, FK → users.uid): Message sender
message (string): Message content
createdAt (timestamp): When message was sent
attachments (array, optional): Media attachments


notifications collection

notificationId (string, PK): Unique notification ID
userId (string, FK → users.uid): Recipient user
type (string): "game_reminder", "waitlist_promoted", etc.
title (string): Notification title
body (string): Notification content
isRead (boolean): Whether user has seen it
createdAt (timestamp): When notification was created
relatedData (object): Contextual information

gameId (string, optional)
groupId (string, optional)
actionType (string, optional)





Important Relationships

User → Groups (one-to-many)

User can create multiple groups
User can be member of multiple groups with different roles


User → Games (one-to-many)

User can create multiple games
User can participate in multiple games


Group → Games (one-to-many)

Group can have multiple games (one-time and recurring)


Game → Teams (one-to-many)

Game can have multiple teams (typically 2+)


Game → Participants (one-to-many)

Game has multiple participants with different statuses


Group → Members (one-to-many)

Group has multiple members with different roles


Recurring Game Series (parent-child)

Parent game record connects to multiple child game instances



Indexes Required

For finding user's groups:

groupMembers collection:

Composite: userId ASC, joinedAt DESC




For finding upcoming games in a group:

games collection:

Composite: groupId ASC, status ASC, dateTime ASC




For finding a user's game registrations:

gameParticipants collection:

Composite: userId ASC, status ASC


For finding waitlisted players in priority order:

gameParticipants collection:

Composite: gameId ASC, status ASC, registeredAt ASC




RetryMOcontinueEditComprehensive MatchPoint Database Schema (Continued)
Data Relationships & Access Patterns
Group Privacy & Access Control

Public vs Private Groups

groups.isPublic: Controls global discoverability
Public groups (isPublic == true):

Visible in search/discovery features
Basic info readable by all authenticated users
Joining may require approval

Private groups (isPublic == false):
Only visible to members
Joining requires invitation code
Security rules must enforce this privacy boundary


Role Hierarchy
Admin > Organizer > Player
Role stored in groupMembers.role
Each role has cascading permissions:
Admins can do everything (including deleting group)
Organizers can create/edit games and manage players
Players can only view and participate

Game Management Relations

Game → Group (many-to-one)
Every game belongs to exactly one group
Group permissions cascade to its games

Recurring Game Pattern
Parent game record contains series metadata
Child game instances reference parent via parentGameId
Special instances (exceptions) marked with isException = true
When updating a series, must consider:
Updates to parent only (affecting future instances)
Updates to specific child instances (exceptions)

Registration Waitlist System
When game reaches maxPlayers:
Additional registrations marked as status = "waitlist"
Ordered by registeredAt timestamp
When a registered player cancels:
First waitlisted player auto-promoted
Requires transaction operation to ensure consistency
Data Validation Requirements
User Data
email: Must be valid email format
username: 3-30 characters, alphanumeric + spaces
preferredSports: Array of valid sport types

Group Data
name: 3-50 characters
sportType: Must be from approved list
isPublic: Must be boolean
adminUids: Must include creator's UID
Every group must have at least one admin

Game Data
dateTime: Must be future date/time when created
maxPlayers: Must be positive integer
location: Required field, non-empty
status: Must be one of allowed values

Registration Data
Can't register twice for same game
Can't register for cancelled games

Group membership grants access to group's games
Group admin status grants admin access to all games in group
Groups can only be deleted by admins
Game Updates
Games can be updated by creator or group admins/organizers
Past games (already occurred) should be read-only
Game participants can only be modified by group admins/organizers or self

Private Communication
Game messages only visible to game participants
Must verify both group membership and game registration
Denormalized Data for Performance
For better read performance, some data may be denormalized:

Group Summary in Games
games might include groupName copy from parent group
Game Counts
groups might track activeGameCount and totalGameCount

Player Counts
games might include registeredCount and waitlistCount
Requires careful transaction handling when updating
Data Migration Considerations
As app evolves, you may need:
Schema Versioning
Field for tracking document schema version
Migration functions when schema changes
Archiving Strategy
For completed/old games and inactive groups
Separate collections or flags for archival