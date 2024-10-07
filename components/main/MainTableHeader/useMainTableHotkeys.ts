import { useHotkeys } from "react-hotkeys-hook";
import { useCycleContext } from "../MainTable";

export default function useMainTableHotkeys() {
	const { selectedCycleId, updateCycleId, cycles } = useCycleContext();
	useHotkeys(["meta+arrowright", "ctrl+arrowright"], (evt) => {
		if (!cycles) return;

		const currentIndex = cycles.findIndex((c) => c.id === selectedCycleId);

		const nextIndex = currentIndex + 1 >= cycles.length ? 0 : currentIndex + 1;
		return updateCycleId(cycles[nextIndex].id);
	});

	useHotkeys(["meta+arrowleft", "ctrl+arrowleft"], (evt) => {
		if (!cycles) return;

		const currentIndex = cycles.findIndex((c) => c.id === selectedCycleId);
		const prevIndex =
			currentIndex - 1 < 0 ? cycles.length - 1 : currentIndex - 1;
		return updateCycleId(cycles[prevIndex].id);
	});
}
