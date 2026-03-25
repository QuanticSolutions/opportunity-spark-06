import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<any>(null);
  const [author, setAuthor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("articles")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .single();
      setArticle(data);
      if (data?.author_id) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("id", data.author_id)
          .single();
        setAuthor(prof);
      }
      setLoading(false);
    };
    fetch();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 container py-12 space-y-6">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-96 w-full" />
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 container py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-6">The article you're looking for doesn't exist or isn't published.</p>
          <Link to="/articles" className="text-primary font-medium hover:underline">← Back to Articles</Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <article className="container max-w-3xl py-12 space-y-8">
          <Link to="/articles" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft size={14} /> Back to Articles
          </Link>

          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground leading-tight">
            {article.title}
          </h1>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {author && (
              <span className="flex items-center gap-1">
                <User size={14} /> {author.full_name || "Admin"}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar size={14} /> {new Date(article.published_at || article.created_at).toLocaleDateString()}
            </span>
          </div>

          {article.cover_image && (
            <img
              src={article.cover_image}
              alt={article.title}
              className="w-full rounded-lg object-cover max-h-[400px]"
            />
          )}

          {article.excerpt && (
            <p className="text-lg text-muted-foreground italic border-l-4 border-primary pl-4">
              {article.excerpt}
            </p>
          )}

          <div
            className="prose prose-sm md:prose-base max-w-none text-foreground
              prose-headings:text-foreground prose-a:text-primary prose-blockquote:border-primary"
            dangerouslySetInnerHTML={{ __html: article.content || "" }}
          />
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
