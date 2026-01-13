import { Spotlight, type SpotlightActionGroupData } from "@mantine/spotlight";
import type { Station, Train } from "@simrail/types";
import { useSelectedTrain } from "contexts/SelectedTrainContext";
import { LatLng } from "leaflet";
import { useEffect, useRef, useState } from "react";
import { MdSearch } from "react-icons/md";
import { useMap } from "react-leaflet";
import { getSteamProfileOrBot } from "./steam";

type SpotlightSearchProps = {
	trains: Train[];
	stations: Station[];
};

class user {
	username = "";
	ID = "";
	platform = "";
	constructor(username: string, ID: string, platform: string) {
		this.username = username;
		this.ID = ID;
		this.platform = platform;
	}
}
export const usernames: user[] = [];

export default function SpotlightSearch({
	trains,
	stations,
}: SpotlightSearchProps) {
	const map = useMap();
	const [spotlightActions, setSpotlightActions] = useState<
		SpotlightActionGroupData[]
	>([]);
	const { setSelectedTrain } = useSelectedTrain();
	const usernamesCache = useRef<Map<string, string>>(new Map());
	const [open, setOpen] = useState(false);

	async function getUsernames(userIDs: (string | null | undefined)[], platforms: (string | null | undefined)[]) {
		for (let i = 0; i < userIDs.length; i++) {
			const platform = platforms[i];
			const ID = userIDs[i];
			if (platform === "steam" && ID && !usernamesCache.current.has(ID)) {
				const profile = await getSteamProfileOrBot(ID);
				if (profile[1]) {
					usernamesCache.current.set(ID, profile[1]);
				}
			}
		}
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies:
	useEffect(() => {
		const actionsGroups: SpotlightActionGroupData[] = [];

		if (!open) return;

		const userIDs = [];
		const platforms = [];
		for (let i = 0; i < trains.length; i++) {
			if (trains[i].Type === "user" && trains[i] != null) {
				if (trains[i].TrainData.ControlledBySteamID != null) {
					userIDs.push(trains[i].TrainData.ControlledBySteamID);
					platforms.push("steam");
				}
				if (trains[i].TrainData.ControlledByXboxID != null) {
					userIDs.push(trains[i].TrainData.ControlledByXboxID);
					platforms.push("xbox");
				}
			}
		}
		for (let i = 0; i < stations.length; i++) {
			if (stations[i].DispatchedBy[0] && stations[i].DispatchedBy[0].SteamId != null) {
				userIDs.push(stations[i].DispatchedBy[0].SteamId);
				platforms.push("steam")
			}
			if (stations[i].DispatchedBy[0] && stations[i].DispatchedBy[0].XboxId != null) {
				userIDs.push(stations[i].DispatchedBy[0].XboxId);
				platforms.push("xbox")
			}
		}

		getUsernames(userIDs, platforms);

		if (trains) {
			actionsGroups.push({
				group: "Trains",
				actions: trains.map((train, index) => {
					let username = "Bot";

					if (train.TrainData.ControlledBySteamID) {
						username =
							usernamesCache.current.get(train.TrainData.ControlledBySteamID) ??
							"Unknown";
					}

					if (train.TrainData.ControlledByXboxID) {
						username = "Unknown [XBOX]" // make function for getting xbox usernames
					}

					return {
						id: `train-${index}`,
						label: `${train.TrainNoLocal} - ${train.TrainName}`,
						description: `Driven by ${username} `,
						onClick: () => {
							setSelectedTrain(train);
							map?.setZoom(13);
						},
					};
				}),
			});
		}

		if (stations) {
			actionsGroups.push({
				group: "Stations",
				actions: stations.map((station, index) => {
					let username = "Bot";

					if (station.DispatchedBy[0] && station.DispatchedBy[0].SteamId) {
						username =
							usernamesCache.current.get(station.DispatchedBy[0].SteamId) ??
							"Unknown";
					}

					if (station.DispatchedBy[0] && station.DispatchedBy[0].XboxId) {
						username = "Unknown [XBOX]" // make function for getting xbox usernames https://panel.simrail.eu:8084/users-open/
					}

					return {
						id: `station-${index}`,
						label: `${station.Name} - ${station.Prefix}`,
						description: `Controlled by ${username}`,
						onClick: () => {
							map?.panTo(new LatLng(station.Latititude, station.Longitude));
							map?.setZoom(13);
						},
					};
				}),
			});
		}

		setSpotlightActions(actionsGroups);
	}, [trains, stations, open, map?.panTo, setSelectedTrain, map?.setZoom]);

	return (
		<Spotlight
			actions={spotlightActions}
			nothingFound="Nothing found..."
			highlightQuery
			styles={{
				actionLabel: {
					color: "var(--mantine-color-text)",
				},
			}}
			onSpotlightOpen={() => setOpen(true)}
			onSpotlightClose={() => setOpen(false)}
			limit={5}
			searchProps={{
				leftSection: <MdSearch />,
				placeholder: "Search players, trains and stations...",
			}}
		/>
	);
}
