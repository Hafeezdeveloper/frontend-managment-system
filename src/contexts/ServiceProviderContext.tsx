import React, { createContext, useContext, useState, useEffect } from "react";

interface ServiceProvider {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  idDocumentType: "CNIC" | "Passport" | "Driver License";
  cnicNumber?: string;
  passportNumber?: string;
  driverLicenseNumber?: string;
  serviceCategory: string;
  keywords: string;
  shortIntro: string;
  experience: string;
  previousWork: string;
  certifications: string;
  availability: string;
  serviceArea: string;
  profilePhoto?: string;
  additionalNotes: string;
  registrationDate: string;
  status: "Pending" | "Active" | "Rejected" | "Suspended";
  rating?: number;
  totalReviews?: number;
  completedJobs?: number;
}

interface ServiceProviderContextType {
  currentServiceProvider: ServiceProvider | null;
  setCurrentServiceProvider: (serviceProvider: ServiceProvider | null) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading?: boolean; // Add loading state
}

const ServiceProviderContext = createContext<
  ServiceProviderContextType | undefined
>(undefined);

export const ServiceProviderProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [currentServiceProvider, setCurrentServiceProviderState] =
    useState<ServiceProvider | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Track loading state

  useEffect(() => {
    const loadServiceProvider = async () => {
      const savedServiceProvider = localStorage.getItem("currentServiceProvider");
      if (savedServiceProvider) {
        try {
          const parsed = JSON.parse(savedServiceProvider);
          // Validate that we have essential fields (id or _id, email, username)
          if (parsed && (parsed.id || parsed._id) && parsed.email && parsed.username) {
            setCurrentServiceProviderState(parsed);
          } else {
            console.warn("Invalid service provider data in localStorage");
            localStorage.removeItem("currentServiceProvider");
          }
        } catch (error) {
          console.error("Failed to parse service provider:", error);
          localStorage.removeItem("currentServiceProvider");
        }
      }
      setIsLoading(false);
    };

    loadServiceProvider();
  }, []);

  const setCurrentServiceProvider = (
    serviceProvider: ServiceProvider | null,
  ) => {
    setCurrentServiceProviderState(serviceProvider);
    if (serviceProvider) {
      localStorage.setItem(
        "currentServiceProvider",
        JSON.stringify(serviceProvider),
      );
    }
    // else {
    //   localStorage.removeItem("currentServiceProvider");
    // }
  };

  const logout = () => {
    setCurrentServiceProviderState(null);
    localStorage.removeItem("currentServiceProvider");
  };
  console.log("wadwad currentServiceProvider !== null", currentServiceProvider !== null)
  const isAuthenticated = currentServiceProvider !== null;

  return (
    <ServiceProviderContext.Provider
      value={{
        currentServiceProvider,
        setCurrentServiceProvider,
        logout,
        isAuthenticated,
        isLoading,
      }}
    >
      {children}
    </ServiceProviderContext.Provider>
  );
};

export const useServiceProvider = () => {
  const context = useContext(ServiceProviderContext);
  if (context === undefined) {
    throw new Error(
      "useServiceProvider must be used within a ServiceProviderProvider",
    );
  }
  return context;
};

export type { ServiceProvider };
