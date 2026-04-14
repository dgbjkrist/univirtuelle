import { enseignants, HEURES_NORMALES } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function HeuresPage() {
  const { user } = useAuth();
  const isEnseignant = user?.role === "enseignant";
  const data = isEnseignant ? enseignants.filter((e) => e.id === "1") : enseignants;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Suivi des heures</h1>
        <p className="text-muted-foreground text-sm mt-1">Volume horaire et heures complémentaires</p>
      </div>

      {isEnseignant ? (
        <div className="space-y-4">
          {data.map((e) => {
            const pct = Math.min((e.heuresTotal / HEURES_NORMALES) * 100, 100);
            return (
              <Card key={e.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Mon volume horaire</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progression</span>
                    <span className="font-medium">{e.heuresTotal}h / {HEURES_NORMALES}h</span>
                  </div>
                  <Progress value={pct} className="h-3" />
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="stat-card text-center">
                      <p className="text-2xl font-bold">{e.heuresTotal}h</p>
                      <p className="text-sm text-muted-foreground">Heures totales</p>
                    </div>
                    <div className="stat-card text-center">
                      <p className="text-2xl font-bold">{e.heuresComplementaires}h</p>
                      <p className="text-sm text-muted-foreground">Heures complémentaires</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Enseignant</TableHead>
                    <TableHead>Département</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead className="text-right">Heures totales</TableHead>
                    <TableHead className="text-right">H. complémentaires</TableHead>
                    <TableHead>Progression</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((e) => {
                    const pct = Math.min((e.heuresTotal / HEURES_NORMALES) * 100, 100);
                    const exceeded = e.heuresTotal > HEURES_NORMALES;
                    return (
                      <TableRow key={e.id}>
                        <TableCell className="font-medium">{e.prenom} {e.nom}</TableCell>
                        <TableCell>{e.departement}</TableCell>
                        <TableCell>{e.grade}</TableCell>
                        <TableCell className="text-right font-medium">{e.heuresTotal}h</TableCell>
                        <TableCell className="text-right">{e.heuresComplementaires}h</TableCell>
                        <TableCell className="w-32">
                          <Progress value={pct} className="h-2" />
                        </TableCell>
                        <TableCell>
                          <Badge variant={exceeded ? "destructive" : "default"}>
                            {exceeded ? "Dépassement" : "Normal"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
