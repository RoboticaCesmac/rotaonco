import { UsersRound, Stethoscope } from "lucide-react";

export function TeamHero({ total, active }: { total: number; active: number }) {
	const totalLabel = total === 1 ? "profissional cadastrado" : "profissionais cadastrados";
	const activeLabel = active === 1 ? "ativo" : "ativos";

	return (
		<section className="relative overflow-hidden rounded-xl border border-[#E5E5E5] bg-white">
			<div className="relative flex flex-col gap-6 px-8 py-10 sm:flex-row sm:items-center sm:justify-between">
				<div className="space-y-3">
					<p className="text-sm font-medium uppercase tracking-wide text-[#3663D8]">
						Equipe médica
					</p>
					<h2 className="text-3xl font-bold leading-tight text-[#3B3D3B] sm:text-[42px] sm:leading-[56px]">
						Médicos cadastrados
					</h2>
					<p className="max-w-xl text-base text-[#6E726E]">
						Visualize e gerencie os profissionais responsáveis pelos cuidados dos pacientes.
					</p>
					<div className="flex flex-wrap gap-4">
						<div className="flex items-center gap-2 rounded-full bg-[#F3F6FD] px-4 py-2 text-sm font-semibold text-[#3663D8]">
							<UsersRound className="h-4 w-4" />
							{total} {totalLabel}
						</div>
						<div className="flex items-center gap-2 rounded-full bg-[#E8F2FF] px-4 py-2 text-sm font-semibold text-[#1F56B9]">
							<Stethoscope className="h-4 w-4" />
							{active} {activeLabel}
						</div>
					</div>
				</div>
				<div className="flex flex-col items-end gap-3 rounded-lg bg-[#F3F6FD] px-6 py-5 text-right text-[#3663D8]">
					<span className="text-xs uppercase tracking-wide text-[#6E726E]">Próximas etapas</span>
					<p className="text-base font-semibold">
						Distribua pacientes, acompanhe licenças e organize escalas com poucos cliques.
					</p>
				</div>
			</div>
			<div className="pointer-events-none absolute -right-[140px] top-1/2 size-[260px] -translate-y-1/2 rounded-full bg-gradient-to-br from-[#AEC4FA] via-[#D6E1FB] to-[#F3F6FD] opacity-60 blur-2xl" />
		</section>
	);
}
