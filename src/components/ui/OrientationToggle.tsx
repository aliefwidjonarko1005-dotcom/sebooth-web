"use client";

import { MonitorSmartphone, Smartphone } from "lucide-react";
import { useOrientation } from "../layout/OrientationProvider";
import { motion } from "framer-motion";

export function OrientationToggle() {
  const { orientation, toggleOrientation } = useOrientation();

  return (
    <motion.button
      onClick={toggleOrientation}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-24 right-6 z-50 p-4 bg-gray-900 text-white rounded-full shadow-2xl flex items-center justify-center border border-white/20 transition-colors hover:bg-gray-800"
      title="Toggle Screen Orientation"
    >
      <div className="relative flex items-center justify-center">
        {orientation === "landscape" ? (
          <MonitorSmartphone className="w-6 h-6 text-green-400" />
        ) : (
          <Smartphone className="w-6 h-6 text-green-400" />
        )}
      </div>
    </motion.button>
  );
}
