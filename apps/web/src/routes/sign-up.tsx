import { AuthHero } from "@/components/auth-hero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/api-client";
import { authClient } from "@/lib/auth-client";
import { useAuthSession } from "@/providers/auth-session-provider";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { IdCard, Lock, Mail, Phone, Stethoscope, User } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import z from "zod";

type AccountDraft = {
  name: string;
  email: string;
  password: string;
};

export const Route = createFileRoute("/sign-up")({
  component: SignUpRoute,
});

function SignUpRoute() {
  const navigate = useNavigate({ from: "/sign-up" });
  const { isAuthenticated, session } = useAuthSession();
  const [step, setStep] = useState<1 | 2>(1);
  const [accountDraft, setAccountDraft] = useState<AccountDraft>({
    name: "",
    email: "",
    password: "",
  });
  const hasCheckedInitialSession = useRef(false);

  useEffect(() => {
    if (hasCheckedInitialSession.current) {
      return;
    }

    if (isAuthenticated) {
      navigate({ to: "/dashboard" });
      return;
    }

    hasCheckedInitialSession.current = true;
  }, [isAuthenticated, navigate]);

  const stepCopy =
    step === 1
      ? {
          title: "Cadastre-se",
          description: "Crie sua conta profissional para acessar a plataforma.",
        }
      : {
          title: "Complete seu perfil",
          description: "Informe os dados profissionais para liberar o acesso.",
        };

  const accountDefaults = useMemo(
    () => ({
      name: accountDraft.name || session?.user?.name || "",
      email: accountDraft.email || session?.user?.email || "",
      password: accountDraft.password || "",
      confirmPassword: accountDraft.password || "",
    }),
    [accountDraft, session?.user?.name, session?.user?.email],
  );

  const handleAccountComplete = (draft: AccountDraft) => {
    setAccountDraft(draft);
    setStep(2);
  };

  const handleBackToAccount = () => {
    setStep(1);
  };

  const handleOnboardingComplete = () => {
    toast.success("Cadastro profissional concluído. Bem-vindo ao gerenciador!");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="flex min-h-screen w-full bg-white">
      <AuthHero />
      <section className="flex w-full max-w-full flex-col items-center justify-center px-6 py-12 sm:px-10 lg:w-[580px] lg:px-12">
        <div className="w-full max-w-[367px] space-y-10">
          <header className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-wide text-[#9FB5ED]">
              Etapa {step} de 2
            </p>
            <h1 className="text-[34px] font-bold leading-[42px] text-[#3B3D3B]">
              {stepCopy.title}
            </h1>
            <p className="text-base text-[#6E726E]">{stepCopy.description}</p>
          </header>
          {step === 1 ? (
            <AccountStepForm defaultValues={accountDefaults} onComplete={handleAccountComplete} />
          ) : (
            <ProfessionalStepForm
              key={`${accountDraft.email}-${accountDraft.name}`}
              defaultName={accountDefaults.name}
              accountEmail={accountDefaults.email}
              onBack={handleBackToAccount}
              onComplete={handleOnboardingComplete}
            />
          )}
        </div>
      </section>
    </div>
  );
}

const accountSchema = z
  .object({
    name: z
      .string()
      .min(3, { message: "Informe seu nome completo" })
      .transform((value) => value.trim()),
    email: z
      .string()
      .min(1, { message: "Informe seu e-mail" })
      .email({ message: "Formato de e-mail inválido" })
      .transform((value) => value.trim()),
    password: z
      .string()
      .min(8, { message: "A senha deve ter ao menos 8 caracteres" }),
    confirmPassword: z
      .string()
      .min(8, { message: "Confirme sua senha" }),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "As senhas precisam ser iguais",
        path: ["confirmPassword"],
      });
    }
  });

type AccountStepFormProps = {
  defaultValues: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  };
  onComplete: (draft: AccountDraft) => void;
};

