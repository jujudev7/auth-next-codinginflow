import { Pool } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  if (!process.env.POSTGRES_PRISMA_URL) {
    throw new Error(
      "POSTGRES_PRISMA_URL n'est pas défini dans les variables d'environnement.",
    );
  }

  const neon = new Pool({ connectionString: process.env.POSTGRES_PRISMA_URL });
  const adapter = new PrismaNeon(neon);
  return new PrismaClient({ adapter });
};

declare global {
  // Déclare une variable globale pour éviter de recréer PrismaClient
  // Utilise le type de retour de `prismaClientSingleton` pour s'assurer du type correct
  var prismaGlobal: ReturnType<typeof prismaClientSingleton> | undefined;
}

// Vérifie si une instance de PrismaClient existe déjà dans l'environnement de développement
const prisma =
  process.env.NODE_ENV === "production"
    ? prismaClientSingleton()
    : globalThis.prismaGlobal ??
      (globalThis.prismaGlobal = prismaClientSingleton());

export default prisma;
