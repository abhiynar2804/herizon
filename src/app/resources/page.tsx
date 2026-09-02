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

type ResourcesResponse = {
  articles: Resource[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

async function getResources(): Promise<ResourcesResponse> {
  try {
    const response = await fetch(
      `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/api/resources?page=1&limit=10`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return {
        articles: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
    }

    return response.json();
  } catch {
    return {
      articles: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  }
}

export default async function ResourcesPage() {
  const { articles } = await getResources();

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

        {articles.length === 0 ? (
          <div className="rounded-3xl bg-white p-12 text-center border border-pink-100/60 shadow-xs">
            <span className="text-3xl block mb-2">📖</span>
            <h3 className="font-bold text-gray-900 text-base">
              Articles Updating
            </h3>
            <p className="text-gray-500 text-xs mt-1 max-w-sm mx-auto">
              Our clinical advisory team is preparing new educational articles for your wellness journey.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/resources/${article.slug}`}
                className="rounded-3xl bg-white p-6 border border-pink-100/60 shadow-xs hover:shadow-md transition flex flex-col justify-between group"
              >
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
                  <span>5 min read</span>
                  <span className="font-semibold text-pink-600 group-hover:translate-x-1 transition-transform">
                    Read More →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}