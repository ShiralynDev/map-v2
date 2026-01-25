type XboxInfo = {
	Gamertag?: string | null;
};

type XboxUser = {
	SteamId: string | null;
	XboxId: string | null;
	ServerCode: string | null;
	UserType: string | null;
	SteamInfo: unknown | null;
	XboxInfo: XboxInfo | null;
	AdditionalInformation: unknown | null;
};

type XboxProfileResponse = {
	result: boolean;
	data: XboxUser[];
	count?: number | null;
	description?: string | null;
};

export type { XboxProfileResponse, XboxUser, XboxInfo };
