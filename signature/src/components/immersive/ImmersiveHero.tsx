"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { ChapitreImmersif } from "@/content/types";
import type { SequenceManifest } from "@/lib/sequence";
import { useSequenceLoader, pickSet } from "./useSequenceLoader";
import { Loader } from "./Loader";

gsap.registerPlugin(ScrollTrigger);

interface Props {
  sequence: SequenceManifest | null;
  titre: string;
  lieu: string;
  accroche: string;
  chapitres: ChapitreImmersif[];
  demo?: boolean;
}

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const getReducedMotion = () => window.matchMedia(REDUCED_MOTION).matches;
function subscribeReducedMotion(cb: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
const noop = () => () => {};

/** Hauteur de défilement de l'expérience, en hauteurs d'écran. */
const SCROLL_LENGTH = 5;

/**
 * Accueil immersif : la vidéo du bien, découpée en images, avance au rythme
 * du défilement. Le dessin se fait dans un <canvas> en mode « cover ».
 */
export function ImmersiveHero({ sequence, titre, lieu, accroche, chapitres, demo }: Props) {
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, () => false);
  // Le jeu d'images dépend de l'appareil : choisi une fois, côté navigateur uniquement.
  const set = useSyncExternalStore(noop, pickSet, () => null);

  if (!sequence || reducedMotion) {
    return <StaticHero sequence={sequence} titre={titre} lieu={lieu} accroche={accroche} chapitres={chapitres} demo={demo} />;
  }

  return (
    <ScrollSequence
      sequence={sequence}
      set={set}
      titre={titre}
      lieu={lieu}
      accroche={accroche}
      chapitres={chapitres}
      demo={demo}
    />
  );
}

