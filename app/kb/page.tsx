"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Search, ChevronRight, BookOpen, Eye, Bot, ToggleLeft, ToggleRight, Loader2, X } from "lucide-react";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  viewCount: number;
  authorName?: string | null;
  tags?: string[];
  category?: { name: string; slug: string; icon?: string | null } | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  _count: { articles: number };
}

interface SearchResult {
  articles: Article[];
  total: number;
  directAnswer?: string | null;
  isAI?: boolean;
}

function SkeletonCard() {
  return (
    <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] animate-pulse">
      <div className="h-3 bg-[var(--color-bg-secondary)] rounded w-1/3 mb-3" />
      <div className="h-4 bg-[var(--color-bg-secondary)] rounded w-3/4 mb-2" />
      <div className="h-3 bg-[var(--color-bg-secondary)] rounded w-full mb-1" />
      <div className="h-3 bg-[var(--color-bg-secondary)] rounded w-2/3" />
    </div>
  );
}

export default function KnowledgeBasePage() {
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [aiEnabled, setAiEnabled] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [searched, setSearched] = useState(false);

  // Auto-search if ?q= is present in URL (e.g. from related search chips)
  useEffect(() => {
    const urlQ = searchParams.get("q");
    if (urlQ) {
      setQuery(urlQ);
      setSearched(true);
      setSearching(true);
      const params = new URLSearchParams({ q: urlQ });
      fetch(`/api/kb/search?${params}`)
        .then((r) => r.json())
        .then((data) => { setSearchResult(data); setSearching(false); })
        .catch(() => { setSearchResult({ articles: [], total: 0 }); setSearching(false); });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    async function loadInitial() {
      try {
        const [catRes, artRes] = await Promise.all([
          fetch("/api/kb?category=__none__").then(() => fetch("/api/admin/kb?type=categories").catch(() => null)),
          fetch("/api/kb"),
        ]);
        // Categories from admin API (public categories list via public API workaround)
        // We'll use the public /api/kb endpoint for articles
        if (artRes.ok) {
          const d = await artRes.json();
          setFeaturedArticles(d.articles || []);
        }
        // Fetch categories separately
        const catPublic = await fetch("/api/kb?_cat=1").catch(() => null);
        // We need categories — use a direct fetch to the admin endpoint without auth
        // The categories are shown via direct DB query on server — we'll fetch from public API
        // Since /api/kb doesn't return categories, we use a workaround: fetch them client-side
        // from the admin endpoint (read-only, public data)
        const catFetch = await fetch("/api/admin/kb?type=categories").catch(() => null);
        if (catFetch?.ok) {
          const cd = await catFetch.json();
          setCategories((cd.categories || []).filter((c: any) => c.isPublic));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingInitial(false);
      }
    }
    loadInitial();
  }, []);

  const handleSearch = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setSearched(true);
    try {
      const params = new URLSearchParams({ q: query.trim() });
      if (aiEnabled) params.set("aiSearch", "true");
      const res = await fetch(`/api/kb/search?${params}`);
      const data = await res.json();
      setSearchResult(data);
    } catch (err) {
      console.error(err);
      setSearchResult({ articles: [], total: 0 });
    } finally {
      setSearching(false);
    }
  }, [query, aiEnabled]);

  const clearSearch = () => {
    setQuery("");
    setSearchResult(null);
    setSearched(false);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Header */}
      <div className="bg-[var(--color-navy)] py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-display font-bold text-4xl text-white mb-3">How can we help you?</h1>
          <p className="text-white/70 mb-8">Search our knowledge base for answers to your questions</p>

          <form onSubmit={handleSearch} className="relative max-w-xl mx-auto">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search articles, guides, FAQs..."
              className="w-full pl-12 pr-24 py-4 rounded-2xl bg-white text-gray-900 text-base outline-none shadow-lg placeholder:text-gray-400 focus:ring-2 focus:ring-[var(--color-gold)]"
            />
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-[88px] top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={16} />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-[var(--color-gold)] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#b8911f] transition-colors"
            >
              Search
            </button>
          </form>

          {/* AI Toggle */}
          <div className="flex items-center justify-center gap-3 mt-4">
            <button
              onClick={() => setAiEnabled((v) => !v)}
              className="flex items-center gap-2 text-white/80 hover:text-white text-sm transition-colors"
              type="button"
            >
              {aiEnabled
                ? <ToggleRight size={22} className="text-[var(--color-gold)]" />
                : <ToggleLeft size={22} className="text-white/40" />
              }
              <span className="font-semibold">AI-Powered Search</span>
              <Bot size={15} className={aiEnabled ? "text-[var(--color-gold)]" : "text-white/40"} />
            </button>
            {aiEnabled && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-gold)]/20 text-[var(--color-gold)] font-semibold border border-[var(--color-gold)]/30">
                AI ON
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">

        {/* ─── SEARCH RESULTS ─── */}
        {searched && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-2xl text-[var(--color-text)]">
                {searching ? "Searching..." : `Results for "${query}"`}
              </h2>
              <button
                onClick={clearSearch}
                className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-gold)] transition-colors"
              >
                Clear search
              </button>
            </div>

            {searching ? (
              <div className="space-y-4">
                {/* AI Answer skeleton */}
                {aiEnabled && (
                  <div className="animate-pulse p-5 rounded-2xl border-2 border-[var(--color-gold)]/30 bg-[var(--color-gold)]/5">
                    <div className="h-4 bg-[var(--color-bg-secondary)] rounded w-1/4 mb-3" />
                    <div className="h-3 bg-[var(--color-bg-secondary)] rounded w-full mb-2" />
                    <div className="h-3 bg-[var(--color-bg-secondary)] rounded w-3/4" />
                  </div>
                )}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
                </div>
              </div>
            ) : (
              <>
                {/* AI Direct Answer */}
                {searchResult?.isAI && searchResult.directAnswer && (
                  <div className="mb-6 p-5 rounded-2xl border-2 border-[var(--color-gold)] bg-[var(--color-gold)]/5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-[var(--color-gold)] text-white">
                        <Bot size={12} /> AI Answer
                      </span>
                      {searchResult.isAI && (
                        <span className="text-[10px] text-[var(--color-text-muted)]">Generated by AI · May not be 100% accurate</span>
                      )}
                    </div>
                    <p className="text-sm text-[var(--color-text)] leading-relaxed">{searchResult.directAnswer}</p>
                  </div>
                )}

                {/* Article Results */}
                {!searchResult || searchResult.articles.length === 0 ? (
                  <div className="py-16 text-center">
                    <Search size={40} className="text-[var(--color-text-muted)] mx-auto mb-3 opacity-30" />
                    <p className="text-[var(--color-text-muted)] font-medium">No articles found. Try different keywords.</p>
                    <p className="text-sm text-[var(--color-text-muted)] mt-1">
                      Or{" "}
                      <button
                        onClick={() => { setAiEnabled(true); handleSearch(); }}
                        className="text-[var(--color-gold)] hover:underline"
                      >
                        try with AI Search
                      </button>
                    </p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {searchResult.articles.map((art) => (
                      <Link key={art.id} href={`/kb/${art.slug}`}
                        className="group p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] hover:border-[var(--color-gold)]/40 hover:shadow-lg transition-all">
                        {art.category && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--color-gold)]/10 text-[var(--color-gold)] mb-2 inline-block">
                            {art.category.icon} {art.category.name}
                          </span>
                        )}
                        <h3 className="font-semibold text-sm text-[var(--color-text)] mb-2 group-hover:text-[var(--color-gold)] transition-colors line-clamp-2">{art.title}</h3>
                        {art.excerpt && (
                          <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 mb-3">{art.excerpt}</p>
                        )}
                        <div className="flex items-center gap-3 text-[10px] text-[var(--color-text-muted)]">
                          <span className="flex items-center gap-1"><Eye size={11} /> {art.viewCount} views</span>
                          {art.authorName && <span>by {art.authorName}</span>}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </section>
        )}

        {/* ─── DEFAULT VIEW (when not searching) ─── */}
        {!searched && (
          <>
            {/* Categories */}
            <section>
              <h2 className="font-display font-bold text-2xl text-[var(--color-text)] mb-6">Browse by Category</h2>
              {loadingInitial ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="animate-pulse p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)]">
                      <div className="h-8 w-8 bg-[var(--color-bg-secondary)] rounded mb-3" />
                      <div className="h-4 bg-[var(--color-bg-secondary)] rounded w-2/3 mb-2" />
                      <div className="h-3 bg-[var(--color-bg-secondary)] rounded w-full" />
                    </div>
                  ))}
                </div>
              ) : categories.length === 0 ? (
                <p className="text-[var(--color-text-muted)] text-sm">No categories available yet.</p>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {categories.map((cat) => (
                    <Link key={cat.id} href={`/kb/category/${cat.slug}`}
                      className="group p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] hover:border-[var(--color-gold)]/40 hover:shadow-lg transition-all">
                      <div className="text-4xl mb-3">{cat.icon || "📋"}</div>
                      <h3 className="font-display font-bold text-base text-[var(--color-text)] mb-1 group-hover:text-[var(--color-gold)] transition-colors">{cat.name}</h3>
                      <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 mb-3">{cat.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
                          {cat._count.articles} articles
                        </span>
                        <ChevronRight size={14} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-gold)] transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* Featured Articles */}
            {(loadingInitial || featuredArticles.length > 0) && (
              <section>
                <h2 className="font-display font-bold text-2xl text-[var(--color-text)] mb-6">Popular Articles</h2>
                {loadingInitial ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {featuredArticles.slice(0, 6).map((art) => (
                      <Link key={art.id} href={`/kb/${art.slug}`}
                        className="group p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] hover:border-[var(--color-gold)]/40 hover:shadow-lg transition-all">
                        {art.category && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--color-gold)]/10 text-[var(--color-gold)] mb-2 inline-block">
                            {art.category.icon} {art.category.name}
                          </span>
                        )}
                        <h3 className="font-semibold text-sm text-[var(--color-text)] mb-2 group-hover:text-[var(--color-gold)] transition-colors line-clamp-2">{art.title}</h3>
                        {art.excerpt && (
                          <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 mb-3">{art.excerpt}</p>
                        )}
                        <div className="flex items-center gap-3 text-[10px] text-[var(--color-text-muted)]">
                          <span className="flex items-center gap-1"><Eye size={11} /> {art.viewCount} views</span>
                          {art.authorName && <span>by {art.authorName}</span>}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            )}
          </>
        )}

        {/* Help CTA */}
        <section className="p-8 rounded-2xl bg-[var(--color-navy)] text-center">
          <BookOpen size={32} className="text-[var(--color-gold)] mx-auto mb-3" />
          <h3 className="font-display font-bold text-xl text-white mb-2">Can&apos;t find what you&apos;re looking for?</h3>
          <p className="text-white/70 text-sm mb-5">Our support team is here to help you 24/7</p>
          <Link href="/support"
            className="inline-flex items-center gap-2 bg-[var(--color-gold)] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-[#b8911f] transition-colors">
            Contact Support <ChevronRight size={16} />
          </Link>
        </section>
      </div>
    </div>
  );
}
