import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { stageFilterOptions, statusFilterOptions } from "../utils";
import { usePatientDetail, useUpdatePatient } from "../hooks";
import type { PatientDetail, PatientStage, PatientStatus } from "../api";
import { toast } from "sonner";

const stageOptions = stageFilterOptions.filter((option) => option.value !== "all");
const statusOptions = statusFilterOptions.filter((option) => option.value !== "all");

type PatientDetailsDialogProps = {
	open: boolean;
	patientId: number | null;
	onOpenChange: (open: boolean) => void;
};

type FormState = {
	fullName: string;
	birthDate: string;
	phone: string;
	emergencyPhone: string;
	tumorType: string;
	clinicalUnit: string;
	stage: PatientStage;
	status: PatientStatus;
};

function mapDetailToForm(detail: PatientDetail): FormState {
	return {
		fullName: detail.fullName ?? "",
		birthDate: detail.birthDate ?? "",
		phone: detail.phone ?? "",
		emergencyPhone: detail.emergencyPhone ?? "",
		tumorType: detail.tumorType ?? "",
		clinicalUnit: detail.clinicalUnit ?? "",
		stage: detail.stage ?? "pre_triage",
		status: detail.status,
	};
}

function normalizeValue(value: string) {
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : "";
}

function formatDateForInput(value: string) {
	if (!value) return "";
	return value;
}

function useBodyScrollLock(open: boolean) {
	useEffect(() => {
		if (!open) return;
		const previous = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = previous;
		};
	}, [open]);
}

