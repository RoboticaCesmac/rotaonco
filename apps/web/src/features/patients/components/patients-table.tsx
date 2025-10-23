import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { PatientSummary } from "../api";
import { getStageBadge, getStatusBadge } from "../utils";
import { formatCPF } from "@/features/dashboard/utils";

const tableCellClass = "px-6 py-4 text-sm text-[#4B5563]";

type PatientsTableProps = {
	patients: PatientSummary[];
	isLoading: boolean;
	error?: Error | null;
	page: number;
	limit: number;
	total: number;
	onPageChange: (page: number) => void;
	onViewDetails?: (patientId: number) => void;
};

export function PatientsTable({
	patients,
	isLoading,
	error,
	page,
	limit,
	total,
	onPageChange,
	onViewDetails,
}: PatientsTableProps) {
	const safeLimit = Math.max(1, limit);
	const totalPages = Math.max(1, Math.ceil(total / safeLimit));
	const currentPage = Math.min(Math.max(1, page), totalPages);
	const rangeStart = total === 0 ? 0 : (currentPage - 1) * safeLimit + 1;
	const rangeEnd = total === 0 ? 0 : Math.min(total, currentPage * safeLimit);

	return (
		<section className="rounded-xl border border-[#E5E5E5] bg-white">
			<header className="border-b border-[#E5E5E5] px-8 py-6">
				<h2 className="text-2xl font-bold text-[#3B3D3B]">Lista de pacientes</h2>
			</header>
			<div className="overflow-x-auto">
				<table className="min-w-full divide-y divide-[#E5E5E5]">
					<thead className="bg-[#F9FAFB] text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
						<tr>
							<th scope="col" className="px-6 py-4">Nome</th>
							<th scope="col" className="px-6 py-4">CPF</th>
							<th scope="col" className="px-6 py-4">Etapa</th>
							<th scope="col" className="px-6 py-4">Status</th>
							<th scope="col" className="px-6 py-4 text-right">Ações</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-[#E5E5E5]">
						{isLoading ? <TableSkeleton /> : null}
						{!isLoading && error ? (
							<tr>
								<td colSpan={5} className="px-6 py-6 text-sm text-red-600">
									Não foi possível carregar os pacientes. Tente novamente em instantes.
								</td>
							</tr>
						) : null}
						{!isLoading && !error && patients.length === 0 ? (
							<tr>
								<td colSpan={5} className="px-6 py-6 text-sm text-[#6B7280]">
									Nenhum paciente encontrado para os filtros selecionados.
								</td>
							</tr>
						) : null}
						{!isLoading && !error
							? patients.map((patient) => {
								const stage = getStageBadge(patient.stage);
								const status = getStatusBadge(patient.status);
								return (
									<tr key={patient.id} className="hover:bg-[#F3F6FD]/60">
										<td className={tableCellClass}>
											<div className="flex flex-col gap-1">
												<span className="text-sm font-medium text-[#111827]">{patient.fullName}</span>
												<span className="text-xs text-[#9CA3AF]">ID #{patient.id}</span>
											</div>
										</td>
										<td className={tableCellClass}>{formatCPF(patient.cpf)}</td>
										<td className={tableCellClass}>
											<span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${stage.className}`}>
												{stage.label}
											</span>
										</td>
										<td className={tableCellClass}>
											<span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>
												{status.label}
											</span>
										</td>
										<td className="px-6 py-4 text-right">
											<Button
												variant="ghost"
												size="sm"
												onClick={() => {
												if (onViewDetails) {
													onViewDetails(patient.id);
												}
											}}
											>
												<span className="text-sm text-[#3663D8]">Detalhes</span>
											</Button>
										</td>
									</tr>
								);
							})
							: null}
					</tbody>
				</table>
			</div>
			<footer className="flex flex-col gap-4 border-t border-[#E5E5E5] px-8 py-4 text-sm text-[#6B7280] lg:flex-row lg:items-center lg:justify-between">
				<span>
					{rangeStart} - {rangeEnd} de {total.toLocaleString("pt-BR")}
				</span>
				<div className="flex items-center gap-3">
					<Button
						variant="outline"
						size="sm"
						disabled={currentPage <= 1}
						onClick={() => onPageChange(currentPage - 1)}
					>
						Anterior
					</Button>
					<span className="text-sm text-[#3B3D3B]">
						Página {currentPage} de {totalPages}
					</span>
					<Button
						variant="outline"
						size="sm"
						disabled={currentPage >= totalPages}
						onClick={() => onPageChange(currentPage + 1)}
					>
						Próxima
					</Button>
				</div>
			</footer>
		</section>
	);
}

function TableSkeleton() {
	return (
		<>
			{Array.from({ length: 5 }).map((_, index) => (
				<tr key={index}>
					<td className={tableCellClass}>
						<div className="space-y-2">
							<Skeleton className="h-4 w-40" />
							<Skeleton className="h-3 w-20" />
						</div>
					</td>
					<td className={tableCellClass}>
						<Skeleton className="h-4 w-28" />
					</td>
					<td className={tableCellClass}>
						<Skeleton className="h-5 w-24" />
					</td>
					<td className={tableCellClass}>
						<Skeleton className="h-5 w-24" />
					</td>
					<td className="px-6 py-4 text-right">
						<Skeleton className="ml-auto h-5 w-20" />
					</td>
				</tr>
			))}
		</>
	);
}
