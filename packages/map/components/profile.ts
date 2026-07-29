import type { ProfileResponse } from "types/SteamProfile";
import type { XboxProfileResponse } from "types/XboxProfile";

const getSteamProfileInfos = async (steamId: string) => {
	const avatarRequest = await fetch(
		`https://panel.simrail.eu:8084/users-open/${steamId}`,
	);
	const response = await avatarRequest.json();
	
	return {
		avatar: response.data[0].SteamInfo.avatar,
		personaname: response.data[0].SteamInfo.personaname,
	} satisfies ProfileResponse;
};

export async function getSteamProfileOrBot(steamId: string | null | undefined) {
	if (steamId)
		return getSteamProfileInfos(steamId).then((profile) => [
			profile.avatar,
			profile.personaname,
		]);

	return Promise.resolve([null, "BOT"]);
}

export async function getXboxProfile(xboxId: string | null | undefined) {
	if (!xboxId) return Promise.resolve([null, "BOT"] as [string | null, string]);

	const avatarRequest = await fetch(
		`https://panel.simrail.eu:8084/users-open/${xboxId}`,
	);
	const response: XboxProfileResponse = await avatarRequest.json();
	const profile = response.data && response.data.length > 0 ? response.data[0] : null;

	const username = profile?.XboxInfo?.Gamertag ?? "Unknown";
	return [null, username] as [string | null, string];
}