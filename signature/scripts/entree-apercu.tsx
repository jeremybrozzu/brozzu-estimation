/**
 * Point d'entrée de l'aperçu statique (page publiée hors Next.js) :
 * monte le parcours acquéreur en mode « aperçu », sans aucun envoi.
 * Compilé avec esbuild (voir README, « Aperçu publié »).
 */
import { createRoot } from "react-dom/client";
import { ParcoursVisite } from "@/components/visite/ParcoursVisite";

const hote = document.getElementById("parcours-apercu")!;
createRoot(hote).render(
  <ParcoursVisite bien={hote.dataset.bien!} titreBien={hote.dataset.titre!} apercu />,
);
