# BROZZU — Signature Collection

Mini-sites immersifs pour les mandats de **BROZZU – L'Atelier Immo**.
*Des lieux. Des vies. Une histoire.*

Projet indépendant de brozzu.fr, prévu pour un sous-domaine (ex. `signature.brozzu.fr/<bien>`).
Rien n'est déployé : tout se teste en local.

## Lancer le site en local

Prérequis : Node.js 20+ et, pour préparer une vidéo, [ffmpeg](https://ffmpeg.org/download.html)
(macOS : `brew install ffmpeg`).

```bash
cd signature
npm install
npm run dev
```

Ouvrir <http://localhost:3000/demo> et faire défiler la page.

## Ajouter la vidéo d'un bien

```bash
npm run video -- ~/Downloads/visite.mp4 villa-martigues 180
```

- 2ᵉ argument : le *slug*, qui devient l'URL (`/villa-martigues`).
- 3ᵉ argument (facultatif) : nombre d'images extraites (180 par défaut, 60 à 400).
  Comptez environ 20 à 25 images par seconde de vidéo pour une fluidité optimale.

Le script crée `public/biens/<slug>/sequence/` (images grand écran, images mobile,
poster, manifest). Il suffit ensuite de copier `src/content/biens/demo.ts` en
`src/content/biens/<slug>.ts`, d'y renseigner les textes et `sequence: "<slug>"`,
puis de l'ajouter dans `src/content/biens/index.ts`.

## Choix techniques

| Besoin | Choix | Pourquoi |
| --- | --- | --- |
| Vidéo pilotée au scroll | Séquence d'images WebP dessinée dans un `<canvas>` + GSAP ScrollTrigger | Faire avancer une balise `<video>` au scroll saccade sur iPhone et sur la plupart des vidéos web. Une séquence d'images est fluide partout et reste fidèle à 100 % à la vidéo. |
| Mobile / appareils modestes | Jeu « sd » (1280 px, une image sur deux) | Choisi automatiquement : petit écran, économie de données, connexion lente, peu de mémoire. |
| Chargement | Poster immédiat, puis images par passes (1/8, 1/4, 1/2, toutes) | Le scroll répond en ~1 s ; la finesse arrive en arrière-plan. Rideau de chargement levé au plus tard après 9 s. |
| Accessibilité | `prefers-reduced-motion` → accueil fixe + textes en clair | Aucune animation imposée. |
| Framework | Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 | Pages pré-générées (rapides, bien référencées) et fonctions serveur pour le formulaire, l'agenda et l'administration (phases 4-5). |

## Structure

```
scripts/prepare-video.mjs          Vidéo → séquence d'images
src/content/types.ts               Modèle d'un bien (une info inconnue reste null)
src/content/biens/                 Un fichier par bien
src/components/immersive/          Accueil immersif (canvas, chargement, repli)
src/app/[slug]/page.tsx            Page d'un bien (SEO, Open Graph)
public/brand/                      Logo et monogramme officiels
```

## Feuille de route

1. ✅ Analyse et direction artistique
2. ✅ Accueil immersif piloté par le scroll (démo) — **en attente de la vidéo réelle**
3. Présentation du bien : annonce, caractéristiques, galerie, DPE/GES, mentions légales
4. Parcours acquéreur en 4 étapes (React Hook Form + Zod)
5. Serveur : stockage sécurisé, Google Agenda (OAuth côté serveur), e-mails, administration
6. Vérifications : performances, accessibilité, sécurité, mobile
