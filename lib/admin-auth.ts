// Edge-safe (no Node.js-only imports). Used by middleware, layout, and server actions.

function getAdminUserIds(): string[] {
  return (process.env.ADMIN_USER_IDS ?? '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

export function isAdminUser(userId: string | undefined): boolean {
  if (!userId) return false;
  return getAdminUserIds().includes(userId);
}

export function requireAdmin(userId: string | undefined): void {
  if (!isAdminUser(userId)) throw new Error('Unauthorized');
}
