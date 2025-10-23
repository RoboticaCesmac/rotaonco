import { useEffect, useState } from "react";
import { SearchIcon, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	stageFilterOptions,
	statusFilterOptions,
	type StageFilterValue,
	type StatusFilterValue,
} from "../utils";

type PatientsFiltersProps = {
	initialSearch: string;
	stage: StageFilterValue;
	status: StatusFilterValue;
	onApplySearch: (search: string) => void;
	onStageChange: (value: StageFilterValue) => void;
	onStatusChange: (value: StatusFilterValue) => void;
	onReset?: () => void;
};

export function PatientsFilters({
	initialSearch,
	stage,
	status,
	onApplySearch,
	onStageChange,
	onStatusChange,
	onReset,
}: PatientsFiltersProps) {
	const [term, setTerm] = useState(initialSearch);

	useEffect(() => {
		setTerm(initialSearch);
	}, [initialSearch]);

	return (
		<section className="flex flex-col gap-4 rounded-xl border border-[#E5E5E5] bg-white p-4 lg:flex-row lg:items-center lg:justify-between">
			<form
				className="flex flex-1 items-center gap-3"
				onSubmit={(event) => {
					event.preventDefault();
					onApplySearch(term);
				}}
			>
				<div className="relative flex-1">
					<Input
						value={term}
						onChange={(event) => setTerm(event.target.value)}
						placeholder="Buscar por nome ou CPF"
						className="h-11 rounded-full border border-[#C8C8C8] pl-11 pr-4 text-sm text-[#111827] placeholder:text-[#CECFCD] focus-visible:ring-0"
					/>
					<SearchIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#AAAAAA]" />
				</div>
				<Button type="submit" className="h-11 rounded-full bg-[#3663D8] px-6 text-sm font-semibold">
					Buscar
				</Button>
			</form>

			<div className="flex flex-col gap-4 sm:flex-row sm:items-center">
				<div className="flex items-center gap-3">
					<SlidersHorizontal className="hidden h-4 w-4 text-[#6B7280] sm:block" />
					<select
						value={stage}
						onChange={(event) => onStageChange(event.target.value as StageFilterValue)}
						className="h-11 rounded-lg border border-[#E5E5E5] bg-white px-3 text-sm text-[#3B3D3B] focus:outline-none focus:ring-2 focus:ring-[#3663D8]/40"
					>
						{stageFilterOptions.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
				</div>
				<select
					value={status}
					onChange={(event) => onStatusChange(event.target.value as StatusFilterValue)}
					className="h-11 rounded-lg border border-[#E5E5E5] bg-white px-3 text-sm text-[#3B3D3B] focus:outline-none focus:ring-2 focus:ring-[#3663D8]/40"
				>
					{statusFilterOptions.map((option) => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</select>
				{onReset ? (
					<Button
						type="button"
						variant="outline"
						className="h-11 rounded-lg border border-[#E5E5E5] px-4 text-sm text-[#3B3D3B]"
						onClick={() => onReset()}
					>
						Limpar
					</Button>
				) : null}
			</div>
		</section>
	);
}
