/**
 * Performance baseline helper (Phase 0).
 *
 * Captures what we can from the repo without a browser session:
 * - Post-login network critical path (from client hooks / family-app)
 * - Optional bundle analysis via npm run analyze
 *
 * React Profiler (search typing, editor typing, list hover) must be
 * captured manually in React DevTools against a running dev server.
 */

const POST_LOGIN_NETWORK = [
  {
    path: "SSR session hint → useSessionQuery(initialData)",
    when: "HTML render + app mount (parallel revalidate)",
    source: "(family)/layout getIsAuthenticated + useSessionQuery",
  },
  {
    path: "/api/members (includes fathers/mothers)",
    when: "after authenticated (no parents waterfall)",
    source: "useMembersQuery + useParentsQuery (shared cache)",
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
console.log(
  "\nBundle: run npm run analyze (webpack + @next/bundle-analyzer).",
);
