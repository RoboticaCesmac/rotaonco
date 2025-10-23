import { AppLayout } from "@/components/app-layout";
import { ReportsActionsPanel } from "@/features/reports/components/reports-actions-panel";
import { ReportsHero } from "@/features/reports/components/reports-hero";
import { ReportsWaitTimeCard } from "@/features/reports/components/reports-wait-time-card";
import { REPORT_ACTION_GROUPS } from "@/features/reports/data";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/reports")({
	beforeLoad: async ({ context }) => {
		const session = await context.authClient.getSession();
		if (!session.data) {
			throw redirect({ to: "/login" });
		}
	},
	component: ReportsRoute,
});

function ReportsRoute() {
	return (
		<AppLayout>
			<div className="space-y-8">
				<header className="space-y-1">
					<h1 className="text-2xl font-bold text-[#3B3D3B] md:text-[34px] md:leading-[42px]">
						Relatórios
					</h1>
					<p className="text-sm text-[#6E726E]">
						Painéis analíticos para monitorar tempos de espera, presença e adesão.
					</p>
				</header>

				<ReportsHero totalReports={REPORT_ACTION_GROUPS.length} />

				<div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
					<ReportsWaitTimeCard />
					<aside className="flex min-h-0 flex-col gap-6">
						<ReportsActionsPanel />
					</aside>
				</div>
			</div>
		</AppLayout>
	);
}
