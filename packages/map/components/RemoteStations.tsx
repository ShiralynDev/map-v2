import { RemoteStationMarker } from "@/components/Markers/StationRemoteMarker";
import stationsJson from "@/components/stationsRemote.json";
import React, { type FC } from "react";
import { Station } from "@simrail/types";

type RemoteStationsProps = {
	stations: Station[] | null;
	visibleMainStations?: Set<string> | null;
};

const RemoteStations: FC<RemoteStationsProps> = ({ stations, visibleMainStations }) => (
	<>
		{stationsJson.map((remoteStation) => {
			const mainStation = stations?.find((s) => s.Name === remoteStation.id);

			if (!mainStation) return null;
			if (visibleMainStations && !visibleMainStations.has(mainStation.Name)) return null;

			return (
				<RemoteStationMarker
					key={remoteStation.Name} // name is unique, id is the station it is dispatched from and therefore might not be unique in the future
					station={remoteStation}
					mainStation={mainStation}
				/>
			);
		})}
	</>
);

export default React.memo(RemoteStations);
