export const familyKeys = {
  all: ["family"] as const,
  session: () => [...familyKeys.all, "session"] as const,
  members: () => [...familyKeys.all, "members"] as const,
  parents: () => [...familyKeys.all, "parents"] as const,
  surveys: () => [...familyKeys.all, "surveys"] as const,
};
