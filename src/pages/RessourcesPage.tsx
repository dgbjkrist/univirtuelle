import { useState } from "react";
import { ressources as initialData, Ressource, RessourceType, RESSOURCE_TYPES, cours } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

type FormType = Omit<Ressource, "id">;
const emptyForm: FormType = { titre: "", type: "Texte", description: "", fichierUrl: "", complexite: "Moyen", coursId: "" };

export default function RessourcesPage() {
  const [data, setData] = useState<Ressource[]>(initialData);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Ressource | null>(null);
  const [form, setForm] = useState<FormType>(emptyForm);

  const filtered = data
    .filter((r) => r.titre.toLowerCase().includes(search.toLowerCase()))
    .filter((r) => filterType === "all" || r.type === filterType);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (r: Ressource) => { setEditing(r); setForm({ titre: r.titre, type: r.type, description: r.description, fichierUrl: r.fichierUrl, complexite: r.complexite, coursId: r.coursId }); setDialogOpen(true); };

  const handleSave = () => {
    if (!form.titre || !form.coursId) { toast.error("Titre et cours obligatoires"); return; }
    if (editing) {
      setData((d) => d.map((r) => r.id === editing.id ? { ...r, ...form } : r));
      toast.success("Ressource modifiée");
    } else {
      setData((d) => [...d, { ...form, id: `r${Date.now()}` }]);
      toast.success("Ressource ajoutée");
    }
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ressources pédagogiques</h1>
          <p className="text-muted-foreground text-sm mt-1">{data.length} ressources enregistrées</p>
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
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-52"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {RESSOURCE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Cours</TableHead>
                  <TableHead>Complexité</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => {
                  const c = cours.find((c) => c.id === r.coursId);
                  return (
                    <TableRow key={r.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{r.titre}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">{r.description}</p>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="secondary">{r.type}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{c?.intitule || "—"}</TableCell>
                      <TableCell>
                        <Badge variant={r.complexite === "Élevé" ? "destructive" : r.complexite === "Moyen" ? "default" : "secondary"}>
                          {r.complexite}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { setData((d) => d.filter((x) => x.id !== r.id)); toast.success("Ressource supprimée"); }}><Trash2 className="h-4 w-4" /></Button>
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
          <DialogHeader><DialogTitle>{editing ? "Modifier la ressource" : "Ajouter une ressource"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Titre *</Label>
              <Input value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as RessourceType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{RESSOURCE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Complexité</Label>
                <Select value={form.complexite} onValueChange={(v) => setForm({ ...form, complexite: v as Ressource["complexite"] })}>
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
              <Label>Cours associé *</Label>
              <Select value={form.coursId} onValueChange={(v) => setForm({ ...form, coursId: v })}>
                <SelectTrigger><SelectValue placeholder="Sélectionner un cours" /></SelectTrigger>
                <SelectContent>{cours.map((c) => <SelectItem key={c.id} value={c.id}>{c.intitule}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Fichier / URL</Label>
              <Input value={form.fichierUrl} onChange={(e) => setForm({ ...form, fichierUrl: e.target.value })} placeholder="https://..." />
            </div>
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
