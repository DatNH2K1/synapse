export const dynamic = "force-dynamic";

import Sidebar from "@/components/dashboard/Sidebar";
import ThemeSwitcher from "@/components/shared/ThemeSwitcher";
import { getConfig } from "@/lib/db";
import { knowledgeService } from "@/lib/services/knowledge-service";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = getConfig();
  const pendingUpdates = await knowledgeService.getPendingUpdates();
  const pendingCount = pendingUpdates.length;

  return (
    <div className="flex h-screen w-screen bg-dashboard-bg text-dashboard-fg overflow-hidden selection:bg-accent-primary/30">
      <Sidebar userName={config.user_name} pendingCount={pendingCount} />

      <main className="relative flex flex-1 flex-col overflow-hidden bg-dashboard-bg/50">
        <div className="absolute right-8 top-8 z-50">
          <ThemeSwitcher />
        </div>
        <div className="flex-1 overflow-y-auto p-8 pt-20 space-y-8 custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
}
