import { useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react";

const ICON_CLASS = "h-4 w-4 text-[#9CA3AF]";
const MIN_PASSWORD_LENGTH = 8;

type ProfilePasswordFormProps = {
	onSubmit: (payload: { newPassword: string; confirmPassword: string }) => Promise<boolean>;
	isSubmitting: boolean;
};

type FormState = {
	newPassword: string;
	confirmPassword: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

export function ProfilePasswordForm({ onSubmit, isSubmitting }: ProfilePasswordFormProps) {
	const [values, setValues] = useState<FormState>({ newPassword: "", confirmPassword: "" });
	const [errors, setErrors] = useState<FormErrors>({});

	const handleChange = (field: keyof FormState) => (event: ChangeEvent<HTMLInputElement>) => {
		const nextValue = event.target.value;
		setValues((prev) => ({ ...prev, [field]: nextValue }));
		setErrors((prev) => ({ ...prev, [field]: undefined }));
	};

	const validate = () => {
		const nextErrors: FormErrors = {};
		const trimmedPassword = values.newPassword.trim();
		const trimmedConfirmation = values.confirmPassword.trim();

		if (trimmedPassword.length < MIN_PASSWORD_LENGTH) {
			nextErrors.newPassword = `A senha deve ter ao menos ${MIN_PASSWORD_LENGTH} caracteres`;
		}

		if (trimmedConfirmation.length < MIN_PASSWORD_LENGTH) {
			nextErrors.confirmPassword = "Confirme sua nova senha";
		}

		if (!nextErrors.newPassword && !nextErrors.confirmPassword && trimmedPassword !== trimmedConfirmation) {
			nextErrors.confirmPassword = "As senhas devem ser iguais";
		}

		setErrors(nextErrors);
		return Object.keys(nextErrors).length === 0;
	};

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!validate()) {
			return;
		}

		let success = false;
		try {
			success = await onSubmit({
				newPassword: values.newPassword.trim(),
				confirmPassword: values.confirmPassword.trim(),
			});
		} catch (error) {
			console.error(error);
		}

		if (success) {
			setValues({ newPassword: "", confirmPassword: "" });
			setErrors({});
		}
	};

	const disabled = isSubmitting;

	return (
		<section className="flex flex-col gap-6 rounded-xl border border-[#E5E5E5] bg-white p-8">
			<header className="space-y-1">
				<h2 className="text-2xl font-bold text-[#3B3D3B]">Segurança</h2>
				<p className="text-sm text-[#6E726E]">Troque a senha de acesso sempre que precisar.</p>
			</header>

			<form className="flex flex-col gap-6" onSubmit={handleSubmit}>
				<Field
					label="Nova senha"
					type="password"
					icon={<Lock className={ICON_CLASS} />}
					value={values.newPassword}
					onChange={handleChange("newPassword")}
					disabled={disabled}
					error={errors.newPassword}
				/>

				<Field
					label="Confirme a nova senha"
					type="password"
					icon={<Lock className={ICON_CLASS} />}
					value={values.confirmPassword}
					onChange={handleChange("confirmPassword")}
					disabled={disabled}
					error={errors.confirmPassword}
				/>

				<div className="flex justify-end">
					<Button type="submit" className="gap-2 bg-[#3663D8] text-white hover:bg-[#2D52B1]" disabled={disabled}>
						{isSubmitting ? "Salvando..." : "Atualizar senha"}
					</Button>
				</div>
			</form>
		</section>
	);
}

function Field({
	label,
	type,
	icon,
	value,
	onChange,
	disabled,
	error,
}: {
	label: string;
	type: string;
	icon: ReactNode;
	value: string;
	onChange: (event: ChangeEvent<HTMLInputElement>) => void;
	disabled: boolean;
	error?: string;
}) {
	return (
		<label className="space-y-2 text-sm">
			<span className="block text-[#6E726E]">{label}</span>
			<div className="space-y-2">
				<div className="flex items-center gap-3 rounded-lg border border-[#E5E5E5] bg-white px-4 py-3">
					{icon}
					<Input
						type={type}
						value={value}
						onChange={onChange}
						disabled={disabled}
						className="border-0 p-0 text-[#3B3D3B] focus-visible:ring-0 disabled:cursor-not-allowed disabled:bg-transparent"
						autoComplete={type === "password" ? "new-password" : undefined}
						spellCheck={false}
					/>
				</div>
				{error ? <p className="text-xs text-[#DC2626]">{error}</p> : null}
			</div>
		</label>
	);
}