function AccountStepForm({ defaultValues, onComplete }: AccountStepFormProps) {
  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: accountSchema,
    },
    onSubmit: async ({ value }) => {
      await authClient.signUp.email(
        {
          name: value.name,
          email: value.email,
          password: value.password,
        },
        {
          onSuccess: async () => {
            await authClient.signIn.email(
              {
                email: value.email,
                password: value.password,
              },
              {
                onSuccess: () => {
                  onComplete({
                    name: value.name,
                    email: value.email,
                    password: value.password,
                  });
                  toast.success(
                    "Conta criada! Agora complete suas informações profissionais.",
                  );
                },
                onError: (error) => {
                  const message =
                    error.error?.message || "Não foi possível iniciar a sessão.";
                  toast.error(message);
                },
              },
            );
          },
          onError: (error) => {
            const message =
              error.error?.message ?? "Não foi possível criar a conta";
            toast.error(message);
          },
        },
      );
    },
  });

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit();
      }}
    >
      <form.Field name="name">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name} className="block text-sm font-medium text-[#3B3D3B]">
              Nome completo
            </Label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9CA3AF]" />
              <Input
                id={field.name}
                type="text"
                autoComplete="name"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                className="h-12 rounded-lg border border-[#D1D5DB] pl-12 pr-3 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus-visible:border-[#2E52B2] focus-visible:ring-[3px] focus-visible:ring-[#2E52B2]/50"
                placeholder="Nome completo"
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
                placeholder="nome@hospital.com"
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

      <form.Field name="password">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name} className="block text-sm font-medium text-[#3B3D3B]">
              Senha de acesso
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
              Confirme sua senha
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
                placeholder="Repita a senha"
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
            {state.isSubmitting ? "Criando conta..." : "Salvar e continuar"}
          </Button>
        )}
      </form.Subscribe>

      <div className="text-sm text-[#6E726E]">
        <span>Já possui uma conta? </span>
        <Link to="/login" className="font-semibold text-[#2E52B2] hover:underline">
          Entrar
        </Link>
      </div>
    </form>
  );
}

const professionalSchema = z.object({
  fullName: z
    .string()
    .min(3, { message: "Informe seu nome completo" })
    .transform((value) => value.trim()),
  documentId: z
    .string()
    .trim()
    .transform((value) => value.replace(/\D/g, ""))
    .refine((value) => /^\d{11}$/.test(value), {
      message: "Informe um CPF com 11 dígitos",
    }),
  specialty: z
    .string()
    .min(2, { message: "Informe sua especialidade" })
    .transform((value) => value.trim()),
  phone: z
    .string()
    .transform((value) => value.replace(/\D/g, ""))
    .refine((value) => value.length === 0 || value.length >= 10, {
      message: "Informe um telefone com DDD (mínimo 10 dígitos)",
    }),
});

type ProfessionalFormValues = z.infer<typeof professionalSchema>;

type ProfessionalStepFormProps = {
  defaultName: string;
  accountEmail: string;
  onBack: () => void;
  onComplete: () => void;
};

