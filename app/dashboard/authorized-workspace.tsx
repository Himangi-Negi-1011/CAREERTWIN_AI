import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CareerWorkspace } from "../components/dashboard/workspace";

export async function AuthorizedWorkspace({ ownerKey }: { ownerKey?: string } = {}) {
  if (ownerKey) {
    return <CareerWorkspace ownerKey={ownerKey} />;
  }

  const { userId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=/dashboard");
  return <CareerWorkspace ownerKey={userId} />;
}
