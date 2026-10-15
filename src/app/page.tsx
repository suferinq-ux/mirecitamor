import LoginForm from "@/components/LoginForm";

export default function Home() {
  const names: [string, string] = [
    process.env.NEXT_PUBLIC_NAME_1 || "Mi Amor",
    process.env.NEXT_PUBLIC_NAME_2 || "Mi Vida"
  ];
  return <LoginForm names={names} devMode={process.env.NODE_ENV !== "production"} />;
}
