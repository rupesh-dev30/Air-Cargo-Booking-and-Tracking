"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../lib/api";

// Types
interface BookingEvent {
  id: number;
  event_type: string;
  location?: string;
  created_at: string;
}

interface Booking {
  ref_id: string;
  status: string;
  origin: string;
  destination: string;
  pieces: number;
  weight_kg: number;
  events: BookingEvent[];
}

export default function TrackBooking() {
  const [refId, setRefId] = useState("");

  // React Query v5 object-style
  const {
    data: booking,
    isFetching,
    isError,
    refetch,
  } = useQuery<Booking, Error>({
    queryKey: ["booking", refId],
    queryFn: async () => {
      const res = await api.get<Booking>(`/bookings/${refId}/history`);
      return res.data;
    },
    enabled: false, // only fetch if refId exists
  });

  const handleTrack = () => {
    if (refId) refetch();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Track Your Booking
      </h1>

      <div className="flex gap-4 w-full max-w-md mb-6">
        <input
          type="text"
          placeholder="Enter Booking Ref ID"
          value={refId}
          onChange={(e) => setRefId(e.target.value)}
          className="flex-1 p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleTrack}
          className="bg-blue-600 text-white px-6 rounded-lg shadow hover:bg-blue-700 transition"
        >
          Track
        </button>
      </div>

      {isFetching && <p className="text-gray-500">Loading...</p>}
      {isError && (
        <p className="text-red-500">Booking not found or an error occurred.</p>
      )}

      {booking && (
        <div className="w-full max-w-3xl mt-6">
          <div className="mb-4 text-center">
            <h2 className="text-xl font-semibold">{booking.ref_id}</h2>
            <p className="text-gray-600">
              {booking.origin} → {booking.destination}
            </p>
            <p className="mt-1 font-medium">Current Status: {booking.status}</p>
          </div>

          {/* Timeline */}
          <div className="w-full items-center border-l-2 border-blue-600 ml-4 mt-10 not-even:relative">
            {booking.events
              .slice()
              .sort(
                (a, b) =>
                  new Date(a.created_at).getTime() -
                  new Date(b.created_at).getTime()
              )
              .map((event) => (
                <div key={event.id} className="mb-6 ml-4 relative">
                  <div className="absolute -left-5 top-0 w-3 h-3 rounded-full bg-blue-600 border-2 border-white"></div>
                  <p className="font-semibold">{event.event_type}</p>
                  {event.location && (
                    <p className="text-gray-500 text-sm">
                      {event.location} —{" "}
                      {new Date(event.created_at).toLocaleString()}
                    </p>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