function ProfessionalStepForm({ defaultName, accountEmail, onBack, onComplete }: ProfessionalStepFormProps) {
  const defaultValues: ProfessionalFormValues = {
    fullName: defaultName,
    documentId: "",
    specialty: "",
    phone: "",
  };

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: professionalSchema,
    },
    onSubmit: async ({ value }) => {
      const { error } = await apiClient.POST("/professionals/onboarding", {
        body: {
          fullName: value.fullName,
          documentId: value.documentId,
          specialty: value.specialty,
          phone: value.phone.length > 0 ? value.phone : undefined,
        },
      });

      if (error) {
        const message = (() => {
          switch (error.code) {
            case "DOCUMENT_IN_USE":
              return "Já existe um profissional cadastrado com este CPF.";
            case "INVALID_DOCUMENT":
              return "Informe um CPF com 11 dígitos.";
            default:
              return error.message || "Não foi possível completar o cadastro.";
          }
        })();
        toast.error(message);
        return;
      }

      onComplete();
    },
  });

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit();
      }}
    >
      <div className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-3 text-sm text-[#4B5563]">
        Você está cadastrando o acesso para <span className="font-medium text-[#1F2937]">{accountEmail}</span>.
      </div>

      <form.Field name="fullName">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name} className="block text-sm font-medium text-[#3B3D3B]">
              Nome completo
            </Label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9CA3AF]" />
              <Input
                id={field.name}
                type="text"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                className="h-12 rounded-lg border border-[#D1D5DB] pl-12 pr-3 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus-visible:border-[#2E52B2] focus-visible:ring-[3px] focus-visible:ring-[#2E52B2]/50"
                placeholder="Nome completo"
              />
            </div>
            {field.state.meta.errors?.map((error, index) => (
              <p key={`${field.name}-error-${index}`} className="text-sm text-[#DC2626]">
                {error?.message}
              </p>
            ))}
          </div>
        )}
      </form.Field>

      <form.Field name="documentId">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name} className="block text-sm font-medium text-[#3B3D3B]">
              CPF
            </Label>
            <div className="relative">
              <IdCard className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9CA3AF]" />
              <Input
                id={field.name}
                type="text"
                inputMode="numeric"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                className="h-12 rounded-lg border border-[#D1D5DB] pl-12 pr-3 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus-visible:border-[#2E52B2] focus-visible:ring-[3px] focus-visible:ring-[#2E52B2]/50"
                placeholder="00000000000"
              />
            </div>
            {field.state.meta.errors?.map((error, index) => (
              <p key={`${field.name}-error-${index}`} className="text-sm text-[#DC2626]">
                {error?.message}
              </p>
            ))}
          </div>
        )}
      </form.Field>

      <form.Field name="specialty">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name} className="block text-sm font-medium text-[#3B3D3B]">
              Especialidade
            </Label>
            <div className="relative">
              <Stethoscope className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9CA3AF]" />
              <Input
                id={field.name}
                type="text"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                className="h-12 rounded-lg border border-[#D1D5DB] pl-12 pr-3 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus-visible:border-[#2E52B2] focus-visible:ring-[3px] focus-visible:ring-[#2E52B2]/50"
                placeholder="Oncologia clínica"
              />
            </div>
            {field.state.meta.errors?.map((error, index) => (
              <p key={`${field.name}-error-${index}`} className="text-sm text-[#DC2626]">
                {error?.message}
              </p>
            ))}
          </div>
        )}
      </form.Field>

      <form.Field name="phone">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name} className="block text-sm font-medium text-[#3B3D3B]">
              Telefone de contato (opcional)
            </Label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9CA3AF]" />
              <Input
                id={field.name}
                type="tel"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                className="h-12 rounded-lg border border-[#D1D5DB] pl-12 pr-3 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus-visible:border-[#2E52B2] focus-visible:ring-[3px] focus-visible:ring-[#2E52B2]/50"
                placeholder="(11) 91234-5678"
              />
            </div>
            {field.state.meta.errors?.map((error, index) => (
              <p key={`${field.name}-error-${index}`} className="text-sm text-[#DC2626]">
                {error?.message}
              </p>
            ))}
          </div>
        )}
      </form.Field>

      <div className="space-y-3">
        <form.Subscribe>
          {(state) => (
            <Button
              type="submit"
              className="h-12 w-full rounded-lg bg-[#2E52B2] text-base font-medium text-white transition-colors hover:bg-[#264B96]"
              disabled={!state.canSubmit || state.isSubmitting}
            >
              {state.isSubmitting ? "Salvando dados..." : "Concluir cadastro"}
            </Button>
          )}
        </form.Subscribe>
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="h-12 w-full border-[#D1D5DB] text-[#2E52B2] transition-colors hover:bg-[#F3F6FD]"
        >
          Voltar para etapa anterior
        </Button>
      </div>
    </form>
  );
}
