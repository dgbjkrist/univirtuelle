export interface Enseignant {
  id: string;
  nom: string;
  prenom: string;
  grade: "Assistant" | "Maître-Assistant" | "Professeur";
  statut: "Permanent" | "Vacataire";
  departement: string;
  tauxHoraire: number;
  email: string;
  telephone: string;
}

export interface Cours {
  id: string;
  intitule: string;
  filiere: string;
  niveau: "L1" | "L2" | "L3" | "M1" | "M2";
  semestre: 1 | 2;
  nombreHeures: number;
  credits: number;
  enseignantId?: string;
}

export type RessourceType = "Texte" | "Vidéo" | "Document" | "Quiz" | "Activité interactive" | "Évaluation";

export interface Ressource {
  id: string;
  titre: string;
  type: RessourceType;
  description: string;
  fichierUrl: string;
  complexite: "Faible" | "Moyen" | "Élevé";
  coursId: string;
}

export interface Sequence {
  id: string;
  titre: string;
  coursId: string;
  ordre: number;
  ressourceIds: string[];
}

export interface Activite {
  id: string;
  enseignantId: string;
  type: "Création" | "Mise à jour";
  ressourceId: string;
  complexite: "Faible" | "Moyen" | "Élevé";
  date: string;
  heuresCalculees: number;
  statut: "En attente" | "Validée" | "Rejetée";
}

export const enseignants: Enseignant[] = [
  { id: "1", nom: "Hadj", prenom: "Karim", grade: "Professeur", statut: "Permanent", departement: "Informatique", tauxHoraire: 3500, email: "k.hadj@univ.dz", telephone: "0555123456" },
  { id: "2", nom: "Bouzid", prenom: "Amina", grade: "Maître-Assistant", statut: "Permanent", departement: "Mathématiques", tauxHoraire: 2800, email: "a.bouzid@univ.dz", telephone: "0555234567" },
  { id: "3", nom: "Cherif", prenom: "Mohamed", grade: "Assistant", statut: "Vacataire", departement: "Physique", tauxHoraire: 2000, email: "m.cherif@univ.dz", telephone: "0555345678" },
  { id: "4", nom: "Slimani", prenom: "Nadia", grade: "Professeur", statut: "Permanent", departement: "Informatique", tauxHoraire: 3500, email: "n.slimani@univ.dz", telephone: "0555456789" },
  { id: "5", nom: "Rahmani", prenom: "Youcef", grade: "Maître-Assistant", statut: "Permanent", departement: "Électronique", tauxHoraire: 2800, email: "y.rahmani@univ.dz", telephone: "0555567890" },
  { id: "6", nom: "Khelifi", prenom: "Sara", grade: "Assistant", statut: "Vacataire", departement: "Mathématiques", tauxHoraire: 2000, email: "s.khelifi@univ.dz", telephone: "0555678901" },
];

export const cours: Cours[] = [
  { id: "1", intitule: "Algorithmique avancée", filiere: "Informatique", niveau: "L3", semestre: 1, nombreHeures: 42, credits: 4, enseignantId: "1" },
  { id: "2", intitule: "Bases de données", filiere: "Informatique", niveau: "L2", semestre: 2, nombreHeures: 56, credits: 5, enseignantId: "4" },
  { id: "3", intitule: "Analyse numérique", filiere: "Mathématiques", niveau: "M1", semestre: 1, nombreHeures: 42, credits: 4, enseignantId: "2" },
  { id: "4", intitule: "Mécanique quantique", filiere: "Physique", niveau: "M2", semestre: 1, nombreHeures: 28, credits: 3, enseignantId: "3" },
  { id: "5", intitule: "Réseaux informatiques", filiere: "Informatique", niveau: "L3", semestre: 2, nombreHeures: 42, credits: 4, enseignantId: "1" },
  { id: "6", intitule: "Intelligence artificielle", filiere: "Informatique", niveau: "M1", semestre: 1, nombreHeures: 56, credits: 6, enseignantId: "4" },
];

