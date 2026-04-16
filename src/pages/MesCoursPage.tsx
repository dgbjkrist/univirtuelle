import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  cours as allCours,
  enseignants,
  sequences as allSequences,
  ressources as allRessources,
  activites as allActivites,
  AUTH_ENSEIGNANT_MAP,
  getHeuresEnseignant,
} from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Eye, Clock, FileText, Layers } from "lucide-react";

export default function MesCoursPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const enseignantId = user ? AUTH_ENSEIGNANT_MAP[user.id] || user.id : "";
  const ens = enseignants.find((e) => e.id === enseignantId);
  const mesCours = allCours.filter((c) => c.enseignantIds.includes(enseignantId));
  const heures = getHeuresEnseignant(enseignantId, allActivites);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mes cours</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {ens ? `${ens.prenom} ${ens.nom}` : "Enseignant"} — {mesCours.length} cours attribué{mesCours.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <BookOpen className="h-5 w-5 mx-auto text-primary mb-1" />
            <p className="text-2xl font-bold text-primary">{mesCours.length}</p>
            <p className="text-xs text-muted-foreground">Cours</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <Layers className="h-5 w-5 mx-auto text-primary mb-1" />
            <p className="text-2xl font-bold text-primary">
              {allSequences.filter((s) => mesCours.some((c) => c.id === s.coursId)).length}
            </p>
            <p className="text-xs text-muted-foreground">Séquences</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <FileText className="h-5 w-5 mx-auto text-primary mb-1" />
            <p className="text-2xl font-bold text-primary">
              {allRessources.filter((r) => mesCours.some((c) => c.id === r.coursId)).length}
            </p>
            <p className="text-xs text-muted-foreground">Ressources</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <Clock className="h-5 w-5 mx-auto text-primary mb-1" />
            <p className="text-2xl font-bold text-primary">{heures.total}h</p>
            <p className="text-xs text-muted-foreground">Heures validées</p>
          </CardContent>
        </Card>
      </div>

      {mesCours.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Aucun cours ne vous est attribué pour le moment.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {mesCours.map((c) => {
            const seqs = allSequences.filter((s) => s.coursId === c.id);
            const res = allRessources.filter((r) => r.coursId === c.id);
            return (
              <Card key={c.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{c.intitule}</CardTitle>
                    <Badge variant="secondary">{c.niveau}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <Badge variant="outline">S{c.semestre}</Badge>
                    <span className="text-xs text-muted-foreground">{c.filiere}</span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span>{seqs.length} séquence{seqs.length !== 1 ? "s" : ""}</span>
                    <span>{res.length} ressource{res.length !== 1 ? "s" : ""}</span>
                    <span>{c.nombreHeures}h</span>
                  </div>
                  <Button
                    variant="default"
                    size="sm"
                    className="gap-2 w-full"
                    onClick={() => navigate(`/mes-cours/${c.id}`)}
                  >
                    <Eye className="h-4 w-4" /> Gérer le contenu
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
