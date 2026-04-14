import { useState } from "react";
import { cours as initialData, Cours, enseignants } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function CoursPage() {
  const [data, setData] = useState<Cours[]>(initialData);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Cours | null>(null);
  const [form, setForm] = useState<Omit<Cours, "id">>({
    intitule: "", filiere: "", niveau: "L1", semestre: 1, nombreHeures: 0, credits: 0, enseignantId: "",
  });

  const filtered = data.filter((c) => c.intitule.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => { setEditing(null); setForm({ intitule: "", filiere: "", niveau: "L1", semestre: 1, nombreHeures: 0, credits: 0, enseignantId: "" }); setDialogOpen(true); };
  const openEdit = (c: Cours) => { setEditing(c); setForm({ intitule: c.intitule, filiere: c.filiere, niveau: c.niveau, semestre: c.semestre, nombreHeures: c.nombreHeures, credits: c.credits, enseignantId: c.enseignantId || "" }); setDialogOpen(true); };

  const handleSave = () => {
    if (!form.intitule || !form.filiere) { toast.error("Champs obligatoires manquants"); return; }
    if (editing) {
      setData((d) => d.map((c) => c.id === editing.id ? { ...c, ...form } : c));
      toast.success("Cours modifié");
    } else {
      setData((d) => [...d, { ...form, id: String(Date.now()) }]);
      toast.success("Cours ajouté");
    }
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cours</h1>
          <p className="text-muted-foreground text-sm mt-1">{data.length} cours enregistrés</p>
        </div>
        <Button onClick={openAdd} className="gap-2"><Plus className="h-4 w-4" /> Ajouter</Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative mb-4 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher un cours..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Intitulé</TableHead>
                  <TableHead>Filière</TableHead>
                  <TableHead>Niveau</TableHead>
                  <TableHead>Semestre</TableHead>
                  <TableHead className="text-right">Heures</TableHead>
                  <TableHead className="text-right">Crédits</TableHead>
                  <TableHead>Enseignant</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => {
                  const ens = enseignants.find((e) => e.id === c.enseignantId);
                  return (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.intitule}</TableCell>
                      <TableCell>{c.filiere}</TableCell>
                      <TableCell><Badge variant="secondary">{c.niveau}</Badge></TableCell>
                      <TableCell>S{c.semestre}</TableCell>
                      <TableCell className="text-right">{c.nombreHeures}h</TableCell>
                      <TableCell className="text-right">{c.credits}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{ens ? `${ens.prenom} ${ens.nom}` : "—"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { setData((d) => d.filter((x) => x.id !== c.id)); toast.success("Cours supprimé"); }}><Trash2 className="h-4 w-4" /></Button>
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
          <DialogHeader><DialogTitle>{editing ? "Modifier le cours" : "Ajouter un cours"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label>Intitulé *</Label>
              <Input value={form.intitule} onChange={(e) => setForm({ ...form, intitule: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Filière *</Label>
              <Input value={form.filiere} onChange={(e) => setForm({ ...form, filiere: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Niveau</Label>
              <Select value={form.niveau} onValueChange={(v) => setForm({ ...form, niveau: v as Cours["niveau"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["L1", "L2", "L3", "M1", "M2"].map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Semestre</Label>
              <Select value={String(form.semestre)} onValueChange={(v) => setForm({ ...form, semestre: Number(v) as 1 | 2 })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Semestre 1</SelectItem>
                  <SelectItem value="2">Semestre 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Nombre d'heures</Label>
              <Input type="number" value={form.nombreHeures} onChange={(e) => setForm({ ...form, nombreHeures: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Crédits</Label>
              <Input type="number" value={form.credits} onChange={(e) => setForm({ ...form, credits: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Enseignant</Label>
              <Select value={form.enseignantId} onValueChange={(v) => setForm({ ...form, enseignantId: v })}>
                <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                <SelectContent>
                  {enseignants.map((e) => <SelectItem key={e.id} value={e.id}>{e.prenom} {e.nom}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSave}>{editing ? "Modifier" : "Ajouter"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
