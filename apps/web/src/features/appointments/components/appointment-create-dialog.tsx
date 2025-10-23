import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Calendar, Clock, FileText, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { useCreateAppointment } from "../hooks";
import type { AppointmentType, PatientSummary, AppointmentCreateInput } from "../api";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";

const appointmentTypeLabels: Record<AppointmentType, string> = {
	triage: "Primeira consulta",
	treatment: "Retorno",
	return: "Acompanhamento",
};

const appointmentTypeOrder: AppointmentType[] = ["triage", "treatment", "return"];

function formatDateForDisplay(value: Date) {
	const day = String(value.getDate()).padStart(2, "0");
	const month = String(value.getMonth() + 1).padStart(2, "0");
	const year = String(value.getFullYear()).padStart(4, "0");
	return `${day}/${month}/${year}`;
}

function formatTimeForDisplay(value: Date) {
	const hours = String(value.getHours()).padStart(2, "0");
	const minutes = String(value.getMinutes()).padStart(2, "0");
	return `${hours}:${minutes}`;
}

function applyPatternMask(rawValue: string, pattern: string) {
	const maxDigits = (pattern.match(/#/g) ?? []).length;
	const digits = rawValue.replace(/\D/g, "").slice(0, maxDigits);
	let result = "";
	let digitIndex = 0;
	for (const char of pattern) {
		if (char === "#") {
			if (digitIndex < digits.length) {
				result += digits[digitIndex];
				digitIndex += 1;
			} else {
				break;
			}
		} else {
			if (digitIndex > 0) {
				result += char;
			}
			if (digitIndex >= digits.length) {
				break;
			}
		}
	}
	return result;
}

function applyDateMask(rawValue: string) {
	return applyPatternMask(rawValue, "##/##/####");
}

function applyTimeMask(rawValue: string) {
	return applyPatternMask(rawValue, "##:##");
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
		<div className="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-black/40 px-4 py-8" onClick={onClose}>
			<div
				role="dialog"
				aria-modal="true"
				className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
				onClick={(event) => event.stopPropagation()}
			>
				{children}
			</div>
		</div>,
		document.body,
	);
}

type AppointmentCreateDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	initialDate: Date;
};

type PatientOption = PatientSummary;

