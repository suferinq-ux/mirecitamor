import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession, SESSION_COOKIE } from "@/lib/session";
import Dashboard from "@/components/Dashboard";

export const dynamic = "force-dynamic";

export default async function AmorPage() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;
  if (!session) redirect("/");

  const names: [string, string] = [
    process.env.NEXT_PUBLIC_NAME_1 || "Mi Amor",
    process.env.NEXT_PUBLIC_NAME_2 || "Mi Vida"
  ];

  return (
    <Dashboard
      userName={session.n}
      names={names}
      anniversary={process.env.NEXT_PUBLIC_ANNIVERSARY || null}
    />
  );
}
