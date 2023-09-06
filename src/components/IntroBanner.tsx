"use client";
import { useState, useEffect } from "react";

export default function IntroBanner() {
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    setShowText(true);
  }, []);

  return (
    <div className="bg-peach-200 h-screen flex justify-center items-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          {showText && (
            <span className="inline-block">
              Hi there! I'm Nima,{" "}
              <span className="inline-block border-b-2 border-teal-500 typing-animation">
                a frontend developer, UX designer and accessibility specialist
              </span>
            </span>
          )}
        </h1>
      </div>
    </div>
  );
}
