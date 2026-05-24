import { Injectable } from '@angular/core';

export interface TypePlante {
  id: number;
  libelle: string;
}

export interface Plante {
  id: number;
  nom: string;
  nomLatin: string | null;
  description: string | null;
  conseil: string | null;
  maladies: string | null;
  ensoleillement: string | null;
  moisSemisDebut: number;
  moisSemisFin: number;
  joursArrosage: number;
  joursMaturation: number;
  typePlanteId: number;
  typePlante?: TypePlante;
}

export interface CreatePlanteDto {
  nom: string;
  nomLatin?: string | null;
  description?: string | null;
  conseil?: string | null;
  maladies?: string | null;
  ensoleillement?: string | null;
  moisSemisDebut: number;
  moisSemisFin: number;
  joursArrosage: number;
  joursMaturation: number;
  typePlanteId: number;
}

export interface UpdatePlanteDto {
  id: number;
  nom?: string;
  nomLatin?: string | null;
  description?: string | null;
  conseil?: string | null;
  maladies?: string | null;
  ensoleillement?: string | null;
  moisSemisDebut?: number;
  moisSemisFin?: number;
  joursArrosage?: number;
  joursMaturation?: number;
  typePlanteId?: number;
}

@Injectable({ providedIn: 'root' })
export class PlanteService {

  // Données mockées — seront remplacées par des appels IPC (window.electronAPI)
  private typePlantesData: TypePlante[] = [
    { id: 1, libelle: 'Légume' },
    { id: 2, libelle: 'Aromatique' },
    { id: 3, libelle: 'Fruit' },
    { id: 4, libelle: 'Fleur' },
    { id: 5, libelle: 'Arbre' },
  ];

  private plantesData: Plante[] = [
    {
      id: 1,
      nom: 'Tomate',
      nomLatin: 'Solanum lycopersicum',
      description: "Plante potagère très cultivée, originaire d'Amérique du Sud.",
      conseil: 'Tuteurer régulièrement. Supprimer les gourmands pour favoriser la fructification.',
      maladies: 'Mildiou, alternariose, botrytis.',
      ensoleillement: 'Plein soleil',
      moisSemisDebut: 2,
      moisSemisFin: 4,
      joursArrosage: 2,
      joursMaturation: 90,
      typePlanteId: 1,
      typePlante: { id: 1, libelle: 'Légume' },
    },
    {
      id: 2,
      nom: 'Lavande',
      nomLatin: 'Lavandula angustifolia',
      description: 'Plante aromatique aux fleurs mauves, très mellifère et résistante à la sécheresse.',
      conseil: 'Tailler après chaque floraison. Sol bien drainé, éviter les excès d\'eau.',
      maladies: 'Résistante aux maladies courantes. Sensible à l\'excès d\'humidité.',
      ensoleillement: 'Plein soleil',
      moisSemisDebut: 3,
      moisSemisFin: 5,
      joursArrosage: 7,
      joursMaturation: 120,
      typePlanteId: 2,
      typePlante: { id: 2, libelle: 'Aromatique' },
    },
  ];

  private nextId = 3;

  async getAll(): Promise<Plante[]> {
    return [...this.plantesData];
  }

  async getTypePlantes(): Promise<TypePlante[]> {
    return [...this.typePlantesData];
  }

  async create(dto: CreatePlanteDto): Promise<Plante> {
    const typePlante = this.typePlantesData.find(t => t.id === dto.typePlanteId);
    const plante: Plante = {
      id: this.nextId++,
      nom: dto.nom,
      nomLatin: dto.nomLatin ?? null,
      description: dto.description ?? null,
      conseil: dto.conseil ?? null,
      maladies: dto.maladies ?? null,
      ensoleillement: dto.ensoleillement ?? null,
      moisSemisDebut: dto.moisSemisDebut,
      moisSemisFin: dto.moisSemisFin,
      joursArrosage: dto.joursArrosage,
      joursMaturation: dto.joursMaturation,
      typePlanteId: dto.typePlanteId,
      typePlante,
    };
    this.plantesData.push(plante);
    return plante;
  }

  async update(dto: UpdatePlanteDto): Promise<Plante> {
    const idx = this.plantesData.findIndex(p => p.id === dto.id);
    if (idx === -1) throw new Error(`Plante ${dto.id} introuvable`);
    const typePlante = dto.typePlanteId !== undefined
      ? this.typePlantesData.find(t => t.id === dto.typePlanteId)
      : this.plantesData[idx].typePlante;
    const updated: Plante = { ...this.plantesData[idx], ...dto, typePlante };
    this.plantesData[idx] = updated;
    return updated;
  }

  async delete(id: number): Promise<void> {
    this.plantesData = this.plantesData.filter(p => p.id !== id);
  }
}
