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
  heuresTotal: number;
  heuresComplementaires: number;
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

export interface Activite {
  id: string;
  enseignantId: string;
  type: "Création" | "Mise à jour";
  ressource: string;
  complexite: "Faible" | "Moyen" | "Élevé";
  date: string;
  heuresCalculees: number;
  statut: "En attente" | "Validée" | "Rejetée";
}

export const enseignants: Enseignant[] = [
  { id: "1", nom: "Hadj", prenom: "Karim", grade: "Professeur", statut: "Permanent", departement: "Informatique", tauxHoraire: 3500, email: "k.hadj@univ.dz", telephone: "0555123456", heuresTotal: 280, heuresComplementaires: 40 },
  { id: "2", nom: "Bouzid", prenom: "Amina", grade: "Maître-Assistant", statut: "Permanent", departement: "Mathématiques", tauxHoraire: 2800, email: "a.bouzid@univ.dz", telephone: "0555234567", heuresTotal: 240, heuresComplementaires: 0 },
  { id: "3", nom: "Cherif", prenom: "Mohamed", grade: "Assistant", statut: "Vacataire", departement: "Physique", tauxHoraire: 2000, email: "m.cherif@univ.dz", telephone: "0555345678", heuresTotal: 160, heuresComplementaires: 0 },
  { id: "4", nom: "Slimani", prenom: "Nadia", grade: "Professeur", statut: "Permanent", departement: "Informatique", tauxHoraire: 3500, email: "n.slimani@univ.dz", telephone: "0555456789", heuresTotal: 310, heuresComplementaires: 70 },
  { id: "5", nom: "Rahmani", prenom: "Youcef", grade: "Maître-Assistant", statut: "Permanent", departement: "Électronique", tauxHoraire: 2800, email: "y.rahmani@univ.dz", telephone: "0555567890", heuresTotal: 220, heuresComplementaires: 0 },
  { id: "6", nom: "Khelifi", prenom: "Sara", grade: "Assistant", statut: "Vacataire", departement: "Mathématiques", tauxHoraire: 2000, email: "s.khelifi@univ.dz", telephone: "0555678901", heuresTotal: 180, heuresComplementaires: 0 },
];

export const cours: Cours[] = [
  { id: "1", intitule: "Algorithmique avancée", filiere: "Informatique", niveau: "L3", semestre: 1, nombreHeures: 42, credits: 4, enseignantId: "1" },
  { id: "2", intitule: "Bases de données", filiere: "Informatique", niveau: "L2", semestre: 2, nombreHeures: 56, credits: 5, enseignantId: "4" },
  { id: "3", intitule: "Analyse numérique", filiere: "Mathématiques", niveau: "M1", semestre: 1, nombreHeures: 42, credits: 4, enseignantId: "2" },
  { id: "4", intitule: "Mécanique quantique", filiere: "Physique", niveau: "M2", semestre: 1, nombreHeures: 28, credits: 3, enseignantId: "3" },
  { id: "5", intitule: "Réseaux informatiques", filiere: "Informatique", niveau: "L3", semestre: 2, nombreHeures: 42, credits: 4, enseignantId: "1" },
  { id: "6", intitule: "Intelligence artificielle", filiere: "Informatique", niveau: "M1", semestre: 1, nombreHeures: 56, credits: 6, enseignantId: "4" },
];

export const activites: Activite[] = [
  { id: "1", enseignantId: "1", type: "Création", ressource: "Cours vidéo - Arbres binaires", complexite: "Élevé", date: "2024-03-15", heuresCalculees: 8, statut: "Validée" },
  { id: "2", enseignantId: "1", type: "Mise à jour", ressource: "Quiz - Complexité algorithmique", complexite: "Moyen", date: "2024-03-18", heuresCalculees: 3, statut: "Validée" },
  { id: "3", enseignantId: "4", type: "Création", ressource: "TP - Normalisation BDD", complexite: "Élevé", date: "2024-03-20", heuresCalculees: 10, statut: "En attente" },
  { id: "4", enseignantId: "2", type: "Création", ressource: "Document - Séries de Fourier", complexite: "Moyen", date: "2024-03-22", heuresCalculees: 5, statut: "Validée" },
  { id: "5", enseignantId: "3", type: "Mise à jour", ressource: "Évaluation - Mécanique", complexite: "Faible", date: "2024-03-25", heuresCalculees: 2, statut: "En attente" },
  { id: "6", enseignantId: "5", type: "Création", ressource: "Activité interactive - Circuits", complexite: "Élevé", date: "2024-03-28", heuresCalculees: 12, statut: "Rejetée" },
];

export const departements = ["Informatique", "Mathématiques", "Physique", "Électronique", "Chimie"];

export const HEURES_NORMALES = 240;

export function calculerHeures(type: string, complexite: string): number {
  const base = type === "Création" ? 5 : 2;
  const mult = complexite === "Élevé" ? 2 : complexite === "Moyen" ? 1.5 : 1;
  return Math.round(base * mult);
}
