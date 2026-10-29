"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Photo } from "@/content/types";

/**
 * Galerie éditoriale + affichage plein écran.
 * Les photographies sont présentées telles quelles : le recadrage de la
 * mosaïque est purement visuel, le plein écran montre l'image entière.
 */

/** Mise en page de la mosaïque (grand écran) : une photo pleine largeur, puis des paires. */
const MOSAIQUE = [
  "md:col-span-12 md:aspect-[16/8]",
  "md:col-span-7 md:h-[34vw] md:max-h-[34rem]",
  "md:col-span-5 md:h-[34vw] md:max-h-[34rem]",
  "md:col-span-5 md:h-[34vw] md:max-h-[34rem]",
  "md:col-span-7 md:h-[34vw] md:max-h-[34rem]",
  "md:col-span-6 md:h-[30vw] md:max-h-[30rem]",
  "md:col-span-6 md:h-[30vw] md:max-h-[30rem]",
];

export function Galerie({ photos, base }: { photos: Photo[]; base: string }) {
  const [ouverte, setOuverte] = useState<number | null>(null);
  const declencheur = useRef<HTMLElement | null>(null);
  const src = (p: Photo, w: 800 | 1600) => `${base}/${p.fichier}-${w}.webp`;

  const ouvrir = (i: number, el: HTMLElement) => {
    declencheur.current = el;
    setOuverte(i);
  };
  const fermer = useCallback(() => {
    setOuverte(null);
    declencheur.current?.focus();
  }, []);

  return (
    <section aria-labelledby="titre-galerie" className="bg-noir text-ivoire">
      <div className="mx-auto max-w-[96rem] px-4 py-24 sm:px-8 sm:py-32">
        <div className="mx-auto flex max-w-6xl items-end justify-between gap-6 px-2 pb-10">
          <div>
            <p className="surtitre text-champagne">Galerie</p>
            <h2 id="titre-galerie" className="mt-4 font-serif text-4xl sm:text-5xl">
              Le lieu, en images
            </h2>
          </div>
          <button
            type="button"
            onClick={(e) => ouvrir(0, e.currentTarget)}
            className="surtitre hidden shrink-0 border-b border-champagne/50 pb-1 text-[0.6rem] text-champagne transition-colors hover:border-champagne sm:block"
          >
            Plein écran · {photos.length} photos
          </button>
        </div>

        <ul className="grid gap-3 md:grid-cols-12 md:gap-4">
          {photos.map((p, i) => (
            <li key={p.fichier} className={`${MOSAIQUE[i % MOSAIQUE.length]} aspect-[4/3] md:aspect-auto`}>
              <button
                type="button"
                onClick={(e) => ouvrir(i, e.currentTarget)}
                className="group relative block h-full w-full overflow-hidden bg-anthracite"
                aria-label={`Agrandir : ${p.legende ?? p.alt}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src(p, 1600)}
                  srcSet={`${src(p, 800)} 800w, ${src(p, 1600)} 1600w`}
                  sizes={i === 0 ? "100vw" : "(min-width: 768px) 60vw, 100vw"}
                  alt={p.alt}
                  width={p.largeur}
                  height={p.hauteur}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-[1.4s] ease-luxe group-hover:scale-[1.03]"
                />
                {p.legende && (
                  <span className="pointer-events-none absolute bottom-0 left-0 p-5 surtitre text-[0.58rem] text-ivoire opacity-0 transition-opacity duration-500 [text-shadow:0_1px_12px_rgba(0,0,0,.6)] group-hover:opacity-100 group-focus-visible:opacity-100">
                    {p.legende}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {ouverte !== null && (
        <Visionneuse photos={photos} index={ouverte} onIndex={setOuverte} onFermer={fermer} src={src} />
      )}
    </section>
  );
}

function Visionneuse({
  photos,
  index,
  onIndex,
  onFermer,
  src,
}: {
  photos: Photo[];
  index: number;
  onIndex: (i: number) => void;
  onFermer: () => void;
  src: (p: Photo, w: 800 | 1600) => string;
}) {
  const fermerRef = useRef<HTMLButtonElement>(null);
  const toucher = useRef<number | null>(null);
  const n = photos.length;
  const p = photos[index];
  const aller = useCallback((d: number) => onIndex((index + d + n) % n), [index, n, onIndex]);

  useEffect(() => {
    fermerRef.current?.focus();
    const avant = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = avant;
    };
  }, []);

  useEffect(() => {
    const clavier = (e: KeyboardEvent) => {
      if (e.key === "Escape") onFermer();
      if (e.key === "ArrowRight") aller(1);
      if (e.key === "ArrowLeft") aller(-1);
    };
    window.addEventListener("keydown", clavier);
    return () => window.removeEventListener("keydown", clavier);
  }, [aller, onFermer]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Photo ${index + 1} sur ${n}`}
      className="fixed inset-0 z-[60] flex flex-col bg-noir/97 backdrop-blur-sm"
      onPointerDown={(e) => (toucher.current = e.clientX)}
      onPointerUp={(e) => {
        if (toucher.current === null) return;
        const dx = e.clientX - toucher.current;
        toucher.current = null;
        if (Math.abs(dx) > 50) aller(dx < 0 ? 1 : -1);
      }}
    >
      <div className="flex items-center justify-between px-5 py-4 sm:px-8">
        <p className="surtitre text-[0.6rem] tabular-nums text-ivoire/70">
          {String(index + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
          {p.legende && <span className="ml-4 text-champagne">{p.legende}</span>}
        </p>
        <button
          ref={fermerRef}
          type="button"
          onClick={onFermer}
          className="surtitre flex items-center gap-3 py-2 text-[0.6rem] text-ivoire hover:text-champagne"
        >
          Fermer
          <span aria-hidden className="relative block h-4 w-4 before:absolute before:left-1/2 before:top-0 before:h-full before:w-px before:rotate-45 before:bg-current after:absolute after:left-1/2 after:top-0 after:h-full after:w-px after:-rotate-45 after:bg-current" />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 pb-6 sm:px-20">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={p.fichier}
          src={src(p, 1600)}
          alt={p.alt}
          width={p.largeur}
          height={p.hauteur}
          className="max-h-full max-w-full select-none object-contain [animation:apparition_.5s_ease-out]"
          draggable={false}
        />
        <button
          type="button"
          onClick={() => aller(-1)}
          aria-label="Photo précédente"
          className="absolute left-2 top-1/2 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-ivoire/20 text-ivoire transition-colors hover:border-champagne hover:text-champagne sm:flex"
        >
          <span aria-hidden>←</span>
        </button>
        <button
          type="button"
          onClick={() => aller(1)}
          aria-label="Photo suivante"
          className="absolute right-2 top-1/2 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-ivoire/20 text-ivoire transition-colors hover:border-champagne hover:text-champagne sm:flex"
        >
          <span aria-hidden>→</span>
        </button>
      </div>
    </div>
  );
}
