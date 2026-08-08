export const resolveUserId = (payload: Record<string, unknown>): string | null => {
  const candidateValues: unknown[] = [
    payload.user_id,
    payload.userId,
    payload.id,
    payload.user && typeof payload.user === 'object'
      ? (payload.user as Record<string, unknown>).id
      : undefined,
    payload.user && typeof payload.user === 'object'
      ? (payload.user as Record<string, unknown>).userId
      : undefined,
  ];

  for (const value of candidateValues) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return null;
};
