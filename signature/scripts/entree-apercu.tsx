/**
 * Point d'entrée des pages statiques (hors Next.js) : monte le parcours acquéreur.
 * Avec data-envoi="<e-mail>", la fiche part par FormSubmit (hébergement comme
 * l'application d'estimation) ; sans, mode « aperçu » sans aucun envoi.
 * Compilé avec esbuild (voir README, « Aperçu publié »).
 */
import { createRoot } from "react-dom/client";
import { ParcoursVisite } from "@/components/visite/ParcoursVisite";

const hote = document.getElementById("parcours-apercu")!;
createRoot(hote).render(
  <ParcoursVisite
    bien={hote.dataset.bien!}
    titreBien={hote.dataset.titre!}
    agenda={hote.dataset.agenda}
    conseiller={hote.dataset.conseiller}
    envoiDirect={hote.dataset.envoi}
    apercu={!hote.dataset.envoi}
  />,
);
