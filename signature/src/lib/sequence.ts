import { readFile } from "node:fs/promises";
import { join } from "node:path";

export interface SequenceSet {
  count: number;
  width: number;
  height: number;
}

export interface SequenceManifest {
  base: string;
  hd: SequenceSet;
  sd: SequenceSet;
}

/** Lit au build le manifest produit par `npm run video`. */
export async function loadSequence(name: string | null): Promise<SequenceManifest | null> {
  "use cache";
  if (!name) return null;
  try {
    const raw = await readFile(join(process.cwd(), "public/biens", name, "sequence/manifest.json"), "utf8");
    const m = JSON.parse(raw);
    return { base: `/biens/${name}/sequence`, hd: m.sets.hd, sd: m.sets.sd };
  } catch {
    return null;
  }
}
