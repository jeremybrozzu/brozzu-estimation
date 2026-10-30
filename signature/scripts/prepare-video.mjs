#!/usr/bin/env node
/**
 * Prépare la vidéo d'un bien pour l'accueil immersif piloté par le scroll.
 *
 * Usage :
 *   npm run video -- <chemin/video.mp4> <slug-du-bien> [nombre-d-images]
 *
 * Produit dans public/biens/<slug>/sequence/ :
 *   hd/0001.webp …  — grand écran (côté long 1920 px)
 *   sd/0001.webp …  — mobile / appareils modestes (même définition, une image sur deux)
 *   poster.webp     — première image (affichage immédiat + repli sans animation)
 *   final.webp      — dernière image
 *   manifest.json   — lu par le site (nombre d'images, dimensions)
 *
 * Pourquoi une séquence d'images plutôt que la vidéo elle-même ?
 * Faire « avancer » une balise <video> au scroll (currentTime) saccade sur
 * Safari iOS et sur la plupart des vidéos encodées pour le web (images clés
 * espacées). Une séquence dessinée dans un <canvas> est fluide partout et ne
 * modifie en rien le contenu filmé : chaque image est une image réelle de la vidéo.
 *
 * Nécessite ffmpeg et ffprobe installés (https://ffmpeg.org).
 */
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync, copyFileSync } from "node:fs";
import { join, resolve } from "node:path";

const [, , input, slug, framesArg] = process.argv;

if (!input || !slug) {
  console.error("Usage : npm run video -- <video.mp4> <slug-du-bien> [nombre-d-images]");
  process.exit(1);
}
if (!/^[a-z0-9-]+$/.test(slug)) {
  console.error("Le slug ne doit contenir que des minuscules, chiffres et tirets (ex. villa-martigues-ferrieres).");
  process.exit(1);
}
if (!existsSync(input)) {
  console.error(`Vidéo introuvable : ${input}`);
  process.exit(1);
}

const target = Math.max(60, Math.min(400, Number(framesArg) || 150));

const probe = JSON.parse(
  execFileSync("ffprobe", [
    "-v", "error",
    "-select_streams", "v:0",
    "-show_entries", "stream=width,height:stream_side_data=rotation:format=duration",
    "-of", "json",
    input,
  ]).toString(),
);
const duration = Number(probe.format.duration);
let { width, height } = probe.streams[0];
const rotation = Math.abs(Number(probe.streams[0].side_data_list?.[0]?.rotation ?? 0));
if (rotation === 90 || rotation === 270) [width, height] = [height, width];

// Bandes noires (enregistrement d'écran, vidéo 4/3 dans un cadre 16/9…) : détectées puis retirées.
let crop = "";
const detect = spawnSync("ffmpeg", [
  "-v", "info", "-i", input, "-t", "20",
  "-vf", "cropdetect=limit=24:round=2:reset=0", "-an", "-f", "null", "-",
]).stderr.toString();
const found = [...detect.matchAll(/crop=(\d+):(\d+):(\d+):(\d+)/g)].at(-1);
if (found) {
  const [, cw, ch, cx, cy] = found.map(Number);
  if (cw * ch < width * height * 0.97) {
    crop = `crop=${cw}:${ch}:${cx}:${cy},`;
    console.log(`Bandes noires retirées : ${width}×${height} → ${cw}×${ch}`);
    [width, height] = [cw, ch];
  }
}
const landscape = width >= height;

console.log(`Vidéo : ${width}×${height}, ${duration.toFixed(1)} s, ${landscape ? "paysage" : "portrait"}`);
console.log(`Extraction de ${target} images…`);

const outDir = resolve("public/biens", slug, "sequence");
rmSync(outDir, { recursive: true, force: true });

function extract(set, longSide, count, quality) {
  const dir = join(outDir, set);
  mkdirSync(dir, { recursive: true });
  const scale = landscape ? `scale=${Math.min(longSide, width)}:-2` : `scale=-2:${Math.min(longSide, height)}`;
  execFileSync("ffmpeg", [
    "-v", "error", "-y",
    "-i", input, "-an",
    "-vf", `${crop}fps=${count}/${duration},${scale}:flags=lanczos`,
    "-frames:v", String(count),
    "-c:v", "libwebp", "-quality", String(quality), "-compression_level", "5",
    join(dir, "%04d.webp"),
  ], { stdio: "inherit" });
  const files = readdirSync(dir).filter((f) => f.endsWith(".webp")).sort();
  const dims = JSON.parse(
    execFileSync("ffprobe", ["-v", "error", "-show_entries", "stream=width,height", "-of", "json", join(dir, files[0])]).toString(),
  ).streams[0];
  console.log(`  ${set} : ${files.length} images ${dims.width}×${dims.height}`);
  return { count: files.length, width: dims.width, height: dims.height, files };
}

// Netteté : pleine résolution (côté long 1920 px) sur tous les écrans. Le jeu « sd » garde
// la même définition — un téléphone recadre la vidéo et l'agrandit — avec deux fois moins d'images.
const hd = extract("hd", 1920, target, 80);
const sd = extract("sd", 1920, Math.round(target / 2), 76);

copyFileSync(join(outDir, "hd", hd.files[0]), join(outDir, "poster.webp"));
copyFileSync(join(outDir, "hd", hd.files.at(-1)), join(outDir, "final.webp"));

const manifest = {
  slug,
  generatedAt: new Date().toISOString(),
  source: { width, height, duration: Number(duration.toFixed(2)) },
  sets: {
    hd: { count: hd.count, width: hd.width, height: hd.height },
    sd: { count: sd.count, width: sd.width, height: sd.height },
  },
};
writeFileSync(join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2));

console.log(`\nTerminé → public/biens/${slug}/sequence/`);
console.log(`Pensez à renseigner \`sequence: "${slug}"\` dans src/content/biens/${slug}.ts`);
