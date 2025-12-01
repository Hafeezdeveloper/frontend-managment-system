import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Resident } from "./AdminDataContext";

interface ResidentContextType {
  currentResident: Resident | null;
  setCurrentResident: (resident: Resident | null) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const ResidentContext = createContext<ResidentContextType | undefined>(
  undefined,
);

export const ResidentProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentResident, setCurrentResident] = useState<Resident | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedResident = localStorage.getItem("currentResident");
    if (storedResident) {
      try {
        const parsedResident = JSON.parse(storedResident);
        setCurrentResident(parsedResident);
      } catch (error) {
        console.error("Error parsing stored resident data:", error);
        localStorage.removeItem("currentResident");
      }
    }
  }, []);

  // Save to localStorage when currentResident changes
  useEffect(() => {
    if (currentResident) {
      localStorage.setItem("currentResident", JSON.stringify(currentResident));
    } else {
      localStorage.removeItem("currentResident");
    }
  }, [currentResident]);

  const logout = () => {
    setCurrentResident(null);
    localStorage.removeItem("currentResident");
  };

  const isAuthenticated = currentResident !== null;

  const contextValue: ResidentContextType = {
    currentResident,
    setCurrentResident,
    logout,
    isAuthenticated,
  };

  return (
    <ResidentContext.Provider value={contextValue}>
      {children}
    </ResidentContext.Provider>
  );
};

export const useResident = () => {
  const context = useContext(ResidentContext);
  if (context === undefined) {
    throw new Error("useResident must be used within a ResidentProvider");
  }
  return context;
};
