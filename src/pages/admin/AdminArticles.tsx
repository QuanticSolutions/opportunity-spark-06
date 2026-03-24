import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

export default function AdminArticles() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: "", slug: "", content: "", excerpt: "", status: "draft" });
  const [editId, setEditId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchArticles = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false });
    setArticles(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchArticles(); }, []);

  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleSave = async () => {
    const adminUser = (await supabase.auth.getUser()).data.user;
    const payload: any = {
      ...form,
      slug: form.slug || generateSlug(form.title),
      author_id: adminUser?.id,
    };

    if (form.status === "published") {
      payload.published_at = new Date().toISOString();
    }

    let error;
    if (editId) {
      ({ error } = await supabase.from("articles").update(payload).eq("id", editId));
    } else {
      ({ error } = await supabase.from("articles").insert(payload));
    }

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    await supabase.from("admin_logs").insert({
      admin_id: adminUser?.id,
      action: editId ? "Article updated" : "Article created",
      target_id: editId || "new",
      target_type: "article",
    });

    toast({ title: editId ? "Article updated" : "Article created" });
    setDialogOpen(false);
    setForm({ title: "", slug: "", content: "", excerpt: "", status: "draft" });
    setEditId(null);
    fetchArticles();
  };

  const openEdit = (article: any) => {
    setForm({
      title: article.title,
      slug: article.slug,
      content: article.content || "",
      excerpt: article.excerpt || "",
      status: article.status,
    });
    setEditId(article.id);
    setDialogOpen(true);
  };

  const deleteArticle = async (id: string) => {
    await supabase.from("articles").delete().eq("id", id);
    const adminUser = (await supabase.auth.getUser()).data.user;
    await supabase.from("admin_logs").insert({
      admin_id: adminUser?.id,
      action: "Article deleted",
      target_id: id,
      target_type: "article",
    });
    toast({ title: "Article deleted" });
    fetchArticles();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Article Management</h1>
          <p className="text-sm text-muted-foreground">Create and manage platform articles</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) { setEditId(null); setForm({ title: "", slug: "", content: "", excerpt: "", status: "draft" }); }
        }}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> New Article</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editId ? "Edit Article" : "New Article"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <Label>Slug</Label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated from title" />
              </div>
              <div>
                <Label>Excerpt</Label>
                <Textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2} />
              </div>
              <div>
                <Label>Content</Label>
                <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={8} />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSave} className="w-full">
                {editId ? "Update Article" : "Create Article"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Articles ({articles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {articles.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium max-w-48 truncate">{a.title}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{a.slug}</TableCell>
                    <TableCell>
                      <Badge variant={a.status === "published" ? "default" : a.status === "pending" ? "secondary" : "outline"}>
                        {a.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(a.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => openEdit(a)}>Edit</Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteArticle(a.id)}>Delete</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
