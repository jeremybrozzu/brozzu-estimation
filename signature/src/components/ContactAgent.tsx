import { agence } from "@/content/agence";

/**
 * Bouton « Contactez un agent » : un clic dévoile le numéro, cliquable pour appeler.
 * Élément <details> natif : fonctionne sans JavaScript, au clavier et au lecteur d'écran.
 */
export function ContactAgent() {
  return (
    <details className="group/contact w-full sm:w-auto">
      <summary className="flex cursor-pointer list-none items-center justify-center gap-4 rounded-full border border-ivoire/40 py-4 pl-7 pr-6 text-ivoire transition-colors hover:border-champagne hover:text-champagne group-open/contact:border-champagne [&::-webkit-details-marker]:hidden">
        <span className="surtitre text-[0.66rem]">Contactez un agent</span>
        <span aria-hidden className="text-champagne transition-transform duration-300 group-open/contact:rotate-45">
          +
        </span>
      </summary>
      <div className="mt-4 text-center [animation:fondu_.4s_ease-out] sm:text-left">
        <a
          href={agence.telephone.lien}
          className="font-serif text-3xl lining-nums tabular-nums text-ivoire underline decoration-champagne/50 underline-offset-8 transition-colors hover:text-champagne hover:decoration-champagne"
        >
          {agence.telephone.affiche}
        </a>
        <p className="mt-2 text-xs text-ivoire/55">Touchez le numéro pour appeler un conseiller BROZZU.</p>
      </div>
    </details>
  );
}
