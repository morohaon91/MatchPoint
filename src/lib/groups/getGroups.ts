// Re-export functions from groupService.ts
export { getUserGroups, getPublicGroups } from "./groupService";
// getUserGroupsAsAdmin is now in groupAdminService.ts and will be imported directly where needed (e.g., API routes)
