import React, { useEffect, useRef } from "react";

const Testing = () => {
  console.log("In Testing.js");

  const hasLoadedBefore = useRef(true);
  useEffect(() => {
    if (hasLoadedBefore.current) {
      //your initializing code runs only once
      console.log("Effect ran");
      hasLoadedBefore.current = false;
    } else {
      //subsequent renders
    }
  }, []);

  return (
    <div>
      <p>dfd</p>
    </div>
  );
};

export default Testing;
