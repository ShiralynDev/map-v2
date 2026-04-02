import type { Station } from "@simrail/types";
import L from "leaflet";
import { Marker, Popup } from "react-leaflet";
import styles from "../../styles/popups.module.css";

type StationMarkerProps = {
	station: Station;
};

export const NonPlayableStationMarker = ({ station }: StationMarkerProps) => {
	const icon = L.icon({
		iconUrl: "/markers/icon-train-station.png",
		iconSize: [16, 16],
		popupAnchor: [0, -8],
	});

	return (
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
					<strong>{station.Name}</strong>
				</div>
			</Popup>
		</Marker>
	);
};
