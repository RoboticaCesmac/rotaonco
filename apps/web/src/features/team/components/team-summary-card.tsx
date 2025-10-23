import { Skeleton } from "@/components/ui/skeleton";
import type { TeamMemberStatus, TeamSummaryCounts } from "../data";
import { getStatusBadge } from "../utils";

const STATUS_ORDER: TeamMemberStatus[] = ["active", "inactive"];

export function TeamSummaryCard({ summary, isLoading }: { summary: TeamSummaryCounts | null; isLoading?: boolean }) {
	const total = summary?.total ?? 0;

	return (
		<section className="rounded-xl border border-[#E5E5E5] bg-white p-6">
			<header className="mb-4 space-y-1">
				<h3 className="text-lg font-semibold text-[#3B3D3B]">Resumo da equipe</h3>
				<p className="text-sm text-[#6E726E]">Acompanhe a disponibilidade da equipe médica.</p>
			</header>
			<div className="mb-4 rounded-lg bg-[#F3F6FD] px-4 py-3">
				<p className="text-xs font-semibold uppercase tracking-wide text-[#3663D8]">Profissionais cadastrados</p>
				{isLoading ? (
					<Skeleton className="mt-2 h-7 w-16" />
				) : (
					<p className="text-2xl font-bold text-[#1F56B9]">
						{total.toLocaleString("pt-BR")}
					</p>
				)}
			</div>
			{isLoading ? (
				<ul className="space-y-3">
					{STATUS_ORDER.map((status) => (
						<li key={status} className="rounded-lg bg-[#F9FAFB] px-4 py-3">
							<Skeleton className="h-5 w-full" />
						</li>
					))}
				</ul>
			) : (
				<ul className="space-y-3">
					{STATUS_ORDER.map((status) => {
						const badge = getStatusBadge(status);
						const value = summary?.[status] ?? 0;
						return (
							<li key={status} className="flex items-center justify-between rounded-lg bg-[#F9FAFB] px-4 py-3">
								<span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}>
									{badge.label}
								</span>
								<span className="text-base font-semibold text-[#3B3D3B]">
									{value.toLocaleString("pt-BR")}
								</span>
							</li>
						);
					})}
				</ul>
			)}
		</section>
	);
}
