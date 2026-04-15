import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  cours as allCours,
  sequences as initialSeqs,
  ressources as initialRes,
  enseignants,
  Sequence,
  Ressource,
  RessourceType,
  RESSOURCE_TYPES,
} from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Pencil, Trash2, ArrowUp, ArrowDown, BookOpen, FileText, Video, HelpCircle, Gamepad2, ClipboardCheck } from "lucide-react";
import { toast } from "sonner";

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

  const [sequences, setSequences] = useState<Sequence[]>(initialSeqs.filter((s) => s.coursId === id));
  const [ressources, setRessources] = useState<Ressource[]>(initialRes.filter((r) => r.coursId === id));

  // Sequence dialog
  const [seqDialogOpen, setSeqDialogOpen] = useState(false);
  const [editingSeq, setEditingSeq] = useState<Sequence | null>(null);
  const [seqForm, setSeqForm] = useState({ titre: "" });

  // Resource dialog
  const [resDialogOpen, setResDialogOpen] = useState(false);
  const [editingRes, setEditingRes] = useState<Ressource | null>(null);
  const [targetSeqId, setTargetSeqId] = useState<string>("");
  const [resForm, setResForm] = useState<Omit<Ressource, "id" | "coursId" | "sequenceId">>({
    titre: "", type: "Texte", description: "", fichierUrl: "", complexite: "Moyen",
  });

  if (!coursItem) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-muted-foreground">Cours introuvable</p>
        <Button variant="outline" onClick={() => navigate("/cours")}>Retour</Button>
      </div>
    );
  }

  const ens = enseignants.find((e) => e.id === coursItem.enseignantId);

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

  // --- Resource CRUD ---
  const openAddRes = (seqId: string) => {
    setEditingRes(null);
    setTargetSeqId(seqId);
    setResForm({ titre: "", type: "Texte", description: "", fichierUrl: "", complexite: "Moyen" });
    setResDialogOpen(true);
  };

  const openEditRes = (r: Ressource) => {
    setEditingRes(r);
    setTargetSeqId(r.sequenceId || "");
    setResForm({ titre: r.titre, type: r.type, description: r.description, fichierUrl: r.fichierUrl, complexite: r.complexite });
    setResDialogOpen(true);
  };

  const saveRes = () => {
    if (!resForm.titre) { toast.error("Titre obligatoire"); return; }
    if (editingRes) {
      setRessources((d) => d.map((r) => r.id === editingRes.id ? { ...r, ...resForm, sequenceId: targetSeqId || undefined } : r));
      // Update sequence ressourceIds if sequence changed
      if (editingRes.sequenceId !== targetSeqId) {
        setSequences((seqs) => seqs.map((s) => {
          if (s.id === editingRes.sequenceId) return { ...s, ressourceIds: s.ressourceIds.filter((rid) => rid !== editingRes.id) };
          if (s.id === targetSeqId) return { ...s, ressourceIds: [...s.ressourceIds, editingRes.id] };
          return s;
        }));
      }
      toast.success("Ressource modifiée");
    } else {
      const newId = `r${Date.now()}`;
      setRessources((d) => [...d, { ...resForm, id: newId, coursId: id!, sequenceId: targetSeqId || undefined }]);
      if (targetSeqId) {
        setSequences((seqs) => seqs.map((s) => s.id === targetSeqId ? { ...s, ressourceIds: [...s.ressourceIds, newId] } : s));
      }
      toast.success("Ressource ajoutée");
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
            {ens && <span className="text-sm text-muted-foreground">• {ens.prenom} {ens.nom}</span>}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
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
        <Card className="col-span-2 sm:col-span-1">
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold text-primary">{coursItem.nombreHeures}h</p>
            <p className="text-xs text-muted-foreground">Volume horaire</p>
          </CardContent>
        </Card>
      </div>

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
                  {seqRes.map((r) => (
                    <div key={r.id} className="flex items-center gap-3 p-2 rounded-md bg-muted/50 group">
                      <span className="text-muted-foreground">{typeIcons[r.type]}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{r.titre}</p>
                        <p className="text-xs text-muted-foreground truncate">{r.description}</p>
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

      {/* Resource Dialog */}
      <Dialog open={resDialogOpen} onOpenChange={setResDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingRes ? "Modifier la ressource" : "Ajouter une ressource"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Titre *</Label>
              <Input value={resForm.titre} onChange={(e) => setResForm({ ...resForm, titre: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
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
            </div>
            <div className="space-y-2">
              <Label>Séquence</Label>
              <Select value={targetSeqId} onValueChange={setTargetSeqId}>
                <SelectTrigger><SelectValue placeholder="Sélectionner une séquence" /></SelectTrigger>
                <SelectContent>
                  {sortedSequences.map((s) => <SelectItem key={s.id} value={s.id}>{s.titre}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={resForm.description} onChange={(e) => setResForm({ ...resForm, description: e.target.value })} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Fichier / URL</Label>
              <Input value={resForm.fichierUrl} onChange={(e) => setResForm({ ...resForm, fichierUrl: e.target.value })} placeholder="https://..." />
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
