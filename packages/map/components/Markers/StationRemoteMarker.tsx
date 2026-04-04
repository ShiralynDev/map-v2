import type { Station } from "@simrail/types";
import L from "leaflet";
import { Marker, Popup, Tooltip } from "react-leaflet";
import styles from "../../styles/popups.module.css";
import { useState, useEffect } from "react"
import type { ProfileResponse } from "types/SteamProfile";
import type { XboxProfileResponse } from "types/XboxProfile";
import { useMantineColorScheme } from "@mantine/core";

type StationMarkerProps = {
	station: Station;
	mainStation?: Station;
};

export const RemoteStationMarker = ({ station, mainStation }: StationMarkerProps) => {
	const [avatar, setAvatar] = useState<string | null>(null);
	const [username, setUsername] = useState<string | null>(null);

	useEffect(() => {
		async function getData() {
			if (mainStation) {
				if (mainStation.DispatchedBy[0]) {
					if (mainStation.DispatchedBy[0].SteamId != null) {
						const avatarRequest = await fetch(
							`https://simrail-edr.emeraldnetwork.xyz/steam/${mainStation.DispatchedBy[0].SteamId}`,
						);
						const profile: ProfileResponse = await avatarRequest.json();
						setAvatar(profile.avatar);
						setUsername(profile.personaname);
					} else if (mainStation.DispatchedBy[0].XboxId != null) {
						const avatarRequest = await fetch(
							`https://panel.simrail.eu:8084/users-open/${mainStation.DispatchedBy[0].XboxId}`,
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
		}
		getData();
	}, [mainStation?.DispatchedBy?.[0]]);

	const { colorScheme } = useMantineColorScheme();
	
	let botIcon = "/markers/icon-bot-simrail.jpg";
	if (
		colorScheme === "dark" ||
		(colorScheme === "auto" &&
			window.matchMedia("(prefers-color-scheme: dark)").matches)
	)
		botIcon = "/markers/icon-bot-simrail-dark.jpg";

	const icon = L.icon({
		iconUrl: (mainStation?.DispatchedBy[0] && avatar) ? avatar : botIcon,
		iconSize: [20, 20],
		popupAnchor: [0, -16],
		className: "station-avatar",
	});

	return (
		<Marker
			key={station.Name}
			icon={icon}
			position={[station.Latititude, station.Longitude]}
			zIndexOffset={30}
			eventHandlers={{
				mouseover: (event) => event.target.openPopup(),
				mouseout: (event) => event.target.closePopup(),
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
					<strong>{station.Name}</strong>
					<br />
					From: {station.id}
					<br />
					{username && (
						<>
							Dispatcher: {username}
							<br />
						</>
					)}
				</div>
			</Popup>
			<Tooltip offset={[0, 10]} direction={"bottom"} permanent={true}>
					LCS: {station.Name}
			</Tooltip>
		</Marker>
	);
};
