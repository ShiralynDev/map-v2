import { getSteamProfileOrBot, getXboxProfile } from "@/components/profile";
import { readLocalStorageValue } from "@mantine/hooks";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSelectedTrain } from "../contexts/SelectedTrainContext";
import styles from "../styles/SelectedTrainPopup.module.css";
import TrainText from "./TrainText";

const SelectedTrainPopup = () => {
	const { selectedTrain } = useSelectedTrain();
	const renderPopup = readLocalStorageValue({
		key: "renderPopup",
		defaultValue: true,
	});

	const [avatar, setAvatar] = useState<string | null>(null);
	const [username, setUsername] = useState<string | null>(null);
	const router = useRouter();
	const { trainId } = router.query;

	type Profile = [string | null, string | null];

	const setData = ([avatarUrl, username]: Profile) => {
		setAvatar(avatarUrl);
		setUsername(username);
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies:
	useEffect(() => {
		if (selectedTrain) {
			if (selectedTrain.TrainData.ControlledBySteamID) {
				getSteamProfileOrBot(selectedTrain.TrainData.ControlledBySteamID).then( // support xbox players
					// @ts-ignore
					setData,
				);
			} else if (selectedTrain.TrainData.ControlledByXboxID) {
				getXboxProfile(selectedTrain.TrainData.ControlledByXboxID).then(
					// @ts-ignore
					setData,
				)
			} else {
				setData([null, "BOT"]);
			}
		}
	}, [selectedTrain]);

	if (renderPopup === true) {
		return selectedTrain ? (
			<div className={styles.popup} style={trainId ? { top: "0px" } : {}}>
				<TrainText
					train={selectedTrain}
					username={username ?? ""}
					avatar={avatar}
				/>
			</div>
		) : null;
	}
	return null;
};

export default SelectedTrainPopup;
