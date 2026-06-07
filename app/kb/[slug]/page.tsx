import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ChevronRight, Eye, ThumbsUp, ThumbsDown, Calendar, User, BookOpen } from "lucide-react";
import { HelpfulButtons } from "./HelpfulButtons";
import { RelatedSearches } from "./RelatedSearches";

export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await db.kBArticle.findUnique({ where: { slug }, select: { title: true, excerpt: true } });
  return {
    title: article ? `${article.title} | KVL TECH Help` : "Article Not Found",
    description: article?.excerpt || "",
  };
}

function renderMarkdown(content: string) {
  // Basic markdown to HTML — headings, bold, italic, code, lists, links
  return content
    .replace(/^### (.+)$/gm, '<h3 class="font-display font-bold text-lg text-[var(--color-text)] mt-6 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="font-display font-bold text-xl text-[var(--color-text)] mt-8 mb-3 border-b border-[var(--color-border)] pb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="font-display font-bold text-2xl text-[var(--color-text)] mt-8 mb-4">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-[var(--color-text)]">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-[var(--color-bg-secondary)] text-xs font-mono text-[var(--color-gold)] border border-[var(--color-border)]">$1</code>')
    .replace(/```([\s\S]*?)```/g, '<pre class="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl p-4 overflow-x-auto text-xs font-mono text-[var(--color-text)] my-4"><code>$1</code></pre>')
    .replace(/^\- (.+)$/gm, '<li class="flex items-start gap-2 text-[var(--color-text-secondary)] text-sm leading-relaxed"><span class="text-[var(--color-gold)] mt-1">•</span><span>$1</span></li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="text-[var(--color-text-secondary)] text-sm leading-relaxed list-decimal list-inside">$2</li>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-[var(--color-gold)] hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\n\n/g, '</p><p class="text-sm text-[var(--color-text-secondary)] leading-relaxed my-3">')
    .replace(/^(?!<[h|p|l|c|p])(.+)$/gm, (m) => m.trim() ? `<p class="text-sm text-[var(--color-text-secondary)] leading-relaxed my-3">${m}</p>` : "");
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const article = await db.kBArticle.findUnique({
    where: { slug },
    include: { category: { select: { id: true, name: true, slug: true, icon: true } } },
  });

  if (!article || !article.isPublic || !article.isPublished) {
    notFound();
  }

  // Increment view count
  await db.kBArticle.update({ where: { id: article.id }, data: { viewCount: { increment: 1 } } });

  // Related articles
  const related = article.categoryId
    ? await db.kBArticle.findMany({
        where: { categoryId: article.categoryId, isPublic: true, isPublished: true, id: { not: article.id } },
        take: 5,
        orderBy: { viewCount: "desc" },
      })
    : [];

  const html = renderMarkdown(article.content);

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex gap-10">

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mb-6">
              <Link href="/kb" className="hover:text-[var(--color-gold)] transition-colors">Help Center</Link>
              {article.category && (
                <>
                  <ChevronRight size={12} />
                  <Link href={`/kb/category/${article.category.slug}`} className="hover:text-[var(--color-gold)] transition-colors">
                    {article.category.icon} {article.category.name}
                  </Link>
                </>
              )}
              <ChevronRight size={12} />
              <span className="text-[var(--color-text-secondary)] truncate max-w-[200px]">{article.title}</span>
            </nav>

            {/* Article header */}
            <div className="mb-8">
              <h1 className="font-display font-bold text-3xl text-[var(--color-text)] mb-4 leading-tight">{article.title}</h1>
              <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)] flex-wrap">
                {article.authorName && (
                  <span className="flex items-center gap-1"><User size={12} /> {article.authorName}</span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {new Date(article.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </span>
                <span className="flex items-center gap-1"><Eye size={12} /> {article.viewCount} views</span>
                {article.helpfulCount > 0 && (
                  <span className="flex items-center gap-1"><ThumbsUp size={12} /> {article.helpfulCount} found helpful</span>
                )}
              </div>
              {article.tags?.length > 0 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {article.tags.map((tag) => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-muted)]">{tag}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Article content */}
            <div className="prose-custom border-t border-[var(--color-border)] pt-8 pb-8"
              dangerouslySetInnerHTML={{ __html: html }} />

            {/* Helpful buttons */}
            <HelpfulButtons slug={slug} />

            {/* Related Searches (AI-generated) */}
            <RelatedSearches slug={slug} />
          </div>

          {/* Sidebar */}
          {related.length > 0 && (
            <aside className="w-64 shrink-0 hidden lg:block">
              <div className="sticky top-20">
                <h3 className="font-display font-bold text-sm text-[var(--color-text)] mb-4 flex items-center gap-2">
                  <BookOpen size={14} className="text-[var(--color-gold)]" />
                  Related Articles
                </h3>
                <div className="space-y-2">
                  {related.map((r) => (
                    <Link key={r.id} href={`/kb/${r.slug}`}
                      className="group block p-3 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-gold)]/40 transition-all">
                      <p className="text-xs font-semibold text-[var(--color-text)] group-hover:text-[var(--color-gold)] transition-colors line-clamp-2">{r.title}</p>
                      <p className="text-[10px] text-[var(--color-text-muted)] mt-1 flex items-center gap-1"><Eye size={10} /> {r.viewCount}</p>
                    </Link>
                  ))}
                </div>

                <div className="mt-6 p-4 rounded-xl bg-[var(--color-navy)]">
                  <p className="text-xs font-semibold text-white mb-1">Still need help?</p>
                  <p className="text-[10px] text-white/60 mb-3">Contact our support team</p>
                  <Link href="/support"
                    className="block text-center text-xs font-semibold bg-[var(--color-gold)] text-white py-2 rounded-lg hover:bg-[#b8911f] transition-colors">
                    Open a Ticket
                  </Link>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
