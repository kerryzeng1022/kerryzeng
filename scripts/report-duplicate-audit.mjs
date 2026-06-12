const ignoredDuplicatePaths = new Set([
  "cover", "title", "subtitle", "generatedAt", "userProfileSummary", "dimension",
  "dimensionName", "scoreLevel", "trackName", "matchLabel", "matchStatus",
  "scoreBreakdown", "roleDetails", "suitableRoles", "relatedDimensions",
  "suitableScenarios", "environment", "roleId", "roleTitle", "familyId", "familyName"
]);

function normalizeDuplicateText(text) {
  return text
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\s，。！？、；：,.!?;:'"“”‘’（）()【】\[\]<>《》\-—_\/\\0-9]/g, "");
}

export function auditReportText(report) {
  const exact = new Map();
  const repeatedShingles = new Map();
  const issues = [];

  function visit(value, path = []) {
    if (typeof value === "string") {
      if (path.some((part) => ignoredDuplicatePaths.has(part))) return;
      const sentences = value.match(/[^。！？!?；;\n]+[。！？!?；;]?/g) ?? [value];
      for (const sentence of sentences) {
        const normalized = normalizeDuplicateText(sentence);
        if (normalized.length < 16) continue;
        const currentPath = path.join(".");
        let originalPath = exact.get(normalized);
        if (!originalPath) {
          const localShingles = new Set();
          for (let index = 0; index <= normalized.length - 14; index += 1) {
            const shingle = normalized.slice(index, index + 14);
            if (localShingles.has(shingle)) {
              originalPath = currentPath;
              break;
            }
            localShingles.add(shingle);
            originalPath = repeatedShingles.get(shingle);
            if (originalPath) break;
          }
        }
        if (originalPath) {
          issues.push({ currentPath, originalPath, sentence: sentence.trim() });
          continue;
        }
        exact.set(normalized, currentPath);
        for (let index = 0; index <= normalized.length - 14; index += 1) {
          const shingle = normalized.slice(index, index + 14);
          if (!repeatedShingles.has(shingle)) repeatedShingles.set(shingle, currentPath);
        }
      }
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item, index) => visit(item, [...path, String(index)]));
      return;
    }
    if (value && typeof value === "object") {
      Object.entries(value).forEach(([key, entry]) => visit(entry, [...path, key]));
    }
  }

  visit(report);
  return issues;
}

export function assertNoDuplicateReportText(report) {
  const issues = auditReportText(report);
  if (issues.length) {
    const issue = issues[0];
    throw new Error(
      `duplicate wording: ${issue.currentPath} repeats ${issue.originalPath}: ${issue.sentence.slice(0, 60)}`
    );
  }
}
