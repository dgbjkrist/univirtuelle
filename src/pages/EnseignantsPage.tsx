import { useState } from "react";
import { enseignants as initialData, Enseignant, departements, activites, getHeuresEnseignant } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Pencil, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

const emptyEnseignant: Omit<Enseignant, "id" | "heuresTotal" | "heuresComplementaires"> = {
  nom: "", prenom: "", grade: "Assistant", statut: "Permanent", departement: "", tauxHoraire: 2000, email: "", telephone: "",
};

export default function EnseignantsPage() {
  const [data, setData] = useState<Enseignant[]>(initialData);
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("all");
  const [filterGrade, setFilterGrade] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Enseignant | null>(null);
  const [form, setForm] = useState(emptyEnseignant);
  const [viewItem, setViewItem] = useState<Enseignant | null>(null);

  const filtered = data.filter((e) => {
    const matchSearch = `${e.nom} ${e.prenom} ${e.email}`.toLowerCase().includes(search.toLowerCase());
    const matchDept = filterDept === "all" || e.departement === filterDept;
    const matchGrade = filterGrade === "all" || e.grade === filterGrade;
    return matchSearch && matchDept && matchGrade;
  });

  const openAdd = () => {
    setEditing(null);
    setForm(emptyEnseignant);
    setDialogOpen(true);
  };

  const openEdit = (e: Enseignant) => {
    setEditing(e);
    setForm({ nom: e.nom, prenom: e.prenom, grade: e.grade, statut: e.statut, departement: e.departement, tauxHoraire: e.tauxHoraire, email: e.email, telephone: e.telephone });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.nom || !form.prenom || !form.email || !form.departement) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    if (editing) {
      setData((d) => d.map((e) => e.id === editing.id ? { ...e, ...form } : e));
      toast.success("Enseignant modifié");
    } else {
      setData((d) => [...d, { ...form, id: String(Date.now()) }]);
      toast.success("Enseignant ajouté");
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setData((d) => d.filter((e) => e.id !== id));
    toast.success("Enseignant supprimé");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Enseignants</h1>
          <p className="text-muted-foreground text-sm mt-1">{data.length} enseignants enregistrés</p>
        </div>
        <Button onClick={openAdd} className="gap-2">
          <Plus className="h-4 w-4" /> Ajouter
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={filterDept} onValueChange={setFilterDept}>
              <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Département" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les départements</SelectItem>
                {departements.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterGrade} onValueChange={setFilterGrade}>
              <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Grade" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les grades</SelectItem>
                <SelectItem value="Assistant">Assistant</SelectItem>
                <SelectItem value="Maître-Assistant">Maître-Assistant</SelectItem>
                <SelectItem value="Professeur">Professeur</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Département</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Heures</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{e.prenom} {e.nom}</p>
                        <p className="text-xs text-muted-foreground">{e.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{e.grade}</TableCell>
                    <TableCell>{e.departement}</TableCell>
                    <TableCell>
                      <Badge variant={e.statut === "Permanent" ? "default" : "secondary"}>{e.statut}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {(() => { const h = getHeuresEnseignant(e.id, activites); return (<><span className="font-medium">{h.total}h</span>{h.complementaires > 0 && <span className="text-xs text-destructive ml-1">(+{h.complementaires})</span>}</>); })()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewItem(e)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(e)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(e.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Modifier l'enseignant" : "Ajouter un enseignant"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nom *</Label>
              <Input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Prénom *</Label>
              <Input value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Téléphone</Label>
              <Input value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Grade</Label>
              <Select value={form.grade} onValueChange={(v) => setForm({ ...form, grade: v as Enseignant["grade"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Assistant">Assistant</SelectItem>
                  <SelectItem value="Maître-Assistant">Maître-Assistant</SelectItem>
                  <SelectItem value="Professeur">Professeur</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select value={form.statut} onValueChange={(v) => setForm({ ...form, statut: v as Enseignant["statut"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Permanent">Permanent</SelectItem>
                  <SelectItem value="Vacataire">Vacataire</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Département *</Label>
              <Select value={form.departement} onValueChange={(v) => setForm({ ...form, departement: v })}>
                <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                <SelectContent>
                  {departements.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Taux horaire (DA)</Label>
              <Input type="number" value={form.tauxHoraire} onChange={(e) => setForm({ ...form, tauxHoraire: Number(e.target.value) })} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSave}>{editing ? "Modifier" : "Ajouter"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewItem} onOpenChange={() => setViewItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Détails de l'enseignant</DialogTitle>
          </DialogHeader>
          {viewItem && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">Nom :</span> <span className="font-medium">{viewItem.prenom} {viewItem.nom}</span></div>
              <div><span className="text-muted-foreground">Grade :</span> <span className="font-medium">{viewItem.grade}</span></div>
              <div><span className="text-muted-foreground">Statut :</span> <span className="font-medium">{viewItem.statut}</span></div>
              <div><span className="text-muted-foreground">Département :</span> <span className="font-medium">{viewItem.departement}</span></div>
              <div><span className="text-muted-foreground">Email :</span> <span className="font-medium">{viewItem.email}</span></div>
              <div><span className="text-muted-foreground">Téléphone :</span> <span className="font-medium">{viewItem.telephone}</span></div>
              <div><span className="text-muted-foreground">Taux horaire :</span> <span className="font-medium">{viewItem.tauxHoraire} DA</span></div>
              {(() => { const h = getHeuresEnseignant(viewItem.id, activites); return (<><div><span className="text-muted-foreground">Volume horaire :</span> <span className="font-medium">{h.total}h</span></div><div><span className="text-muted-foreground">Heures comp. :</span> <span className="font-medium">{h.complementaires}h</span></div></>); })()}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
