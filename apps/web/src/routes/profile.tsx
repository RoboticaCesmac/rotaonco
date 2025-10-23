import { AppLayout } from "@/components/app-layout";
import { ProfileHero } from "@/features/profile/components/profile-hero";
import { ProfileInfoForm } from "@/features/profile/components/profile-info-form";
import { ProfileOverviewCard } from "@/features/profile/components/profile-overview-card";
import { useProfessionalProfile } from "@/features/profile/hooks";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/profile")({
	beforeLoad: async ({ context }) => {
		const session = await context.authClient.getSession();
		if (!session.data) {
			throw redirect({ to: "/login" });
		}
	},
	component: ProfileRoute,
});

function ProfileRoute() {
	const profileQuery = useProfessionalProfile();
	const profile = profileQuery.data ?? null;
	const errorMessage = profileQuery.isError
		? ((profileQuery.error instanceof Error ? profileQuery.error.message : null) ?? "Não foi possível carregar seus dados.")
		: null;

	return (
		<AppLayout>
			<div className="space-y-8">
				<header className="space-y-1">
					<h1 className="text-2xl font-bold text-[#3B3D3B] md:text-[34px] md:leading-[42px]">
						Meu perfil
					</h1>
					<p className="text-sm text-[#6E726E]">
						Gerencie dados de acesso e preferências de contato em um único lugar.
					</p>
				</header>

				<ProfileHero lastUpdated={profile?.updatedAt} isLoading={profileQuery.isLoading} />

				{errorMessage ? (
					<div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
						{errorMessage}
					</div>
				) : null}

				<div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
					<ProfileOverviewCard profile={profile} isLoading={profileQuery.isLoading} />
					<ProfileInfoForm profile={profile} isLoading={profileQuery.isLoading} />
				</div>
			</div>
		</AppLayout>
	);
}
