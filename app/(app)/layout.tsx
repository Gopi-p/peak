import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { BottomTabBar } from "@/components/peak/bottom-tab-bar";
import { OnlineIndicator } from "@/components/peak/online-indicator";
import { ServiceWorkerBootstrap } from "@/components/peak/service-worker-bootstrap";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <ServiceWorkerBootstrap />
      <OnlineIndicator />
      <main className="flex-1 px-edge pt-edge pb-[96px]">{children}</main>
      <BottomTabBar />
    </div>
  );
}
