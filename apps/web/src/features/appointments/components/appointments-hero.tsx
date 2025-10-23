import { CalendarDays, ChevronRight } from "lucide-react";

export function AppointmentsHero({
	total,
	selectedDay,
}: {
	total: number;
	selectedDay: string;
}) {
	const description = total === 1 ? "consulta agendada" : "consultas agendadas";
	const dateValue = new Date(`${selectedDay}T00:00:00`);
	const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});
	const readableDate = Number.isNaN(dateValue.getTime())
		? selectedDay
		: dateFormatter.format(dateValue);

	return (
		<section className="relative overflow-hidden rounded-xl border border-[#E5E5E5] bg-white">
			<div className="relative flex flex-col gap-4 px-8 py-10 sm:flex-row sm:items-center sm:justify-between">
				<div className="space-y-2">
					<p className="text-sm font-medium uppercase tracking-wide text-[#3663D8]">
						Agenda de consultas
					</p>
					<h2 className="text-3xl font-bold leading-tight text-[#3B3D3B] sm:text-[42px] sm:leading-[56px]">
						Suas consultas
					</h2>
					<p className="text-base text-[#6E726E]">
						{total} {description} para {readableDate}
					</p>
				</div>
				<div className="flex items-center gap-3 rounded-lg bg-[#F3F6FD] px-4 py-3 text-[#3663D8]">
					<CalendarDays className="h-6 w-6" />
					<div className="text-left text-sm font-medium">
						<p className="text-xs uppercase tracking-wide text-[#6E726E]">Dia selecionado</p>
						<p className="text-base text-[#3663D8]">{readableDate}</p>
					</div>
					<ChevronRight className="h-5 w-5 text-[#8FA6E8]" />
				</div>
			</div>
			<div className="pointer-events-none absolute -right-[120px] top-1/2 size-[220px] -translate-y-1/2 rounded-full bg-gradient-to-br from-[#AEC4FA] via-[#D6E1FB] to-[#F3F6FD] opacity-60 blur-2xl" />
		</section>
	);
}
