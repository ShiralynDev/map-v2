import type { ProfileResponse } from "types/SteamProfile";
import type { XboxProfileResponse } from "types/XboxProfile";

const getSteamProfileInfos = (steamId: string): Promise<ProfileResponse> =>
	fetch(`https://simrail-edr.emeraldnetwork.xyz/steam/${steamId}`).then((r) =>
		r.json(),
	);

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