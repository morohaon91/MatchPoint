/**
 * Utility functions for group invitations
 */

/**
 * Generates a unique invitation code
 * @returns A unique invitation code
 */
export function generateInviteCode(): string {
  // Generate a random string of characters
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const length = 8;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
}

/**
 * Validates an invitation code
 * @param code The invitation code to validate
 * @returns Whether the code is valid
 */
export function validateInviteCode(code: string): boolean {
  // In a real app, this would check against the database
  // For now, we'll just check if the code is a valid format
  return /^[A-Za-z0-9]{8}$/.test(code);
}

/**
 * Checks if an invitation code has expired
 * @param createdAt The date the invitation was created
 * @param expirationDays The number of days until expiration (default: 7)
 * @returns Whether the invitation has expired
 */
export function isInviteCodeExpired(
  createdAt: Date,
  expirationDays: number = 7,
): boolean {
  const expirationDate = new Date(createdAt);
  expirationDate.setDate(expirationDate.getDate() + expirationDays);

  return new Date() > expirationDate;
}

/**
 * Generates a shareable invitation link
 * @param groupId The ID of the group
 * @param inviteCode The invitation code
 * @returns A shareable invitation link
 */
export function generateInviteLink(
  groupId: string,
  inviteCode: string,
): string {
  // In a real app, this would use the actual domain
  return `${window.location.origin}/invite/${inviteCode}?groupId=${groupId}`;
}
