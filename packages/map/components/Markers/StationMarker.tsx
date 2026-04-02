import { Space, useMantineColorScheme } from "@mantine/core";
import type { Station } from "@simrail/types";
import L from "leaflet";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Marker, Popup, Tooltip } from "react-leaflet";
import type { ProfileResponse } from "types/SteamProfile";
import type { XboxProfileResponse } from "types/XboxProfile";
import stationsList from "../EDR_station.json";
import styles from "../../styles/popups.module.css";

type StationMarkerProps = {
	station: Station;
};

export const StationMarker = ({ station }: StationMarkerProps) => {
	const [avatar, setAvatar] = useState<string | null>(null);
	const [username, setUsername] = useState<string | null>(null);

	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		async function getData() {
			if (station.DispatchedBy[0]) {
				if (station.DispatchedBy[0].SteamId != null) {
					const avatarRequest = await fetch(
						`https://simrail-edr.emeraldnetwork.xyz/steam/${station.DispatchedBy[0].SteamId}`,
					);
					const profile: ProfileResponse = await avatarRequest.json();
					setAvatar(profile.avatar);
					setUsername(profile.personaname);
				} else if (station.DispatchedBy[0].XboxId != null) {
					const avatarRequest = await fetch(
						`https://panel.simrail.eu:8084/users-open/${station.DispatchedBy[0].XboxId}`,
					);
					const response: XboxProfileResponse = await avatarRequest.json();
					const profile = response.data && response.data.length > 0 ? response.data[0] : null;
					setAvatar(null);
					setUsername(profile?.XboxInfo?.Gamertag ?? "Unknown");
				} else {
					setAvatar(null); // xbox currently bugged and sometimes not give any ID
					setUsername("Unknown");
				}
			} else {
				setAvatar(null);
				setUsername("BOT");
			}
		}
		getData();
	}, [station.DispatchedBy?.[0]]);

	const { colorScheme } = useMantineColorScheme();

	let botIcon = "/markers/icon-bot-simrail.jpg";
	if (
		colorScheme === "dark" ||
		(colorScheme === "auto" &&
			window.matchMedia("(prefers-color-scheme: dark)").matches)
	)
		botIcon = "/markers/icon-bot-simrail-dark.jpg";

	const icon = L.icon({
		iconUrl: station.DispatchedBy[0] && avatar ? avatar : botIcon,
		iconSize: [32, 32],
		popupAnchor: [0, -16],
		className: "station-avatar",
	});

	if (!username) return null;

	return (
		<Marker
			key={station.id}
			icon={icon}
			position={[station.Latititude, station.Longitude]}
			zIndexOffset={50}
			eventHandlers={{
				mouseover: (event) => event.target.openPopup(),
				mouseout: (event) => event.target.closePopup(),
				click: () => {
					// Find the corresponding station in the JSON file
					const stationEntry = Object.values(stationsList).find(
						(entry) => entry.srName === station.Name,
					);

					if (stationEntry) {
						router.push(
							`https://edr.simrail.app/${pathname.split("/")[2]}/station/${
								stationEntry.id
							}`,
						);
					} else {
						// Fallback to old behavior if station not found
						router.push(
							`https://edr.simrail.app/${
								pathname.split("/")[2]
							}/station/${station.Prefix.toUpperCase()}`,
						);
					}
				},
			}}
		>
			<Popup closeButton={false} className={styles.mapPopup}>
				<div className={styles.popupInner}>
					<img
						src={station.MainImageURL}
						alt={station.Name}
						width={200}
						height={86}
						className={styles.popupImage}
					/>
					<br />
					<strong>{station.Name} ({station.DifficultyLevel}/5)</strong>
					<br />
					Dispatcher: {username}
					<br />
				</div>
			</Popup>
			<Tooltip offset={[0, 20]} direction={"bottom"} permanent={true}>
				{station.Name}
			</Tooltip>
		</Marker>
	);
};