export function AppointmentCreateDialog({ open, onOpenChange, initialDate }: AppointmentCreateDialogProps) {
	const createAppointment = useCreateAppointment();
	const [patientQuery, setPatientQuery] = useState("");
	const [selectedPatient, setSelectedPatient] = useState<PatientOption | null>(null);
	const [dateValue, setDateValue] = useState<string>(() => formatDateForDisplay(initialDate));
	const [timeValue, setTimeValue] = useState<string>(() => {
		const formatted = formatTimeForDisplay(initialDate);
		return formatted === "00:00" ? "09:00" : formatted;
	});
	const [typeValue, setTypeValue] = useState<AppointmentType>("triage");
	const [notesValue, setNotesValue] = useState("");
	const [patientResults, setPatientResults] = useState<PatientOption[]>([]);

	const {
		data: professionalProfile,
		isPending: isProfessionalLoading,
		error: professionalError,
	} = useQuery({
		queryKey: ["professional", "me"],
		queryFn: async () => {
			const { data, error } = await apiClient.GET("/professionals/me");
			if (error) {
				throw error;
			}
			return data ?? null;
		},
		enabled: open,
		staleTime: 5 * 60 * 1000,
	});

	const searchPatients = useMutation({
		mutationFn: async (term: string) => {
			const trimmed = term.trim();
			if (!trimmed) {
				return [] as PatientOption[];
			}
			const { data, error } = await apiClient.GET("/patients/search", {
				params: {
					query: {
						q: trimmed,
						limit: 5,
					},
				},
			});
			if (error) {
				throw error;
			}
			return (data ?? []) as PatientOption[];
		},
		onSuccess: (data) => {
			setPatientResults(data);
		},
		onError: (error: Error) => {
			toast.error(error.message || "Não foi possível buscar pacientes");
		},
	});

	useEffect(() => {
		if (!open) {
			return;
		}
		if (professionalError instanceof Error) {
			toast.error("Não foi possível carregar os dados do profissional");
		}
	}, [open, professionalError]);

	useEffect(() => {
		if (!open) {
			return;
		}
		if (patientQuery.trim().length < 3) {
			setPatientResults([]);
			return;
		}
		const handle = window.setTimeout(() => {
			searchPatients.mutate(patientQuery);
		}, 300);
		return () => window.clearTimeout(handle);
	}, [open, patientQuery, searchPatients]);

	useEffect(() => {
		if (!open) {
			setPatientQuery("");
			setSelectedPatient(null);
			setPatientResults([]);
			return;
		}
		setDateValue(formatDateForDisplay(initialDate));
		const formattedTime = formatTimeForDisplay(initialDate);
		setTimeValue(formattedTime === "00:00" ? "09:00" : formattedTime);
		setTypeValue("triage");
		setNotesValue("");
	}, [open, initialDate]);

	const isSaving = createAppointment.isPending;

	const patientFieldError = useMemo(() => {
		if (!patientQuery.trim()) {
			return "Informe o paciente";
		}
		if (!selectedPatient) {
			return "Selecione o paciente na lista";
		}
		return null;
	}, [patientQuery, selectedPatient]);

	const handleClose = () => {
		if (isSaving) return;
		onOpenChange(false);
	};

	const handleSelectPatient = (option: PatientOption) => {
		setSelectedPatient(option);
		setPatientQuery(option.fullName);
		setPatientResults([]);
	};

	const handleSubmit = async () => {
		if (!selectedPatient) {
			toast.error("Selecione um paciente para agendar");
			return;
		}
		const dateDigits = dateValue.replace(/\D/g, "");
		if (dateDigits.length !== 8) {
			toast.error("Informe a data no formato DD/MM/AAAA");
			return;
		}

		const day = Number.parseInt(dateDigits.slice(0, 2), 10);
		const month = Number.parseInt(dateDigits.slice(2, 4), 10);
		const year = Number.parseInt(dateDigits.slice(4), 10);

		if (!day || !month || !year) {
			toast.error("Data inválida");
			return;
		}

		const timeDigits = timeValue.replace(/\D/g, "");
		if (timeDigits.length !== 4) {
			toast.error("Informe o horário no formato HH:MM");
			return;
		}

		const hours = Number.parseInt(timeDigits.slice(0, 2), 10);
		const minutes = Number.parseInt(timeDigits.slice(2), 10);

		if (hours > 23 || minutes > 59) {
			toast.error("Horário inválido");
			return;
		}

		const isoDate = `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
		const hourStr = String(hours).padStart(2, "0");
		const minuteStr = String(minutes).padStart(2, "0");
		const startsAt = new Date(`${isoDate}T${hourStr}:${minuteStr}:00`);

		if (
			Number.isNaN(startsAt.getTime()) ||
			startsAt.getFullYear() !== year ||
			startsAt.getMonth() + 1 !== month ||
			startsAt.getDate() !== day ||
			startsAt.getHours() !== hours ||
			startsAt.getMinutes() !== minutes
		) {
			toast.error("Data ou horário inválidos");
			return;
		}

		const professionalId = professionalProfile?.id;
		if (typeof professionalId !== "number" || Number.isNaN(professionalId)) {
			toast.error("Não foi possível identificar o profissional logado");
			return;
		}

		const payload: AppointmentCreateInput = {
			patientId: selectedPatient.id,
			professionalId,
			startsAt: startsAt.toISOString(),
			type: typeValue,
			notes: notesValue.trim() ? notesValue.trim() : null,
		};

		try {
			await createAppointment.mutateAsync(payload);
			toast.success("Consulta agendada com sucesso");
			onOpenChange(false);
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Não foi possível agendar a consulta";
			toast.error(message);
		}
	};

	return (
		<ModalContainer open={open} onClose={handleClose}>
			<header className="mb-4 text-center">
				<h2 className="text-lg font-semibold text-[#111827]">Agendar consulta</h2>
				<p className="text-sm text-[#6B7280]">Defina os detalhes da consulta para o paciente selecionado.</p>
			</header>

			<div className="space-y-5">
				<div className="space-y-2">
					<label className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
						Paciente
					</label>
					<div className="relative">
						<User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
						<Input
							value={patientQuery}
							onChange={(event) => {
								setPatientQuery(event.target.value);
								setSelectedPatient(null);
							}}
							placeholder="Nome do paciente"
							className={cn(
								"h-12 rounded-2xl border-[#E5E7EB] bg-white pl-10 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus-visible:border-[#3663D8] focus-visible:ring-[#3663D8]/40",
								patientFieldError && "border-[#F87171]",
							)}
							data-testid="appointment-patient-input"
						/>
					</div>
					{patientResults.length > 0 ? (
						<ul className="mt-2 max-h-40 overflow-y-auto rounded-xl border border-[#E5E7EB] bg-white p-2 shadow-md">
							{patientResults.map((patient) => (
								<li key={patient.id}>
									<button
										type="button"
										onClick={() => handleSelectPatient(patient)}
										className="w-full rounded-lg px-3 py-2 text-left text-sm text-[#1F2937] hover:bg-[#EEF2FF]"
									>
										<span className="font-medium">{patient.fullName}</span>
										<span className="block text-xs text-[#6B7280]">CPF: {patient.cpf}</span>
									</button>
								</li>
							))}
						</ul>
					) : null}
				</div>

				<div className="grid grid-cols-2 gap-3">
					<label className="relative flex flex-col gap-2">
						<span className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Data</span>
						<div className="relative">
							<Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
							<Input
								type="text"
								inputMode="numeric"
								placeholder="00/00/0000"
								autoComplete="off"
								value={dateValue}
								onChange={(event) => setDateValue(applyDateMask(event.target.value))}
								className="h-12 rounded-2xl border-[#E5E7EB] bg-white pl-10 text-sm text-[#1F2937] focus-visible:border-[#3663D8] focus-visible:ring-[#3663D8]/40"
							/>
						</div>
					</label>
					<label className="relative flex flex-col gap-2">
						<span className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Horário</span>
						<div className="relative">
							<Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
							<Input
								type="text"
								inputMode="numeric"
								placeholder="00:00"
								autoComplete="off"
								value={timeValue}
								onChange={(event) => setTimeValue(applyTimeMask(event.target.value))}
								className="h-12 rounded-2xl border-[#E5E7EB] bg-white pl-10 text-sm text-[#1F2937] focus-visible:border-[#3663D8] focus-visible:ring-[#3663D8]/40"
							/>
						</div>
					</label>
				</div>

				<div className="space-y-2">
					<span className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
						Tipo de consulta
					</span>
					<div className="flex flex-wrap gap-2">
						{appointmentTypeOrder.map((option) => (
							<Button
								key={option}
								type="button"
								variant="outline"
								className={cn(
									"rounded-full border-[#D1D5DB] bg-white px-4 py-2 text-sm text-[#6B7280]",
									typeValue === option && "border-[#3663D8] bg-[#F3F6FD] text-[#3663D8]",
								)}
								onClick={() => setTypeValue(option)}
							>
								{appointmentTypeLabels[option]}
							</Button>
						))}
					</div>
				</div>

				<label className="relative flex flex-col gap-2">
					<span className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Observações</span>
					<div className="relative">
						<FileText className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-[#9CA3AF]" />
						<textarea
							value={notesValue}
							onChange={(event) => setNotesValue(event.target.value)}
							rows={3}
							placeholder="Informações adicionais para a equipe"
							className="w-full resize-none rounded-2xl border border-[#E5E7EB] bg-white px-10 py-3 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus-visible:border-[#3663D8] focus-visible:ring-[#3663D8]/40"
						/>
					</div>
				</label>
			</div>

			<div className="mt-6 flex flex-col gap-3">
				<Button
					type="button"
					onClick={handleSubmit}
					disabled={isSaving || isProfessionalLoading}
					className="h-12 rounded-full bg-[#3663D8] text-sm font-semibold text-white hover:bg-[#2D52B6]"
				>
					{isSaving || isProfessionalLoading ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : (
						"Agendar consulta"
					)}
				</Button>
				<Button
					type="button"
					variant="outline"
					onClick={handleClose}
					disabled={isSaving}
					className="h-12 rounded-full border-[#D1D5DB] text-sm text-[#6B7280] hover:bg-white"
				>
					Cancelar
				</Button>
			</div>

			{patientFieldError && !selectedPatient ? (
				<p className="mt-2 text-xs text-[#DC2626]">{patientFieldError}</p>
			) : null}
		</ModalContainer>
	);
}
