import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useCreatePatient } from "../hooks";
import { stageFilterOptions, statusFilterOptions } from "../utils";
import type { PatientStage, PatientStatus, PatientCreateInput } from "../api";
import { toast } from "sonner";

type PatientCreateDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

type ContactForm = {
	id: string;
	fullName: string;
	relation: string;
	phone: string;
	isPrimary: boolean;
};

type FormState = {
	fullName: string;
	cpf: string;
	pin: string;
	birthDate: string;
	phone: string;
	emergencyPhone: string;
	tumorType: string;
	clinicalUnit: string;
	stage: PatientStage;
	status: PatientStatus;
	contacts: ContactForm[];
};

const stageOptions = stageFilterOptions.filter((option) => option.value !== "all");
const statusOptions = statusFilterOptions.filter((option) => option.value !== "all");

const initialFormState: FormState = {
	fullName: "",
	cpf: "",
	pin: "",
	birthDate: "",
	phone: "",
	emergencyPhone: "",
	tumorType: "",
	clinicalUnit: "",
	stage: "pre_triage",
	status: "active",
	contacts: [],
};

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
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/50 px-4 py-6" onClick={onClose}>
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

function createContact(): ContactForm {
	return {
		id: Math.random().toString(36).slice(2),
		fullName: "",
		relation: "",
		phone: "",
		isPrimary: false,
	};
}

