import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div className="p-10">
        <h1>Você não está logado</h1>
        <a href="/login" className="text-blue-500">
          Ir para login
        </a>
      </div>
    );
  }

  return (
    <div className="p-10">
      <h1>Bem-vindo {session.user?.email}</h1>
    </div>
  );
}