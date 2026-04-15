import { useState } from "react";
import { activites as initialData, Activite, enseignants, ressources, calculerHeures } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function ActivitesPage() {
  const { user } = useAuth();
  const [data, setData] = useState<Activite[]>(initialData);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ enseignantId: "", type: "Création" as Activite["type"], ressourceId: "", complexite: "Moyen" as Activite["complexite"], date: "" });

  const isEnseignant = user?.role === "enseignant";
  const filtered = data
    .filter((a) => isEnseignant ? a.enseignantId === "1" : true)
    .filter((a) => {
      const r = ressources.find((r) => r.id === a.ressourceId);
      return (r?.titre || "").toLowerCase().includes(search.toLowerCase());
    });

  const handleAdd = () => {
    if (!form.ressourceId || !form.date || (!isEnseignant && !form.enseignantId)) { toast.error("Champs obligatoires manquants"); return; }
    const r = ressources.find((r) => r.id === form.ressourceId);
    const complexite = r?.complexite || form.complexite;
    const heures = calculerHeures(form.type, complexite);
    const newItem: Activite = {
      id: String(Date.now()),
      enseignantId: isEnseignant ? "1" : form.enseignantId,
      type: form.type,
      ressourceId: form.ressourceId,
      complexite,
      date: form.date,
      heuresCalculees: heures,
      statut: "En attente",
    };
    setData((d) => [newItem, ...d]);
    toast.success(`Activité ajoutée — ${heures}h calculées automatiquement`);
    setDialogOpen(false);
  };

  const validate = (id: string, statut: "Validée" | "Rejetée") => {
    setData((d) => d.map((a) => a.id === id ? { ...a, statut } : a));
    toast.success(`Activité ${statut.toLowerCase()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Activités pédagogiques</h1>
          <p className="text-muted-foreground text-sm mt-1">{filtered.length} activités</p>
        </div>
        <Button onClick={() => { setForm({ enseignantId: "", type: "Création", ressourceId: "", complexite: "Moyen", date: "" }); setDialogOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> Saisir une activité
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative mb-4 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {!isEnseignant && <TableHead>Enseignant</TableHead>}
                  <TableHead>Type</TableHead>
                  <TableHead>Ressource</TableHead>
                  <TableHead>Complexité</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Heures</TableHead>
                  <TableHead>Statut</TableHead>
                  {!isEnseignant && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((a) => {
                  const ens = enseignants.find((e) => e.id === a.enseignantId);
                  const r = ressources.find((r) => r.id === a.ressourceId);
                  return (
                    <TableRow key={a.id}>
                      {!isEnseignant && <TableCell className="text-sm">{ens ? `${ens.prenom} ${ens.nom}` : "—"}</TableCell>}
                      <TableCell><Badge variant="secondary">{a.type}</Badge></TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate">{r?.titre || "—"}</TableCell>
                      <TableCell>
                        <Badge variant={a.complexite === "Élevé" ? "destructive" : a.complexite === "Moyen" ? "default" : "secondary"}>
                          {a.complexite}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{a.date}</TableCell>
                      <TableCell className="text-right font-medium">{a.heuresCalculees}h</TableCell>
                      <TableCell>
                        <Badge variant={a.statut === "Validée" ? "default" : a.statut === "En attente" ? "secondary" : "destructive"}>
                          {a.statut}
                        </Badge>
                      </TableCell>
                      {!isEnseignant && (
                        <TableCell className="text-right">
                          {a.statut === "En attente" && (
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600" onClick={() => validate(a.id, "Validée")}>
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => validate(a.id, "Rejetée")}>
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Saisir une activité</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {!isEnseignant && (
              <div className="space-y-2">
                <Label>Enseignant *</Label>
                <Select value={form.enseignantId} onValueChange={(v) => setForm({ ...form, enseignantId: v })}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>
                    {enseignants.map((e) => <SelectItem key={e.id} value={e.id}>{e.prenom} {e.nom}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Type d'activité</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as Activite["type"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Création">Création de ressource</SelectItem>
                  <SelectItem value="Mise à jour">Mise à jour de ressource</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Ressource concernée *</Label>
              <Select value={form.ressourceId} onValueChange={(v) => {
                const r = ressources.find((r) => r.id === v);
                setForm({ ...form, ressourceId: v, complexite: r?.complexite || form.complexite });
              }}>
                <SelectTrigger><SelectValue placeholder="Sélectionner une ressource" /></SelectTrigger>
                <SelectContent>
                  {ressources.map((r) => <SelectItem key={r.id} value={r.id}>{r.titre}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Complexité (héritée de la ressource)</Label>
              <Select value={form.complexite} onValueChange={(v) => setForm({ ...form, complexite: v as Activite["complexite"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Faible">Faible</SelectItem>
                  <SelectItem value="Moyen">Moyen</SelectItem>
                  <SelectItem value="Élevé">Élevé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <p className="text-sm text-muted-foreground">
              Heures calculées automatiquement : <span className="font-semibold text-foreground">{calculerHeures(form.type, form.complexite)}h</span>
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleAdd}>Enregistrer</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
