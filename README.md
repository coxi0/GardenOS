# GardenOS

Application de bureau pour la gestion d'un jardin potager. Permet de suivre les parcelles, les cultures, les récoltes, le stock de graines et d'outils, et de tenir un journal de bord.

## Stack technique

- **Electron** — application de bureau (main / preload / renderer)
- **Angular 21** — interface utilisateur (standalone components, signals, reactive forms)
- **Prisma** — ORM pour l'accès à la base de données
- **SQLite** — base de données locale (aucune dépendance cloud)

## Prérequis

- Node.js >= 18
- npm >= 9

## Installation

```bash
# 1. Installer les dépendances à la racine
npm install

# 2. Installer les dépendances Angular
npm install --prefix renderer

# 3. Générer le client Prisma
npx prisma generate

# 4. Créer la base de données et appliquer les migrations
npx prisma migrate deploy

# 5. Recompiler les modules natifs pour le Node de votre système
npm rebuild better-sqlite3

# 6. Peupler la base avec les données de test
npx prisma db seed
```

> Après le seed, recompilez `better-sqlite3` pour Electron avant de démarrer l'app :
> ```bash
> npx @electron/rebuild -f -w better-sqlite3
> ```

## Lancement

```bash
npm run start
```

> Pour le développement avec hot-reload Angular :
> ```bash
> npm run dev
> ```

## Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run start` | Lance l'application Electron |
| `npm run dev` | Développement avec hot-reload (Angular + Electron) |
| `npm run build` | Build complet (Angular + Electron package) |
| `npm run prisma:generate` | Régénère le client Prisma |
| `npm run prisma:migrate` | Crée et applique une nouvelle migration |
| `npm run prisma:studio` | Ouvre Prisma Studio (interface DB visuelle) |

## Structure du projet

```
GardenOS/
├── src/
│   ├── main/
│   │   ├── main.ts              # Point d'entrée Electron, BrowserWindow
│   │   └── ipc/                 # Handlers IPC (jardin, plantes, stock, journal, refs)
│   ├── preload/
│   │   └── preload.ts           # contextBridge — expose l'API au renderer
│   └── shared/
│       └── ipc/                 # Types et DTOs partagés main ↔ renderer
├── renderer/
│   └── src/app/
│       ├── component/           # Composants Angular (dashboard, jardin, plantes, stock, journal, parametres)
│       ├── services/            # Services Angular (PlanteService, JardinService, StockService, JournalService…)
│       └── layout/navbar/       # Barre de navigation
├── prisma/
│   ├── schema/                  # Schémas Prisma découpés par domaine
│   └── seed.ts                  # Script de peuplement initial
└── README.md
```

## Base de données

12 modèles Prisma organisés en domaines :

| Modèle | Description |
|--------|-------------|
| `Plante` | Catalogue des plantes (nom, latin, type, calendrier) |
| `TypePlante` | Référentiel des types (Légume, Aromatique, Fruit…) |
| `Parcelle` | Zones du jardin avec position sur grille |
| `Culture` | Plantation d'une plante dans une parcelle |
| `StatutCulture` | Référentiel des statuts (Planifiée, En cours, Récoltée…) |
| `Tag` | Étiquettes libres attachées aux cultures |
| `CultureTag` | Table de jonction N:M Culture ↔ Tag |
| `Recolte` | Enregistrement d'une récolte (quantité, unité) |
| `Journal` | Entrées du journal de bord liées à une culture |
| `StockItem` | Articles en stock (graines, outils, engrais) |
| `CategorieStock` | Référentiel des catégories de stock |
| `TypeSol` | Référentiel des types de sol |

Relations clés : `Parcelle` → `Culture` → `Recolte` (1:N), `Culture` ↔ `Tag` (N:M via `CultureTag`).

### Schéma entité-relation

Le diagramme complet de la base de données est disponible dans le fichier [`gardenOs_Bd.drawio`](gardenOs_Bd.drawio) (ouvrir avec [draw.io](https://app.diagrams.net/)). Une version PDF est également fournie : [`gardenOs_Bd.pdf`](gardenOs_Bd.pdf).

## Fonctionnalités

- **Dashboard** — vue d'ensemble : cultures par statut, prochains semis et récoltes, alertes de stock
- **Jardin** — grille de parcelles avec drag & drop, gestion des cultures et récoltes par parcelle
- **Plantes** — catalogue avec recherche Wikipedia, formulaire complet
- **Stock** — suivi des quantités avec seuils d'alerte
- **Journal** — journal de bord chronologique par culture
- **Paramètres** — gestion des référentiels (types de plante, types de sol, statuts, catégories de stock)

Bien entendu, Claude Sonnet 4.6 a été utilisé pour l'aide ou developpement de cette application afin de limiter le travail répétitif, corriger certains bugs, problème de gestion/structure et faire les annotations dans le code directement. 