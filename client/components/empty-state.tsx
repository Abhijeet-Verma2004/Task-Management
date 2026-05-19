import { ClipboardList } from "lucide-react";
import { Card, CardContent } from "./ui/card";

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-14 text-center">
        <div className="mb-4 rounded-full bg-muted p-3">
          <ClipboardList className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
