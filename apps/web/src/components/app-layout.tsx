import { useState, type ReactNode } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { AppTopbar } from "@/components/app-topbar";

export function AppLayout({ children }: { children: ReactNode }) {
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

	return (
		<div className="flex h-svh w-full overflow-hidden bg-[#FCFBFA] text-[#111827]">
			<AppSidebar collapsed={isSidebarCollapsed} />
			<div className="flex h-full flex-1 flex-col">
				<AppTopbar
					isSidebarCollapsed={isSidebarCollapsed}
					onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
				/>
				<main className="no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pb-6 pt-8 lg:px-8 xl:px-10">
					<div className="flex min-h-0 flex-1 flex-col">
						{children}
					</div>
				</main>
			</div>
		</div>
	);
}
