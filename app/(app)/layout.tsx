import { BottomTabBar } from "@/components/peak/bottom-tab-bar";
import { OnlineIndicator } from "@/components/peak/online-indicator";
import { ServiceWorkerBootstrap } from "@/components/peak/service-worker-bootstrap";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <ServiceWorkerBootstrap />
      <OnlineIndicator />
      <main className="flex-1 px-edge pt-edge pb-[96px]">{children}</main>
      <BottomTabBar />
    </div>
  );
}
