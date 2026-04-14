import { enseignants, HEURES_NORMALES } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, FileText, Printer } from "lucide-react";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const chartData = enseignants.map((e) => ({
  name: `${e.prenom[0]}. ${e.nom}`,
  heures: e.heuresTotal,
  complementaires: e.heuresComplementaires,
}));

export default function RapportsPage() {
  const handleExport = (format: string) => {
    toast.success(`Export ${format} en cours de génération...`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Rapports</h1>
          <p className="text-muted-foreground text-sm mt-1">Génération et export des rapports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => handleExport("PDF")}>
            <Download className="h-4 w-4" /> PDF
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => handleExport("Excel")}>
            <FileText className="h-4 w-4" /> Excel
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Imprimer
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Heures par enseignant</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="heures" fill="hsl(230,80%,56%)" name="Heures totales" radius={[4, 4, 0, 0]} />
              <Bar dataKey="complementaires" fill="hsl(38,92%,50%)" name="Complémentaires" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">État global des heures</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Enseignant</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Département</TableHead>
                  <TableHead className="text-right">Heures</TableHead>
                  <TableHead className="text-right">Complémentaires</TableHead>
                  <TableHead className="text-right">Taux</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enseignants.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.prenom} {e.nom}</TableCell>
                    <TableCell>{e.grade}</TableCell>
                    <TableCell>{e.departement}</TableCell>
                    <TableCell className="text-right">{e.heuresTotal}h</TableCell>
                    <TableCell className="text-right">{e.heuresComplementaires}h</TableCell>
                    <TableCell className="text-right">{e.tauxHoraire} DA</TableCell>
                    <TableCell className="text-right font-medium">
                      {(e.heuresComplementaires * e.tauxHoraire).toLocaleString()} DA
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
