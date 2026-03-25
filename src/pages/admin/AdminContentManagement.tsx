import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from "react-router-dom";
import AdminArticles from "./AdminArticles";
import AdminOpportunities from "./AdminOpportunities";

export default function AdminContentManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "articles";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Content Management</h1>
        <p className="text-sm text-muted-foreground">Manage articles and opportunities</p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setSearchParams({ tab: v })}>
        <TabsList>
          <TabsTrigger value="articles">Articles</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
        </TabsList>
        <TabsContent value="articles" className="mt-6">
          <AdminArticles />
        </TabsContent>
        <TabsContent value="opportunities" className="mt-6">
          <AdminOpportunities />
        </TabsContent>
      </Tabs>
    </div>
  );
}
