import React, { useMemo, useState } from "react";
import {
  useForm,
  useFieldArray,
} from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { AnimatePresence, motion } from "framer-motion";

// Country data for dropdowns
const countries = [
  { code: "IN", name: "India", cities: ["Mumbai (BOM)", "Delhi (DEL)", "Bengaluru (BLR)", "Hyderabad (HYD)", "Goa (GOI)", "Chennai (MAA)"] },
  { code: "AE", name: "United Arab Emirates", cities: ["Dubai (DXB)", "Abu Dhabi (AUH)", "Sharjah (SHJ)"] },
  { code: "SG", name: "Singapore", cities: ["Singapore (SIN)"] },
  { code: "GB", name: "United Kingdom", cities: ["London (LHR)", "London (LGW)", "Manchester (MAN)"] },
  { code: "US", name: "United States", cities: ["New York (JFK)", "Los Angeles (LAX)", "Chicago (ORD)", "San Francisco (SFO)"] },
  { code: "JP", name: "Japan", cities: ["Tokyo (HND)", "Tokyo (NRT)", "Osaka (KIX)"] },
  { code: "FR", name: "France", cities: ["Paris (CDG)", "Paris (ORY)", "Nice (NCE)"] },
  { code: "AU", name: "Australia", cities: ["Sydney (SYD)", "Melbourne (MEL)", "Brisbane (BNE)"] },
  { code: "CA", name: "Canada", cities: ["Toronto (YYZ)", "Vancouver (YVR)", "Montreal (YUL)"] },
  { code: "DE", name: "Germany", cities: ["Frankfurt (FRA)", "Munich (MUC)", "Berlin (BER)"] },
  { code: "TH", name: "Thailand", cities: ["Bangkok (BKK)", "Phuket (HKT)"] },
  { code: "MY", name: "Malaysia", cities: ["Kuala Lumpur (KUL)", "Penang (PEN)"] },
];

const airports = countries.flatMap(country => country.cities);

