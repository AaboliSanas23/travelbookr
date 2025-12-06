import React from "react";
import TravelBookingForm from "./travelBookingForm.jsx";
import "./index.css";
const App = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-[97vw] ">
        <TravelBookingForm />
      </div>
    </div>
  );
};

export default App;
