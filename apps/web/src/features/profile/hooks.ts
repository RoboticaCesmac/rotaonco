import { useQuery } from "@tanstack/react-query";
import { fetchCurrentProfessional } from "./api";
import { toProfileViewModel, type ProfileViewModel } from "./types";

const PROFILE_SCOPE = "profile";

export function useProfessionalProfile() {
	return useQuery<ProfileViewModel>({
		queryKey: [PROFILE_SCOPE, "me"],
		queryFn: async () => {
			const professional = await fetchCurrentProfessional();
			if (!professional) {
				throw new Error("Profissional não encontrado");
			}

			return toProfileViewModel(professional);
		},
		staleTime: 60 * 1000,
	});
}
