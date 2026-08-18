import Link from "next/link";

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
  const response = await fetch(
    `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/api/resources?page=1&limit=10`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch resources.");
  }

  return response.json();
}

export default async function ResourcesPage() {
  const { articles } = await getResources();

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10">
          <h1 className="text-3xl font-bold">
            Health Resources
          </h1>

          <p className="mt-2 text-gray-600">
            Reliable educational information for women&apos;s
            health and wellness.
          </p>
        </div>

        {articles.length === 0 ? (
          <div className="rounded-xl border p-8 text-center">
            <p className="text-gray-600">
              No resources are available yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/resources/${article.slug}`}
                className="rounded-xl border p-6 transition hover:shadow-md"
              >
                <p className="mb-2 text-sm font-medium">
                  {article.category.name}
                </p>

                <h2 className="text-xl font-semibold">
                  {article.title}
                </h2>

                {article.summary && (
                  <p className="mt-3 text-sm text-gray-600">
                    {article.summary}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}