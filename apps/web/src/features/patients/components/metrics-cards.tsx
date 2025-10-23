import { Users2, Stethoscope, HeartPulse, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { PatientsMetrics } from "../api";

const cardBaseClasses = "relative overflow-hidden rounded-xl border border-[#E5E5E5] bg-white p-6 shadow-sm";

const metricCards = [
	{
		title: "Total de pacientes",
		description: "Pacientes cadastrados",
		icon: Users2,
		getValue: (metrics?: PatientsMetrics) => metrics?.total ?? 0,
	},
	{
		title: "Em tratamento",
		description: "Pacientes ativos no ciclo",
		icon: Stethoscope,
		getValue: (metrics?: PatientsMetrics) => metrics?.inTreatment ?? 0,
	},
	{
		title: "Concluídos",
		description: "Tratamentos finalizados",
		icon: HeartPulse,
		getValue: (metrics?: PatientsMetrics) => metrics?.concluded ?? 0,
	},
	{
		title: "Em risco",
		description: "Atenção da equipe",
		icon: AlertTriangle,
		getValue: (metrics?: PatientsMetrics) => metrics?.atRisk ?? 0,
	},
] as const;

type MetricsCardsProps = {
	metrics?: PatientsMetrics;
	isLoading: boolean;
	error?: Error | null;
};

export function MetricsCards({ metrics, isLoading, error }: MetricsCardsProps) {
	return (
		<section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
			{metricCards.map((card) => {
				const Icon = card.icon;
				const value = card.getValue(metrics);
				return (
					<article key={card.title} className={cardBaseClasses}>
						<div className="flex flex-col gap-6">
							<header className="flex items-center gap-3">
								<div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#2563EB]/10 text-[#2563EB]">
									<Icon className="h-5 w-5" />
								</div>
								<div>
									<p className="text-sm font-medium text-[#3B3D3B]">{card.title}</p>
									<p className="text-xs font-medium uppercase text-[#C8C8C8]">{card.description}</p>
								</div>
							</header>
							<div>
								{isLoading ? (
									<Skeleton className="h-10 w-24" />
								) : (
									<p className="text-4xl font-bold text-[#3663D8]">
										{value.toLocaleString("pt-BR")}
									</p>
								)}
							</div>
						</div>
					</article>
				);
			})}
			{error ? (
				<div className="col-span-full rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
					Não foi possível carregar os indicadores dos pacientes.
				</div>
			) : null}
		</section>
	);
}
