import { useState, useEffect, useCallback } from "react";
import debounce from "lodash.debounce";
import { usersActions } from "@/app/actions";

interface CycleState {
  lastOpenedCycleId: string;
  lastOpenedSubcycleId: string;
}

export function useCycleState(initialCycle: string, initialSubcycle: string) {
  const [state, setState] = useState<CycleState>({
    lastOpenedCycleId: initialCycle,
    lastOpenedSubcycleId: initialSubcycle,
  });

  const debouncedUpdateUser = useCallback(
    debounce((updates: Partial<CycleState>) => {
      usersActions.updateUser(updates);
    }, 1000),
    []
  );

  useEffect(() => {
    debouncedUpdateUser(state);
  }, [state, debouncedUpdateUser]);

  const updateCycle = useCallback((newCycle: string) => {
    setState((prev) => ({
      lastOpenedCycleId: newCycle,
      lastOpenedSubcycleId: "",
    }));
  }, []);

  const updateSubcycle = useCallback((newSubcycle: string) => {
    setState((prev) => ({
      ...prev,
      lastOpenedSubcycleId: newSubcycle,
    }));
  }, []);

  return {
    selectedCycle: state.lastOpenedCycleId,
    selectedSubcycle: state.lastOpenedSubcycleId,
    updateCycle,
    updateSubcycle,
  };
}
