import { Card, CardContent } from "@/components/ui/card";
import { UsersRound } from "lucide-react";

export default function Team() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-foreground">Team Members</h1>
      <Card className="glass-card">
        <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
          <UsersRound size={48} className="text-muted-foreground" />
          <div>
            <h3 className="text-lg font-semibold text-foreground">Team Management</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Available on Professional and Enterprise plans. Invite team members to collaborate on opportunity management.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
