import { Skeleton } from "@/components/ui/skeleton";

type ProfileHeroProps = {
	lastUpdated?: string | null;
	isLoading: boolean;
};

export function ProfileHero({ lastUpdated, isLoading }: ProfileHeroProps) {
	const formattedUpdatedAt = formatUpdatedAt(lastUpdated);

	return (
		<section className="relative overflow-hidden rounded-xl border border-[#E5E5E5] bg-white">
			<div className="relative flex flex-col gap-4 px-8 py-10 sm:flex-row sm:items-center sm:justify-between">
				<div className="space-y-3">
					<p className="text-sm font-medium uppercase tracking-wide text-[#3663D8]">
						Dados do usuário
					</p>
					<h2 className="text-3xl font-bold leading-tight text-[#3B3D3B] sm:text-[42px] sm:leading-[56px]">
						Mantenha seus dados atualizados
					</h2>
					<p className="max-w-xl text-base text-[#6E726E]">
						Informações corretas garantem uma jornada de cuidado mais segura para toda a equipe.
					</p>
				</div>
				<div className="flex items-center gap-3 rounded-lg bg-[#F3F6FD] px-6 py-5 text-right text-[#3663D8]">
					<div className="text-left">
						<p className="text-xs uppercase tracking-wide text-[#6E726E]">Última atualização</p>
						{isLoading ? (
							<Skeleton className="mt-1 h-4 w-32" />
						) : (
							<p className="text-base font-semibold">{formattedUpdatedAt}</p>
						)}
					</div>
				</div>
			</div>
			<div className="pointer-events-none absolute -right-[120px] top-1/2 size-[220px] -translate-y-1/2 rounded-full bg-gradient-to-br from-[#AEC4FA] via-[#D6E1FB] to-[#F3F6FD] opacity-60 blur-2xl" />
		</section>
	);
}

function formatUpdatedAt(updatedAt?: string | null) {
	if (!updatedAt) {
		return "Não disponível";
	}
	const date = new Date(updatedAt);
	if (Number.isNaN(date.getTime())) {
		return "Não disponível";
	}
	return date.toLocaleDateString("pt-BR", {
		day: "2-digit",
		month: "long",
		year: "numeric",
	});
}