function ModalContainer({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
	useBodyScrollLock(open);

	useEffect(() => {
		if (!open) return;
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				onClose();
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [open, onClose]);

	if (!open) {
		return null;
	}

	return createPortal(
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/50 px-4 py-6"
			onClick={onClose}
		>
			<div
				role="dialog"
				aria-modal="true"
				className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-8 shadow-2xl"
				onClick={(event) => event.stopPropagation()}
			>
				{children}
			</div>
		</div>,
		document.body,
	);
}

export function PatientDetailsDialog({ open, patientId, onOpenChange }: PatientDetailsDialogProps) {
	const detailQuery = usePatientDetail(open && typeof patientId === "number" ? patientId : null);
	const updateMutation = useUpdatePatient(open && typeof patientId === "number" ? patientId : null);
	const detail = detailQuery.data;
	const [formState, setFormState] = useState<FormState | null>(null);

	useEffect(() => {
		if (!open) {
			setFormState(null);
			return;
		}
		if (detail) {
			setFormState((prev) => {
				const mapped = mapDetailToForm(detail);
				return prev ? { ...mapped, stage: mapped.stage, status: mapped.status } : mapped;
			});
		}
	}, [open, detail]);

	const hasChanges = useMemo(() => {
		if (!detail || !formState) {
			return false;
		}
		const base = mapDetailToForm(detail);
		return (
			normalizeValue(formState.fullName) !== normalizeValue(base.fullName) ||
			formatDateForInput(formState.birthDate) !== formatDateForInput(base.birthDate ?? "") ||
			normalizeValue(formState.phone) !== normalizeValue(base.phone ?? "") ||
			normalizeValue(formState.emergencyPhone) !== normalizeValue(base.emergencyPhone ?? "") ||
			normalizeValue(formState.tumorType) !== normalizeValue(base.tumorType ?? "") ||
			normalizeValue(formState.clinicalUnit) !== normalizeValue(base.clinicalUnit ?? "") ||
			formState.stage !== base.stage ||
			formState.status !== base.status
		);
	}, [detail, formState]);

	const handleClose = () => {
		onOpenChange(false);
	};

	const isSaving = updateMutation.isPending;

	const handleSave = async () => {
		if (!detail || !formState) {
			return;
		}

		const base = mapDetailToForm(detail);
		const payload: Record<string, unknown> = {};

		if (normalizeValue(formState.fullName) !== normalizeValue(base.fullName)) {
			payload.fullName = formState.fullName.trim();
		}

		if (formatDateForInput(formState.birthDate) !== formatDateForInput(base.birthDate ?? "")) {
			payload.birthDate = formState.birthDate.trim().length > 0 ? formState.birthDate : null;
		}

		if (normalizeValue(formState.phone) !== normalizeValue(base.phone ?? "")) {
			payload.phone = formState.phone.trim().length > 0 ? formState.phone.trim() : null;
		}

		if (normalizeValue(formState.emergencyPhone) !== normalizeValue(base.emergencyPhone ?? "")) {
			payload.emergencyPhone = formState.emergencyPhone.trim().length > 0 ? formState.emergencyPhone.trim() : null;
		}

		if (normalizeValue(formState.tumorType) !== normalizeValue(base.tumorType ?? "")) {
			payload.tumorType = formState.tumorType.trim().length > 0 ? formState.tumorType.trim() : null;
		}

		if (normalizeValue(formState.clinicalUnit) !== normalizeValue(base.clinicalUnit ?? "")) {
			payload.clinicalUnit = formState.clinicalUnit.trim().length > 0 ? formState.clinicalUnit.trim() : null;
		}

		if (formState.stage !== base.stage) {
			payload.stage = formState.stage;
		}

		if (formState.status !== base.status) {
			payload.status = formState.status;
		}

		if (Object.keys(payload).length === 0) {
			toast.info("Nenhuma alteração para salvar");
			return;
		}

		try {
			await updateMutation.mutateAsync(payload as any);
			toast.success("Dados do paciente atualizados com sucesso");
			onOpenChange(false);
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Não foi possível atualizar o paciente";
			toast.error(message);
		}
	};

	const renderContent = () => {
		if (!open) {
			return null;
		}

		if (detailQuery.isLoading) {
			return (
				<div className="flex h-48 flex-col items-center justify-center gap-3 text-[#4B5563]">
					<Loader2 className="h-6 w-6 animate-spin" />
					<span>Carregando informações do paciente...</span>
				</div>
			);
		}

		if (detailQuery.error) {
			return (
				<div className="flex flex-col gap-4">
					<p className="text-sm text-[#DC2626]">
						Não foi possível carregar os dados do paciente. Tente novamente em instantes.
					</p>
					<div className="flex items-center gap-3">
						<Button variant="outline" onClick={() => detailQuery.refetch()}>
							Tentar novamente
						</Button>
						<Button variant="ghost" onClick={handleClose}>
							Fechar
						</Button>
					</div>
				</div>
			);
		}

		if (!detail || !formState) {
			return (
				<p className="text-sm text-[#6B7280]">
					Selecione um paciente para visualizar os detalhes.
				</p>
			);
		}

		return (
			<div className="space-y-8">
				<section className="space-y-6">
					<div className="grid gap-5 md:grid-cols-2">
						<div className="space-y-3">
							<div className="space-y-1">
								<Label className="text-[#1F2937]" htmlFor="patient-fullName">
									Nome completo
								</Label>
								<p
									id="patient-fullName-helper"
									className="text-xs text-[#6B7280]"
								>
									Identificação exibida para toda a equipe.
								</p>
							</div>
							<Input
								id="patient-fullName"
								aria-describedby="patient-fullName-helper"
								className="bg-white text-[#1F2937] placeholder:text-[#9CA3AF] focus-visible:border-[#2E52B2] focus-visible:ring-[#2E52B2]/30"
								value={formState.fullName}
								onChange={(event) =>
									setFormState((prev) =>
										prev ? { ...prev, fullName: event.target.value } : prev,
									)}
							/>
						</div>
						<div className="space-y-3">
							<div className="space-y-1">
								<Label className="text-[#1F2937]" htmlFor="patient-birthDate">
									Data de nascimento
								</Label>
								<p
									id="patient-birthDate-helper"
									className="text-xs text-[#6B7280]"
								>
									Usada para validar idade e documentação.
								</p>
							</div>
							<Input
								id="patient-birthDate"
								type="date"
								aria-describedby="patient-birthDate-helper"
								className="bg-white text-[#1F2937] placeholder:text-[#9CA3AF] focus-visible:border-[#2E52B2] focus-visible:ring-[#2E52B2]/30"
								value={formState.birthDate ?? ""}
								onChange={(event) =>
									setFormState((prev) =>
										prev ? { ...prev, birthDate: event.target.value } : prev,
									)}
							/>
						</div>
						<div className="space-y-3">
							<div className="space-y-1">
								<Label className="text-[#1F2937]" htmlFor="patient-phone">
									Telefone
								</Label>
								<p id="patient-phone-helper" className="text-xs text-[#6B7280]">
									Contato principal do paciente para avisos.
								</p>
							</div>
							<Input
								id="patient-phone"
								aria-describedby="patient-phone-helper"
								className="bg-white text-[#1F2937] placeholder:text-[#9CA3AF] focus-visible:border-[#2E52B2] focus-visible:ring-[#2E52B2]/30"
								value={formState.phone}
								onChange={(event) =>
									setFormState((prev) =>
										prev ? { ...prev, phone: event.target.value } : prev,
									)}
							/>
						</div>
						<div className="space-y-3">
							<div className="space-y-1">
								<Label className="text-[#1F2937]" htmlFor="patient-emergencyPhone">
									Telefone de emergência
								</Label>
								<p
									id="patient-emergencyPhone-helper"
									className="text-xs text-[#6B7280]"
								>
									Contato secundário em situações críticas.
								</p>
							</div>
							<Input
								id="patient-emergencyPhone"
								aria-describedby="patient-emergencyPhone-helper"
								className="bg-white text-[#1F2937] placeholder:text-[#9CA3AF] focus-visible:border-[#2E52B2] focus-visible:ring-[#2E52B2]/30"
								value={formState.emergencyPhone}
								onChange={(event) =>
									setFormState((prev) =>
										prev ? { ...prev, emergencyPhone: event.target.value } : prev,
									)}
							/>
						</div>
						<div className="space-y-3">
							<div className="space-y-1">
								<Label className="text-[#1F2937]" htmlFor="patient-tumorType">
									Tipo de tumor
								</Label>
								<p id="patient-tumorType-helper" className="text-xs text-[#6B7280]">
									Ajuda a direcionar a equipe multidisciplinar.
								</p>
							</div>
							<Input
								id="patient-tumorType"
								aria-describedby="patient-tumorType-helper"
								className="bg-white text-[#1F2937] placeholder:text-[#9CA3AF] focus-visible:border-[#2E52B2] focus-visible:ring-[#2E52B2]/30"
								value={formState.tumorType}
								onChange={(event) =>
									setFormState((prev) =>
										prev ? { ...prev, tumorType: event.target.value } : prev,
									)}
							/>
						</div>
						<div className="space-y-3">
							<div className="space-y-1">
								<Label className="text-[#1F2937]" htmlFor="patient-clinicalUnit">
									Unidade clínica
								</Label>
								<p
									id="patient-clinicalUnit-helper"
									className="text-xs text-[#6B7280]"
								>
									Local responsável pelo atendimento do paciente.
								</p>
							</div>
							<Input
								id="patient-clinicalUnit"
								aria-describedby="patient-clinicalUnit-helper"
								className="bg-white text-[#1F2937] placeholder:text-[#9CA3AF] focus-visible:border-[#2E52B2] focus-visible:ring-[#2E52B2]/30"
								value={formState.clinicalUnit}
								onChange={(event) =>
									setFormState((prev) =>
										prev ? { ...prev, clinicalUnit: event.target.value } : prev,
									)}
							/>
						</div>
					</div>
					<div className="grid gap-5 md:grid-cols-2">
						<div className="space-y-3">
							<div className="space-y-1">
								<Label className="text-[#1F2937]" htmlFor="patient-stage">
									Etapa do tratamento
								</Label>
								<p id="patient-stage-helper" className="text-xs text-[#6B7280]">
									Define em que momento do tratamento o paciente está.
								</p>
							</div>
							<select
								id="patient-stage"
								aria-describedby="patient-stage-helper"
								className="h-10 w-full rounded-lg border border-[#D1D5DB] bg-white px-3 text-sm text-[#1F2937] focus-visible:border-[#2E52B2] focus-visible:ring-[3px] focus-visible:ring-[#2E52B2]/70"
								value={formState.stage}
								onChange={(event) =>
									setFormState((prev) =>
										prev ? { ...prev, stage: event.target.value as PatientStage } : prev,
									)}
							>
								{stageOptions.map((option) => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</select>
						</div>
						<div className="space-y-3">
							<div className="space-y-1">
								<Label className="text-[#1F2937]" htmlFor="patient-status">
									Status
								</Label>
								<p id="patient-status-helper" className="text-xs text-[#6B7280]">
									Mostra se o paciente está ativo, em risco ou inativo.
								</p>
							</div>
							<select
								id="patient-status"
								aria-describedby="patient-status-helper"
								className="h-10 w-full rounded-lg border border-[#D1D5DB] bg-white px-3 text-sm text-[#1F2937] focus-visible:border-[#2E52B2] focus-visible:ring-[3px] focus-visible:ring-[#2E52B2]/70"
								value={formState.status}
								onChange={(event) =>
									setFormState((prev) =>
										prev ? { ...prev, status: event.target.value as PatientStatus } : prev,
									)}
							>
								{statusOptions.map((option) => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</select>
						</div>
					</div>
				</section>

				<section className="space-y-4">
					<h3 className="text-sm font-semibold uppercase tracking-wide text-[#6B7280]">
						Contatos
					</h3>
					<div className="space-y-3">
						{detail.contacts && detail.contacts.length > 0 ? (
							detail.contacts.map((contact) => (
								<div
									key={contact.id}
									className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4"
								>
									<div className="text-sm font-medium text-[#1F2937]">
										{contact.fullName}
									</div>
									<div className="mt-1 text-xs text-[#6B7280]">
										{contact.relation ? `${contact.relation} • ` : null}
										{contact.phone}
									</div>
								</div>
							))
						) : (
							<p className="text-sm text-[#6B7280]">
								Nenhum contato cadastrado para este paciente.
							</p>
						)}
					</div>
				</section>

				<section className="grid gap-4 md:grid-cols-2">
					<div className="space-y-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
						<h4 className="text-sm font-semibold text-[#1F2937]">Ocorrências recentes</h4>
						<div className="space-y-2 text-sm text-[#4B5563]">
							{detail.occurrences && detail.occurrences.length > 0 ? (
								detail.occurrences.slice(0, 3).map((occurrence) => (
									<div key={occurrence.id} className="rounded-md bg-white px-3 py-2">
										<div className="font-medium text-[#1F2937]">{occurrence.kind}</div>
										<div className="text-xs text-[#6B7280]">
											Registrada em {new Date(occurrence.createdAt).toLocaleString("pt-BR")}
										</div>
										{occurrence.notes ? (
											<p className="mt-1 text-xs text-[#4B5563]">{occurrence.notes}</p>
										) : null}
									</div>
								))
							) : (
								<p className="text-sm text-[#6B7280]">Sem ocorrências registradas.</p>
							)}
						</div>
					</div>
					<div className="space-y-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
						<h4 className="text-sm font-semibold text-[#1F2937]">Alertas ativos</h4>
						<div className="space-y-2 text-sm text-[#4B5563]">
							{detail.alerts && detail.alerts.length > 0 ? (
								detail.alerts.slice(0, 3).map((alert) => (
									<div key={alert.id} className="rounded-md bg-white px-3 py-2">
										<div className="flex items-center justify-between">
											<span className="font-medium text-[#1F2937]">{alert.kind}</span>
											<span className="text-xs uppercase tracking-wide text-[#6B7280]">
												{alert.severity === "high"
													? "Alto"
													: alert.severity === "medium"
														? "Médio"
														: "Baixo"}
											</span>
										</div>
										{alert.details ? (
											<p className="mt-1 text-xs text-[#4B5563]">{alert.details}</p>
										) : null}
										<div className="text-xs text-[#6B7280]">
											Criado em {new Date(alert.createdAt).toLocaleString("pt-BR")}
										</div>
									</div>
								))
							) : (
								<p className="text-sm text-[#6B7280]">Sem alertas no momento.</p>
							)}
						</div>
					</div>
				</section>
			</div>
		);
	};

	return (
		<ModalContainer open={open} onClose={handleClose}>
			<header className="mb-6 flex items-start justify-between">
				<div>
					<p className="text-xs uppercase tracking-wide text-[#6B7280]">Paciente</p>
					<h2 className="text-2xl font-semibold text-[#1F2937]">
						{detail?.fullName ?? "Detalhes do paciente"}
					</h2>
					{detail ? (
						<p className="mt-1 text-sm text-[#6B7280]">CPF: {detail.cpf}</p>
					) : null}
				</div>
				<Button variant="ghost" size="icon" onClick={handleClose} aria-label="Fechar detalhes">
					<X className="h-5 w-5 text-[#4B5563]" />
				</Button>
			</header>

			<div className="space-y-8">
				{renderContent()}

				{detail && formState ? (
					<div className="flex items-center justify-end gap-3">
						<Button variant="outline" onClick={handleClose} disabled={isSaving}>
							Cancelar
						</Button>
						<Button
							onClick={handleSave}
							disabled={!hasChanges || isSaving}
							className="bg-[#2E52B2] text-white hover:bg-[#264B96]"
						>
							{isSaving ? "Salvando..." : "Salvar alterações"}
						</Button>
					</div>
				) : null}
			</div>
		</ModalContainer>
	);
}
