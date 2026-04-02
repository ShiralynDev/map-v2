import type { Station } from "@simrail/types";
import L from "leaflet";
import { Marker, Popup } from "react-leaflet";
import styles from "../../styles/popups.module.css";

type StationMarkerProps = {
	station: Station;
};

export const RemoteStationMarker = ({ station }: StationMarkerProps) => {
	const icon = L.icon({
		iconUrl: "/markers/icon-station-remote.png",
		iconSize: [16, 16],
		popupAnchor: [0, -16],
	});

	return (
		// make "User: {username}" work in a good way with the data from the station list used in Map.tsx and sync with this station.id
		<Marker
			key={station.id}
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
				</div>
			</Popup>
		</Marker>
	);
};
