import React, { createContext, useContext, useState } from "react";

const GenderContext = createContext();

export const useGenderContext = () => useContext(GenderContext);

export const GenderProvider = ({ children }) => {
  const [gender, setGender] = useState(""); // State for storing selected gender

  const updateGender = (newGender) => {
    setGender(newGender);
  };

  return (
    <GenderContext.Provider value={{ gender, updateGender }}>
      {children}
    </GenderContext.Provider>
  );
};
