
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { institutionalAnnouncements } from "@/lib/mock-data";
import { Megaphone } from "lucide-react";
import Image from "next/image";

export function AnnouncementsPage() {
  const getCategoryVariant = (category: string) => {
    switch (category) {
      case 'Evento': return 'default';
      case 'Académico': return 'secondary';
      case 'General': return 'outline';
      default: return 'outline';
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Página de Inicio"
        description="Mantente al día con los últimos anuncios y noticias de la institución."
      >
        <Megaphone className="h-8 w-8 text-primary" />
      </PageHeader>
      <div className="space-y-6">
        {institutionalAnnouncements.map((ann) => (
          <Card key={ann.id}>
            {ann.imageUrl && (
              <div className="relative w-full h-48">
                <Image
                  src={ann.imageUrl}
                  alt={ann.title}
                  fill
                  style={{ objectFit: 'cover' }}
                  className="rounded-t-lg"
                  data-ai-hint="announcement image"
                />
              </div>
            )}
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{ann.title}</CardTitle>
                <Badge variant={getCategoryVariant(ann.category) as any}>{ann.category}</Badge>
              </div>
              <CardDescription>
                Publicado por {ann.author} el {ann.date}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{ann.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
