import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'node:path';

const dbPath = path.resolve('./dev.db');
const adapter = new PrismaBetterSqlite3({ url: 'file:' + dbPath });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  // Nettoyage dans l'ordre des dépendances
  await prisma.journal.deleteMany();
  await prisma.recolte.deleteMany();
  await prisma.cultureTag.deleteMany();
  await prisma.culture.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.parcelle.deleteMany();
  await prisma.stockItem.deleteMany();
  await prisma.plante.deleteMany();
  await prisma.typePlante.deleteMany();
  await prisma.categorieStock.deleteMany();
  await prisma.statutCulture.deleteMany();
  await prisma.typeSol.deleteMany();

  // --- Référentiels ---

  const [typeLegume, typeAromatique, typeFruit] = await Promise.all([
    prisma.typePlante.create({ data: { libelle: 'Légume' } }),
    prisma.typePlante.create({ data: { libelle: 'Aromatique' } }),
    prisma.typePlante.create({ data: { libelle: 'Fruit' } }),
  ]);
  await prisma.typePlante.createMany({
    data: [{ libelle: 'Fleur' }, { libelle: 'Arbre' }, { libelle: "Plante d'intérieur" }],
  });
  console.log('Seed TypePlante OK');

  const [catGraine, catOutil, catEngrais] = await Promise.all([
    prisma.categorieStock.create({ data: { libelle: 'Graine' } }),
    prisma.categorieStock.create({ data: { libelle: 'Outil' } }),
    prisma.categorieStock.create({ data: { libelle: 'Engrais' } }),
  ]);
  await prisma.categorieStock.create({ data: { libelle: 'Traitement' } });
  console.log('Seed CategorieStock OK');

  const [statutPlanifiee, statutEnCours, statutRecoltee] = await Promise.all([
    prisma.statutCulture.create({ data: { libelle: 'Planifiée' } }),
    prisma.statutCulture.create({ data: { libelle: 'En cours' } }),
    prisma.statutCulture.create({ data: { libelle: 'Récoltée' } }),
  ]);
  await prisma.statutCulture.create({ data: { libelle: 'Abandonnée' } });
  console.log('Seed StatutCulture OK');

  const [typeSolLimoneux, typeSolSableux] = await Promise.all([
    prisma.typeSol.create({ data: { libelle: 'Limoneux' } }),
    prisma.typeSol.create({ data: { libelle: 'Sableux' } }),
  ]);
  await prisma.typeSol.createMany({
    data: [{ libelle: 'Argileux' }, { libelle: 'Calcaire' }, { libelle: 'Humifère' }],
  });
  console.log('Seed TypeSol OK');

  // --- Plantes ---

  const [tomate, basilic, courgette, fraisier, carotte] = await Promise.all([
    prisma.plante.create({
      data: {
        nom: 'Tomate', nomLatin: 'Solanum lycopersicum',
        typePlanteId: typeLegume.id,
        description: 'Légume fruit très populaire, riche en lycopène.',
        conseil: 'Tuteurer dès 30 cm. Arroser régulièrement sans mouiller le feuillage.',
        ensoleillement: 'Plein soleil',
        moisSemisDebut: 2, moisSemisFin: 4,
        joursArrosage: 2, joursMaturation: 70,
      },
    }),
    prisma.plante.create({
      data: {
        nom: 'Basilic', nomLatin: 'Ocimum basilicum',
        typePlanteId: typeAromatique.id,
        description: 'Herbe aromatique méditerranéenne au parfum intense.',
        conseil: 'Pincer les fleurs pour favoriser la croissance des feuilles.',
        ensoleillement: 'Plein soleil',
        moisSemisDebut: 4, moisSemisFin: 6,
        joursArrosage: 2, joursMaturation: 30,
      },
    }),
    prisma.plante.create({
      data: {
        nom: 'Courgette', nomLatin: 'Cucurbita pepo',
        typePlanteId: typeLegume.id,
        description: "Légume d'été très productif.",
        conseil: 'Récolter jeune pour favoriser la production.',
        ensoleillement: 'Plein soleil',
        moisSemisDebut: 4, moisSemisFin: 5,
        joursArrosage: 3, joursMaturation: 50,
      },
    }),
    prisma.plante.create({
      data: {
        nom: 'Fraisier', nomLatin: 'Fragaria × ananassa',
        typePlanteId: typeFruit.id,
        description: 'Petite plante fruitière vivace très appréciée.',
        conseil: "Supprimer les stolons pour concentrer l'énergie sur les fruits.",
        ensoleillement: 'Mi-ombre',
        moisSemisDebut: 3, moisSemisFin: 5,
        joursArrosage: 2, joursMaturation: 90,
      },
    }),
    prisma.plante.create({
      data: {
        nom: 'Carotte', nomLatin: 'Daucus carota',
        typePlanteId: typeLegume.id,
        description: 'Légume racine riche en bêta-carotène.',
        conseil: 'Éclaircir à 5 cm pour obtenir de belles racines.',
        ensoleillement: 'Plein soleil',
        moisSemisDebut: 3, moisSemisFin: 7,
        joursArrosage: 3, joursMaturation: 80,
      },
    }),
  ]);
  console.log('Seed Plantes OK');

  // --- Parcelles ---

  const [parcellePotager, parcelleAromatiques, parcelleFruits] = await Promise.all([
    prisma.parcelle.create({
      data: {
        nom: 'Potager principal', superficie: 12.0,
        exposition: 'Sud', typeSolId: typeSolLimoneux.id,
        notes: 'Pleine exposition sud, sol bien drainé.',
        posX: 0, posY: 0,
      },
    }),
    prisma.parcelle.create({
      data: {
        nom: 'Carré aromatiques', superficie: 4.0,
        exposition: 'Sud-Est', typeSolId: typeSolSableux.id,
        notes: 'Réservé aux herbes aromatiques.',
        posX: 1, posY: 0,
      },
    }),
    prisma.parcelle.create({
      data: {
        nom: 'Coin fruits', superficie: 6.0,
        exposition: 'Est', typeSolId: typeSolLimoneux.id,
        notes: "Mi-ombre l'après-midi, idéal pour les fraisiers.",
        posX: 0, posY: 1,
      },
    }),
  ]);
  console.log('Seed Parcelles OK');

  // --- Tags ---

  const [tagBio, tagTuteur] = await Promise.all([
    prisma.tag.create({ data: { libelle: 'bio' } }),
    prisma.tag.create({ data: { libelle: 'tuteur' } }),
  ]);
  await prisma.tag.createMany({
    data: [{ libelle: 'arrosage quotidien' }, { libelle: 'hivernal' }],
  });

  // --- Cultures ---

  const [culturesTomate, cultureBasilic, cultureCarotte, cultureFramboisier] = await Promise.all([
    prisma.culture.create({
      data: {
        planteId: tomate.id, parcelleId: parcellePotager.id,
        statutId: statutEnCours.id,
        dateSemisPrevue: new Date('2026-03-15'),
        dateRecoltePrevue: new Date('2026-07-01'),
        dateSemisReelle: new Date('2026-03-18'),
        notes: 'Variété cœur de bœuf. Semis en intérieur.',
        tags: {
          create: [
            { tag: { connect: { id: tagBio.id } } },
            { tag: { connect: { id: tagTuteur.id } } },
          ],
        },
      },
    }),
    prisma.culture.create({
      data: {
        planteId: basilic.id, parcelleId: parcelleAromatiques.id,
        statutId: statutEnCours.id,
        dateSemisPrevue: new Date('2026-04-20'),
        dateRecoltePrevue: new Date('2026-06-01'),
        dateSemisReelle: new Date('2026-04-22'),
        notes: 'Semis en pleine terre après les gelées.',
        tags: { create: [{ tag: { connect: { id: tagBio.id } } }] },
      },
    }),
    prisma.culture.create({
      data: {
        planteId: carotte.id, parcelleId: parcellePotager.id,
        statutId: statutRecoltee.id,
        dateSemisPrevue: new Date('2026-03-01'),
        dateRecoltePrevue: new Date('2026-06-01'),
        dateSemisReelle: new Date('2026-03-05'),
        dateRecolteReelle: new Date('2026-06-10'),
        notes: 'Première récolte de la saison.',
      },
    }),
    prisma.culture.create({
      data: {
        planteId: fraisier.id, parcelleId: parcelleFruits.id,
        statutId: statutEnCours.id,
        dateSemisPrevue: new Date('2026-04-01'),
        dateRecoltePrevue: new Date('2026-06-15'),
        dateSemisReelle: new Date('2026-04-03'),
        notes: 'Plantation de 6 pieds. Paillis en place.',
      },
    }),
  ]);
  await prisma.culture.create({
    data: {
      planteId: courgette.id, parcelleId: parcellePotager.id,
      statutId: statutPlanifiee.id,
      dateSemisPrevue: new Date('2026-05-10'),
      dateRecoltePrevue: new Date('2026-07-15'),
      notes: "Prévoir tuteur si la plante s'étend trop.",
    },
  });
  console.log('Seed Cultures OK');

  // --- Récoltes ---

  await prisma.recolte.create({
    data: { cultureId: cultureCarotte.id, quantite: 1.2, unite: 'kg', notes: 'Carottes bien formées.' },
  });
  await prisma.recolte.create({
    data: { cultureId: cultureCarotte.id, quantite: 0.8, unite: 'kg', notes: 'Deuxième passage.' },
  });
  console.log('Seed Récoltes OK');

  // --- Journal ---

  await prisma.journal.createMany({
    data: [
      { cultureId: culturesTomate.id, date: new Date('2026-03-18'), contenu: 'Semis effectués en godets sous serre. Bonne levée attendue dans 10 jours.' },
      { cultureId: culturesTomate.id, date: new Date('2026-04-15'), contenu: 'Repiquage en pleine terre. Plants vigoureux, 15 cm de hauteur.' },
      { cultureId: cultureBasilic.id, date: new Date('2026-04-22'), contenu: 'Semis direct en ligne. Sol bien réchauffé.' },
      { cultureId: cultureCarotte.id, date: new Date('2026-06-10'), contenu: 'Récolte terminée. 2 kg au total. Excellente qualité, saveur douce.' },
      { cultureId: cultureFramboisier.id, date: new Date('2026-04-03'), contenu: 'Plantation de 6 pieds de fraisiers. Paillis de paille installé.' },
    ],
  });
  console.log('Seed Journal OK');

  // --- Stock ---

  await prisma.stockItem.createMany({
    data: [
      { nom: 'Graines de tomate cœur de bœuf', quantite: 15, unite: 'graines', seuilAlerte: 5, categorieId: catGraine.id, planteId: tomate.id, notes: 'Sachet ouvert, conservation au frais.' },
      { nom: 'Graines de basilic grand vert',   quantite: 50, unite: 'graines', seuilAlerte: 10, categorieId: catGraine.id, planteId: basilic.id },
      { nom: 'Graines de carotte Nantaise',     quantite: 0,  unite: 'graines', seuilAlerte: 20, categorieId: catGraine.id, planteId: carotte.id, notes: 'Stock épuisé — à renouveler.' },
      { nom: 'Arrosoir 10L',                    quantite: 1,  unite: 'pièce',   categorieId: catOutil.id },
      { nom: 'Compost organique',               quantite: 25, unite: 'kg',      seuilAlerte: 5,  categorieId: catEngrais.id, notes: "Compost maison, prêt à l'emploi." },
    ],
  });
  console.log('Seed Stock OK');

  console.log('\nSeed terminé avec succès.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
