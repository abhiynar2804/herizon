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
  coverImage?: string | null;
  status: ArticleStatus;
  publishedAt: string | null;
  category: Category;
};

export default function AdminArticlesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Category Create State
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [addingCat, setAddingCat] = useState(false);

  // Category Edit State (Plan #05)
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [editCatName, setEditCatName] = useState("");
  const [editCatDesc, setEditCatDesc] = useState("");
  const [savingCat, setSavingCat] = useState(false);
  const [deletingCatId, setDeletingCatId] = useState<string | null>(null);

  // Article Create State
  const [artTitle, setArtTitle] = useState("");
  const [artSlug, setArtSlug] = useState("");
  const [artCatId, setArtCatId] = useState("");
  const [artSummary, setArtSummary] = useState("");
  const [artContent, setArtContent] = useState("");
  const [artStatus, setArtStatus] = useState<ArticleStatus>("PUBLISHED");
  const [addingArt, setAddingArt] = useState(false);

  // Article Edit State (Plan #03)
  const [editingArt, setEditingArt] = useState<Article | null>(null);
  const [editArtTitle, setEditArtTitle] = useState("");
  const [editArtSlug, setEditArtSlug] = useState("");
  const [editArtCatId, setEditArtCatId] = useState("");
  const [editArtSummary, setEditArtSummary] = useState("");
  const [editArtContent, setEditArtContent] = useState("");
  const [editArtStatus, setEditArtStatus] = useState<ArticleStatus>("PUBLISHED");
  const [savingArt, setSavingArt] = useState(false);

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

  // CATEGORY ACTIONS
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

  function handleStartEditCategory(cat: Category) {
    setEditingCat(cat);
    setEditCatName(cat.name);
    setEditCatDesc(cat.description || "");
    setError("");
  }

  async function handleUpdateCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingCat || !editCatName.trim()) return;

    try {
      setSavingCat(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/admin/article-categories/${editingCat.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: editCatName.trim(),
            description: editCatDesc.trim() || undefined,
          }),
        },
      );

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to update category.");

      setSuccess("Category updated successfully!");
      setEditingCat(null);
      await loadAllData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error updating category.");
    } finally {
      setSavingCat(false);
    }
  }

  async function handleDeleteCategory(id: string) {
    if (
      !confirm(
        "Are you sure you want to delete this category? (Categories with assigned articles cannot be deleted)",
      )
    )
      return;

    try {
      setDeletingCatId(id);
      setError("");
      setSuccess("");

      const response = await fetch(`/api/admin/article-categories/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to delete category.");

      setSuccess("Category deleted successfully.");
      await loadAllData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error deleting category.");
    } finally {
      setDeletingCatId(null);
    }
  }

  // ARTICLE ACTIONS
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

  function handleStartEditArticle(article: Article) {
    setEditingArt(article);
    setEditArtTitle(article.title);
    setEditArtSlug(article.slug);
    setEditArtCatId(article.category.id);
    setEditArtSummary(article.summary || "");
    setEditArtContent(article.content);
    setEditArtStatus(article.status);
    setError("");
  }

  async function handleUpdateArticle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingArt || !editArtTitle.trim() || !editArtCatId || !editArtContent.trim()) {
      setError("Please fill in all required article fields.");
      return;
    }

    const autoSlug =
      editArtSlug.trim() ||
      editArtTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    try {
      setSavingArt(true);
      setError("");
      setSuccess("");

      const response = await fetch(`/api/admin/articles/${editingArt.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editArtTitle.trim(),
          slug: autoSlug,
          categoryId: editArtCatId,
          summary: editArtSummary.trim() || undefined,
          content: editArtContent.trim(),
          status: editArtStatus,
        }),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to update article.");

      setSuccess("Article updated successfully!");
      setEditingArt(null);
      await loadAllData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error updating article.");
    } finally {
      setSavingArt(false);
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
            Publish articles, edit existing content, and manage resource categories.
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

            {/* Existing Categories List with Edit & Delete */}
            <section className="rounded-3xl bg-slate-900/80 p-6 border border-slate-800 space-y-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Existing Categories ({categories.length})
              </h2>

              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {categories.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{c.name}</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleStartEditCategory(c)}
                          className="text-indigo-400 hover:text-indigo-300 font-medium text-xs transition"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(c.id)}
                          disabled={deletingCatId === c.id}
                          className="text-red-400 hover:text-red-300 font-medium text-xs transition disabled:opacity-50"
                        >
                          {deletingCatId === c.id ? "..." : "Delete"}
                        </button>
                      </div>
                    </div>
                    {c.description && (
                      <p className="text-[11px] text-slate-400">
                        {c.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Article Editor & List (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Create Article Form */}
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

            {/* Articles Table with Edit & Delete */}
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
                          onClick={() => handleStartEditArticle(art)}
                          className="px-2 py-1 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-800/60 text-xs transition"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteArticle(art.id)}
                          className="px-2 py-1 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/60 text-xs transition"
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

        {/* Category Edit Modal Overlay (Plan #05) */}
        {editingCat && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-md rounded-3xl bg-slate-900 p-6 sm:p-8 shadow-2xl border border-slate-800 space-y-5 text-slate-100">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white">
                  ✏️ Edit Category
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingCat(null)}
                  className="text-slate-400 hover:text-white text-sm font-semibold p-1"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdateCategory} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editCatName}
                    onChange={(e) => setEditCatName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={editCatDesc}
                    onChange={(e) => setEditCatDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingCat(null)}
                    className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingCat}
                    className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2 text-xs font-semibold text-white shadow-xs disabled:opacity-50 transition"
                  >
                    {savingCat ? "Saving..." : "Save Category"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Article Edit Modal Overlay (Plan #03) */}
        {editingArt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-2xl rounded-3xl bg-slate-900 p-6 sm:p-8 shadow-2xl border border-slate-800 space-y-5 text-slate-100 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white">
                  ✏️ Edit Educational Article
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingArt(null)}
                  className="text-slate-400 hover:text-white text-sm font-semibold p-1"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdateArticle} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Article Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={editArtTitle}
                      onChange={(e) => setEditArtTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Category *
                    </label>
                    <select
                      value={editArtCatId}
                      onChange={(e) => setEditArtCatId(e.target.value)}
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
                      URL Slug
                    </label>
                    <input
                      type="text"
                      value={editArtSlug}
                      onChange={(e) => setEditArtSlug(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Status
                    </label>
                    <select
                      value={editArtStatus}
                      onChange={(e) =>
                        setEditArtStatus(e.target.value as ArticleStatus)
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
                    value={editArtSummary}
                    onChange={(e) => setEditArtSummary(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Article Body Content *
                  </label>
                  <textarea
                    rows={8}
                    required
                    value={editArtContent}
                    onChange={(e) => setEditArtContent(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500 font-sans"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingArt(null)}
                    className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingArt}
                    className="rounded-xl bg-purple-600 hover:bg-purple-700 px-5 py-2 text-xs font-semibold text-white shadow-xs disabled:opacity-50 transition"
                  >
                    {savingArt ? "Saving..." : "Save Article Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
