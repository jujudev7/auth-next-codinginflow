import prisma from "@/lib/prisma";
import Image from "next/image";
import { notFound } from "next/navigation";
import { cache } from "react";

interface PageProps {
  params: { id: string };
}

interface UserId {
  id: string;
}

// Utiliser le cache pour optimiser la récupération des données utilisateur
const getUser = cache(async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, image: true, createdAt: true },
  });
});

export async function generateStaticParams() {
  // Récupérer tous les utilisateurs
  const allUsers = await prisma.user.findMany({
    select: { id: true },
  });

  // Typage explicite du paramètre `id`
  return allUsers.map(({ id }: UserId) => ({ id }));
}

export async function generateMetadata({ params: { id } }: PageProps) {
  const user = await getUser(id);

  return {
    title: user?.name || `User ${id}`,
  };
}

export default async function Page({ params: { id } }: PageProps) {
  // Délai artificiel pour illustrer la mise en cache statique
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const user = await getUser(id);

  if (!user) notFound();

  return (
    <div className="mx-3 my-10 flex flex-col items-center gap-3">
      {user.image && (
        <Image
          src={user.image}
          width={100}
          alt="User profile picture"
          height={100}
          className="rounded-full"
        />
      )}
      <h1 className="text-center text-xl font-bold">
        {user?.name || `User ${id}`}
      </h1>
      <p className="text-muted-foreground">
        User since {new Date(user.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
}
