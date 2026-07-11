import { createContext, useContext } from "react";
import { useFetch } from "../hooks/useFetch.js";

const SettingsContext = createContext({});

export function SettingsProvider({ children }) {
  const { data } = useFetch("/settings");
  return (
    <SettingsContext.Provider value={data || {}}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
