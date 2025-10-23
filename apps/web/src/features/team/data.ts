export type TeamMemberStatus = "active" | "inactive";

export type TeamMember = {
	id: number;
	fullName: string;
	specialty: string | null;
	documentId: string;
	phone: string | null;
	email: string;
	status: TeamMemberStatus;
	roles: string[];
	updatedAt: string | null;
};

export type TeamSummaryCounts = {
	total: number;
	active: number;
	inactive: number;
};
