"use client";

/**
 * Bouton « Organiser une visite », toujours accessible.
 * Phase 4 : ouvrira le parcours acquéreur en quatre étapes.
 */
export function VisitButton() {
  return (
    <a
      href="#visite"
      className="group fixed bottom-5 right-5 z-40 flex items-center gap-3 rounded-full border border-champagne/40 bg-noir/70 py-3 pl-5 pr-4 text-ivoire shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] backdrop-blur-md transition-colors duration-500 hover:border-champagne hover:bg-anthracite sm:bottom-8 sm:right-8"
    >
      <span className="surtitre text-[0.62rem]">Organiser une visite</span>
      <span aria-hidden className="block h-px w-6 bg-champagne transition-all duration-500 ease-luxe group-hover:w-9" />
    </a>
  );
}
