import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <main>
      <h1>Welcome, {session.user.name}</h1>

      <p>Email: {session.user.email}</p>

      <p>Role: {session.user.role}</p>
    </main>
  );
}