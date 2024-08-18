import { useEffect, useState } from "react";

export function useCycleTab(
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
