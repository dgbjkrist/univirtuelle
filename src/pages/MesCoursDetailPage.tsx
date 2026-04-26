import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  cours as allCours,
  sequences as initialSeqs,
  ressources as initialRes,
  activites as initialActs,
  enseignants,
  Sequence,
  Ressource,
  Activite,
  RessourceType,
  RESSOURCE_TYPES,
  calculerHeures,
  AUTH_ENSEIGNANT_MAP,
} from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Pencil, Trash2, ArrowUp, ArrowDown, BookOpen, FileText, Video, HelpCircle, Gamepad2, ClipboardCheck, Zap } from "lucide-react";
import { toast } from "sonner";

const typeIcons: Record<RessourceType, React.ReactNode> = {
  "Texte": <FileText className="h-4 w-4" />,
  "Vidéo": <Video className="h-4 w-4" />,
  "Document": <FileText className="h-4 w-4" />,
  "Quiz": <HelpCircle className="h-4 w-4" />,
  "Activité interactive": <Gamepad2 className="h-4 w-4" />,
  "Évaluation": <ClipboardCheck className="h-4 w-4" />,
};

export default function MesCoursDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const enseignantId = user ? AUTH_ENSEIGNANT_MAP[user.id] || user.id : "";
  const coursItem = allCours.find((c) => c.id === id && c.enseignantIds.includes(enseignantId));

  const [sequences, setSequences] = useState<Sequence[]>(initialSeqs.filter((s) => s.coursId === id));
  const [ressources, setRessources] = useState<Ressource[]>(initialRes.filter((r) => r.coursId === id));
  const [activites, setActivites] = useState<Activite[]>(initialActs);

  // Sequence dialog
  const [seqDialogOpen, setSeqDialogOpen] = useState(false);
  const [editingSeq, setEditingSeq] = useState<Sequence | null>(null);
  const [seqForm, setSeqForm] = useState({ titre: "" });

  // Resource dialog
  const [resDialogOpen, setResDialogOpen] = useState(false);
  const [editingRes, setEditingRes] = useState<Ressource | null>(null);
  const [targetSeqId, setTargetSeqId] = useState<string>("");
  const [resForm, setResForm] = useState<Omit<Ressource, "id" | "coursId" | "sequenceId">>({
    titre: "", type: "Texte", description: "", complexite: "Moyen",
    contenuTexte: "", videoUrl: "", documentUrl: "", evaluationUrl: "", quiz: [],
  });

  if (!coursItem) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-muted-foreground">Cours introuvable ou non attribué</p>
        <Button variant="outline" onClick={() => navigate("/mes-cours")}>Retour</Button>
      </div>
    );
  }

  // Auto-create activity helper
  const createAutoActivity = (ressource: Ressource, type: "Création" | "Mise à jour") => {
    const heures = calculerHeures(type, ressource.complexite);
    const newActivity: Activite = {
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      enseignantId,
      type,
      ressourceId: ressource.id,
      complexite: ressource.complexite,
      date: new Date().toISOString().split("T")[0],
      heuresCalculees: heures,
      statut: "En attente",
    };
    setActivites((prev) => [...prev, newActivity]);
    return newActivity;
  };

  // --- Sequence CRUD ---
  const openAddSeq = () => { setEditingSeq(null); setSeqForm({ titre: "" }); setSeqDialogOpen(true); };
  const openEditSeq = (s: Sequence) => { setEditingSeq(s); setSeqForm({ titre: s.titre }); setSeqDialogOpen(true); };

  const saveSeq = () => {
    if (!seqForm.titre) { toast.error("Titre obligatoire"); return; }
    if (editingSeq) {
      setSequences((d) => d.map((s) => s.id === editingSeq.id ? { ...s, titre: seqForm.titre } : s));
      toast.success("Séquence modifiée");
    } else {
      const maxOrdre = sequences.reduce((m, s) => Math.max(m, s.ordre), 0);
      setSequences((d) => [...d, { id: `s${Date.now()}`, titre: seqForm.titre, coursId: id!, ordre: maxOrdre + 1, ressourceIds: [] }]);
      toast.success("Séquence ajoutée");
    }
    setSeqDialogOpen(false);
  };

  const deleteSeq = (seqId: string) => {
    setSequences((d) => d.filter((s) => s.id !== seqId));
    setRessources((d) => d.map((r) => r.sequenceId === seqId ? { ...r, sequenceId: undefined } : r));
    toast.success("Séquence supprimée");
  };

  const moveSeq = (seqId: string, dir: -1 | 1) => {
    setSequences((prev) => {
      const sorted = [...prev].sort((a, b) => a.ordre - b.ordre);
      const idx = sorted.findIndex((s) => s.id === seqId);
      const target = idx + dir;
      if (target < 0 || target >= sorted.length) return prev;
      const temp = sorted[idx].ordre;
      sorted[idx] = { ...sorted[idx], ordre: sorted[target].ordre };
      sorted[target] = { ...sorted[target], ordre: temp };
      return sorted;
    });
  };

  // --- Resource CRUD with auto-activity ---
  const openAddRes = (seqId: string) => {
    setEditingRes(null);
    setTargetSeqId(seqId);
    setResForm({
      titre: "", type: "Texte", description: "", complexite: "Moyen",
      contenuTexte: "", videoUrl: "", documentUrl: "", evaluationUrl: "", quiz: [],
    });
    setResDialogOpen(true);
  };

  const openEditRes = (r: Ressource) => {
    setEditingRes(r);
    setTargetSeqId(r.sequenceId || "");
    setResForm({
      titre: r.titre, type: r.type, description: r.description, complexite: r.complexite,
      contenuTexte: r.contenuTexte || "", videoUrl: r.videoUrl || "",
      documentUrl: r.documentUrl || "", evaluationUrl: r.evaluationUrl || "",
      quiz: r.quiz || [],
    });
    setResDialogOpen(true);
  };

  const saveRes = () => {
    if (!resForm.titre) { toast.error("Titre obligatoire"); return; }
    if (editingRes) {
      const updatedRes = { ...editingRes, ...resForm, sequenceId: targetSeqId || undefined };
      setRessources((d) => d.map((r) => r.id === editingRes.id ? updatedRes : r));
      if (editingRes.sequenceId !== targetSeqId) {
        setSequences((seqs) => seqs.map((s) => {
          if (s.id === editingRes.sequenceId) return { ...s, ressourceIds: s.ressourceIds.filter((rid) => rid !== editingRes.id) };
          if (s.id === targetSeqId) return { ...s, ressourceIds: [...s.ressourceIds, editingRes.id] };
          return s;
        }));
      }
      // AUTO: create "Mise à jour" activity
      const act = createAutoActivity(updatedRes, "Mise à jour");
      toast.success(`Ressource modifiée — activité auto-créée (+${act.heuresCalculees}h)`);
    } else {
      const newId = `r${Date.now()}`;
      const newRes: Ressource = { ...resForm, id: newId, coursId: id!, sequenceId: targetSeqId || undefined };
      setRessources((d) => [...d, newRes]);
      if (targetSeqId) {
        setSequences((seqs) => seqs.map((s) => s.id === targetSeqId ? { ...s, ressourceIds: [...s.ressourceIds, newId] } : s));
      }
      // AUTO: create "Création" activity
      const act = createAutoActivity(newRes, "Création");
      toast.success(`Ressource ajoutée — activité auto-créée (+${act.heuresCalculees}h)`);
    }
    setResDialogOpen(false);
  };

  const deleteRes = (r: Ressource) => {
    setRessources((d) => d.filter((x) => x.id !== r.id));
    if (r.sequenceId) {
      setSequences((seqs) => seqs.map((s) => s.id === r.sequenceId ? { ...s, ressourceIds: s.ressourceIds.filter((rid) => rid !== r.id) } : s));
    }
    toast.success("Ressource supprimée");
  };

  const sortedSequences = [...sequences].sort((a, b) => a.ordre - b.ordre);
  const unassignedRes = ressources.filter((r) => !r.sequenceId);

  // Recent activities for this course
  const courseResIds = ressources.map((r) => r.id);
  const courseActivites = activites
    .filter((a) => a.enseignantId === enseignantId && courseResIds.includes(a.ressourceId))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/mes-cours")} className="mt-1">
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

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold text-primary">{courseActivites.length}</p>
            <p className="text-xs text-muted-foreground">Activités récentes</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent auto-activities */}
      {courseActivites.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" /> Activités pédagogiques récentes
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {courseActivites.map((a) => {
                const res = ressources.find((r) => r.id === a.ressourceId);
                return (
                  <div key={a.id} className="flex items-center gap-3 p-2 rounded-md bg-muted/50 text-sm">
                    <Badge variant={a.type === "Création" ? "default" : "secondary"} className="text-xs shrink-0">{a.type}</Badge>
                    <span className="flex-1 truncate">{res?.titre || a.ressourceId}</span>
                    <Badge variant={a.statut === "Validée" ? "default" : a.statut === "Rejetée" ? "destructive" : "secondary"} className="text-xs">
                      {a.statut}
                    </Badge>
                    <span className="text-muted-foreground text-xs">{a.heuresCalculees}h</span>
                    <span className="text-muted-foreground text-xs">{a.date}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sequences */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <BookOpen className="h-5 w-5" /> Séquences pédagogiques
        </h2>
        <Button onClick={openAddSeq} size="sm" className="gap-1"><Plus className="h-4 w-4" /> Séquence</Button>
      </div>

      {sortedSequences.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Aucune séquence. Ajoutez-en une pour structurer ce cours.
          </CardContent>
        </Card>
      )}

      {sortedSequences.map((seq, seqIdx) => {
        const seqRes = ressources.filter((r) => r.sequenceId === seq.id);
        return (
          <Card key={seq.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">#{seq.ordre}</Badge>
                  {seq.titre}
                  <Badge variant="outline" className="text-xs">{seqRes.length} ressource{seqRes.length !== 1 ? "s" : ""}</Badge>
                </CardTitle>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveSeq(seq.id, -1)} disabled={seqIdx === 0}>
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveSeq(seq.id, 1)} disabled={seqIdx === sortedSequences.length - 1}>
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditSeq(seq)}>
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteSeq(seq.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {seqRes.length === 0 ? (
                <p className="text-sm text-muted-foreground mb-3">Aucune ressource dans cette séquence.</p>
              ) : (
                <div className="space-y-2 mb-3">
                  {seqRes.map((r) => {
                    const contents = [
                      r.contenuTexte && { icon: <FileText className="h-3 w-3" />, label: "Texte" },
                      r.videoUrl && { icon: <Video className="h-3 w-3" />, label: "Vidéo" },
                      r.documentUrl && { icon: <FileText className="h-3 w-3" />, label: "Doc" },
                      r.quiz && r.quiz.length > 0 && { icon: <HelpCircle className="h-3 w-3" />, label: "Quiz" },
                      r.evaluationUrl && { icon: <ClipboardCheck className="h-3 w-3" />, label: "Éval" },
                    ].filter(Boolean) as { icon: React.ReactNode; label: string }[];
                    return (
                    <div key={r.id} className="flex items-center gap-3 p-2 rounded-md bg-muted/50 group">
                      <span className="text-muted-foreground">{typeIcons[r.type]}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{r.titre}</p>
                        <div className="flex items-center gap-1 flex-wrap mt-0.5">
                          {contents.map((c, i) => (
                            <Badge key={i} variant="outline" className="text-[10px] py-0 h-4 gap-0.5">
                              {c.icon}{c.label}
                            </Badge>
                          ))}
                          {contents.length === 0 && <span className="text-xs text-muted-foreground truncate">{r.description}</span>}
                        </div>
                      </div>
                      <Badge variant={r.complexite === "Élevé" ? "destructive" : r.complexite === "Moyen" ? "default" : "secondary"} className="text-xs shrink-0">
                        {r.complexite}
                      </Badge>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditRes(r)}><Pencil className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteRes(r)}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Button variant="outline" size="sm" className="gap-1" onClick={() => openAddRes(seq.id)}>
                <Plus className="h-3 w-3" /> Ajouter une ressource
              </Button>
            </CardContent>
          </Card>
        );
      })}

      {/* Unassigned resources */}
      {unassignedRes.length > 0 && (
        <>
          <h2 className="text-lg font-semibold text-foreground">Ressources non assignées</h2>
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-2">
                {unassignedRes.map((r) => (
                  <div key={r.id} className="flex items-center gap-3 p-2 rounded-md bg-muted/50 group">
                    <span className="text-muted-foreground">{typeIcons[r.type]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{r.titre}</p>
                      <p className="text-xs text-muted-foreground">{r.description}</p>
                    </div>
                    <Badge variant={r.complexite === "Élevé" ? "destructive" : r.complexite === "Moyen" ? "default" : "secondary"} className="text-xs">
                      {r.complexite}
                    </Badge>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditRes(r)}><Pencil className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteRes(r)}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Sequence Dialog */}
      <Dialog open={seqDialogOpen} onOpenChange={setSeqDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editingSeq ? "Modifier la séquence" : "Ajouter une séquence"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Titre *</Label>
              <Input value={seqForm.titre} onChange={(e) => setSeqForm({ titre: e.target.value })} placeholder="Ex: Introduction aux structures de données" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setSeqDialogOpen(false)}>Annuler</Button>
            <Button onClick={saveSeq}>{editingSeq ? "Modifier" : "Ajouter"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Resource Dialog — multi-content combinable */}
      <Dialog open={resDialogOpen} onOpenChange={setResDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRes ? "Modifier la ressource" : "Ajouter une ressource"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Métadonnées */}
            <div className="space-y-2">
              <Label>Titre *</Label>
              <Input value={resForm.titre} onChange={(e) => setResForm({ ...resForm, titre: e.target.value })} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Type principal</Label>
                <Select value={resForm.type} onValueChange={(v) => setResForm({ ...resForm, type: v as RessourceType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{RESSOURCE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Complexité</Label>
                <Select value={resForm.complexite} onValueChange={(v) => setResForm({ ...resForm, complexite: v as Ressource["complexite"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Faible">Faible</SelectItem>
                    <SelectItem value="Moyen">Moyen</SelectItem>
                    <SelectItem value="Élevé">Élevé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Séquence</Label>
                <Select value={targetSeqId} onValueChange={setTargetSeqId}>
                  <SelectTrigger><SelectValue placeholder="Séquence" /></SelectTrigger>
                  <SelectContent>
                    {sortedSequences.map((s) => <SelectItem key={s.id} value={s.id}>{s.titre}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description courte</Label>
              <Textarea value={resForm.description} onChange={(e) => setResForm({ ...resForm, description: e.target.value })} rows={2} />
            </div>

            {/* Contenus combinables */}
            <div className="rounded-md border bg-muted/30 p-3 space-y-3">
              <p className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Contenus pédagogiques (combinables — tous optionnels)
              </p>

              <div className="space-y-2">
                <Label className="text-xs flex items-center gap-1.5"><FileText className="h-3 w-3" /> Texte enrichi</Label>
                <Textarea
                  value={resForm.contenuTexte || ""}
                  onChange={(e) => setResForm({ ...resForm, contenuTexte: e.target.value })}
                  rows={4}
                  placeholder="Saisir le contenu textuel (markdown / HTML supporté)..."
                  className="font-mono text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs flex items-center gap-1.5"><Video className="h-3 w-3" /> Lien vidéo</Label>
                  <Input
                    value={resForm.videoUrl || ""}
                    onChange={(e) => setResForm({ ...resForm, videoUrl: e.target.value })}
                    placeholder="https://youtube.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs flex items-center gap-1.5"><FileText className="h-3 w-3" /> Document (PDF, DOCX)</Label>
                  <Input
                    value={resForm.documentUrl || ""}
                    onChange={(e) => setResForm({ ...resForm, documentUrl: e.target.value })}
                    placeholder="https://... ou upload"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs flex items-center gap-1.5"><ClipboardCheck className="h-3 w-3" /> Évaluation (lien / module)</Label>
                <Input
                  value={resForm.evaluationUrl || ""}
                  onChange={(e) => setResForm({ ...resForm, evaluationUrl: e.target.value })}
                  placeholder="URL de l'évaluation ou identifiant du module"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs flex items-center gap-1.5"><HelpCircle className="h-3 w-3" /> Quiz — questions (1 par ligne, format : question | bonne réponse)</Label>
                <Textarea
                  value={(resForm.quiz || []).map((q) => `${q.question} | ${q.options[q.correct] || ""}`).join("\n")}
                  onChange={(e) => {
                    const quiz = e.target.value.split("\n").filter((l) => l.trim()).map((l) => {
                      const [question, answer] = l.split("|").map((s) => s.trim());
                      return { question: question || "", options: [answer || ""], correct: 0 };
                    });
                    setResForm({ ...resForm, quiz });
                  }}
                  rows={3}
                  placeholder="Quelle est la complexité de ABR ? | O(log n)"
                  className="text-sm"
                />
                {(resForm.quiz?.length || 0) > 0 && (
                  <p className="text-xs text-muted-foreground">{resForm.quiz?.length} question(s) configurée(s)</p>
                )}
              </div>
            </div>

            {/* Preview: auto-calculated hours */}
            <div className="rounded-md bg-primary/5 border border-primary/20 p-3 text-sm">
              <div className="flex items-center gap-2 flex-wrap">
                <Zap className="h-4 w-4 text-primary" />
                <span className="font-medium">Activité auto-créée à la sauvegarde :</span>
                <Badge variant="default">
                  +{calculerHeures(editingRes ? "Mise à jour" : "Création", resForm.complexite)}h
                </Badge>
                <span className="text-muted-foreground text-xs">
                  ({editingRes ? "Mise à jour" : "Création"} • {resForm.complexite})
                </span>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setResDialogOpen(false)}>Annuler</Button>
            <Button onClick={saveRes}>{editingRes ? "Modifier" : "Ajouter"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
