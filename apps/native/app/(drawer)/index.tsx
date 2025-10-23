import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Image, Text, TouchableOpacity, View } from "react-native";

export default function Home() {
	const insets = useSafeAreaInsets();
	const router = useRouter();

	return (
		<SafeAreaView
			style={{ flex: 1, backgroundColor: "#0E47A1" }}
			className="flex-1 bg-[#0E47A1]"
			edges={["top"]}
		>
			<View
				style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
				className="flex-1 items-center justify-center"
			>
				<Image
					source={require("../../assets/images/healthcross.png")}
					style={{ width: 320, height: 320, marginTop: -80, resizeMode: "contain" }}
					className="w-80 h-80 -mt-20"
				/>
			</View>
			<View
				style={{
					backgroundColor: "#FFFFFF",
					borderTopLeftRadius: 36,
					borderTopRightRadius: 36,
					paddingHorizontal: 28,
					paddingVertical: 40,
				}}
				className="bg-white rounded-t-[36px] px-7 pt-10 pb-12"
			>
				<Text className="text-center text-xl font-bold text-zinc-900">
					Como você quer acessar?
				</Text>
				<Text className="mt-3 text-center text-sm text-neutral-600">
					Escolha o perfil que melhor representa você para continuar
				</Text>
				<View
					style={{ marginTop: 32 }}
					className="mt-8"
				>
					<TouchableOpacity
						style={{
							marginBottom: 20,
							borderRadius: 14,
							paddingVertical: 14,
							width: "85%",
							alignSelf: "center",
						}}
						className="flex-row items-center justify-center gap-2 bg-[#2F66F5]"
						onPress={() => router.push("/(drawer)/patient-login")}
					>
						<Ionicons name="person" size={18} color="#FFFFFF" />
						<Text className="text-base font-medium text-white">Sou Paciente</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={{
							borderRadius: 14,
							paddingVertical: 14,
							width: "85%",
							alignSelf: "center",
						}}
						className="flex-row items-center justify-center gap-2 bg-[#2F66F5]"
						onPress={() => router.push("/(drawer)/professional-login")}
					>
						<Ionicons name="people" size={18} color="#FFFFFF" />
						<Text className="text-base font-medium text-white">Sou Profissional</Text>
					</TouchableOpacity>
				</View>
			</View>
			<View style={{ height: insets.bottom, backgroundColor: "#FFFFFF" }} />
		</SafeAreaView>
	);
}