function ScrollSequence({
  sequence,
  set,
  titre,
  lieu,
  accroche,
  chapitres,
  demo,
}: Props & { sequence: SequenceManifest; set: "hd" | "sd" | null }) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const chapterRefs = useRef<(HTMLDivElement | null)[]>([]);
  const barRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);

  const { frames, ready, progress: loadProgress, nearest } = useSequenceLoader(sequence, set);

  // Image courante, partagée entre le scroll et la boucle de dessin.
  const current = useRef({ frame: 0, drawn: -1 });

  // Dessin « cover » dans le canvas, à la résolution de l'écran (DPR ≤ 2).
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !set) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let raf = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      current.current.drawn = -1;
    };
    const draw = () => {
      const idx = nearest(current.current.frame);
      if (idx !== -1 && idx !== current.current.drawn) {
        const img = frames.current[idx]!;
        const cw = canvas.width, ch = canvas.height;
        const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
        const w = img.naturalWidth * scale, h = img.naturalHeight * scale;
        ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
        current.current.drawn = idx;
      }
      raf = requestAnimationFrame(draw);
    };
    resize();
    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [set, frames, nearest]);

  // Pilotage par le scroll.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !set) return;
    const count = sequence[set].count;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
          onUpdate: (self) => {
            current.current.frame = Math.round(self.progress * (count - 1));
            if (barRef.current) barRef.current.style.transform = `scaleY(${self.progress})`;
          },
        },
      });

      // L'introduction s'efface en douceur au premier mouvement.
      tl.to(introRef.current, { autoAlpha: 0, y: -60, duration: 0.1 }, 0.02);

      // Chapitres : apparition, tenue, disparition.
      chapitres.forEach((c, i) => {
        const el = chapterRefs.current[i];
        if (!el) return;
        const span = c.fin - c.debut;
        const fade = Math.min(0.05, span / 3);
        tl.fromTo(el, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: fade }, c.debut);
        tl.to(el, { autoAlpha: 0, y: -40, duration: fade }, c.fin - fade);
      });

      // Fondu final vers la présentation du bien.
      tl.fromTo(veilRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.06 }, 0.94);
      tl.set({}, {}, 1);
    }, section);

    return () => ctx.revert();
  }, [set, sequence, chapitres]);

  return (
    <section
      ref={sectionRef}
      aria-label={`Découverte immersive — ${titre}`}
      className="relative bg-noir"
      style={{ height: `${SCROLL_LENGTH * 100}svh` }}
    >
      <div className="sticky top-0 h-svh w-full overflow-hidden">
        {/* Poster immédiat (LCP), remplacé par le canvas dès que les images arrivent */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${sequence.base}/poster.webp`}
          alt=""
          width={sequence.hd.width}
          height={sequence.hd.height}
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <canvas
          ref={canvasRef}
          aria-hidden
          className="absolute inset-0 h-full w-full transition-opacity duration-700"
          style={{ opacity: ready ? 1 : 0 }}
        />

        {/* Voiles pour la lisibilité du texte */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-noir/55 via-transparent to-noir/70" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(23,22,21,0.55))]" />

        {/* Introduction */}
        <div ref={introRef} className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <p className="surtitre text-champagne">Signature Collection</p>
          <h1 className="mt-6 max-w-4xl font-serif text-5xl font-medium leading-[1.02] text-ivoire sm:text-7xl lg:text-8xl">
            {titre}
          </h1>
          <p className="mt-5 surtitre text-ivoire/80">{lieu}</p>
          <p className="mt-10 max-w-xl font-serif text-2xl italic text-ivoire/90 sm:text-3xl">{accroche}</p>

          <div className="absolute bottom-10 flex flex-col items-center gap-4">
            <span className="surtitre text-[0.6rem] text-ivoire/70">Défilez pour entrer</span>
            <span className="relative block h-14 w-px overflow-hidden bg-ivoire/15">
              <span className="scroll-hint-line absolute inset-0 bg-champagne" />
            </span>
          </div>
        </div>

        {/* Chapitres */}
        {chapitres.map((c, i) => (
          <div
            key={i}
            ref={(el) => {
              chapterRefs.current[i] = el;
            }}
            className="invisible absolute inset-x-0 bottom-[16svh] px-6 opacity-0 sm:bottom-auto sm:left-[8vw] sm:top-1/2 sm:max-w-xl sm:-translate-y-1/2 sm:px-0"
          >
            {c.surtitre && (
              <p className="surtitre flex items-center gap-4 text-champagne">
                <span className="block h-px w-10 bg-champagne" />
                {c.surtitre}
              </p>
            )}
            <p className="mt-4 font-serif text-4xl leading-tight text-ivoire sm:text-5xl">{c.texte}</p>
          </div>
        ))}

        {/* Progression */}
        <div aria-hidden className="absolute right-5 top-1/2 h-32 w-px -translate-y-1/2 bg-ivoire/15 sm:right-8">
          <div ref={barRef} className="h-full w-full origin-top scale-y-0 bg-champagne" />
        </div>

        {demo && (
          <p className="absolute left-1/2 top-20 -translate-x-1/2 whitespace-nowrap rounded-full border border-champagne/40 bg-noir/60 px-4 py-1.5 surtitre text-[0.58rem] text-champagne backdrop-blur">
            Démonstration — vidéo provisoire
          </p>
        )}

        {/* Transition vers la suite de la page */}
        <div ref={veilRef} className="invisible absolute inset-0 bg-ivoire opacity-0" />
      </div>

      <Loader progress={loadProgress} done={ready} />
    </section>
  );
}

/** Version sans animation : préférences d'accessibilité ou séquence absente. */
function StaticHero({ sequence, titre, lieu, accroche, chapitres, demo }: Props) {
  return (
    <section aria-label={titre} className="relative bg-noir">
      <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 text-center">
        {sequence && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`${sequence.base}/poster.webp`} alt="" className="absolute inset-0 h-full w-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-noir/60 via-noir/30 to-noir/80" />
        <div className="relative">
          <p className="surtitre text-champagne">Signature Collection</p>
          <h1 className="mt-6 font-serif text-5xl font-medium text-ivoire sm:text-7xl">{titre}</h1>
          <p className="mt-5 surtitre text-ivoire/80">{lieu}</p>
          <p className="mx-auto mt-10 max-w-xl font-serif text-2xl italic text-ivoire/90">{accroche}</p>
          {demo && <p className="mt-8 surtitre text-[0.6rem] text-champagne">Démonstration</p>}
        </div>
      </div>
      {chapitres.length > 0 && (
        <div className="mx-auto grid max-w-5xl gap-12 px-6 py-24 sm:grid-cols-3">
          {chapitres.map((c, i) => (
            <div key={i}>
              {c.surtitre && <p className="surtitre text-champagne">{c.surtitre}</p>}
              <p className="mt-3 font-serif text-2xl text-ivoire">{c.texte}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
