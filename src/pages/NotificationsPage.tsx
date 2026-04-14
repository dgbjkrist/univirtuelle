import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, CheckCircle, Info } from "lucide-react";

const notifications = [
  { id: "1", type: "warning", title: "Dépassement d'heures", message: "Nadia Slimani a dépassé le quota de 240h (310h)", date: "Il y a 2h", read: false },
  { id: "2", type: "info", title: "Activité en attente", message: "Une nouvelle activité de Mohamed Cherif est en attente de validation", date: "Il y a 5h", read: false },
  { id: "3", type: "success", title: "Activité validée", message: "L'activité 'Cours vidéo - Arbres binaires' a été validée", date: "Hier", read: true },
  { id: "4", type: "warning", title: "Dépassement d'heures", message: "Karim Hadj a dépassé le quota de 240h (280h)", date: "Il y a 2 jours", read: true },
  { id: "5", type: "info", title: "Nouveau cours ajouté", message: "Le cours 'Intelligence artificielle' a été ajouté au programme", date: "Il y a 3 jours", read: true },
];

const iconMap = { warning: AlertTriangle, info: Info, success: CheckCircle, pending: Clock };
const colorMap = { warning: "text-warning", info: "text-primary", success: "text-success", pending: "text-muted-foreground" };

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
        <p className="text-muted-foreground text-sm mt-1">{notifications.filter((n) => !n.read).length} non lues</p>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => {
          const Icon = iconMap[n.type as keyof typeof iconMap] || Info;
          const color = colorMap[n.type as keyof typeof colorMap] || "text-muted-foreground";
          return (
            <Card key={n.id} className={!n.read ? "border-primary/20 bg-accent/30" : ""}>
              <CardContent className="flex items-start gap-4 py-4">
                <div className={`mt-0.5 ${color}`}><Icon className="h-5 w-5" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{n.title}</p>
                    {!n.read && <Badge variant="default" className="text-[10px] px-1.5 py-0">Nouveau</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{n.date}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
