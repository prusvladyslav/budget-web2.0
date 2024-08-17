import { updateUser } from "@/app/actions";
import debounce from "lodash.debounce";
import { useCallback, useState, useEffect } from "react";

export function useDebouncedUserUpdate(key: string, delay = 1000) {
  return useCallback(
    debounce(async (value: string) => {
      await updateUser({ key, value });
    }, delay),
    []
  );
}

export function useCycleState(
  initialCycleId: string,
  debouncedUpdateUserCycle: (value: string) => void
) {
  const [selectedCycle, setSelectedCycle] = useState(initialCycleId);

  const updateSelectedCycleValue = (value: string) => {
    setSelectedCycle(value);
  };

  useEffect(() => {
    if (selectedCycle) {
      debouncedUpdateUserCycle(selectedCycle);
    }
  }, [selectedCycle, debouncedUpdateUserCycle]);

  return { selectedCycle, updateSelectedCycleValue };
}
