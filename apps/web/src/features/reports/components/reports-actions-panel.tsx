import { FileText, Layers, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { REPORT_ACTION_GROUPS } from "../data";
import { toast } from "sonner";

const ICONS = [FileText, Layers, Share2];

export function ReportsActionsPanel() {
	return (
		<section className="flex flex-col gap-4">
			{REPORT_ACTION_GROUPS.map((group, index) => {
				const Icon = ICONS[index % ICONS.length];
				return (
					<article
						key={group.title}
						className="rounded-xl border border-[#E5E5E5] bg-white p-6 shadow-[0px_1px_2px_rgba(16,24,40,0.05)]"
					>
						<header className="mb-4 flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F3F6FD] text-[#3663D8]">
								<Icon className="h-5 w-5" />
							</div>
							<div>
								<h3 className="text-base font-semibold text-[#3B3D3B]">{group.title}</h3>
								<p className="text-sm text-[#6E726E]">Configure visibilidade e exporte dados consolidados.</p>
							</div>
						</header>
						<div className="flex flex-wrap gap-2">
							{group.actions.map((action) => (
								<Button
									key={action}
									variant={action === "Visualizar" ? "default" : "outline"}
									className={
										action === "Visualizar"
											? "gap-2 bg-[#3663D8] text-white hover:bg-[#2D52B1]"
											: "gap-2 border-[#CBD5F5] text-[#3663D8] hover:bg-[#F3F6FD]"
									}
									onClick={() => toast.info(`${group.title} - ${action} disponível em breve`)}
								>
									{action}
								</Button>
							))}
						</div>
					</article>
				);
			})}
		</section>
	);
}
