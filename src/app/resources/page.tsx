"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

type Resource = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  coverImage: string | null;
  publishedAt: string | null;
  category: {
    id: string;
    name: string;
  };
};

type Category = {
  id: string;
  name: string;
  description: string | null;
};

type PaginationInfo = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export default function ResourcesPage() {
  const [articles, setArticles] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 9,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/resources/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  }, []);

  const fetchArticles = useCallback(
    async (page: number, category: string, search: string) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", "9");
        if (category) params.set("categoryId", category);
        if (search.trim()) params.set("search", search.trim());

        const res = await fetch(`/api/resources?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setArticles(data.articles || []);
          if (data.pagination) {
            setPagination(data.pagination);
          }
        } else {
          setArticles([]);
        }
      } catch (err) {
        console.error("Failed to load resources:", err);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchArticles(currentPage, selectedCategory, searchQuery);
  }, [fetchArticles, currentPage, selectedCategory, searchQuery]);

  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/70">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <header className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100/70 text-pink-700 text-xs font-semibold">
            📚 Evidence-Based Health Library
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Educational Health Resources
          </h1>
          <p className="text-gray-500 text-sm">
            Explore medically vetted guidance on reproductive care, hormonal balance, nutrition, and wellness.
          </p>
        </header>

        {/* Filters and Search Bar */}
        <section className="bg-white rounded-3xl p-5 border border-pink-100/60 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              🔍
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search topics, keywords..."
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 rounded-2xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:bg-white transition"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Tabs / Dropdown */}
          <div className="w-full md:w-auto flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => handleCategoryChange("")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === ""
                  ? "bg-pink-600 text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All Topics
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat.id
                    ? "bg-pink-600 text-white shadow-xs"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </section>

        {/* Content Section */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mb-3" />
            <p className="text-gray-400 text-xs font-medium">Loading resources...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="rounded-3xl bg-white p-12 text-center border border-pink-100/60 shadow-xs">
            <span className="text-3xl block mb-2">📖</span>
            <h3 className="font-bold text-gray-900 text-base">
              {searchQuery || selectedCategory ? "No matching articles found" : "Articles Updating"}
            </h3>
            <p className="text-gray-500 text-xs mt-1 max-w-sm mx-auto">
              {searchQuery || selectedCategory
                ? "Try adjusting your search terms or clearing category filters to find what you're looking for."
                : "Our clinical advisory team is preparing new educational articles for your wellness journey."}
            </p>
            {(searchQuery || selectedCategory) && (
              <button
                onClick={() => {
                  setSelectedCategory("");
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                className="mt-4 px-4 py-2 bg-pink-50 text-pink-600 rounded-xl text-xs font-bold hover:bg-pink-100 transition"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <Link
                  key={article.id}
                  href={`/resources/${article.slug}`}
                  className="rounded-3xl bg-white overflow-hidden border border-pink-100/60 shadow-xs hover:shadow-md transition flex flex-col justify-between group"
                >
                  {article.coverImage && (
                    <div className="w-full h-44 overflow-hidden bg-gray-100">
                      <img
                        src={article.coverImage}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    </div>
                  )}

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="px-2.5 py-1 rounded-full bg-pink-50 text-pink-700 text-[10px] font-bold uppercase tracking-wider">
                        {article.category.name}
                      </span>

                      <h2 className="text-base font-bold text-gray-900 mt-3 group-hover:text-pink-600 transition line-clamp-2">
                        {article.title}
                      </h2>

                      {article.summary && (
                        <p className="mt-2 text-xs text-gray-500 line-clamp-3 leading-relaxed">
                          {article.summary}
                        </p>
                      )}
                    </div>

                    <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                      <span>
                        {article.publishedAt
                          ? new Date(article.publishedAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "5 min read"}
                      </span>
                      <span className="font-semibold text-pink-600 group-hover:translate-x-1 transition-transform">
                        Read More →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between rounded-3xl bg-white px-6 py-4 border border-pink-100/60 shadow-xs">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={!pagination.hasPreviousPage}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  ← Previous
                </button>

                <span className="text-xs font-medium text-gray-500">
                  Page <strong className="text-gray-900">{pagination.page}</strong> of{" "}
                  <strong className="text-gray-900">{pagination.totalPages}</strong> ({pagination.total} articles)
                </span>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={!pagination.hasNextPage}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-pink-600 text-white hover:bg-pink-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}