/**
 * Performance baseline helper (Phase 0).
 *
 * Captures what we can from the repo without a browser session:
 * - Post-login network critical path (from client hooks / family-app)
 * - Optional bundle analysis via ANALYZE=true npm run build
 *
 * React Profiler (search typing, editor typing, list hover) must be
 * captured manually in React DevTools against a running dev server.
 */

const POST_LOGIN_NETWORK = [
  { path: "/api/auth/session", when: "app mount", source: "useSessionQuery" },
  {
    path: "/api/members",
    when: "after authenticated",
    source: "useMembersQuery",
  },
  {
    path: "/api/parents?gender=m",
    when: "after authenticated",
    source: "useParentsQuery (parallel)",
  },
  {
    path: "/api/parents?gender=f",
    when: "after authenticated",
    source: "useParentsQuery (parallel)",
  },
  {
    path: "/api/surveys",
    when: "after authenticated",
    source: "useSurveysQuery",
  },
];

console.log("Family app performance baseline");
console.log("==============================");
console.log("\nPost-login network critical path:");
for (const entry of POST_LOGIN_NETWORK) {
  console.log(`  ${entry.path}`);
  console.log(`    when: ${entry.when}`);
  console.log(`    source: ${entry.source}`);
}

console.log("\nManual Profiler checklist (React DevTools):");
console.log("  1. Search typing while browsing members");
console.log("  2. Editor field typing on Family tab");
console.log("  3. Mouse move across member list rows");
console.log("\nBundle: run ANALYZE=true npm run build (opens analyzer when build succeeds).");
