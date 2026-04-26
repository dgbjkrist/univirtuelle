import { useParams, useNavigate } from "react-router-dom";
import {
  cours as allCours,
  sequences as allSeqs,
  ressources as allRes,
  enseignants,
  RessourceType,
} from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, BookOpen, FileText, Video, HelpCircle, Gamepad2, ClipboardCheck, Info, Lock } from "lucide-react";

const typeIcons: Record<RessourceType, React.ReactNode> = {
  "Texte": <FileText className="h-4 w-4" />,
  "Vidéo": <Video className="h-4 w-4" />,
  "Document": <FileText className="h-4 w-4" />,
  "Quiz": <HelpCircle className="h-4 w-4" />,
  "Activité interactive": <Gamepad2 className="h-4 w-4" />,
  "Évaluation": <ClipboardCheck className="h-4 w-4" />,
};

export default function CoursDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const coursItem = allCours.find((c) => c.id === id);

  if (!coursItem) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-muted-foreground">Cours introuvable</p>
        <Button variant="outline" onClick={() => navigate("/cours")}>Retour</Button>
      </div>
    );
  }

  const coursEnseignants = enseignants.filter((e) => coursItem.enseignantIds.includes(e.id));
  const sequences = allSeqs.filter((s) => s.coursId === id).sort((a, b) => a.ordre - b.ordre);
  const ressources = allRes.filter((r) => r.coursId === id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/cours")} className="mt-1">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{coursItem.intitule}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <Badge variant="secondary">{coursItem.niveau}</Badge>
            <Badge variant="outline">S{coursItem.semestre}</Badge>
            <span className="text-sm text-muted-foreground">{coursItem.filiere}</span>
            <span className="text-sm text-muted-foreground">• {coursItem.nombreHeures}h • {coursItem.credits} crédits</span>
          </div>
        </div>
      </div>

      {/* Read-only notice */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Vue secrétaire — consultation uniquement. Le contenu pédagogique (séquences, ressources)
          est créé par les enseignants attribués depuis leur espace « Mes cours ».
        </AlertDescription>
      </Alert>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold text-primary">{coursEnseignants.length}</p>
            <p className="text-xs text-muted-foreground">Enseignant{coursEnseignants.length > 1 ? "s" : ""}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold text-primary">{sequences.length}</p>
            <p className="text-xs text-muted-foreground">Séquences</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold text-primary">{ressources.length}</p>
            <p className="text-xs text-muted-foreground">Ressources</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold text-primary">{coursItem.nombreHeures}h</p>
            <p className="text-xs text-muted-foreground">Volume horaire</p>
          </CardContent>
        </Card>
      </div>

      {/* Enseignants attribués */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Enseignants attribués</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {coursEnseignants.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun enseignant attribué. Utilisez la page Cours pour en attribuer.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {coursEnseignants.map((e) => (
                <Badge key={e.id} variant="secondary" className="text-sm py-1">
                  {e.prenom} {e.nom} • {e.grade}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Séquences (read-only) */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <BookOpen className="h-5 w-5" /> Séquences pédagogiques
        </h2>
        <Badge variant="outline" className="gap-1"><Lock className="h-3 w-3" /> Lecture seule</Badge>
      </div>

      {sequences.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Aucune séquence créée. Les enseignants attribués peuvent en créer depuis « Mes cours ».
          </CardContent>
        </Card>
      ) : (
        sequences.map((seq) => {
          const seqRes = ressources.filter((r) => r.sequenceId === seq.id);
          return (
            <Card key={seq.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">#{seq.ordre}</Badge>
                  {seq.titre}
                  <Badge variant="outline" className="text-xs">{seqRes.length} ressource{seqRes.length !== 1 ? "s" : ""}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {seqRes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucune ressource.</p>
                ) : (
                  <div className="space-y-2">
                    {seqRes.map((r) => (
                      <div key={r.id} className="flex items-center gap-3 p-2 rounded-md bg-muted/50">
                        <span className="text-muted-foreground">{typeIcons[r.type]}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{r.titre}</p>
                          <p className="text-xs text-muted-foreground truncate">{r.description}</p>
                        </div>
                        <Badge variant={r.complexite === "Élevé" ? "destructive" : r.complexite === "Moyen" ? "default" : "secondary"} className="text-xs shrink-0">
                          {r.complexite}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