export const ressources: Ressource[] = [
  { id: "r1", titre: "Cours vidéo - Arbres binaires", type: "Vidéo", description: "Introduction aux arbres binaires et parcours", fichierUrl: "", complexite: "Élevé", coursId: "1" },
  { id: "r2", titre: "Quiz - Complexité algorithmique", type: "Quiz", description: "Évaluation des connaissances en complexité", fichierUrl: "", complexite: "Moyen", coursId: "1" },
  { id: "r3", titre: "TP - Normalisation BDD", type: "Activité interactive", description: "Travaux pratiques sur la normalisation", fichierUrl: "", complexite: "Élevé", coursId: "2" },
  { id: "r4", titre: "Document - Séries de Fourier", type: "Document", description: "Support de cours sur les séries de Fourier", fichierUrl: "", complexite: "Moyen", coursId: "3" },
  { id: "r5", titre: "Évaluation - Mécanique", type: "Évaluation", description: "Examen de mécanique quantique", fichierUrl: "", complexite: "Faible", coursId: "4" },
  { id: "r6", titre: "Activité interactive - Circuits", type: "Activité interactive", description: "Simulation de circuits électroniques", fichierUrl: "", complexite: "Élevé", coursId: "5" },
  { id: "r7", titre: "Contenu textuel - Intro IA", type: "Texte", description: "Introduction à l'intelligence artificielle", fichierUrl: "", complexite: "Moyen", coursId: "6" },
];

export const sequences: Sequence[] = [
  { id: "s1", titre: "Séquence 1 - Structures arborescentes", coursId: "1", ordre: 1, ressourceIds: ["r1", "r2"] },
  { id: "s2", titre: "Séquence 1 - Modélisation relationnelle", coursId: "2", ordre: 1, ressourceIds: ["r3"] },
  { id: "s3", titre: "Séquence 1 - Séries", coursId: "3", ordre: 1, ressourceIds: ["r4"] },
];

export const activites: Activite[] = [
  { id: "1", enseignantId: "1", type: "Création", ressourceId: "r1", complexite: "Élevé", date: "2024-03-15", heuresCalculees: 10, statut: "Validée" },
  { id: "2", enseignantId: "1", type: "Mise à jour", ressourceId: "r2", complexite: "Moyen", date: "2024-03-18", heuresCalculees: 3, statut: "Validée" },
  { id: "3", enseignantId: "4", type: "Création", ressourceId: "r3", complexite: "Élevé", date: "2024-03-20", heuresCalculees: 10, statut: "En attente" },
  { id: "4", enseignantId: "2", type: "Création", ressourceId: "r4", complexite: "Moyen", date: "2024-03-22", heuresCalculees: 8, statut: "Validée" },
  { id: "5", enseignantId: "3", type: "Mise à jour", ressourceId: "r5", complexite: "Faible", date: "2024-03-25", heuresCalculees: 2, statut: "En attente" },
  { id: "6", enseignantId: "5", type: "Création", ressourceId: "r6", complexite: "Élevé", date: "2024-03-28", heuresCalculees: 10, statut: "Rejetée" },
];

export const departements = ["Informatique", "Mathématiques", "Physique", "Électronique", "Chimie"];

export const HEURES_NORMALES = 240;

export const RESSOURCE_TYPES: RessourceType[] = ["Texte", "Vidéo", "Document", "Quiz", "Activité interactive", "Évaluation"];

export function calculerHeures(type: string, complexite: string): number {
  const base = type === "Création" ? 5 : 2;
  const mult = complexite === "Élevé" ? 2 : complexite === "Moyen" ? 1.5 : 1;
  return Math.round(base * mult);
}

export function getHeuresEnseignant(enseignantId: string, acts: Activite[]): { total: number; complementaires: number } {
  const validated = acts.filter((a) => a.enseignantId === enseignantId && a.statut === "Validée");
  const total = validated.reduce((s, a) => s + a.heuresCalculees, 0);
  const complementaires = Math.max(0, total - HEURES_NORMALES);
  return { total, complementaires };
}
