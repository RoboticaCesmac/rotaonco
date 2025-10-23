import { WAIT_TIME_REPORT } from "../data";

const MAX_BAR_HEIGHT = 200;

export function ReportsWaitTimeCard() {
	const maxValue = WAIT_TIME_REPORT.reduce((acc, point) => Math.max(acc, point.value), 0);
	const average = WAIT_TIME_REPORT.reduce((sum, point) => sum + point.value, 0) / WAIT_TIME_REPORT.length;

	return (
		<section className="flex min-h-0 flex-1 flex-col gap-6 rounded-xl border border-[#E5E5E5] bg-white p-8">
			<header className="space-y-1">
				<h2 className="text-2xl font-bold text-[#3B3D3B]">Relatório de tempo de espera</h2>
				<p className="text-sm text-[#6E726E]">
					Tempo médio entre encaminhamento e primeira consulta por mês.
				</p>
			</header>

			<div className="grid gap-6 border border-[#E5E5E5] rounded-xl p-6">
				<div className="flex flex-wrap items-center justify-between gap-4">
					<StatCard label="Tempo médio total" value={`${Math.round(average)} dias`} accent />
					<StatCard label="Meta institucional" value="≤ 10 dias" />
					<StatCard label="Mês com maior espera" value="Junho" />
				</div>

				<div className="relative flex flex-col gap-4">
					<div className="absolute bottom-0 left-0 right-0 border-t border-dashed border-[#E5E5E5]" />
					<div className="flex items-end gap-4 overflow-x-auto pb-2">
						{WAIT_TIME_REPORT.map((point) => {
							const height = maxValue === 0 ? 0 : Math.round((point.value / maxValue) * MAX_BAR_HEIGHT);
							const isPeak = point.value === maxValue;
							return (
								<div key={point.month} className="flex min-w-[44px] flex-col items-center gap-3">
									<div className="flex h-[220px] w-11 items-end justify-center rounded-md bg-[#F5F6F9]">
										<div
											className="w-8 rounded-md bg-[#D4DBF7] transition-colors"
											style={{ height }}
										>
											<div
												className="h-full w-full rounded-md"
												style={{ backgroundColor: isPeak ? "#3663D8" : "#AEC4FA" }}
											/>
										</div>
									</div>
									<div className="space-y-1 text-center text-sm text-[#6E726E]">
										<span className="block text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">
											{point.label}
										</span>
										<span className="block text-sm font-semibold text-[#3B3D3B]">
											{point.value}d
										</span>
									</div>
								</div>
							);
						})}
					</div>
					<div className="flex items-center justify-between text-xs text-[#9CA3AF]">
						<span>Média mensal (dias)</span>
						<span>Fonte: registros clínicos consolidados</span>
					</div>
				</div>
			</div>
		</section>
	);
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
	return (
		<div
			className="flex min-w-[180px] flex-1 flex-col gap-1 rounded-lg bg-[#F9FAFB] px-4 py-3 text-[#3B3D3B]"
		>
			<span className="text-xs font-medium uppercase tracking-wide text-[#6E726E]">
				{label}
			</span>
			<span className={`text-lg font-semibold ${accent ? "text-[#3663D8]" : ""}`}>{value}</span>
		</div>
	);
}
