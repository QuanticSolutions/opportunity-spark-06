import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function Documents() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-foreground">Documents</h1>
      <Card className="glass-card">
        <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
          <FileText size={48} className="text-muted-foreground" />
          <div>
            <h3 className="text-lg font-semibold text-foreground">Document Review</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Applicant documents (CVs, cover letters, transcripts) will appear here when applicants submit them.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
