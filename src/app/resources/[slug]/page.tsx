import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

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
  try {
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
  } catch {
    return null;
  }
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
    <div className="min-h-screen flex flex-col bg-gray-50/70">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <article className="rounded-3xl bg-white p-6 sm:p-10 shadow-xs border border-pink-100/60">
          <Link
            href="/resources"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-pink-600 hover:text-pink-700 hover:underline"
          >
            ← Back to All Resources
          </Link>

          <div className="mt-6">
            <span className="px-2.5 py-1 rounded-full bg-pink-50 text-pink-700 text-[10px] font-bold uppercase tracking-wider">
              {article.category.name}
            </span>

            <h1 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
              {article.title}
            </h1>

            {article.summary && (
              <p className="mt-4 text-sm sm:text-base text-gray-600 font-medium leading-relaxed pb-6 border-b border-gray-100">
                {article.summary}
              </p>
            )}

            <div className="mt-8 prose prose-pink max-w-none text-gray-700 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
              {article.content}
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}