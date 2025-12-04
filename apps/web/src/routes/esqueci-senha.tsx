import { AuthHero } from "@/components/auth-hero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordReset } from "@/features/password-reset/api";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import z from "zod";

export const Route = createFileRoute("/esqueci-senha")({
	component: ForgotPasswordRoute,
});

const forgotPasswordSchema = z.object({
	email: z
		.string()
		.min(1, { message: "Informe seu e-mail" })
		.email({ message: "Formato de e-mail inválido" }),
});

function ForgotPasswordRoute() {
	const [emailSent, setEmailSent] = useState<string | null>(null);

	const form = useForm({
		defaultValues: {
			email: "",
		},
		validators: {
			onSubmit: forgotPasswordSchema,
		},
		onSubmit: async ({ value }) => {
			try {
				await requestPasswordReset(value.email);
				setEmailSent(value.email);
				toast.success("Se o e-mail estiver cadastrado, enviaremos instruções em instantes.");
			} catch (error) {
				const message = error instanceof Error ? error.message : "Não foi possível processar o pedido.";
				toast.error(message);
			}
		},
	});

	return (
		<div className="flex min-h-screen w-full bg-white">
			<AuthHero />
			<section className="flex w-full max-w-full flex-col items-center justify-center px-6 py-12 sm:px-10 lg:w-[580px] lg:px-12">
				<div className="w-full max-w-[367px] space-y-10">
					<header className="space-y-3">
						<h1 className="text-[34px] font-bold leading-[42px] text-[#3B3D3B]">Esqueci minha senha</h1>
						<p className="text-base text-[#6E726E]">
							Informe seu e-mail profissional para receber um link de redefinição válido por 60 minutos.
						</p>
					</header>

					{emailSent ? (
						<div className="rounded-lg border border-[#DCFCE7] bg-[#F0FDF4] p-4 text-sm text-[#166534]">
							Enviamos um link de redefinição para <strong>{emailSent}</strong>. Confira também a caixa de spam.
						</div>
					) : null}

					<form
						className="space-y-6"
						onSubmit={(event) => {
							event.preventDefault();
							event.stopPropagation();
							form.handleSubmit();
						}}
					>
						<form.Field name="email">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name} className="block text-sm font-medium text-[#3B3D3B]">
										E-mail profissional
									</Label>
									<div className="relative">
										<Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9CA3AF]" />
										<Input
											id={field.name}
											type="email"
											autoComplete="email"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(event) => field.handleChange(event.target.value)}
											className="h-12 rounded-lg border border-[#D1D5DB] pl-12 pr-3 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus-visible:border-[#2E52B2] focus-visible:ring-[3px] focus-visible:ring-[#2E52B2]/50"
											placeholder="email@rotaonco.com"
										/>
									</div>
									{field.state.meta.errors.map((error) => (
										<p key={error?.message} className="text-sm text-[#DC2626]">
											{error?.message}
										</p>
									))}
								</div>
							)}
						</form.Field>

						<form.Subscribe>
							{(state) => (
								<Button
									type="submit"
									className="h-12 w-full rounded-lg bg-[#2E52B2] text-base font-medium text-white transition-colors hover:bg-[#264B96]"
									disabled={!state.canSubmit || state.isSubmitting}
								>
									{state.isSubmitting ? "Enviando..." : "Enviar link de redefinição"}
								</Button>
							)}
						</form.Subscribe>

						<div className="text-sm text-[#6E726E]">
							<span>Lembrou da senha? </span>
							<Link to="/login" className="font-semibold text-[#2E52B2] hover:underline">
								Voltar ao login
							</Link>
						</div>
					</form>
				</div>
			</section>
		</div>
	);
}
