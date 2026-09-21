"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import AdminNavbar from "@/components/layout/AdminNavbar";

type Category = {
  id: string;
  name: string;
  description: string | null;
};

type ArticleStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

type Article = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  status: ArticleStatus;
  publishedAt: string | null;
  category: Category;
};

export default function AdminArticlesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Category Form State
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [addingCat, setAddingCat] = useState(false);

  // Article Form State
  const [artTitle, setArtTitle] = useState("");
  const [artSlug, setArtSlug] = useState("");
  const [artCatId, setArtCatId] = useState("");
  const [artSummary, setArtSummary] = useState("");
  const [artContent, setArtContent] = useState("");
  const [artStatus, setArtStatus] = useState<ArticleStatus>("PUBLISHED");
  const [addingArt, setAddingArt] = useState(false);

  const loadAllData = useCallback(async () => {
    try {
      setError("");

      const [catRes, artRes] = await Promise.all([
        fetch("/api/admin/article-categories"),
        fetch("/api/admin/articles"),
      ]);

      const catData = await catRes.json();
      const artData = await artRes.json();

      if (!catRes.ok)
        throw new Error(catData.message || "Failed to load categories.");
      if (!artRes.ok)
        throw new Error(artData.message || "Failed to load articles.");

      const catList = catData.categories || catData || [];
      setCategories(catList);
      if (catList.length > 0 && !artCatId) {
        setArtCatId(catList[0].id);
      }

      setArticles(artData.articles || artData || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error loading educational data.",
      );
    }
  }, [artCatId]);

  useEffect(() => {
    void loadAllData();
  }, [loadAllData]);

  async function handleAddCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!catName.trim()) return;

    try {
      setAddingCat(true);
      setError("");
      setSuccess("");

      const response = await fetch("/api/admin/article-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: catName.trim(),
          description: catDesc.trim() || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to create category.");

      setSuccess("Category added successfully!");
      setCatName("");
      setCatDesc("");
      await loadAllData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error adding category.");
    } finally {
      setAddingCat(false);
    }
  }

  async function handleAddArticle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!artTitle.trim() || !artCatId || !artContent.trim()) {
      setError("Please provide title, category, and content.");
      return;
    }

    const autoSlug =
      artSlug.trim() ||
      artTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    try {
      setAddingArt(true);
      setError("");
      setSuccess("");

      const response = await fetch("/api/admin/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: artTitle.trim(),
          slug: autoSlug,
          categoryId: artCatId,
          summary: artSummary.trim() || undefined,
          content: artContent.trim(),
          status: artStatus,
        }),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to save article.");

      setSuccess("Educational Article saved successfully!");
      setArtTitle("");
      setArtSlug("");
      setArtSummary("");
      setArtContent("");
      await loadAllData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error saving article.");
    } finally {
      setAddingArt(false);
    }
  }

  async function handleDeleteArticle(id: string) {
    if (!confirm("Delete this article?")) return;

    try {
      setError("");
      const response = await fetch(`/api/admin/articles/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to delete article.");

      setSuccess("Article deleted successfully.");
      await loadAllData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error deleting article.");
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <AdminNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Educational Content &amp; Article Management
          </h1>
          <p className="text-xs text-slate-400">
            Publish articles and create resource categories for platform users.
          </p>
        </header>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-950/60 border border-red-800/80 text-xs text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-800/80 text-xs text-emerald-300">
            ✓ {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Categories Management (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            <section className="rounded-3xl bg-slate-900/80 p-6 border border-slate-800 space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider text-indigo-400">
                Create Resource Category
              </h2>

              <form onSubmit={handleAddCategory} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    placeholder="e.g. Hormonal Health, PCOS Care"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={catDesc}
                    onChange={(e) => setCatDesc(e.target.value)}
                    placeholder="Brief category scope..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={addingCat}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-semibold text-white transition disabled:opacity-50"
                >
                  {addingCat ? "Saving..." : "+ Add Category"}
                </button>
              </form>
            </section>

            <section className="rounded-3xl bg-slate-900/80 p-6 border border-slate-800 space-y-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Existing Categories ({categories.length})
              </h2>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {categories.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs"
                  >
                    <span className="font-bold text-white block">{c.name}</span>
                    {c.description && (
                      <span className="text-[11px] text-slate-400">
                        {c.description}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Article Editor & List (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            <section className="rounded-3xl bg-slate-900/80 p-6 border border-slate-800 space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider text-purple-400">
                Write &amp; Publish Article
              </h2>

              <form onSubmit={handleAddArticle} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Article Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={artTitle}
                      onChange={(e) => setArtTitle(e.target.value)}
                      placeholder="e.g. Understanding the Follicular Phase"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Category *
                    </label>
                    <select
                      value={artCatId}
                      onChange={(e) => setArtCatId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      URL Slug (Auto-generated if blank)
                    </label>
                    <input
                      type="text"
                      value={artSlug}
                      onChange={(e) => setArtSlug(e.target.value)}
                      placeholder="follicular-phase-guide"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Status
                    </label>
                    <select
                      value={artStatus}
                      onChange={(e) =>
                        setArtStatus(e.target.value as ArticleStatus)
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="DRAFT">DRAFT</option>
                      <option value="PUBLISHED">PUBLISHED</option>
                      <option value="ARCHIVED">ARCHIVED</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Summary / Excerpt
                  </label>
                  <input
                    type="text"
                    value={artSummary}
                    onChange={(e) => setArtSummary(e.target.value)}
                    placeholder="Brief 1-2 sentence preview for search & resource cards..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Article Body Content *
                  </label>
                  <textarea
                    rows={6}
                    required
                    value={artContent}
                    onChange={(e) => setArtContent(e.target.value)}
                    placeholder="Write educational article text..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500 font-sans"
                  />
                </div>

                <button
                  type="submit"
                  disabled={addingArt}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 font-semibold text-white transition disabled:opacity-50"
                >
                  {addingArt ? "Saving Article..." : "+ Save & Publish Article"}
                </button>
              </form>
            </section>

            {/* Articles Table */}
            <section className="rounded-3xl bg-slate-900/80 p-6 border border-slate-800 space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Published &amp; Draft Articles ({articles.length})
              </h2>

              <div className="space-y-3">
                {articles.map((art) => (
                  <div
                    key={art.id}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">
                          {art.title}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px]">
                          {art.category.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            art.status === "PUBLISHED"
                              ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                              : "bg-amber-950 text-amber-300 border border-amber-800"
                          }`}
                        >
                          {art.status}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteArticle(art.id)}
                          className="text-slate-500 hover:text-red-400 transition ml-2 text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {art.summary && (
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        {art.summary}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
