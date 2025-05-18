// Re-export all service functions for easier imports

// Group services
export { createGroup } from "../groups/createGroup";
export { getUserGroups, getPublicGroups } from "../groups/getGroups"; // Removed getUserGroupsAsAdmin
export {
  getGroup,
  updateGroup,
  deleteGroup,
  addGroupMember,
  updateGroupMemberRole,
  removeGroupMember,
  getGroupMembers,
} from "../groups/groupService";

// Permission services
export {
  canManageGroup,
  canManageGames,
  isGroupMember,
} from "../permissions/checkPermissions";

// Game services
export { createGame } from "../games/createGame";
export {
  getGame,
  updateGame,
  deleteGame,
  getUserUpcomingGames,
} from "../games/gameService";
export { getGroupGames } from "../games/getGames";
export {
  getGameParticipants,
  addGameParticipant,
  updateGameParticipantStatus,
  removeGameParticipant,
} from "../games/gameService";

// User services
export {
  getUserProfile,
  updateUserProfile,
  updateSportsPreferences,
  updateAvailability,
  isProfileComplete,
} from "../users/userProfileService";
