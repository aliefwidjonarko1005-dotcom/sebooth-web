"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Orientation = "landscape" | "portrait";

interface OrientationContextType {
  orientation: Orientation;
  toggleOrientation: () => void;
  setOrientation: (val: Orientation) => void;
}

const OrientationContext = createContext<OrientationContextType | undefined>(undefined);

export function OrientationProvider({ children }: { children: React.ReactNode }) {
  const [orientation, setOrientationState] = useState<Orientation>("landscape");

  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      document.documentElement.removeAttribute("data-orientation");
      setOrientationState("landscape");
      return;
    }

    const stored = localStorage.getItem("sebooth-orientation") as Orientation | null;
    if (stored === "portrait" || stored === "landscape") {
      setOrientation(stored);
    } else {
      // Basic auto-detection if no preference
      if (window.innerHeight > window.innerWidth) {
        setOrientation("portrait");
      } else {
        setOrientation("landscape");
      }
    }
  }, []);

  const setOrientation = (val: Orientation) => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      document.documentElement.removeAttribute("data-orientation");
      setOrientationState("landscape");
      return;
    }

    setOrientationState(val);
    localStorage.setItem("sebooth-orientation", val);
    
    // Apply dataset attribute to HTML tag for Tailwind selectors
    document.documentElement.dataset.orientation = val;
  };

  const toggleOrientation = () => {
    setOrientation(orientation === "landscape" ? "portrait" : "landscape");
  };

  return (
    <OrientationContext.Provider value={{ orientation, toggleOrientation, setOrientation }}>
      {children}
    </OrientationContext.Provider>
  );
}

export function useOrientation() {
  const context = useContext(OrientationContext);
  if (context === undefined) {
    throw new Error("useOrientation must be used within an OrientationProvider");
  }
  return context;
}
