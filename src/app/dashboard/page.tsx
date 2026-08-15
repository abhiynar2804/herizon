import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const healthProfile = await prisma.healthProfile.findUnique({
    where: {
      userId: session.user.id,
    },
  });

  if (!healthProfile) {
    redirect("/onboarding");
  }

  return (
    <main>
      <h1>Welcome, {session.user.name}</h1>

      <p>Email: {session.user.email}</p>

      <p>Role: {session.user.role}</p>

      <p>Health profile completed.</p>
    </main>
  );
}