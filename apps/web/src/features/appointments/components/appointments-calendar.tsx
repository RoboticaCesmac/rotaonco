import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getMonthMatrix, toISODateString, WEEKDAY_LABELS } from "../utils";

export function AppointmentsCalendar({
	selectedDate,
	onChange,
}: {
	selectedDate: Date;
	onChange: (next: Date) => void;
}) {
	const monthMatrix = getMonthMatrix(selectedDate);

	const goPrev = () => {
		const next = new Date(selectedDate);
		next.setMonth(selectedDate.getMonth() - 1, 1);
		onChange(next);
	};

	const goNext = () => {
		const next = new Date(selectedDate);
		next.setMonth(selectedDate.getMonth() + 1, 1);
		onChange(next);
	};

	const monthFormatter = new Intl.DateTimeFormat("pt-BR", {
		month: "long",
		year: "numeric",
	});

	const headerLabel = monthFormatter.format(selectedDate);

	return (
		<section className="rounded-xl border border-[#E5E5E5] bg-white p-6">
			<header className="mb-4 flex items-center justify-between">
				<h3 className="text-lg font-semibold text-[#3B3D3B]">Calendário</h3>
				<div className="flex items-center gap-2">
					<Button
						type="button"
						variant="outline"
						size="icon"
						className="h-8 w-8"
						onClick={goPrev}
						aria-label="Mês anterior"
					>
						<ChevronLeft className="h-4 w-4" />
					</Button>
					<p className="text-sm font-medium capitalize text-[#3B3D3B]">{headerLabel}</p>
					<Button
						type="button"
						variant="outline"
						size="icon"
						className="h-8 w-8"
						onClick={goNext}
						aria-label="Próximo mês"
					>
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>
			</header>
			<table className="w-full table-fixed border-separate border-spacing-1 text-center text-sm">
				<thead>
					<tr className="text-[#6E726E]">
						{WEEKDAY_LABELS.map((label) => (
							<th key={label} className="py-2 text-xs font-semibold uppercase tracking-wide">
								{label}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{monthMatrix.map((week, index) => (
						<tr key={index}>
							{week.map((day) => {
								const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
								const isSelected = toISODateString(day) === toISODateString(selectedDate);

								return (
									<td key={day.toISOString()}>
										<button
											type="button"
											className={cn(
												"flex h-10 w-10 items-center justify-center rounded-md text-sm transition",
												isSelected
													? "bg-[#3663D8] text-white shadow-sm"
													: "text-[#3B3D3B] hover:bg-[#F3F6FD]",
												!isCurrentMonth && "text-[#B9BDC1]",
											)}
											onClick={() => onChange(day)}
										>
											{day.getDate()}
										</button>
									</td>
								);
							})}
						</tr>
					))}
				</tbody>
			</table>
		</section>
	);
}
