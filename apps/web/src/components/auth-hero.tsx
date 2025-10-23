export function AuthHero() {
	return (
		<aside className="relative hidden min-h-screen flex-1 items-center justify-center overflow-hidden bg-gradient-to-b from-[#264B96] to-[#0D1F4A] text-white lg:flex">
			<img
				src="/images/login/health simbol login.svg"
				alt="Ilustração saúde"
				className="pointer-events-none absolute bottom-0 left-0 w-64 opacity-15 drop-shadow-[0_0_12px_rgba(38,75,150,0.35)]"
			/>
			<div className="relative flex flex-col items-center gap-3 text-center">
				<img src="/images/login/logo.svg" alt="RotaOnco" className="w-64" />
				<p className="text-sm text-white/80">
					Acesso seguro ao seu gerenciador web.
				</p>
			</div>
		</aside>
	);
}
