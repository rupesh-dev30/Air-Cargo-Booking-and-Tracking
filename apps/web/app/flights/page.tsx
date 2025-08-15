"use client";

import { useState } from "react";
import { Plane, Calendar, MapPin, Search } from "lucide-react";
import { useFlights } from "../../hooks/useFlights";

const cities = [
  { code: "DEL", name: "Delhi" },
  { code: "BOM", name: "Mumbai" },
  { code: "BLR", name: "Bangalore" },
  { code: "MAA", name: "Chennai" },
  { code: "CCU", name: "Kolkata" },
  { code: "HYD", name: "Hyderabad" },
  { code: "AMD", name: "Ahmedabad" },
  { code: "IXC", name: "Chandigarh" },
  { code: "PNQ", name: "Pune" },
  { code: "CCJ", name: "Calicut" },
];

export default function FlightSearchPage() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [searchParams, setSearchParams] = useState<{
    origin: string;
    destination: string;
    date: string;
  }>();

  const { data: flights, isFetching } = useFlights(searchParams);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !destination || !departureDate) return;
    setSearchParams({ origin, destination, date: departureDate });
  };

  const swapCities = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-12">
      {/* Search Form */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-10">
        <h1 className="text-3xl font-extrabold text-center text-gray-900 mb-8">
          Find Your Flight
        </h1>
        <form onSubmit={handleSearch} className="space-y-6">
          <div className="flex gap-4 items-end w-full">
            {/* Origin */}
            <div className="flex-2 space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                From
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 hover:bg-white transition-shadow"
                  required
                >
                  <option value="">Select Origin</option>
                  {cities.map((c) => (
                    <option
                      key={c.code}
                      value={c.code}
                      disabled={c.code === destination}
                    >
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex items-end justify-center">
              <button
                type="button"
                onClick={swapCities}
                className="p-3 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 shadow -rotate-90 transition-transform transform hover:-rotate-180"
                disabled={!origin || !destination}
              >
                <Plane className="h-5 w-5 rotate-90" />
              </button>
            </div>

            {/* Destination */}
            <div className="flex-2 space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                To
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 hover:bg-white transition-shadow"
                  required
                >
                  <option value="">Select Destination</option>
                  {cities.map((c) => (
                    <option
                      key={c.code}
                      value={c.code}
                      disabled={c.code === origin}
                    >
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Departure Date */}
            <div className="flex-1 space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Departure
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 hover:bg-white transition-shadow"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-2xl font-semibold hover:from-blue-700 hover:to-indigo-700 shadow-lg flex items-center space-x-2 transition-transform hover:scale-105"
            >
              <Search className="h-5 w-5" />
              <span>{isFetching ? "Searching..." : "Search Flights"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Flight Results */}
      {searchParams && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Available Flights
          </h2>
          {isFetching ? (
            <p className="text-center text-gray-500 py-6">Loading flights...</p>
          ) : flights?.length ? (
            flights.map((f) => (
              <div
                key={f.id}
                className="bg-gradient-to-r from-white via-gray-50 to-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 hover:shadow-2xl transition-shadow"
              >
                <div className="space-y-2">
                  <p className="font-semibold text-xl text-gray-900">
                    {f.flight_number}{" "}
                    <span className="text-sm text-gray-500">
                      ({f.airline_name})
                    </span>
                  </p>
                  <p className="text-gray-600 text-sm flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-blue-500" />
                    <span>{f.origin}</span>
                    <Plane className="h-4 w-4 rotate-90 text-gray-400" />
                    <span>{f.destination}</span>
                  </p>
                  <p className="text-gray-500 text-xs">
                    Depart: {new Date(f.departure_datetime).toLocaleString()} |{" "}
                    Arrive: {new Date(f.arrival_datetime).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <a
                    href={`/bookings?flight_id=${f.id}`}
                    className="bg-green-500 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-green-600 transition-colors shadow"
                  >
                    Book Now
                  </a>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-6">
              No flights found for this route and date.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
