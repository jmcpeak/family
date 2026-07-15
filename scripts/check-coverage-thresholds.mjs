import fs from "node:fs";
import path from "node:path";

const summaryPath = path.resolve("coverage/coverage-summary.json");

if (!fs.existsSync(summaryPath)) {
  console.error(`Coverage summary not found: ${summaryPath}`);
  process.exit(1);
}

const summary = JSON.parse(fs.readFileSync(summaryPath, "utf8"));

const thresholds = [
  { file: "src/lib/env.ts", lines: 85 },
  { file: "src/lib/auth.ts", lines: 65 },
  { file: "src/lib/member-validation.ts", lines: 80 },
  { file: "src/lib/api-observability.ts", lines: 90 },
  { file: "src/app/api/auth/login/route.ts", lines: 85 },
  { file: "src/app/api/members/route.ts", lines: 70 },
  { file: "src/app/api/health/ready/route.ts", lines: 90 },
];

const failures = [];

for (const threshold of thresholds) {
  const entry = Object.entries(summary).find(([entryPath]) =>
    entryPath.endsWith(threshold.file),
  );

  if (!entry) {
    failures.push(`Missing coverage entry for ${threshold.file}`);
    continue;
  }

  const [, metrics] = entry;
  const lineCoverage = metrics.lines?.pct ?? 0;
  if (lineCoverage < threshold.lines) {
    failures.push(
      `${threshold.file} line coverage ${lineCoverage}% is below ${threshold.lines}%`,
    );
  }
}

if (failures.length > 0) {
  console.error("Coverage threshold check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Coverage thresholds satisfied for critical server modules.");
