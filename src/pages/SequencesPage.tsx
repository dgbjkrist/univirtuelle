import { useState } from "react";
import { sequences as initialSeqs, Sequence, cours, ressources } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Pencil, Trash2, GripVertical, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";

export default function SequencesPage() {
  const [data, setData] = useState<Sequence[]>(initialSeqs);
  const [search, setSearch] = useState("");
  const [filterCours, setFilterCours] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Sequence | null>(null);
  const [form, setForm] = useState({ titre: "", coursId: "", ressourceIds: [] as string[] });

  const filtered = data
    .filter((s) => s.titre.toLowerCase().includes(search.toLowerCase()))
    .filter((s) => filterCours === "all" || s.coursId === filterCours)
    .sort((a, b) => a.ordre - b.ordre);

  const openAdd = () => { setEditing(null); setForm({ titre: "", coursId: "", ressourceIds: [] }); setDialogOpen(true); };
  const openEdit = (s: Sequence) => { setEditing(s); setForm({ titre: s.titre, coursId: s.coursId, ressourceIds: [...s.ressourceIds] }); setDialogOpen(true); };

  const handleSave = () => {
    if (!form.titre || !form.coursId) { toast.error("Titre et cours obligatoires"); return; }
    if (editing) {
      setData((d) => d.map((s) => s.id === editing.id ? { ...s, ...form } : s));
      toast.success("Séquence modifiée");
    } else {
      const maxOrdre = data.filter((s) => s.coursId === form.coursId).reduce((m, s) => Math.max(m, s.ordre), 0);
      setData((d) => [...d, { ...form, id: `s${Date.now()}`, ordre: maxOrdre + 1 }]);
      toast.success("Séquence ajoutée");
    }
    setDialogOpen(false);
  };

  const toggleRessource = (rid: string) => {
    setForm((f) => ({
      ...f,
      ressourceIds: f.ressourceIds.includes(rid)
        ? f.ressourceIds.filter((id) => id !== rid)
        : [...f.ressourceIds, rid],
    }));
  };

  const moveRessource = (idx: number, dir: -1 | 1) => {
    const newIds = [...form.ressourceIds];
    const target = idx + dir;
    if (target < 0 || target >= newIds.length) return;
    [newIds[idx], newIds[target]] = [newIds[target], newIds[idx]];
    setForm({ ...form, ressourceIds: newIds });
  };

  const coursRessources = form.coursId ? ressources.filter((r) => r.coursId === form.coursId) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Séquences pédagogiques</h1>
          <p className="text-muted-foreground text-sm mt-1">{data.length} séquences enregistrées</p>
        </div>
        <Button onClick={openAdd} className="gap-2"><Plus className="h-4 w-4" /> Ajouter</Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={filterCours} onValueChange={setFilterCours}>
              <SelectTrigger className="w-full sm:w-56"><SelectValue placeholder="Cours" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les cours</SelectItem>
                {cours.map((c) => <SelectItem key={c.id} value={c.id}>{c.intitule}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ordre</TableHead>
                  <TableHead>Titre</TableHead>
                  <TableHead>Cours</TableHead>
                  <TableHead>Ressources</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s) => {
                  const c = cours.find((c) => c.id === s.coursId);
                  return (
                    <TableRow key={s.id}>
                      <TableCell>
                        <Badge variant="secondary">#{s.ordre}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{s.titre}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{c?.intitule || "—"}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {s.ressourceIds.map((rid) => {
                            const r = ressources.find((r) => r.id === rid);
                            return r ? (
                              <Badge key={rid} variant="outline" className="text-xs">{r.titre}</Badge>
                            ) : null;
                          })}
                          {s.ressourceIds.length === 0 && <span className="text-xs text-muted-foreground">Aucune</span>}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { setData((d) => d.filter((x) => x.id !== s.id)); toast.success("Séquence supprimée"); }}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Modifier la séquence" : "Ajouter une séquence"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Titre *</Label>
              <Input value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Cours *</Label>
              <Select value={form.coursId} onValueChange={(v) => setForm({ ...form, coursId: v, ressourceIds: [] })}>
                <SelectTrigger><SelectValue placeholder="Sélectionner un cours" /></SelectTrigger>
                <SelectContent>{cours.map((c) => <SelectItem key={c.id} value={c.id}>{c.intitule}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {form.coursId && (
              <div className="space-y-2">
                <Label>Ressources (cliquer pour ajouter/retirer)</Label>
                <div className="border rounded-md p-2 space-y-1 max-h-40 overflow-y-auto">
                  {coursRessources.length === 0 && <p className="text-xs text-muted-foreground p-2">Aucune ressource pour ce cours</p>}
                  {coursRessources.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => toggleRessource(r.id)}
                      className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${form.ressourceIds.includes(r.id) ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"}`}
                    >
                      {form.ressourceIds.includes(r.id) ? "✓ " : ""}{r.titre}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {form.ressourceIds.length > 0 && (
              <div className="space-y-2">
                <Label>Ordre des ressources</Label>
                <div className="border rounded-md p-2 space-y-1">
                  {form.ressourceIds.map((rid, idx) => {
                    const r = ressources.find((r) => r.id === rid);
                    return (
                      <div key={rid} className="flex items-center gap-2 px-2 py-1 bg-muted/50 rounded text-sm">
                        <GripVertical className="h-3 w-3 text-muted-foreground" />
                        <span className="flex-1">{idx + 1}. {r?.titre}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveRessource(idx, -1)} disabled={idx === 0}><ArrowUp className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveRessource(idx, 1)} disabled={idx === form.ressourceIds.length - 1}><ArrowDown className="h-3 w-3" /></Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSave}>{editing ? "Modifier" : "Ajouter"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
