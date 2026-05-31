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

Lance simultanément le serveur Angular (hot-reload) et Electron.

## Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run start` | Lance Angular + Electron en mode développement |
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
| `Parcelle` | Zones du jardin avec position sur grille et exposition solaire (`enum Exposition`) |
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


---

## Remise en question et pistes d'amélioration

Sur le plan de la modélisation, plusieurs choix auraient mérité plus de réflexion en amont. `StatutCulture` aurait dû être un `enum` Prisma dès le départ plutôt qu'une table de référence, puisque ses valeurs sont fixes et jamais modifiées par l'utilisateur, utiliser une table complète ajoute une jointure, un handler IPC et une section dans les Paramètres pour rien. De même, l'enum `Exposition` a été ajouté tardivement, ce qui a nécessité une migration et une correction du seed en cours de développement alors qu'une conception initiale plus rigoureuse l'aurait inclus dès le début. Il manque aussi une contrainte `@unique` sur le nom des parcelles, ce qui permet à deux parcelles d'avoir le même nom sans erreur.

Côté architecture, le `wikipedia.service.ts` appelle les APIs Wikipedia et Wikidata directement depuis le renderer au lieu de passer par un handler IPC dans le main process. Ce n'est pas un problème fonctionnel mais c'est une incohérence par rapport à la philosophie Electron où le renderer est censé ne communiquer qu'avec le preload. Le `ParametresComponent` utilise également `ChangeDetectorRef` avec mutation d'objet ordinaire au lieu de signaux, contrairement à tous les autres composants, ce qui le rend moins cohérent avec le reste du code. Sur la qualité générale, il n'y a aucune gestion d'erreur visible pour l'utilisateur, les erreurs restent en console.

Concernant la gestion du temps et l'utilisation de l'IA, le projet a été développé avec l'assistance de Claude code, ce qui a clairement eu un effet pervers sur la façon de travailler. Savoir que l'IA peut réécrire un fichier entier en quelques secondes encourage une certaine passivité dans la recherche et plus une suite de question réponse avec le prompt. C'est la meme chose pour la correction de bug ou la recherche est beaucoup plus rapide que de tester chaque ligne.  

L'IA a été utile pour les tâches répétitives (annotations JSDoc, handlers IPC similaires, corrections de typage, vérification des consignes), mais elle a aussi conforté une tendance à ne pas planifier suffisamment en amont, en se disant qu'on pourra toujours corriger ça plus tard. Plusieurs choses ont ainsi été implémentées en réaction comme l'enum Exposition, le fix du `typePlanteId`, la correction du mapping Wikipedia plutôt que pensées dès la conception..... 

Parmi les fonctionnalités qui auraient pu être développées avec plus de temps j'aurais voulu mettre en place un lien automatique entre les récoltes et le stock (incrémenter la quantité en stock à chaque récolte enregistrée), un historique des mouvements de stock avec un modèle `MouvementStock`, des notifications système natives via Electron pour les rappels de semis, un export CSV ou PDF des données, et une recherche globale transversale à toute l'application.