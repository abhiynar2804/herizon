import Link from "next/link";
import { notFound } from "next/navigation";

type Resource = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  coverImage: string | null;
  publishedAt: string | null;
  category: {
    id: string;
    name: string;
  };
};

async function getResource(slug: string): Promise<Resource | null> {
  const response = await fetch(
    `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/api/resources/${slug}`,
    {
      cache: "no-store",
    },
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to fetch resource.");
  }

  return response.json();
}

export default async function ResourcePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getResource(slug);

  if (!article) {
    notFound();
  }

  return (
    <main className="min-h-screen px-6 py-10">
      <article className="mx-auto max-w-3xl">
        <Link
          href="/resources"
          className="text-sm underline"
        >
          ← Back to resources
        </Link>

        <div className="mt-8">
          <p className="text-sm font-medium">
            {article.category.name}
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            {article.title}
          </h1>

          {article.summary && (
            <p className="mt-4 text-lg text-gray-600">
              {article.summary}
            </p>
          )}

          <div className="mt-8 whitespace-pre-wrap leading-7">
            {article.content}
          </div>
        </div>
      </article>
    </main>
  );
}