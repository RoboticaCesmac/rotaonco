import { AuthHero } from "@/components/auth-hero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { confirmPasswordReset, validatePasswordResetToken } from "@/features/password-reset/api";
import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";
import z from "zod";

export const Route = createFileRoute("/resetar-senha")({
    component: ResetPasswordRoute,
    validateSearch: z.object({
        token: z.string().optional(),
    }),
});

const passwordSchema = z
    .object({
        newPassword: z
            .string()
            .min(8, { message: "A senha deve ter ao menos 8 caracteres" })
            .max(191, { message: "A senha deve conter no máximo 191 caracteres" }),
        confirmPassword: z.string().min(8, { message: "Confirme sua nova senha" }),
    })
    .refine((value) => value.newPassword === value.confirmPassword, {
        message: "As senhas devem ser iguais",
        path: ["confirmPassword"],
    });

function resolveErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }

    if (typeof error === "string") {
        return error;
    }

    if (error && typeof error === "object" && "message" in error) {
        const message = (error as { message?: unknown }).message;
        if (typeof message === "string") {
            return message;
        }
    }

    return "Não foi possível processar sua requisição.";
}

function ResetPasswordRoute() {
    const navigate = useNavigate({ from: "/resetar-senha" });
    const { token } = Route.useSearch();

    const normalizedToken = useMemo(() => token?.trim() ?? "", [token]);

    const validationQuery = useQuery({
        queryKey: ["password-reset-token", normalizedToken],
        queryFn: async () => {
            if (!normalizedToken) {
                throw new Error("Token de redefinição ausente.");
            }

            await validatePasswordResetToken(normalizedToken);
            return true;
        },
        enabled: normalizedToken.length > 0,
        retry: false,
    });

    const queryErrorMessage = !normalizedToken
        ? "Link inválido. Solicite um novo e-mail de redefinição."
        : validationQuery.isError
            ? resolveErrorMessage(validationQuery.error)
            : null;

    const form = useForm({
        defaultValues: {
            newPassword: "",
            confirmPassword: "",
        },
        validators: {
            onSubmit: passwordSchema,
        },
        onSubmit: async ({ value }) => {
            if (!normalizedToken) {
                toast.error("Token inválido ou ausente.");
                return;
            }

            try {
                await confirmPasswordReset({
                    token: normalizedToken,
                    newPassword: value.newPassword,
                    confirmPassword: value.confirmPassword,
                });

                toast.success("Senha atualizada com sucesso. Faça login novamente.");
                navigate({ to: "/login" });
            } catch (error) {
                toast.error(resolveErrorMessage(error));
            }
        },
    });

    const isDisabled = validationQuery.isLoading || Boolean(queryErrorMessage);

    return (
        <div className="flex min-h-screen w-full bg-white">
            <AuthHero />
            <section className="flex w-full max-w-full flex-col items-center justify-center px-6 py-12 sm:px-10 lg:w-[580px] lg:px-12">
                <div className="w-full max-w-[367px] space-y-10">
                    <header className="space-y-3">
                        <h1 className="text-[34px] font-bold leading-[42px] text-[#3B3D3B]">Defina uma nova senha</h1>
                        <p className="text-base text-[#6E726E]">Crie uma senha forte para continuar acessando a plataforma.</p>
                    </header>

                    {validationQuery.isLoading ? (
                        <div className="rounded-lg border border-[#E5E5E5] bg-white p-4 text-sm text-[#6E726E] shadow-sm">
                            Validando link de redefinição...
                        </div>
                    ) : null}

                    {queryErrorMessage ? (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                            {queryErrorMessage}
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
                        <form.Field name="newPassword">
                            {(field) => (
                                <div className="space-y-2">
                                    <Label htmlFor={field.name} className="block text-sm font-medium text-[#3B3D3B]">
                                        Nova senha
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9CA3AF]" />
                                        <Input
                                            id={field.name}
                                            type="password"
                                            autoComplete="new-password"
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={(event) => field.handleChange(event.target.value)}
                                            className="h-12 rounded-lg border border-[#D1D5DB] pl-12 pr-3 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus-visible:border-[#2E52B2] focus-visible:ring-[3px] focus-visible:ring-[#2E52B2]/50"
                                            placeholder="Crie uma senha segura"
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

                        <form.Field name="confirmPassword">
                            {(field) => (
                                <div className="space-y-2">
                                    <Label htmlFor={field.name} className="block text-sm font-medium text-[#3B3D3B]">
                                        Confirme a nova senha
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9CA3AF]" />
                                        <Input
                                            id={field.name}
                                            type="password"
                                            autoComplete="new-password"
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={(event) => field.handleChange(event.target.value)}
                                            className="h-12 rounded-lg border border-[#D1D5DB] pl-12 pr-3 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus-visible:border-[#2E52B2] focus-visible:ring-[3px] focus-visible:ring-[#2E52B2]/50"
                                            placeholder="Repita a nova senha"
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
                                    disabled={!state.canSubmit || state.isSubmitting || isDisabled}
                                >
                                    {state.isSubmitting ? "Salvando..." : "Atualizar senha"}
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