// Custom Select Component
const CountrySelect = ({ label, name, register, error, placeholder, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredCountries = countries.filter(country => 
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.cities.some(city => city.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelect = (city) => {
    onChange(city);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          {...register(name)}
          type="text"
          value={value}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            onChange(e.target.value);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full rounded-xl bg-white dark:bg-slate-900/70 border border-slate-300 dark:border-slate-600 px-4 py-3.5 text-base text-slate-900 dark:text-slate-50 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-cyan-400/20 transition-all"
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500"
        >
          {isOpen ? "▲" : "▼"}
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-800/95 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 max-h-64 overflow-y-auto">
          {filteredCountries.length > 0 ? (
            filteredCountries.map((country) => (
              <div key={country.code} className="border-b border-slate-100 dark:border-slate-700 last:border-b-0">
                <div className="px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50">
                  {country.name}
                </div>
                {country.cities.map((city) => (
                  <div
                    key={city}
                    className="px-6 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-700/80 cursor-pointer transition-colors"
                    onClick={() => handleSelect(city)}
                  >
                    {city}
                  </div>
                ))}
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
              No results found
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-rose-600 dark:text-rose-400 mt-2 flex items-center gap-1">
          <span>⚠</span> {error.message}
        </p>
      )}
    </div>
  );
};

// --- Yup schema ---
const bookingSchema = yup.object({
  tripType: yup.string().required("Please select a trip type"),
  from: yup.string().required("Origin is required"),
  to: yup.string().required("Destination is required"),
  departureDate: yup.string().required("Departure date is required"),
  returnDate: yup.string().when("tripType", {
    is: (val) => val === "roundtrip",
    then: (schema) => schema.required("Return date is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  classType: yup.string().required("Please select a class"),
  passengers: yup
    .array()
    .of(
      yup.object({
        firstName: yup.string().required("First name is required"),
        lastName: yup.string().required("Last name is required"),
        age: yup
          .number()
          .typeError("Age must be a number")
          .min(0)
          .max(120)
          .required("Age is required"),
        gender: yup.string().required("Gender is required"),
      })
    )
    .min(1, "At least one passenger is required"),
  seats: yup
    .array()
    .of(yup.string())
    .min(1, "Please select at least one seat"),
  extras: yup.object({
    meals: yup.boolean(),
    baggage: yup.boolean(),
    insurance: yup.boolean(),
  }),
  cardName: yup.string().required("Name on card is required"),
  cardNumber: yup
    .string()
    .required("Card number is required")
    .min(16, "Card number must be at least 16 digits"),
  expiry: yup.string().required("Expiry is required"),
  cvv: yup
    .string()
    .required("CVV is required")
    .min(3, "CVV must be at least 3 digits"),
});

const steps = [
  { title: "Trip Type", subtitle: "Choose your journey style" },
  { title: "Flight Details", subtitle: "Where & when are you flying?" },
  { title: "Passengers", subtitle: "Who's travelling?" },
  { title: "Seat Selection", subtitle: "Pick your perfect seat" },
  { title: "Extras", subtitle: "Enhance your trip" },
  { title: "Summary", subtitle: "Review your itinerary" },
  { title: "Payment", subtitle: "Secure your booking" },
  { title: "Success", subtitle: "You're all set!" },
];

const rows = ["A", "B", "C", "D"];
const cols = [1, 2, 3, 4, 5, 6];

const TravelBookingForm = () => {
  const [step, setStep] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [fromInput, setFromInput] = useState("");
  const [toInput, setToInput] = useState("");

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark");
  };

  const {
    register,
    handleSubmit,
    control,
    setValue,
    trigger,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(bookingSchema),
    defaultValues: {
      tripType: "oneway",
      from: "",
      to: "",
      departureDate: "",
      returnDate: "",
      classType: "economy",
      passengers: [
        {
          firstName: "",
          lastName: "",
          age: "",
          gender: "Female",
        },
      ],
      seats: [],
      extras: {
        meals: true,
        baggage: false,
        insurance: true,
      },
      cardName: "",
      cardNumber: "",
      expiry: "",
      cvv: "",
    },
    mode: "onChange",
  });

  const { fields: passengerFields, append, remove } = useFieldArray({
    control,
    name: "passengers",
  });

  const values = watch();

  // --- helper: step-specific validation fields ---
  const stepFieldNames = [
    ["tripType"],
    ["from", "to", "departureDate", "returnDate", "classType"],
    ["passengers"],
    ["seats"],
    ["extras"],
    [], // summary (no new fields)
    ["cardName", "cardNumber", "expiry", "cvv"],
  ];

  const computePrice = useMemo(() => {
    const passengerCount = values.passengers?.length || 1;
    let base = 5000;

    if (values.classType === "business") base *= 2.1;
    if (values.classType === "first") base *= 3.4;

    let extras = 0;
    if (values.extras?.meals) extras += 400;
    if (values.extras?.baggage) extras += 900;
    if (values.extras?.insurance) extras += 600;

    const subtotal = base * passengerCount + extras * passengerCount;
    const taxes = subtotal * 0.18;
    const total = subtotal + taxes;

    return {
      passengerCount,
      base: Math.round(base),
      extras: Math.round(extras * passengerCount),
      taxes: Math.round(taxes),
      total: Math.round(total),
    };
  }, [values]);

  const goToNext = async () => {
    if (step === steps.length - 2) return; // last "real" step handled by submit

    const fields = stepFieldNames[step];
    if (fields.length) {
      const valid = await trigger(fields);
      if (!valid) return;
    }
    setStep((s) => s + 1);
  };

  const goToPrev = () => {
    if (step === 0) return;
    setStep((s) => s - 1);
  };

  const toggleSeat = (seatId) => {
    const current = values.seats || [];
    const exists = current.includes(seatId);
    const next = exists
      ? current.filter((s) => s !== seatId)
      : [...current, seatId];

    setValue("seats", next, { shouldValidate: true });
  };

  const onSubmit = (data) => {
    console.log("Booking data:", data);
    setIsSubmitted(true);
    setStep(7);
  };

  // Reset form and start over
  const handleNewBooking = () => {
    reset({
      tripType: "oneway",
      from: "",
      to: "",
      departureDate: "",
      returnDate: "",
      classType: "economy",
      passengers: [
        {
          firstName: "",
          lastName: "",
          age: "",
          gender: "Female",
        },
      ],
      seats: [],
      extras: {
        meals: true,
        baggage: false,
        insurance: true,
      },
      cardName: "",
      cardNumber: "",
      expiry: "",
      cvv: "",
    });
    setFromInput("");
    setToInput("");
    setIsSubmitted(false);
    setStep(0);
  };

  // --- animations ---
  const stepVariants = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -16 },
  };

  const confettiPieces = Array.from({ length: 40 });

  return (
    <div className="relative px-4 py-1 min-h-[90vh] flex items-center justify-center">
      {/* Glow effects */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-indigo-300/30 dark:bg-cyan-500/20 blur-3xl" />
        <div className="absolute top-1/3 -right-10 h-80 w-80 rounded-full bg-amber-200/20 dark:bg-indigo-500/25 blur-3xl" />
        <div className="absolute -bottom-32 left-1/4 h-64 w-64 rounded-full bg-emerald-200/20 dark:bg-emerald-500/20 blur-3xl" />
      </div>

      {/* Theme Toggle - Fixed position */}
      <div className="fixed top-6 right-6 z-50">
        <button
          type="button"
          onClick={toggleTheme}
          className="px-4 py-2.5 rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 backdrop-blur-sm text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg transition-all duration-300 flex items-center gap-2 text-sm font-medium shadow-md"
        >
          {theme === "dark" ? (
            <>
              <span className="text-amber-500">☀</span> Light Mode
            </>
          ) : (
            <>
              <span className="text-indigo-400">🌙</span> Dark Mode
            </>
          )}
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-[95vw] max-w-8xl mx-auto backdrop-blur-xl bg-white/90 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-700/50 rounded-3xl shadow-2xl shadow-slate-300/30 dark:shadow-slate-900/50 overflow-hidden"
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-3 text-slate-900 dark:text-slate-50">
                <span className="bg-gradient-to-r from-indigo-500 to-cyan-500 dark:from-cyan-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  ✨ Luxury Travel Booking
                </span>
              </h1>
              <p className="text-base text-slate-600 dark:text-slate-400 mt-2 max-w-2xl">
                Curated flights. Premium seats. Smooth checkout. Experience travel reimagined.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700/50 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Secure booking · 256-bit SSL
              </div>
            </div>
          </div>

          {/* Stepper */}
          <div className="mt-8">
            <div className="flex items-center gap-3 text-sm mb-3">
              <span className="font-semibold text-indigo-600 dark:text-cyan-400">
                Step {Math.min(step + 1, steps.length)}/{steps.length}
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-700 dark:text-slate-300">{steps[step].title}</span>
            </div>
            <div className="relative h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 via-cyan-500 to-emerald-500 dark:from-cyan-400 dark:via-indigo-400 dark:to-emerald-400 rounded-full"
                style={{ width: `${((step + 1) / steps.length) * 100}%` }}
                layout
                transition={{ type: "spring", stiffness: 80, damping: 20 }}
              />
            </div>
          </div>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-6 md:px-8 py-8 md:py-10 grid lg:grid-cols-[3fr,2fr] gap-8">
            {/* Left: step content */}
            <div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  variants={stepVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <h2 className="text-xl md:text-2xl font-semibold mb-2 flex items-center gap-3 text-slate-900 dark:text-slate-50">
                    <span className="h-8 w-1 rounded-full bg-gradient-to-b from-indigo-500 to-cyan-500"></span>
                    {steps[step].title}
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                    {steps[step].subtitle}
                  </p>

                  {/* STEP CONTENT SWITCH */}
                  {step === 0 && (
                    <StepTripType
                      register={register}
                      current={values.tripType}
                      error={errors.tripType}
                    />
                  )}

                  {step === 1 && (
                    <StepFlightDetails
                      register={register}
                      errors={errors}
                      tripType={values.tripType}
                      fromInput={fromInput}
                      setFromInput={setFromInput}
                      toInput={toInput}
                      setToInput={setToInput}
                      setValue={setValue}
                    />
                  )}

                  {step === 2 && (
                    <StepPassengers
                      register={register}
                      errors={errors}
                      passengerFields={passengerFields}
                      append={append}
                      remove={remove}
                    />
                  )}

                  {step === 3 && (
                    <StepSeats
                      rows={rows}
                      cols={cols}
                      selected={values.seats || []}
                      toggleSeat={toggleSeat}
                      error={errors.seats}
                    />
                  )}

                  {step === 4 && (
                    <StepExtras
                      register={register}
                      extras={values.extras || {}}
                    />
                  )}

                  {step === 5 && (
                    <StepSummary
                      values={values}
                      price={computePrice}
                    />
                  )}

                  {step === 6 && (
                    <StepPayment
                      register={register}
                      errors={errors}
                    />
                  )}

                  {step === 7 && (
                    <StepSuccess
                      values={values}
                      price={computePrice}
                      confettiPieces={confettiPieces}
                      onNewBooking={handleNewBooking}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right: live summary sidebar (hidden for success step) */}
            {step !== 7 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm p-5 md:p-6 flex flex-col gap-5 shadow-lg shadow-slate-200/20 dark:shadow-slate-900/20"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Trip Snapshot
                  </h3>
                  <span className="text-[11px] px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-cyan-500/15 text-indigo-700 dark:text-cyan-200 border border-indigo-200 dark:border-cyan-500/30 font-medium">
                    Live Preview
                  </span>
                </div>

                <div className="space-y-4 text-sm">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-50 to-cyan-50 dark:from-slate-800/50 dark:to-slate-900/50 border border-indigo-100 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-600 dark:text-slate-400">Trip Type</span>
                      <span className="font-medium text-slate-900 dark:text-slate-50 capitalize">
                        {values.tripType === "oneway"
                          ? "One-way"
                          : values.tripType === "roundtrip"
                          ? "Round-trip"
                          : "Multi-city"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-600 dark:text-slate-400 block mb-1">
                          Route
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900 dark:text-slate-50">
                            {values.from || "Origin"}
                          </span>
                          <span className="text-slate-500">→</span>
                          <span className="font-medium text-slate-900 dark:text-slate-50">
                            {values.to || "Destination"}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-600 dark:text-slate-400">Class</div>
                        <div className="font-medium text-slate-900 dark:text-slate-50 capitalize">
                          {values.classType}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                      <div className="text-xs text-slate-600 dark:text-slate-400">Passengers</div>
                      <div className="text-lg font-bold text-slate-900 dark:text-slate-50 mt-1">
                        {values.passengers?.length || 1}
                      </div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                      <div className="text-xs text-slate-600 dark:text-slate-400">Seats</div>
                      <div className="text-lg font-bold text-slate-900 dark:text-slate-50 mt-1">
                        {values.seats?.length || 0}
                      </div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                      <div className="text-xs text-slate-600 dark:text-slate-400">Extras</div>
                      <div className="text-lg font-bold text-slate-900 dark:text-slate-50 mt-1">
                        {Object.values(values.extras || {}).filter(Boolean).length}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-2.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-700 dark:text-slate-300">Base Fare × {computePrice.passengerCount}</span>
                      <span className="font-medium text-slate-900 dark:text-slate-50">₹{computePrice.base * computePrice.passengerCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-700 dark:text-slate-300">Extras & Add-ons</span>
                      <span className="font-medium text-slate-900 dark:text-slate-50">₹{computePrice.extras}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-700 dark:text-slate-300">Taxes & Fees</span>
                      <span className="font-medium text-slate-900 dark:text-slate-50">₹{computePrice.taxes}</span>
                    </div>
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between text-base font-bold">
                        <span className="text-slate-900 dark:text-slate-50">Total Payable</span>
                        <span className="text-indigo-600 dark:text-cyan-300 text-lg">
                          ₹{computePrice.total}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Fully protected checkout with 256-bit encryption. Cancel or modify most bookings easily before departure.
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer buttons (except success step) */}
          {step !== 7 && (
            <div className="px-6 md:px-8 pb-7 pt-5 border-t border-slate-200 dark:border-slate-700 bg-gradient-to-r from-white/50 to-slate-50/50 dark:from-slate-900/20 dark:to-slate-900/40 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={goToPrev}
                disabled={step === 0}
                className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition-all ${
                  step === 0
                    ? "border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-600 cursor-not-allowed bg-slate-100 dark:bg-slate-900"
                    : "border-slate-400 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-indigo-400 dark:hover:border-cyan-500 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-50 hover:shadow-md"
                }`}
              >
                <span className="text-lg">←</span> Back
              </button>

              <div className="flex items-center gap-3">
                {step < 6 && (
                  <button
                    type="button"
                    onClick={goToNext}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-cyan-600 dark:from-cyan-500 dark:via-indigo-500 dark:to-indigo-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/40 dark:shadow-cyan-500/30 hover:shadow-xl hover:shadow-indigo-500/50 dark:hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-95 transition-all duration-300"
                  >
                    Continue
                    <span className="text-lg">→</span>
                  </button>
                )}

                {step === 6 && (
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-emerald-400 dark:to-emerald-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/50 hover:scale-[1.02] active:scale-95 transition-all duration-300"
                  >
                    Pay & Book Now
                    <span className="text-lg">💳</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </form>

        {/* Subtle "saved" indicator */}
        {isSubmitted && (
          <div className="px-6 pb-6 text-center text-xs text-emerald-600 dark:text-emerald-300 font-medium">
            Booking captured in console log for demo purposes.
          </div>
        )}
      </motion.div>
    </div>
  );
};

// --- STEP COMPONENTS ---

const StepTripType = ({ register, current, error }) => {
  const options = [
    { id: "oneway", label: "One-way", desc: "Perfect for single direction", icon: "→" },
    { id: "roundtrip", label: "Round-trip", desc: "Return flights included", icon: "↔" },
    { id: "multicity", label: "Multi-City", desc: "Advanced routing", icon: "⇄" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {options.map((opt) => (
          <label key={opt.id} className="block cursor-pointer group">
            <input
              {...register("tripType")}
              type="radio"
              value={opt.id}
              className="hidden"
            />
            <div
              className={`relative h-[160px] rounded-2xl border-2 px-5 py-5
                          bg-white dark:bg-slate-800/70 backdrop-blur-sm transition-all duration-300
                          flex flex-col justify-between
                          group-hover:border-indigo-400 dark:group-hover:border-cyan-400
                ${
                  current === opt.id
                    ? "border-indigo-500 dark:border-cyan-400 shadow-lg shadow-indigo-200/50 dark:shadow-cyan-500/20"
                    : "border-slate-300 dark:border-slate-700"
                }`}
            >
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-cyan-400 transition-colors">
                    {opt.icon}
                  </span>
                  <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center
                                  transition-all duration-300
                    ${
                      current === opt.id
                        ? "border-indigo-500 dark:border-cyan-400 bg-indigo-100 dark:bg-cyan-500/20"
                        : "border-slate-400 dark:border-slate-600"
                    }`}
                  >
                    {current === opt.id && (
                      <div className="h-2 w-2 rounded-full bg-indigo-500 dark:bg-cyan-400"></div>
                    )}
                  </div>
                </div>
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {opt.label}
                </p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-snug">
                  {opt.desc}
                </p>
              </div>
            </div>
          </label>
        ))}
      </div>

      {error && (
        <p className="text-sm text-rose-600 dark:text-rose-400 mt-2 flex items-center gap-2">
          <span className="text-lg">⚠</span> {error.message}
        </p>
      )}
    </div>
  );
};

const StepFlightDetails = ({ register, errors, tripType, fromInput, setFromInput, toInput, setToInput, setValue }) => (
  <div className="space-y-6">
    <div className="grid md:grid-cols-2 gap-5">
      <CountrySelect
        label="Departure City"
        name="from"
        register={register}
        error={errors.from}
        placeholder="Search or select departure city"
        value={fromInput}
        onChange={(value) => {
          setFromInput(value);
          setValue("from", value, { shouldValidate: true });
        }}
      />
      <CountrySelect
        label="Arrival City"
        name="to"
        register={register}
        error={errors.to}
        placeholder="Search or select arrival city"
        value={toInput}
        onChange={(value) => {
          setToInput(value);
          setValue("to", value, { shouldValidate: true });
        }}
      />
    </div>

    <div className="grid md:grid-cols-2 gap-5">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Departure Date
        </label>
        <input
          type="date"
          className="w-full rounded-xl bg-white dark:bg-slate-900/70 border border-slate-300 dark:border-slate-600 px-4 py-3.5 text-base text-slate-900 dark:text-slate-50 focus:outline-none focus:border-indigo-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-cyan-400/20 transition-all"
          {...register("departureDate")}
        />
        
        
        {errors.departureDate && (
          <p className="text-sm text-rose-600 dark:text-rose-400 mt-2 flex items-center gap-1">
            <span>⚠</span> {errors.departureDate.message}
          </p>
        )}
      </div>
      {tripType === "roundtrip" && (
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Return Date
          </label>
          <input
            type="date"
            className="w-full rounded-xl bg-white dark:bg-slate-900/70 border border-slate-300 dark:border-slate-600 px-4 py-3.5 text-base text-slate-900 dark:text-slate-50 focus:outline-none focus:border-indigo-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-cyan-400/20 transition-all"
            {...register("returnDate")}
          />
          {errors.returnDate && (
            <p className="text-sm text-rose-600 dark:text-rose-400 mt-2 flex items-center gap-1">
              <span>⚠</span> {errors.returnDate.message}
            </p>
          )}
        </div>
      )}
    </div>

    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
        Travel Class
      </label>
      <select
        className="w-full rounded-xl bg-white dark:bg-slate-900/70 border border-slate-300 dark:border-slate-600 px-4 py-3.5 text-base text-slate-900 dark:text-slate-50 focus:outline-none focus:border-indigo-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-cyan-400/20 transition-all appearance-none"
        {...register("classType")}
      >
        <option value="economy">✈ Economy Class</option>
        <option value="premium">⭐ Premium Economy</option>
        <option value="business">💼 Business Class</option>
        <option value="first">👑 First Class</option>
      </select>
      {errors.classType && (
        <p className="text-sm text-rose-600 dark:text-rose-400 mt-2 flex items-center gap-1">
          <span>⚠</span> {errors.classType.message}
        </p>
      )}
    </div>
  </div>
);

const StepPassengers = ({
  register,
  errors,
  passengerFields,
  append,
  remove,
}) => (
  <div className="space-y-5">
    <div className="flex items-center justify-between">
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Add each traveller's details as they appear on their ID.
      </p>
      <button
        type="button"
        onClick={() =>
          append({ firstName: "", lastName: "", age: "", gender: "Female" })
        }
        className="text-sm px-4 py-2 rounded-full bg-indigo-50 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 text-indigo-700 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-slate-700 hover:border-indigo-300 dark:hover:border-slate-600 transition-all font-medium"
      >
        + Add Passenger
      </button>
    </div>

    <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scroll">
      {passengerFields.map((field, index) => (
        <div
          key={field.id}
          className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/50 px-5 py-4 space-y-4 hover:border-indigo-300 dark:hover:border-slate-600 transition-colors"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-100 to-cyan-100 dark:from-indigo-900/30 dark:to-cyan-900/30 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-semibold text-sm">
                {index + 1}
              </span>
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                Passenger {index + 1}
              </span>
            </div>
            {passengerFields.length > 1 && (
              <button
                type="button"
                onClick={() => remove(index)}
                className="text-sm text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 px-3 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
              >
                Remove
              </button>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                First Name
              </label>
              <input
                type="text"
                placeholder="John"
                className="w-full rounded-xl bg-white dark:bg-slate-900/70 border border-slate-300 dark:border-slate-600 px-4 py-3 text-sm text-slate-900 dark:text-slate-50 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-cyan-400/20 transition-all"
                {...register(`passengers.${index}.firstName`)}
              />
              {errors.passengers?.[index]?.firstName && (
                <p className="text-xs text-rose-600 dark:text-rose-400 mt-1.5">
                  {errors.passengers[index].firstName.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                Last Name
              </label>
              <input
                type="text"
                placeholder="Doe"
                className="w-full rounded-xl bg-white dark:bg-slate-900/70 border border-slate-300 dark:border-slate-600 px-4 py-3 text-sm text-slate-900 dark:text-slate-50 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-cyan-400/20 transition-all"
                {...register(`passengers.${index}.lastName`)}
              />
              {errors.passengers?.[index]?.lastName && (
                <p className="text-xs text-rose-600 dark:text-rose-400 mt-1.5">
                  {errors.passengers[index].lastName.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                Age
              </label>
              <input
                type="number"
                placeholder="25"
                className="w-full rounded-xl bg-white dark:bg-slate-900/70 border border-slate-300 dark:border-slate-600 px-4 py-3 text-sm text-slate-900 dark:text-slate-50 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-cyan-400/20 transition-all"
                {...register(`passengers.${index}.age`)}
              />
              {errors.passengers?.[index]?.age && (
                <p className="text-xs text-rose-600 dark:text-rose-400 mt-1.5">
                  {errors.passengers[index].age.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                Gender
              </label>
              <select
                className="w-full rounded-xl bg-white dark:bg-slate-900/70 border border-slate-300 dark:border-slate-600 px-4 py-3 text-sm text-slate-900 dark:text-slate-50 focus:outline-none focus:border-indigo-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-cyan-400/20 transition-all"
                {...register(`passengers.${index}.gender`)}
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
              {errors.passengers?.[index]?.gender && (
                <p className="text-xs text-rose-600 dark:text-rose-400 mt-1.5">
                  {errors.passengers[index].gender.message}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>

    {typeof errors.passengers?.message === "string" && (
      <p className="text-sm text-rose-600 dark:text-rose-400 mt-2 flex items-center gap-2">
        <span className="text-lg">⚠</span> {errors.passengers.message}
      </p>
    )}
  </div>
);

const StepSeats = ({ rows, cols, selected, toggleSeat, error }) => {
  const isAisleSeat = (col) => col === 3 || col === 4;
  
  return (
    <div className="space-y-5 pb-20">
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Choose your seats from the cabin layout. Aisle seats have extra legroom.
      </p>

      <div className="w-full rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 px-6 py-6 shadow-lg shadow-slate-200/20 dark:shadow-slate-900/20">
        <div className="flex justify-center mb-4 text-sm text-slate-500 dark:text-slate-400 font-medium">
          <span className="flex items-center gap-2">
            <span className="text-indigo-500 dark:text-cyan-400">✈</span>
            Front of Cabin
          </span>
        </div>
        
        {/* Seat grid container with proper centering */}
        <div className="flex justify-center mb-2">
          <div className="grid gap-3">
            {rows.map((row) => (
              <div key={row} className="flex items-center gap-4">
                <span className="w-6 text-sm font-medium text-slate-700 dark:text-slate-300">
                  {row}
                </span>
                <div className="flex gap-2.5">
                  {cols.map((col) => {
                    const seatId = `${row}${col}`;
                    const isSelected = selected.includes(seatId);
                    const isAisle = isAisleSeat(col);

                    return (
                      <button
                        key={seatId}
                        type="button"
                        onClick={() => toggleSeat(seatId)}
                        className={`h-10 w-10 rounded-lg text-sm font-medium flex items-center justify-center border-2 transition-all duration-300 ${
                          isSelected
                            ? "bg-gradient-to-r from-indigo-500 to-cyan-500 text-white border-indigo-600 shadow-lg shadow-indigo-500/40 scale-105"
                            : isAisle
                            ? "bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 text-slate-700 dark:text-slate-400 border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800"
                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:border-indigo-400 dark:hover:border-cyan-400 hover:text-indigo-600 dark:hover:text-cyan-300 hover:shadow-md"
                        } ${isAisle ? "ml-4 relative" : ""}`}
                        title={isAisle ? "Aisle Seat (Extra legroom)" : "Regular Seat"}
                      >
                        {col}
                        {isAisle && !isSelected && (
                          <span className="absolute -top-1.5 -right-1.5 text-[10px] text-slate-500 dark:text-slate-400">↔</span>
                        )}
                        {isSelected && (
                          <span className="absolute -top-1.5 -right-1.5 text-[10px] text-white">✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Visual cabin aisle */}
        <div className="mt-8 mb-6">
          <div className="h-8 w-full bg-gradient-to-r from-slate-100/80 to-slate-200/80 dark:from-slate-800/80 dark:to-slate-900/80 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-slate-900/80 px-3 py-1 rounded-full">
                CABIN AISLE
              </span>
            </div>
          </div>
          <div className="text-center mt-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Aisle seats provide easier access and extra legroom
            </span>
          </div>
        </div>
        
        {/* Seat Legend with improved layout */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 text-center">
            Seat Legend
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700">
              <div className="h-6 w-6 rounded-lg border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 mb-2" />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Regular</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Standard seat</span>
            </div>
            
            <div className="flex flex-col items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700">
              <div className="h-6 w-6 rounded-lg border-2 border-indigo-500 bg-gradient-to-r from-indigo-500 to-cyan-500 mb-2 relative">
                <span className="absolute -top-1 -right-1 text-[8px] text-white">✓</span>
              </div>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Selected</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Your choice</span>
            </div>
            
            <div className="flex flex-col items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700">
              <div className="h-6 w-6 rounded-lg border-2 border-slate-400 dark:border-slate-700 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 mb-2 relative">
                <span className="absolute -top-1 -right-1 text-[8px] text-slate-500 dark:text-slate-400">↔</span>
              </div>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Aisle</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Extra legroom</span>
            </div>
            
            <div className="flex flex-col items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700">
              <div className="h-6 w-6 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-900/80 mb-2 flex items-center justify-center">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">AISLE</span>
              </div>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Cabin Space</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Walking area</span>
            </div>
          </div>
        </div>
        
        {/* Selection summary */}
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Selected Seats: <span className="text-indigo-600 dark:text-cyan-400 font-bold">{selected.length}</span>
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {selected.length > 0 
                  ? `Seats: ${selected.join(", ")}`
                  : "No seats selected yet"}
              </p>
            </div>
            <div className="text-center sm:text-right">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Total Passengers: <span className="font-bold">{selected.length || 0}</span>
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Select at least {Math.max(1, selected.length)} seat(s)
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="mt-4 p-4 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-700/50">
          <p className="text-sm text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <span className="text-lg">⚠</span> 
            <span className="font-medium">{error.message}</span>
          </p>
        </div>
      )}
    </div>
  );
};

const StepExtras = ({ register, extras }) => (
  <div className="space-y-5">
    <p className="text-sm text-slate-600 dark:text-slate-400">
      Add comfort & peace of mind for a small extra fee.
    </p>
    <div className="grid md:grid-cols-3 gap-4">
      <label className="group cursor-pointer rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/50 p-4 flex flex-col gap-2 hover:border-indigo-400 dark:hover:border-cyan-400 transition-all hover:shadow-lg hover:shadow-indigo-200/50 dark:hover:shadow-cyan-500/10">
        <div className="flex items-center justify-between">
          <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            🍽️
          </div>
          <input
            type="checkbox"
            className="h-5 w-5 accent-indigo-500 dark:accent-cyan-400 rounded"
            {...register("extras.meals")}
            defaultChecked={extras.meals}
          />
        </div>
        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Gourmet Meals
        </span>
        <span className="text-xs text-slate-600 dark:text-slate-400">
          Curated menus with veg & non-veg options.
        </span>
        <span className="text-xs font-bold text-indigo-600 dark:text-cyan-300 mt-2">
          +₹400 / passenger
        </span>
      </label>

      <label className="group cursor-pointer rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/50 p-4 flex flex-col gap-2 hover:border-indigo-400 dark:hover:border-cyan-400 transition-all hover:shadow-lg hover:shadow-indigo-200/50 dark:hover:shadow-cyan-500/10">
        <div className="flex items-center justify-between">
          <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
            🧳
          </div>
          <input
            type="checkbox"
            className="h-5 w-5 accent-indigo-500 dark:accent-cyan-400 rounded"
            {...register("extras.baggage")}
            defaultChecked={extras.baggage}
          />
        </div>
        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Extra Baggage
        </span>
        <span className="text-xs text-slate-600 dark:text-slate-400">
          Additional 15kg baggage allowance.
        </span>
        <span className="text-xs font-bold text-indigo-600 dark:text-cyan-300 mt-2">
          +₹900 / passenger
        </span>
      </label>

      <label className="group cursor-pointer rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/50 p-4 flex flex-col gap-2 hover:border-indigo-400 dark:hover:border-cyan-400 transition-all hover:shadow-lg hover:shadow-indigo-200/50 dark:hover:shadow-cyan-500/10">
        <div className="flex items-center justify-between">
          <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            🛡️
          </div>
          <input
            type="checkbox"
            className="h-5 w-5 accent-indigo-500 dark:accent-cyan-400 rounded"
            {...register("extras.insurance")}
            defaultChecked={extras.insurance}
          />
        </div>
        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Travel Insurance
        </span>
        <span className="text-xs text-slate-600 dark:text-slate-400">
          Coverage for delays, loss & emergencies.
        </span>
        <span className="text-xs font-bold text-indigo-600 dark:text-cyan-300 mt-2">
          +₹600 / passenger
        </span>
      </label>
    </div>
  </div>
);

const StepSummary = ({ values, price }) => (
  <div className="space-y-5">
    <p className="text-sm text-slate-600 dark:text-slate-400">
      Review all details before proceeding to secure payment.
    </p>

    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/50 p-5 space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Route Details</h4>
          <div className="flex items-center gap-3">
            <div className="text-center">
              <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{values.from || "—"}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Departure</div>
            </div>
            <div className="text-slate-400 dark:text-slate-500">→</div>
            <div className="text-center">
              <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{values.to || "—"}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Arrival</div>
            </div>
          </div>
        </div>
        <div>
          <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Travel Dates</h4>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">Depart:</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">{values.departureDate || "—"}</span>
            </div>
            {values.tripType === "roundtrip" && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600 dark:text-slate-400">Return:</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">{values.returnDate || "—"}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Passengers</div>
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{values.passengers?.length || 1}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Class</div>
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100 capitalize">{values.classType}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Seats</div>
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {values.seats?.length || 0} selected
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
        <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">Selected Extras</h4>
        <div className="flex flex-wrap gap-2">
          {values.extras?.meals && (
            <span className="px-3 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-medium border border-indigo-200 dark:border-indigo-700">
              🍽️ Gourmet Meals
            </span>
          )}
          {values.extras?.baggage && (
            <span className="px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-medium border border-amber-200 dark:border-amber-700">
              🧳 Extra Baggage
            </span>
          )}
          {values.extras?.insurance && (
            <span className="px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium border border-emerald-200 dark:border-emerald-700">
              🛡️ Travel Insurance
            </span>
          )}
          {!values.extras?.meals && !values.extras?.baggage && !values.extras?.insurance && (
            <span className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium">
              No extras selected
            </span>
          )}
        </div>
      </div>
    </div>

    <div className="rounded-2xl border border-emerald-200 dark:border-emerald-700/50 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-5 space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-700 dark:text-slate-300">Base Fare × {price.passengerCount}</span>
        <span className="font-medium text-slate-900 dark:text-slate-100">₹{price.base * price.passengerCount}</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-700 dark:text-slate-300">Extras (meals, bags, insurance)</span>
        <span className="font-medium text-slate-900 dark:text-slate-100">₹{price.extras}</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-700 dark:text-slate-300">Taxes & Fees (18%)</span>
        <span className="font-medium text-slate-900 dark:text-slate-100">₹{price.taxes}</span>
      </div>
      <div className="pt-3 border-t border-emerald-300/50 dark:border-emerald-700/50 mt-2">
        <div className="flex items-center justify-between text-base font-bold">
          <span className="text-slate-900 dark:text-slate-100">Total Payable</span>
          <span className="text-emerald-600 dark:text-emerald-300 text-lg">
            ₹{price.total}
          </span>
        </div>
      </div>
    </div>
  </div>
);

const StepPayment = ({ register, errors }) => (
  <div className="space-y-6">
    <p className="text-sm text-slate-600 dark:text-slate-400">
      Your payment is processed securely. We never store your card details.
    </p>
    <div className="grid md:grid-cols-2 gap-5">
      <div className="space-y-2.5">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Name on card
        </label>
        <input
          type="text"
          placeholder="Aaboli Sanas"
          className="w-full rounded-xl bg-white dark:bg-slate-900/70 border border-slate-300 dark:border-slate-600 px-4 py-3.5 text-base text-slate-900 dark:text-slate-50 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-cyan-400/20 transition-all"
          {...register("cardName")}
        />
        {errors.cardName && (
          <p className="text-sm text-rose-600 dark:text-rose-400 mt-2 flex items-center gap-1">
            <span>⚠</span> {errors.cardName.message}
          </p>
        )}
      </div>
      <div className="space-y-2.5">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Card Number
        </label>
        <input
          type="text"
          maxLength={19}
          placeholder="4242 4242 4242 4242"
          className="w-full rounded-xl bg-white dark:bg-slate-900/70 border border-slate-300 dark:border-slate-600 px-4 py-3.5 text-base text-slate-900 dark:text-slate-50 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-cyan-400/20 transition-all tracking-[0.2em]"
          {...register("cardNumber")}
        />
        {errors.cardNumber && (
          <p className="text-sm text-rose-600 dark:text-rose-400 mt-2 flex items-center gap-1">
            <span>⚠</span> {errors.cardNumber.message}
          </p>
        )}
      </div>
    </div>

    <div className="grid md:grid-cols-3 gap-5">
      <div className="space-y-2.5">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Expiry Date
        </label>
        <input
          type="text"
          placeholder="MM/YY"
          className="w-full rounded-xl bg-white dark:bg-slate-900/70 border border-slate-300 dark:border-slate-600 px-4 py-3.5 text-base text-slate-900 dark:text-slate-50 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-cyan-400/20 transition-all"
          {...register("expiry")}
        />
        {errors.expiry && (
          <p className="text-sm text-rose-600 dark:text-rose-400 mt-2 flex items-center gap-1">
            <span>⚠</span> {errors.expiry.message}
          </p>
        )}
      </div>
      <div className="space-y-2.5">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          CVV
        </label>
        <input
          type="password"
          maxLength={4}
          placeholder="***"
          className="w-full rounded-xl bg-white dark:bg-slate-900/70 border border-slate-300 dark:border-slate-600 px-4 py-3.5 text-base text-slate-900 dark:text-slate-50 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-cyan-400/20 transition-all"
          {...register("cvv")}
        />
        {errors.cvv && (
          <p className="text-sm text-rose-600 dark:text-rose-400 mt-2 flex items-center gap-1">
            <span>⚠</span> {errors.cvv.message}
          </p>
        )}
      </div>
      <div className="space-y-2.5">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Saved Cards
        </label>
        <div className="h-12 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center text-sm text-slate-500 dark:text-slate-400 hover:border-indigo-400 dark:hover:border-cyan-400 transition-colors cursor-pointer">
          Demo only – no saved cards
        </div>
      </div>
    </div>
  </div>
);

const StepSuccess = ({ values, price, confettiPieces, onNewBooking }) => (
  <div className="relative overflow-hidden">
    {/* Confetti */}
    {confettiPieces.map((_, i) => (
      <motion.div
        key={i}
        className="pointer-events-none absolute rounded-full"
        style={{
          width: 6 + (i % 4),
          height: 6 + (i % 4),
          background:
            i % 3 === 0
              ? "#8b5cf6"
              : i % 3 === 1
              ? "#06b6d4"
              : "#10b981",
          left: `${(i * 7) % 100}%`,
        }}
        initial={{ y: -40, opacity: 0, rotate: 0 }}
        animate={{ y: 220, opacity: [0, 1, 0.8, 0], rotate: 180 }}
        transition={{
          duration: 2.4,
          delay: i * 0.03,
          repeat: Infinity,
          repeatType: "loop",
        }}
      />
    ))}

    <div className="relative z-10 space-y-5">
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 flex items-center justify-center text-2xl shadow-lg shadow-emerald-400/30">
          ✈️
        </div>
        <div>
          <h2 className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
            Booking Confirmed!
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Your e-ticket is on the way to your email. Check your spam folder if you don't see it.
          </p>
        </div>
      </div>

      {/* Ticket preview */}
      <motion.div
        initial={{ rotate: -2, y: 10, opacity: 0 }}
        animate={{ rotate: 0, y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 16 }}
        className="mt-3 rounded-3xl border border-slate-300 dark:border-slate-700 bg-gradient-to-br from-white via-slate-50 to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 p-5 shadow-2xl shadow-emerald-200/30 dark:shadow-emerald-900/20"
      >
        <div className="flex items-center justify-between text-sm mb-4">
          <span className="font-bold text-slate-900 dark:text-slate-100">
            ✨ LUXE AIRWAYS
          </span>
          <span className="text-xs px-3 py-1 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 text-white font-medium">
            PREMIUM · CONFIRMED
          </span>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
              FROM
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {values.from || "—"}
            </div>
          </div>
          <div className="text-2xl text-indigo-500 dark:text-cyan-400">✈</div>
          <div className="text-right">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
              TO
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {values.to || "—"}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm border-y border-dashed border-slate-300 dark:border-slate-700 py-4">
          <div>
            <div className="text-slate-500 dark:text-slate-400 text-xs mb-1">
              DATE
            </div>
            <div className="font-medium text-slate-900 dark:text-slate-100">{values.departureDate || "—"}</div>
          </div>
          <div className="text-center">
            <div className="text-slate-500 dark:text-slate-400 text-xs mb-1">
              PASSENGERS
            </div>
            <div className="font-medium text-slate-900 dark:text-slate-100">{values.passengers?.length || 1}</div>
          </div>
          <div className="text-right">
            <div className="text-slate-500 dark:text-slate-400 text-xs mb-1">
              SEATS
            </div>
            <div className="font-mono font-medium text-slate-900 dark:text-slate-100">
              {values.seats?.length
                ? values.seats.join(", ")
                : "TBA"}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div>
            <div className="text-slate-500 dark:text-slate-400 text-xs mb-1">
              TRIP TYPE
            </div>
            <div className="font-medium text-slate-900 dark:text-slate-100 capitalize">
              {values.tripType || "—"}
            </div>
          </div>
          <div className="text-right">
            <div className="text-slate-500 dark:text-slate-400 text-xs mb-1">
              TOTAL PAID
            </div>
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-300">
              ₹{price.total}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20 border border-indigo-200 dark:border-indigo-700">
        <p className="text-sm text-slate-700 dark:text-slate-300">
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">Next steps:</span> You'll receive updates about your flight schedule, gate changes, and check-in reminders automatically. Check-in opens 48 hours before departure.
        </p>
      </div>

      {/* Action buttons */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={onNewBooking}
          className="px-6 py-3 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 dark:from-cyan-500 dark:to-indigo-500 text-white font-semibold hover:shadow-lg hover:shadow-indigo-500/30 dark:hover:shadow-cyan-500/30 hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center gap-2"
        >
          <span className="text-lg">✈</span>
          Book Another Flight
        </button>
        
        <button
          type="button"
          onClick={() => window.print()}
          className="px-6 py-3 rounded-full border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-300 flex items-center gap-2"
        >
          <span className="text-lg">🖨️</span>
          Print Ticket
        </button>
        
        <button
          type="button"
          onClick={() => alert("Booking details have been sent to your email!")}
          className="px-6 py-3 rounded-full border-2 border-emerald-300 dark:border-emerald-600 text-emerald-700 dark:text-emerald-300 font-medium hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-400 dark:hover:border-emerald-500 transition-all duration-300 flex items-center gap-2"
        >
          <span className="text-lg">📧</span>
          Email Receipt
        </button>
      </div>

      <div className="text-center mt-4">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Need help? Contact our customer support at support@luxeairways.com
        </p>
      </div>
    </div>
  </div>
);

export default TravelBookingForm;