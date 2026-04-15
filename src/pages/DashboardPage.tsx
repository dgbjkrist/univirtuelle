import { useAuth } from "@/contexts/AuthContext";
import { StatCard } from "@/components/StatCard";
import { enseignants, activites, cours, ressources, HEURES_NORMALES, getHeuresEnseignant } from "@/data/mockData";
import { Users, Clock, BookOpen, AlertTriangle, FileText, CheckCircle, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const deptData = (() => {
  const map: Record<string, number> = {};
  enseignants.forEach((e) => {
    const h = getHeuresEnseignant(e.id, activites);
    map[e.departement] = (map[e.departement] || 0) + h.total;
  });
  return Object.entries(map).map(([name, heures]) => ({ name, heures }));
})();

const COLORS = ["hsl(230,80%,56%)", "hsl(142,72%,40%)", "hsl(38,92%,50%)", "hsl(0,72%,51%)"];

const activityTypeData = [
  { name: "Création", value: activites.filter((a) => a.type === "Création").length },
  { name: "Mise à jour", value: activites.filter((a) => a.type === "Mise à jour").length },
];

function AdminDashboard() {
  const totalHeures = enseignants.reduce((s, e) => s + getHeuresEnseignant(e.id, activites).total, 0);
  const totalComp = enseignants.reduce((s, e) => s + getHeuresEnseignant(e.id, activites).complementaires, 0);
  const depassements = enseignants.filter((e) => getHeuresEnseignant(e.id, activites).total > HEURES_NORMALES).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Tableau de bord</h1>
        <p className="text-muted-foreground text-sm mt-1">Vue d'ensemble — Année 2024/2025</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Enseignants" value={enseignants.length} icon={<Users className="h-5 w-5" />} />
        <StatCard title="Volume horaire total" value={`${totalHeures}h`} icon={<Clock className="h-5 w-5" />} />
        <StatCard title="Ressources" value={ressources.length} icon={<Package className="h-5 w-5" />} />
        <StatCard title="Dépassements" value={depassements} icon={<AlertTriangle className="h-5 w-5" />} subtitle="enseignants au-delà de 240h" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Heures par département</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={deptData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="heures" fill="hsl(230,80%,56%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Répartition des activités</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={activityTypeData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {activityTypeData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Activités récentes</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activites.slice(0, 5).map((a) => {
              const ens = enseignants.find((e) => e.id === a.enseignantId);
              const r = ressources.find((r) => r.id === a.ressourceId);
              return (
                <div key={a.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center text-xs font-medium text-accent-foreground">
                      {ens?.prenom[0]}{ens?.nom[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{ens?.prenom} {ens?.nom}</p>
                      <p className="text-xs text-muted-foreground">{r?.titre || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{a.heuresCalculees}h</span>
                    <Badge variant={a.statut === "Validée" ? "default" : a.statut === "En attente" ? "secondary" : "destructive"} className="text-xs">{a.statut}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SecretaireDashboard() {
  const pendingCount = activites.filter((a) => a.statut === "En attente").length;
  const depassements = enseignants.filter((e) => getHeuresEnseignant(e.id, activites).total > HEURES_NORMALES);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Tableau de bord</h1>
        <p className="text-muted-foreground text-sm mt-1">Suivi des activités — Secrétariat</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Enseignants actifs" value={enseignants.length} icon={<Users className="h-5 w-5" />} />
        <StatCard title="Activités en attente" value={pendingCount} icon={<FileText className="h-5 w-5" />} />
        <StatCard title="Alertes dépassement" value={depassements.length} icon={<AlertTriangle className="h-5 w-5" />} />
      </div>
      {depassements.length > 0 && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" /> Alertes de dépassement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {depassements.map((e) => {
                const h = getHeuresEnseignant(e.id, activites);
                return (
                  <div key={e.id} className="flex items-center justify-between text-sm">
                    <span>{e.prenom} {e.nom}</span>
                    <span className="font-medium text-destructive">{h.total}h / {HEURES_NORMALES}h (+{h.complementaires}h)</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Activités en attente de validation</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activites.filter((a) => a.statut === "En attente").map((a) => {
              const ens = enseignants.find((e) => e.id === a.enseignantId);
              const r = ressources.find((r) => r.id === a.ressourceId);
              return (
                <div key={a.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium">{ens?.prenom} {ens?.nom}</p>
                    <p className="text-xs text-muted-foreground">{a.type} — {r?.titre || "—"}</p>
                  </div>
                  <Badge variant="secondary">{a.heuresCalculees}h</Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EnseignantDashboard() {
  const myActivites = activites.filter((a) => a.enseignantId === "1");
  const h = getHeuresEnseignant("1", activites);
  const validated = myActivites.filter((a) => a.statut === "Validée").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mon tableau de bord</h1>
        <p className="text-muted-foreground text-sm mt-1">Bienvenue, Karim Hadj</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Volume horaire" value={`${h.total}h`} icon={<Clock className="h-5 w-5" />} subtitle={`Seuil: ${HEURES_NORMALES}h`} />
        <StatCard title="Heures complémentaires" value={`${h.complementaires}h`} icon={<BookOpen className="h-5 w-5" />} />
        <StatCard title="Activités validées" value={`${validated}/${myActivites.length}`} icon={<CheckCircle className="h-5 w-5" />} />
      </div>
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Mes activités récentes</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {myActivites.map((a) => {
              const r = ressources.find((r) => r.id === a.ressourceId);
              return (
                <div key={a.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium">{r?.titre || "—"}</p>
                    <p className="text-xs text-muted-foreground">{a.type} • {a.complexite} • {a.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{a.heuresCalculees}h</span>
                    <Badge variant={a.statut === "Validée" ? "default" : "secondary"}>{a.statut}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  if (user?.role === "admin") return <AdminDashboard />;
  if (user?.role === "secretaire") return <SecretaireDashboard />;
  return <EnseignantDashboard />;
}
