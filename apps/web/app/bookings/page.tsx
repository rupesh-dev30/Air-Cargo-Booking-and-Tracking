"use client";

import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { useSearchParams, useRouter } from "next/navigation";
import { Plane, Package, Weight, PlusCircle, CheckCircle } from "lucide-react";

const bookingSchema = z.object({
  flight_id: z.number().min(1, "Flight ID must be a positive number"),
  pieces: z.number().min(1, "Number of pieces must be at least 1"),
  weight_kg: z.number().min(1, "Weight must be at least 1 kg"),
});

type BookingForm = z.infer<typeof bookingSchema>;

export default function BookingPage() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  // Prefill flight_id if coming from Flight Search page
  useEffect(() => {
    const flightIdParam = searchParams.get("flight_id");
    if (flightIdParam) setValue("flight_id", parseInt(flightIdParam));
  }, [searchParams, setValue]);

  const bookingMutation = useMutation({
    mutationFn: (data: BookingForm) => api.post("/bookings", data),
    onSuccess: (res) => {
      const refId = res.data.ref_id;
      router.push(`/bookings/${refId}`);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      setError(err.response?.data?.message || "Booking failed");
    },
  });

  const onSubmit = (data: BookingForm) => bookingMutation.mutate(data);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 md:p-10 border border-gray-100">
        <div className="text-center mb-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-extrabold text-gray-900">
            Confirm Booking
          </h1>
          <p className="text-gray-600 mt-2">
            Enter the details for your baggage to finalize.
          </p>
        </div>

        {error && (
          <p className="bg-red-100 text-red-700 p-3 rounded-lg text-center mb-4 font-medium">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="relative">
            <label
              className="block text-sm font-semibold text-gray-700 mb-2"
              htmlFor="flight_id"
            >
              Flight ID
            </label>
            <Plane className="absolute left-3 top-1/2 mt-3 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="number"
              id="flight_id"
              placeholder="Flight ID"
              {...register("flight_id", { valueAsNumber: true })}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              readOnly={searchParams.get("flight_id") !== null}
            />
            {errors.flight_id && (
              <p className="text-red-500 text-sm mt-1">
                {errors.flight_id.message}
              </p>
            )}
          </div>

          <div className="relative">
            <label
              className="block text-sm font-semibold text-gray-700 mb-2"
              htmlFor="pieces"
            >
              Number of Pieces
            </label>
            <Package className="absolute left-3 top-1/2 mt-3 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="number"
              id="pieces"
              placeholder="Number of pieces"
              {...register("pieces", { valueAsNumber: true })}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            {errors.pieces && (
              <p className="text-red-500 text-sm mt-1">
                {errors.pieces.message}
              </p>
            )}
          </div>

          <div className="relative">
            <label
              className="block text-sm font-semibold text-gray-700 mb-2"
              htmlFor="weight_kg"
            >
              Total Weight (kg)
            </label>
            <Weight className="absolute left-3 top-1/2 mt-3 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="number"
              id="weight_kg"
              placeholder="Weight (kg)"
              {...register("weight_kg", { valueAsNumber: true })}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            {errors.weight_kg && (
              <p className="text-red-500 text-sm mt-1">
                {errors.weight_kg.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={bookingMutation.isPending}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg flex items-center justify-center space-x-2"
          >
            <PlusCircle className="h-5 w-5" />
            <span>
              {bookingMutation.isPending ? "Booking..." : "Create Booking"}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
