import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY?.trim();
const defaultFrom = process.env.EMAIL_FROM?.trim() || "RotaOnco <noreply@rotaonco.mail.com>";

let client: Resend | null = null;

function getResendClient() {
	if (!resendApiKey) {
		throw new Error("RESEND_API_KEY is not configured");
	}
	if (!client) {
		client = new Resend(resendApiKey);
	}
	return client;
}

function buildPasswordResetHtml(resetUrl: string, displayName?: string | null) {
	const greetingName = displayName?.trim().length ? displayName.trim().split(" ")[0] ?? displayName.trim() : "Olá";
	const escapedResetUrl = resetUrl.replace(/"/g, "&quot;");

	return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Redefinicao de senha</title>
</head>
<body style="margin:0;padding:0;background-color:#f9fafb;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
	<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;padding:24px 0;">
		<tr>
			<td align="center">
				<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;padding:32px 40px;box-shadow:0 12px 32px rgba(30,64,175,0.08);">
					<tr>
						<td style="text-align:left;">
							<h1 style="margin:0;font-size:24px;color:#1f2937;">Redefinição de senha</h1>
							<p style="margin:16px 0 24px;font-size:16px;color:#374151;line-height:1.5;">${greetingName}, recebemos um pedido para atualizar a senha de acesso à plataforma RotaOnco. Clique no botão abaixo para criar uma nova senha.</p>
							<p style="margin:0 0 32px;">
								<a href="${escapedResetUrl}" style="display:inline-block;background-color:#2e52b2;color:#ffffff;text-decoration:none;padding:14px 24px;border-radius:999px;font-size:16px;font-weight:600;">Definir nova senha</a>
							</p>
							<p style="margin:0;font-size:14px;color:#4b5563;line-height:1.5;">Se o botão não funcionar, copie e cole o link a seguir no navegador:</p>
							<p style="margin:12px 0 0;font-size:14px;word-break:break-all;color:#1f2937;">${escapedResetUrl}</p>
							<p style="margin:32px 0 0;font-size:13px;color:#6b7280;line-height:1.5;">Este link expira em sessenta minutos. Se você não solicitou esta alteração, ignore este e-mail.</p>
						</td>
					</tr>
				</table>
				<p style="margin:24px 0 0;font-size:12px;color:#9ca3af;">© ${new Date().getFullYear()} RotaOnco. Todos os direitos reservados.</p>
			</td>
		</tr>
	</table>
</body>
</html>`;
}

function buildPasswordResetText(resetUrl: string) {
	return [
		"Redefinicao de senha",
		"",
		"Recebemos um pedido para redefinir sua senha na RotaOnco.",
		"",
		`Use o link a seguir dentro de 60 minutos: ${resetUrl}`,
		"",
		"Se voce nao solicitou esta alteracao, ignore esta mensagem.",
	].join("\n");
}

export async function sendPasswordResetEmail(params: { to: string; resetUrl: string; name?: string | null }) {
	const resend = getResendClient();

	await resend.emails.send({
		from: defaultFrom,
		to: params.to,
		subject: "Redefinicao de senha - RotaOnco",
		html: buildPasswordResetHtml(params.resetUrl, params.name),
		text: buildPasswordResetText(params.resetUrl),
	});
}
