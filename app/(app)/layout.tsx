import { BottomTabBar } from "@/components/peak/bottom-tab-bar";
import { OnlineIndicator } from "@/components/peak/online-indicator";
import { ServiceWorkerBootstrap } from "@/components/peak/service-worker-bootstrap";
import { SyncStatusBanner } from "@/components/peak/sync-status-banner";
import { ToastProvider } from "@/components/peak/toast-provider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="mx-auto flex min-h-dvh max-w-md flex-col pt-[env(safe-area-inset-top)]">
        <ServiceWorkerBootstrap />
        <OnlineIndicator />
        <SyncStatusBanner />
        <main className="flex-1 px-edge pt-edge pb-[96px]">{children}</main>
        <BottomTabBar />
      </div>
    </ToastProvider>
  );
}
