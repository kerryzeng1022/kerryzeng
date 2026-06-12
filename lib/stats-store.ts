import { promises as fs } from "fs";
import path from "path";
import { getStore } from "@netlify/blobs";

type StatsStore = {
  questionnaireStarts: number;
  updatedAt: string;
};

const localStatsPath = path.join(process.cwd(), "stats-store.json");
const blobStoreName = "jobseek-stats";
const statsBlobKey = "global";

function shouldUseBlobStore() {
  return Boolean(process.env.NETLIFY_BLOBS_CONTEXT);
}

function createEmptyStats(): StatsStore {
  return {
    questionnaireStarts: 0,
    updatedAt: new Date().toISOString()
  };
}

function getStatsBlobStore() {
  return getStore(blobStoreName, { consistency: "strong" });
}

async function readLocalStats(): Promise<StatsStore> {
  try {
    const raw = await fs.readFile(localStatsPath, "utf-8");
    return JSON.parse(raw) as StatsStore;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return createEmptyStats();
    throw error;
  }
}

async function writeLocalStats(stats: StatsStore) {
  await fs.writeFile(localStatsPath, JSON.stringify(stats, null, 2), "utf-8");
}

export async function getQuestionnaireStats() {
  if (shouldUseBlobStore()) {
    const stats = (await getStatsBlobStore().get(statsBlobKey, {
      type: "json"
    })) as StatsStore | null;
    return stats ?? createEmptyStats();
  }

  return readLocalStats();
}

export async function incrementQuestionnaireStarts() {
  const current = await getQuestionnaireStats();
  const next = {
    questionnaireStarts: current.questionnaireStarts + 1,
    updatedAt: new Date().toISOString()
  };

  if (shouldUseBlobStore()) {
    await getStatsBlobStore().setJSON(statsBlobKey, next);
  } else {
    await writeLocalStats(next);
  }

  return next;
}
