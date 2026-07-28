import { Suspense } from "react";
import { Sidebar } from "@/components/sidebar";
import { TermsGate } from "@/components/terms-gate";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen gap-3 p-3 overflow-hidden">
      <Suspense fallback={<aside className="w-60 shrink-0 glass-md rounded-lg" />}>
        <Sidebar />
      </Suspense>
      <main className="flex-1 overflow-y-auto rounded-lg glass-md p-6 sm:p-8">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
      {/* Bloqueia o dashboard inteiro (inclusive a sidebar) até o aceite dos
          termos vigentes — fail-open se o Monitor estiver fora do ar. */}
      <Suspense fallback={null}>
        <TermsGate />
      </Suspense>
    </div>
  );
}
