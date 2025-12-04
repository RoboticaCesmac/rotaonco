import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
	BarChart3Icon,
	LayoutDashboardIcon,
	LogOutIcon,
	SquareGanttChart,
	Stethoscope,
	Users2Icon,
	type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";

const mainNavItems = [
	{
		label: "Dashboard",
		to: "/dashboard" as const,
		icon: LayoutDashboardIcon,
		enabled: true,
	},
	{
		label: "Pacientes",
		to: "/patients" as const,
		icon: Users2Icon,
		enabled: true,
	},
	{
		label: "Consultas",
		to: "/consultas" as const,
		icon: SquareGanttChart,
		enabled: true,
	},
	{
		label: "Equipe médica",
		to: "/team" as const,
		icon: Stethoscope,
		enabled: true,
	},
	{
		label: "Relatórios",
		to: "/reports" as const,
		icon: BarChart3Icon,
		enabled: true,
	},
] as const;

type ExtraNavItem =
	| {
		label: string;
		icon: LucideIcon;
		enabled: boolean;
		to: "/profile";
	}
	| {
		label: string;
		icon: LucideIcon;
		enabled: boolean;
		action: "logout";
	};

const extraNavItems: ExtraNavItem[] = [
	{
		label: "Meu perfil",
		to: "/profile",
		icon: Users2Icon,
		enabled: true,
	},
	{
		label: "Sair",
		icon: LogOutIcon,
		enabled: true,
		action: "logout",
	},
];

function handleComingSoon(label: string) {
	toast.info(`${label} em breve`);
}

type AppSidebarProps = {
	collapsed?: boolean;
};

export function AppSidebar({ collapsed = false }: AppSidebarProps) {
	if (collapsed) {
		return null;
	}
	const navigate = useNavigate();
	const routerState = useRouterState({
		select: (s) => s.location.pathname,
	});
	const pathname = routerState;
	const [isSigningOut, setIsSigningOut] = useState(false);

	const handleSignOut = async () => {
		if (isSigningOut) {
			return;
		}
		setIsSigningOut(true);
		try {
			await authClient.signOut({
				fetchOptions: {
					onSuccess: () => {
						navigate({ to: "/" });
					},
				},
			});
		} catch (error) {
			console.error("Failed to sign out", error);
			toast.error("Não foi possível encerrar a sessão. Tente novamente.");
		} finally {
			setIsSigningOut(false);
		}
	};

	return (
		<aside
			id="app-sidebar"
			className="hidden h-full w-[312px] flex-shrink-0 border-r border-[#CECFCD] bg-white px-10 py-5 xl:flex xl:flex-col xl:gap-16"
		>
			<div className="flex items-center gap-3">
				<div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#3663D8]">
					<img
						src="/images/branding/Vector.svg"
						alt="RotaOnco"
						className="h-7 w-7 object-contain"
					/>
				</div>
				<div className="flex flex-col text-center text-[#3663D8]">
					<span className="text-[26px] font-bold leading-6">RotaOnco</span>
					<span className="text-xs font-medium leading-3 text-[#9FB5ED]">
						GERENCIADOR WEB
					</span>
				</div>
			</div>

			<nav className="flex flex-1 flex-col gap-10">
				<div className="space-y-4">
					<p className="text-sm font-medium text-[#AAAAAA]">MENU</p>
					<ul className="space-y-4">
						{mainNavItems.map((item) => {
							const Icon = item.icon;
							const isActive = pathname.startsWith(item.to);
							const commonClasses = cn(
								"flex h-12 items-center gap-3 rounded-md px-3 py-2 text-base font-medium transition",
								isActive
									? "bg-[#3663D8] text-white shadow-sm"
									: "text-[#AAAAAA] hover:bg-[#F3F6FD]",
							);

							if (!item.enabled) {
								return (
									<li key={item.label}>
										<button
											type="button"
											onClick={() => handleComingSoon(item.label)}
											className={cn(commonClasses, "w-full cursor-not-allowed opacity-60")}
										>
											<Icon className="h-4 w-4" />
											<span>{item.label}</span>
										</button>
									</li>
								);
							}

							return (
								<li key={item.label}>
									<Link to={item.to} className={cn(commonClasses, "w-full")}
										activeOptions={{ exact: true }}
									>
										<Icon className="h-4 w-4" />
										<span>{item.label}</span>
									</Link>
								</li>
							);
						})}
					</ul>
				</div>

				<div className="space-y-4">
					<p className="text-sm font-medium text-[#AAAAAA]">MAIS</p>
					<ul className="space-y-4">
						{extraNavItems.map((item) => {
							const Icon = item.icon;
							const isLinkItem = "to" in item;
							const isActive = isLinkItem ? pathname.startsWith(item.to) : false;
							const linkClasses = cn(
								"flex h-12 items-center gap-3 rounded-md px-3 py-2 text-base font-medium transition",
								isActive
									? "bg-[#3663D8] text-white shadow-sm"
									: "text-[#AAAAAA] hover:bg-[#F3F6FD]",
							);

							if (!item.enabled) {
								return (
									<li key={item.label}>
										<button
											type="button"
											onClick={() => handleComingSoon(item.label)}
											className={cn(linkClasses, "w-full cursor-not-allowed opacity-60")}
										>
											<Icon className="h-4 w-4" />
											<span>{item.label}</span>
										</button>
									</li>
								);
							}

							if ("action" in item && item.action === "logout") {
								return (
									<li key={item.label}>
										<button
											type="button"
											onClick={handleSignOut}
											disabled={isSigningOut}
											className={cn(
												"flex h-12 w-full items-center gap-3 rounded-md px-3 py-2 text-base font-medium transition",
												"text-[#B91C1C] hover:bg-[#FDE8E8] disabled:cursor-not-allowed disabled:opacity-70",
											)}
										>
											<Icon className="h-4 w-4" />
											<span>{isSigningOut ? "Encerrando..." : item.label}</span>
										</button>
									</li>
								);
							}

							if (isLinkItem) {
								return (
									<li key={item.label}>
										<Link to={item.to} className={cn(linkClasses, "w-full")}
											activeOptions={{ exact: true }}
										>
											<Icon className="h-4 w-4" />
											<span>{item.label}</span>
										</Link>
									</li>
								);
							}

							return null;
						})}
					</ul>
				</div>
			</nav>
		</aside>
	);
}
