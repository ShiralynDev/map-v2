import { RemoteStationMarker } from "@/components/Markers/StationRemoteMarker";
import stationsJson from "@/components/stationsRemote.json";
import React, { type FC } from "react";
import { Station } from "@simrail/types"

type RemoteStationsProps = {
	stations: Station[] | null;
};

const RemoteStations: FC<RemoteStationsProps> = ({ stations }) => (
	<>
		{stationsJson.map((remoteStation) => {
			const mainStation = stations?.find((s) => s.Name === remoteStation.id);

			return (
				<RemoteStationMarker
					key={remoteStation.Name} // name is unique, id is the station it is dispatched from and therefor might not be unique in the future
					station={remoteStation}
					mainStation={mainStation}
				/>
			);
		})}
	</>
);

export default React.memo(RemoteStations);
