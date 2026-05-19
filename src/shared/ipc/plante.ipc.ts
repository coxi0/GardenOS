export interface Plante {
    id: number;
    nom: string;
    nomLatin: string;
    description: string;
    conseil: string;
    maladies: string;
    ensoleillement: string;
    moisSemisDebut: number;
    moisSemisFin: number;
    joursArrosage: number;
    joursMaturation: number;
    typePlanteId: number;
}

export interface PlanteIPC {
    'plantes:getAll':{request: void; response:Plante[]}
    'plantes:getById':{}
}