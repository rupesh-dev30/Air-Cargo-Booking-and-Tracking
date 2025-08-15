"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import {
  Plane,
  MapPin,
  XCircle,
  Package,
  Weight,
  Clock,
  ArrowRight,
  RefreshCcw,
} from "lucide-react";

// Types
type BookingStatus = "BOOKED" | "DEPARTED" | "ARRIVED" | "CANCELLED";

interface BookingEvent {
  id: number;
  event_type: string;
  location?: string;
  created_at: string;
}

interface Booking {
  ref_id: string;
  origin: string;
  destination: string;
  pieces: number;
  weight_kg: number;
  status: BookingStatus;
  events: BookingEvent[];
}

interface LocationPayload {
  location: string;
}

export default function BookingStatusPage() {
  const { refId } = useParams<{ refId: string }>();
  const queryClient = useQueryClient();
  const [location, setLocation] = useState("");

  const invalidateBooking = () =>
    queryClient.invalidateQueries({ queryKey: ["booking", refId] });

  // Fetch booking
  const { data, isLoading, isError } = useQuery<Booking>({
    queryKey: ["booking", refId],
    queryFn: async () => {
      const res = await api.get<Booking>(`/bookings/${refId}/history`);
      return res.data;
    },
  });

  // Generic status mutation
  const useStatusMutation = (endpoint: string) =>
    useMutation<Booking, Error, LocationPayload>({
      mutationFn: (payload) =>
        api
          .patch<Booking>(`/bookings/${refId}/${endpoint}`, payload)
          .then((res) => res.data),
      onSuccess: invalidateBooking,
    });

  const departMutation = useStatusMutation("depart");
  const arriveMutation = useStatusMutation("arrive");

  const cancelMutation = useMutation<Booking, Error>({
    mutationFn: () =>
      api.patch<Booking>(`/bookings/${refId}/cancel`).then((res) => res.data),
    onSuccess: invalidateBooking,
  });

  const sortedEvents = useMemo(() => {
    if (!data) return [];
    return [...data.events].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [data]);

  const getStatusColor = (status: BookingStatus) => {
    const map: Record<BookingStatus, string> = {
      BOOKED: "bg-blue-100 text-blue-800",
      DEPARTED: "bg-purple-100 text-purple-800",
      ARRIVED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
    };
    return map[status] || "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <p className="text-gray-500 font-medium">Loading booking...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <p className="text-red-500 font-medium">
          No booking found or an error occurred.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex items-start justify-center">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-2xl p-6 md:p-10 border border-gray-100">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Booking:{" "}
            <span className="text-indigo-600 font-mono">{data.ref_id}</span>
          </h1>
          <span
            className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide ${getStatusColor(data.status)}`}
          >
            {data.status}
          </span>
        </div>

        {/* Booking Route with Plane Images */}
        <div className="flex items-center justify-between mb-6">
          {/* Left Plane Placeholder */}
          <div className="h-12 w-12 flex-shrink-0 rounded-full flex items-center justify-center">
            {/* Replace with image */}
            <span className="text-white font-bold">✈️</span>
          </div>

          {/* Origin → Destination */}
          <p className="flex-1 text-center font-semibold text-gray-900 text-lg">
            {data.origin}{" "}
            <ArrowRight className="inline h-5 w-5 text-gray-400 mx-2" />{" "}
            {data.destination}
          </p>

          {/* Right Plane Placeholder */}
          <div className="h-12 w-12 flex-shrink-0 rounded-full flex items-center justify-center rotate-260">
            {/* Replace with image */}
            <span className="text-white font-bold">✈️</span>
          </div>
        </div>

        {/* Booking Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-sm text-gray-700">
          <div className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-gray-500" />
            <p>
              Pieces: <span className="font-semibold">{data.pieces}</span>
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Weight className="h-5 w-5 text-gray-500" />
            <p>
              Weight: <span className="font-semibold">{data.weight_kg} kg</span>
            </p>
          </div>
        </div>

        {/* Status Update Form */}
        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200 mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-900">
            Update Status
          </h2>
          <div className="relative mb-4">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Current location (e.g., DEL)"
              value={location}
              disabled={["ARRIVED", "CANCELLED"].includes(data.status)}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => departMutation.mutate({ location })}
              disabled={data.status !== "BOOKED" || !location}
              className={`py-3 px-4 rounded-lg font-semibold flex items-center justify-center space-x-2 ${
                data.status === "BOOKED" && location
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              <Plane className="h-5 w-5" />
              <span>{departMutation.isPending ? "Updating..." : "Depart"}</span>
            </button>

            <button
              onClick={() => arriveMutation.mutate({ location })}
              disabled={data.status !== "DEPARTED" || !location}
              className={`py-3 px-4 rounded-lg font-semibold flex items-center justify-center space-x-2 ${
                data.status === "DEPARTED" && location
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              <MapPin className="h-5 w-5" />
              <span>{arriveMutation.isPending ? "Updating..." : "Arrive"}</span>
            </button>

            <button
              onClick={() => cancelMutation.mutate()}
              disabled={
                ["ARRIVED", "CANCELLED"].includes(data.status) ||
                cancelMutation.isPending
              }
              className={`py-3 px-4 rounded-lg font-semibold flex items-center justify-center space-x-2 ${
                !["ARRIVED", "CANCELLED"].includes(data.status)
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              <XCircle className="h-5 w-5" />
              <span>{cancelMutation.isPending ? "Updating..." : "Cancel"}</span>
            </button>
          </div>
        </div>

        {/* Timeline */}
        <h2 className="text-xl font-bold mb-4 text-gray-900">Timeline</h2>
        <div className="space-y-4">
          {sortedEvents.map((e, index) => (
            <div
              key={e.id}
              className={`relative pl-8 pb-4 border-l-2 ${
                index === sortedEvents.length - 1
                  ? "border-transparent"
                  : "border-gray-200"
              }`}
            >
              <div className="absolute -left-2 top-1 w-4 h-4 bg-white border-2 border-indigo-500 rounded-full flex items-center justify-center">
                <Clock className="h-2.5 w-2.5 text-indigo-500" />
              </div>
              <p className="font-semibold text-gray-900">
                {e.event_type}
                {e.location && (
                  <span className="font-normal text-gray-600">
                    {" "}
                    at {e.location}
                  </span>
                )}
              </p>
              <p className="text-sm text-gray-500">
                {new Date(e.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
        <div className="p-6 md:p-8 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-center space-x-3 text-gray-500">
            <RefreshCcw className="h-4 w-4 animate-spin" />
            <span className="text-sm font-medium">
              Timeline updates automatically
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
