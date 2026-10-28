import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CareerWorkspace } from "../components/dashboard/workspace";

export async function AuthorizedWorkspace() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=/dashboard");
  return <CareerWorkspace ownerKey={userId} />;
}
