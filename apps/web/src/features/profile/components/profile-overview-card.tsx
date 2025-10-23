import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProfileViewModel } from "../types";
import { Camera } from "lucide-react";
import { toast } from "sonner";

type ProfileOverviewCardProps = {
	profile?: ProfileViewModel | null;
	isLoading: boolean;
};

export function ProfileOverviewCard({ profile, isLoading }: ProfileOverviewCardProps) {
	const initials = getInitials(profile?.fullName ?? "");
	const roleLabel = profile?.roleLabel ?? "Usuário";
	const formattedDocument = formatDocument(profile?.documentId);
	const formattedPhone = formatPhone(profile?.phone);

	return (
		<section className="flex flex-col gap-6">
			<article className="flex flex-col items-center gap-6 rounded-xl border border-[#E5E5E5] bg-white p-8">
				<div className="relative">
					<div className="flex size-32 items-center justify-center rounded-full bg-[#E8EEFF] text-3xl font-semibold text-[#3663D8] sm:size-40">
						{isLoading ? <Skeleton className="h-10 w-10 rounded-full" /> : initials || "??"}
					</div>
					<Button
						type="button"
						size="icon"
						variant="secondary"
						className="absolute bottom-0 right-0 h-9 w-9 rounded-full border border-[#CBD5F5] bg-white text-[#3663D8] shadow-md"
						disabled={isLoading}
						onClick={() => toast.info("Atualização de foto disponível em breve")}
					>
						<Camera className="h-4 w-4" />
					</Button>
				</div>
				<div className="text-center">
					{isLoading ? (
						<>
							<Skeleton className="mx-auto mb-2 h-6 w-44" />
							<Skeleton className="mx-auto h-4 w-28" />
						</>
					) : (
						<>
							<h2 className="text-2xl font-semibold text-[#3B3D3B]">
								{profile?.fullName ?? "Usuário"}
							</h2>
							<p className="text-sm text-[#6E726E]">{roleLabel}</p>
						</>
					)}
				</div>
			</article>

			<article className="space-y-6 rounded-xl border border-[#E5E5E5] bg-white p-6">
				<header>
					<h3 className="text-lg font-semibold text-[#3B3D3B]">Informações principais</h3>
					<p className="text-sm text-[#6E726E]">Resumo rápido dos dados profissionais.</p>
				</header>
				<ul className="space-y-4 text-sm text-[#4B5563]">
					<OverviewItem label="Nome" value={profile?.fullName} isLoading={isLoading} />
					<OverviewItem label="Especialidade" value={profile?.specialty} isLoading={isLoading} />
					<OverviewItem label="Documento" value={formattedDocument} isLoading={isLoading} />
					<OverviewItem label="E-mail" value={profile?.email} isLoading={isLoading} />
					<OverviewItem label="Telefone" value={formattedPhone} isLoading={isLoading} />
					<OverviewItem
						label="Status"
						value={profile ? (profile.isActive ? "Ativo" : "Inativo") : undefined}
						isLoading={isLoading}
					/>
				</ul>
			</article>
		</section>
	);
}

function getInitials(name: string) {
	return name
		.split(" ")
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part.charAt(0).toUpperCase())
		.join("");
}

function formatDocument(documentId?: string) {
	if (!documentId) {
		return "Não informado";
	}
	const digits = documentId.replace(/\D/g, "");
	if (digits.length === 11) {
		return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
	}
	return documentId;
}

function formatPhone(raw?: string | null) {
	if (!raw) {
		return "Não informado";
	}
	const digits = raw.replace(/\D/g, "");
	if (digits.length === 11) {
		return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
	}
	if (digits.length === 10) {
		return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
	}
	return raw;
}

function OverviewItem({ label, value, isLoading }: { label: string; value?: string | null; isLoading: boolean }) {
	return (
		<li>
			<span className="font-medium text-[#6E726E]">{label}:</span>{" "}
			{isLoading ? (
				<Skeleton className="inline-block h-3 w-32 align-middle" />
			) : value && value.trim().length > 0 ? (
				value
			) : (
				"Não informado"
			)}
		</li>
	);
}
