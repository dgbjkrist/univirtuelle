import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function ParametresPage() {
  const [annee, setAnnee] = useState("2024/2025");
  const [heuresNormales, setHeuresNormales] = useState(240);
  const [tauxAssistant, setTauxAssistant] = useState(2000);
  const [tauxMaitre, setTauxMaitre] = useState(2800);
  const [tauxProf, setTauxProf] = useState(3500);
  const [multCreation, setMultCreation] = useState(5);
  const [multMaj, setMultMaj] = useState(2);

  const handleSave = () => toast.success("Paramètres enregistrés");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Paramètres</h1>
        <p className="text-muted-foreground text-sm mt-1">Configuration de l'application</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Année académique</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Année en cours</Label>
              <Input value={annee} onChange={(e) => setAnnee(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Heures normales (quota)</Label>
              <Input type="number" value={heuresNormales} onChange={(e) => setHeuresNormales(Number(e.target.value))} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Taux horaires (DA)</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Assistant</Label>
              <Input type="number" value={tauxAssistant} onChange={(e) => setTauxAssistant(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Maître-Assistant</Label>
              <Input type="number" value={tauxMaitre} onChange={(e) => setTauxMaitre(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Professeur</Label>
              <Input type="number" value={tauxProf} onChange={(e) => setTauxProf(Number(e.target.value))} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Règles de calcul</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Base heures — Création</Label>
              <Input type="number" value={multCreation} onChange={(e) => setMultCreation(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Base heures — Mise à jour</Label>
              <Input type="number" value={multMaj} onChange={(e) => setMultMaj(Number(e.target.value))} />
            </div>
            <p className="text-xs text-muted-foreground">
              Multiplicateurs de complexité : Faible ×1, Moyen ×1.5, Élevé ×2
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Enregistrer les paramètres</Button>
      </div>
    </div>
  );
}
