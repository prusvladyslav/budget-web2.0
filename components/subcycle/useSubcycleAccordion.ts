import { useEffect, useState } from "react";

export function useSubcycleState(
  initialSubcycleId: string,
  debouncedUpdateUserSubcycle: (value: string) => void
) {
  const [selectedSubcycle, setSelectedSubcycle] = useState(initialSubcycleId);

  const updateSelectedSubcycleValue = (value: string) => {
    setSelectedSubcycle(value);
  };

  useEffect(() => {
    if (selectedSubcycle) {
      debouncedUpdateUserSubcycle(selectedSubcycle);
    }
  }, [selectedSubcycle, debouncedUpdateUserSubcycle]);

  return { selectedSubcycle, updateSelectedSubcycleValue };
}
