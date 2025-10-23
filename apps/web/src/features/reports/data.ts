export type WaitTimeReportPoint = {
	month: string;
	label: string;
	value: number;
};

export const WAIT_TIME_REPORT: WaitTimeReportPoint[] = [
	{ month: "jan", label: "Jan", value: 6 },
	{ month: "fev", label: "Fev", value: 15 },
	{ month: "mar", label: "Mar", value: 10 },
	{ month: "abr", label: "Abr", value: 11 },
	{ month: "mai", label: "Mai", value: 9 },
	{ month: "jun", label: "Jun", value: 16 },
	{ month: "jul", label: "Jul", value: 8 },
	{ month: "ago", label: "Ago", value: 15 },
	{ month: "set", label: "Set", value: 5 },
	{ month: "out", label: "Out", value: 11 },
	{ month: "nov", label: "Nov", value: 7 },
	{ month: "dez", label: "Dez", value: 10 },
];

export const REPORT_ACTION_GROUPS = [
	{
		title: "Relatório de tempo",
		actions: ["Visualizar", "Unidade", "Exportar"],
	},
	{
		title: "Relatório de adesão",
		actions: ["Visualizar", "Unidade"],
	},
	{
		title: "Relatório de presença",
		actions: ["Visualizar", "Unidade", "Exportar"],
	},
	{
		title: "Relatório de efeitos",
		actions: ["Visualizar", "Unidade"],
	},
] as const;