export function PatientCreateDialog({ open, onOpenChange }: PatientCreateDialogProps) {
	const [formState, setFormState] = useState<FormState>(initialFormState);
	const createMutation = useCreatePatient();

	useEffect(() => {
		if (!open) {
			setFormState(initialFormState);
		}
	}, [open]);

	const isSaving = createMutation.isPending;

	const requiredFieldsValid = useMemo(() => {
		const cpfDigits = formState.cpf.replace(/\D/g, "");
		const pinDigits = formState.pin.replace(/\D/g, "");
		return (
			formState.fullName.trim().length > 0 &&
			cpfDigits.length === 11 &&
			pinDigits.length === 6
		);
	}, [formState.fullName, formState.cpf, formState.pin]);

	const sanitizedContacts = useMemo(() => {
		return formState.contacts
			.map((contact) => ({
				fullName: contact.fullName.trim(),
				relation: contact.relation.trim(),
				phone: contact.phone.trim(),
				isPrimary: contact.isPrimary,
			}))
			.filter((contact) => contact.fullName && contact.relation && contact.phone);
	}, [formState.contacts]);

	const handleClose = () => {
		onOpenChange(false);
	};

	const handleAddContact = () => {
		setFormState((prev) => ({
			...prev,
			contacts: [...prev.contacts, createContact()],
		}));
	};

	const handleRemoveContact = (id: string) => {
		setFormState((prev) => ({
			...prev,
			contacts: prev.contacts.filter((contact) => contact.id !== id),
		}));
	};

	const handleContactChange = (id: string, field: keyof ContactForm, value: string | boolean) => {
		setFormState((prev) => ({
			...prev,
			contacts: prev.contacts.map((contact) => {
				if (contact.id !== id) return contact;
				if (field === "isPrimary") {
					return { ...contact, isPrimary: Boolean(value) };
				}
				return { ...contact, [field]: value } as ContactForm;
			}),
		}));
	};

	const handleSubmit = async () => {
		if (!requiredFieldsValid) {
			toast.error("Preencha nome, CPF com 11 dígitos e PIN de 6 dígitos");
			return;
		}

		const cpfDigits = formState.cpf.replace(/\D/g, "");
		const pinDigits = formState.pin.replace(/\D/g, "");

		const payload: PatientCreateInput = {
			fullName: formState.fullName.trim(),
			cpf: cpfDigits,
			pin: pinDigits,
			birthDate: formState.birthDate.trim() ? formState.birthDate : undefined,
			phone: formState.phone.trim() ? formState.phone.trim() : undefined,
			emergencyPhone: formState.emergencyPhone.trim() ? formState.emergencyPhone.trim() : undefined,
			tumorType: formState.tumorType.trim() ? formState.tumorType.trim() : undefined,
			clinicalUnit: formState.clinicalUnit.trim() ? formState.clinicalUnit.trim() : undefined,
			stage: formState.stage,
			status: formState.status,
			contacts:
				sanitizedContacts.length > 0
					? sanitizedContacts.map((contact) => ({
						fullName: contact.fullName,
						relation: contact.relation,
						phone: contact.phone,
						isPrimary: contact.isPrimary,
					}))
					: undefined,
		};

		try {
			await createMutation.mutateAsync(payload);
			toast.success("Paciente criado com sucesso");
			onOpenChange(false);
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Não foi possível criar o paciente";
			toast.error(message);
		}
	};

	return (
		<ModalContainer open={open} onClose={handleClose}>
			<header className="mb-6 flex items-start justify-between">
				<div>
					<p className="text-xs uppercase tracking-wide text-[#6B7280]">Cadastro</p>
					<h2 className="text-2xl font-semibold text-[#1F2937]">Novo paciente</h2>
					<p className="mt-1 text-sm text-[#6B7280]">
						Informe os dados básicos para registrar um novo paciente na plataforma.
					</p>
				</div>
				<Button variant="ghost" size="icon" onClick={handleClose} aria-label="Fechar cadastro">
					<X className="h-5 w-5 text-[#4B5563]" />
				</Button>
			</header>

			<div className="space-y-8">
				<section className="space-y-6">
					<div className="grid gap-5 md:grid-cols-2">
						<div className="space-y-3">
							<div className="space-y-1">
								<Label className="text-[#1F2937]" htmlFor="create-fullName">
									Nome completo
								</Label>
								<p id="create-fullName-helper" className="text-xs text-[#6B7280]">
									Identificação exibida para toda a equipe.
								</p>
							</div>
							<Input
								id="create-fullName"
								aria-describedby="create-fullName-helper"
								className="bg-white text-[#1F2937] placeholder:text-[#9CA3AF] focus-visible:border-[#2E52B2] focus-visible:ring-[#2E52B2]/30"
								value={formState.fullName}
								onChange={(event) =>
									setFormState((prev) => ({ ...prev, fullName: event.target.value }))
								}
							/>
						</div>
						<div className="space-y-3">
							<div className="space-y-1">
								<Label className="text-[#1F2937]" htmlFor="create-cpf">
									CPF
								</Label>
								<p id="create-cpf-helper" className="text-xs text-[#6B7280]">
									Informe 11 dígitos numéricos sem separadores.
								</p>
							</div>
							<Input
								id="create-cpf"
								aria-describedby="create-cpf-helper"
								inputMode="numeric"
								className="bg-white text-[#1F2937] placeholder:text-[#9CA3AF] focus-visible:border-[#2E52B2] focus-visible:ring-[#2E52B2]/30"
								value={formState.cpf}
								onChange={(event) =>
									setFormState((prev) => ({ ...prev, cpf: event.target.value }))
								}
							/>
						</div>
						<div className="space-y-3">
							<div className="space-y-1">
								<Label className="text-[#1F2937]" htmlFor="create-pin">
									PIN de acesso
								</Label>
								<p id="create-pin-helper" className="text-xs text-[#6B7280]">
									Código de 6 dígitos utilizado no app do paciente.
								</p>
							</div>
							<Input
								id="create-pin"
								aria-describedby="create-pin-helper"
								inputMode="numeric"
								className="bg-white text-[#1F2937] placeholder:text-[#9CA3AF] focus-visible:border-[#2E52B2] focus-visible:ring-[#2E52B2]/30"
								value={formState.pin}
								onChange={(event) =>
									setFormState((prev) => ({ ...prev, pin: event.target.value }))
								}
							/>
						</div>
						<div className="space-y-3">
							<div className="space-y-1">
								<Label className="text-[#1F2937]" htmlFor="create-birthDate">
									Data de nascimento
								</Label>
								<p id="create-birthDate-helper" className="text-xs text-[#6B7280]">
									Usada para validar idade e documentação.
								</p>
							</div>
							<Input
								id="create-birthDate"
								type="date"
								aria-describedby="create-birthDate-helper"
								className="bg-white text-[#1F2937] placeholder:text-[#9CA3AF] focus-visible:border-[#2E52B2] focus-visible:ring-[#2E52B2]/30"
								value={formState.birthDate}
								onChange={(event) =>
									setFormState((prev) => ({ ...prev, birthDate: event.target.value }))
								}
							/>
						</div>
						<div className="space-y-3">
							<div className="space-y-1">
								<Label className="text-[#1F2937]" htmlFor="create-phone">
									Telefone
								</Label>
								<p id="create-phone-helper" className="text-xs text-[#6B7280]">
									Contato principal do paciente para avisos.
								</p>
							</div>
							<Input
								id="create-phone"
								aria-describedby="create-phone-helper"
								className="bg-white text-[#1F2937] placeholder:text-[#9CA3AF] focus-visible:border-[#2E52B2] focus-visible:ring-[#2E52B2]/30"
								value={formState.phone}
								onChange={(event) =>
									setFormState((prev) => ({ ...prev, phone: event.target.value }))
								}
							/>
						</div>
						<div className="space-y-3">
							<div className="space-y-1">
								<Label className="text-[#1F2937]" htmlFor="create-emergencyPhone">
									Telefone de emergência
								</Label>
								<p id="create-emergencyPhone-helper" className="text-xs text-[#6B7280]">
									Contato secundário em situações críticas.
								</p>
							</div>
							<Input
								id="create-emergencyPhone"
								aria-describedby="create-emergencyPhone-helper"
								className="bg-white text-[#1F2937] placeholder:text-[#9CA3AF] focus-visible:border-[#2E52B2] focus-visible:ring-[#2E52B2]/30"
								value={formState.emergencyPhone}
								onChange={(event) =>
									setFormState((prev) => ({ ...prev, emergencyPhone: event.target.value }))
								}
							/>
						</div>
						<div className="space-y-3">
							<div className="space-y-1">
								<Label className="text-[#1F2937]" htmlFor="create-tumorType">
									Tipo de tumor
								</Label>
								<p id="create-tumorType-helper" className="text-xs text-[#6B7280]">
									Ajuda a direcionar a equipe multidisciplinar.
								</p>
							</div>
							<Input
								id="create-tumorType"
								aria-describedby="create-tumorType-helper"
								className="bg-white text-[#1F2937] placeholder:text-[#9CA3AF] focus-visible:border-[#2E52B2] focus-visible:ring-[#2E52B2]/30"
								value={formState.tumorType}
								onChange={(event) =>
									setFormState((prev) => ({ ...prev, tumorType: event.target.value }))
								}
							/>
						</div>
						<div className="space-y-3">
							<div className="space-y-1">
								<Label className="text-[#1F2937]" htmlFor="create-clinicalUnit">
									Unidade clínica
								</Label>
								<p id="create-clinicalUnit-helper" className="text-xs text-[#6B7280]">
									Local responsável pelo atendimento do paciente.
								</p>
							</div>
							<Input
								id="create-clinicalUnit"
								aria-describedby="create-clinicalUnit-helper"
								className="bg-white text-[#1F2937] placeholder:text-[#9CA3AF] focus-visible:border-[#2E52B2] focus-visible:ring-[#2E52B2]/30"
								value={formState.clinicalUnit}
								onChange={(event) =>
									setFormState((prev) => ({ ...prev, clinicalUnit: event.target.value }))
								}
							/>
						</div>
					</div>
					<div className="grid gap-5 md:grid-cols-2">
						<div className="space-y-3">
							<div className="space-y-1">
								<Label className="text-[#1F2937]" htmlFor="create-stage">
									Etapa do tratamento
								</Label>
								<p id="create-stage-helper" className="text-xs text-[#6B7280]">
									Define em que momento do tratamento o paciente está.
								</p>
							</div>
							<select
								id="create-stage"
								aria-describedby="create-stage-helper"
								className="h-10 w-full rounded-lg border border-[#D1D5DB] bg-white px-3 text-sm text-[#1F2937] focus-visible:border-[#2E52B2] focus-visible:ring-[3px] focus-visible:ring-[#2E52B2]/70"
								value={formState.stage}
								onChange={(event) =>
									setFormState((prev) => ({ ...prev, stage: event.target.value as PatientStage }))
								}
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
								<Label className="text-[#1F2937]" htmlFor="create-status">
									Status
								</Label>
								<p id="create-status-helper" className="text-xs text-[#6B7280]">
									Mostra se o paciente está ativo, em risco ou inativo.
								</p>
							</div>
							<select
								id="create-status"
								aria-describedby="create-status-helper"
								className="h-10 w-full rounded-lg border border-[#D1D5DB] bg-white px-3 text-sm text-[#1F2937] focus-visible:border-[#2E52B2] focus-visible:ring-[3px] focus-visible:ring-[#2E52B2]/70"
								value={formState.status}
								onChange={(event) =>
									setFormState((prev) => ({ ...prev, status: event.target.value as PatientStatus }))
								}
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
					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-sm font-semibold uppercase tracking-wide text-[#6B7280]">
								Contatos
							</h3>
							<p className="text-xs text-[#6B7280]">
								Cadastre pessoas autorizadas a receber informações do paciente.
							</p>
						</div>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={handleAddContact}
							className="border-[#CBD5F5] text-[#1F2937] hover:bg-[#EEF2FF]"
						>
							<Plus className="mr-2 h-4 w-4 text-[#2E52B2]" /> Adicionar contato
						</Button>
					</div>

					{formState.contacts.length === 0 ? (
						<p className="rounded-lg border border-dashed border-[#E5E7EB] bg-[#F9FAFB] p-4 text-sm text-[#6B7280]">
							Nenhum contato adicionado ainda.
						</p>
					) : (
						<div className="space-y-4">
							{formState.contacts.map((contact, index) => (
								<div key={contact.id} className="space-y-4 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
									<div className="flex items-center justify-between">
										<h4 className="text-sm font-semibold text-[#1F2937]">
											Contato {index + 1}
										</h4>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											onClick={() => handleRemoveContact(contact.id)}
											aria-label={`Remover contato ${index + 1}`}
										>
											<Trash2 className="h-4 w-4 text-[#6B7280]" />
										</Button>
									</div>
									<div className="grid gap-4 md:grid-cols-3">
										<div className="space-y-2">
											<Label className="text-sm text-[#1F2937]" htmlFor={`contact-name-${contact.id}`}>
												Nome completo
											</Label>
											<Input
												id={`contact-name-${contact.id}`}
												className="bg-white text-[#1F2937] placeholder:text-[#9CA3AF] focus-visible:border-[#2E52B2] focus-visible:ring-[#2E52B2]/30"
												value={contact.fullName}
												onChange={(event) =>
													handleContactChange(contact.id, "fullName", event.target.value)
												}
											/>
										</div>
										<div className="space-y-2">
											<Label className="text-sm text-[#1F2937]" htmlFor={`contact-relation-${contact.id}`}>
												Relação
											</Label>
											<Input
												id={`contact-relation-${contact.id}`}
												className="bg-white text-[#1F2937] placeholder:text-[#9CA3AF] focus-visible:border-[#2E52B2] focus-visible:ring-[#2E52B2]/30"
												value={contact.relation}
												onChange={(event) =>
													handleContactChange(contact.id, "relation", event.target.value)
												}
											/>
										</div>
										<div className="space-y-2">
											<Label className="text-sm text-[#1F2937]" htmlFor={`contact-phone-${contact.id}`}>
												Telefone
											</Label>
											<Input
												id={`contact-phone-${contact.id}`}
												className="bg-white text-[#1F2937] placeholder:text-[#9CA3AF] focus-visible:border-[#2E52B2] focus-visible:ring-[#2E52B2]/30"
												value={contact.phone}
												onChange={(event) =>
													handleContactChange(contact.id, "phone", event.target.value)
												}
											/>
										</div>
									</div>
									<label className="flex items-center gap-2 text-sm text-[#4B5563]">
										<Checkbox
											checked={contact.isPrimary}
											onCheckedChange={(checked) =>
												handleContactChange(contact.id, "isPrimary", checked === true)
											}
										/>
										<span>Contato principal</span>
									</label>
								</div>
							))}
						</div>
					)}
				</section>

				<div className="flex items-center justify-end gap-3">
					<Button
						type="button"
						variant="outline"
						onClick={handleClose}
						disabled={isSaving}
					>
						Cancelar
					</Button>
					<Button
						type="button"
						onClick={handleSubmit}
						disabled={!requiredFieldsValid || isSaving}
						className="bg-[#2E52B2] text-white hover:bg-[#264B96]"
					>
						{isSaving ? "Cadastrando..." : "Cadastrar paciente"}
					</Button>
				</div>

				{isSaving ? (
					<div className="flex items-center gap-2 text-sm text-[#4B5563]">
						<Loader2 className="h-4 w-4 animate-spin" />
						<span>Salvando alterações...</span>
					</div>
				) : null}
			</div>
		</ModalContainer>
	);
}
