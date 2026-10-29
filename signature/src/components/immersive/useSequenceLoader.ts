"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SequenceManifest } from "@/lib/sequence";

type Nav = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean; effectiveType?: string };
};

/**
 * Choisit le jeu d'images : « sd » pour les téléphones, les connexions lentes,
 * le mode économie de données et les appareils peu dotés en mémoire.
 */
export function pickSet(): "hd" | "sd" {
  const nav = navigator as Nav;
  const small = Math.min(window.innerWidth, window.innerHeight) < 700;
  const slow = nav.connection?.saveData || /(^|-)2g|3g/.test(nav.connection?.effectiveType ?? "");
  const weak = (nav.deviceMemory ?? 8) <= 2;
  return small || slow || weak ? "sd" : "hd";
}

/** Passes de chargement : une image sur 8, puis sur 4, sur 2, puis toutes. */
const STRIDES = [8, 4, 2, 1];
const CONCURRENCY = 6;
/** Au-delà, on lève l'écran de chargement quoi qu'il arrive. */
const MAX_WAIT_MS = 9000;

export function useSequenceLoader(sequence: SequenceManifest, set: "hd" | "sd" | null) {
  const frames = useRef<(HTMLImageElement | undefined)[]>([]);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!set) return;
    const { count } = sequence[set];
    frames.current = new Array(count);
    let cancelled = false;

    // Ordre de chargement : grossier d'abord pour que le scroll réponde vite.
    const order: number[] = [];
    const seen = new Set<number>();
    for (const s of STRIDES) {
      const pass = Array.from({ length: Math.ceil(count / s) }, (_, k) => k * s);
      if (s === STRIDES[0]) pass.push(count - 1);
      for (const i of pass) {
        if (seen.has(i)) continue;
        seen.add(i);
        order.push(i);
      }
    }
    const firstPass = order.findIndex((i) => i % STRIDES[0] !== 0 && i !== count - 1);
    const threshold = firstPass === -1 ? order.length : firstPass;

    let next = 0;
    let done = 0;
    const src = (i: number) => `${sequence.base}/${set}/${String(i + 1).padStart(4, "0")}.webp`;

    const loadNext = (): Promise<void> => {
      if (cancelled || next >= order.length) return Promise.resolve();
      const i = order[next++];
      const img = new Image();
      img.decoding = "async";
      img.src = src(i);
      return img
        .decode()
        .then(() => {
          if (cancelled) return;
          frames.current[i] = img;
        })
        .catch(() => {})
        .finally(() => {
          if (cancelled) return;
          done++;
          if (done <= threshold) setProgress(done / threshold);
          if (done === threshold) setReady(true);
        })
        .then(loadNext);
    };

    for (let k = 0; k < CONCURRENCY; k++) loadNext();
    const timer = setTimeout(() => !cancelled && setReady(true), MAX_WAIT_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [sequence, set]);

  /** Image chargée la plus proche de l'image demandée (-1 si aucune). */
  const nearest = useCallback((i: number) => {
    const f = frames.current;
    if (f[i]) return i;
    for (let d = 1; d < f.length; d++) {
      if (f[i - d]) return i - d;
      if (f[i + d]) return i + d;
    }
    return -1;
  }, []);

  return { frames, progress, ready, nearest };
}
