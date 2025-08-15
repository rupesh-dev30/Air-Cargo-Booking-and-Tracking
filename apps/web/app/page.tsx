"use client";

import Link from "next/link";
import { Plane, Package, Search } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-100 to-gray-200 flex flex-col items-center justify-center p-4 md:p-8">
      {/* Hero Section */}
      <div className="bg-white rounded-4xl shadow-2xl p-10 md:p-16 max-w-5xl w-full border border-gray-100 transform hover:scale-105 transition-transform duration-500">
        <div className="text-center mb-10">
          <Plane className="h-20 w-20 text-indigo-500 mx-auto mb-6 animate-bounce" />
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Air Cargo Booking System
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Book, track, and manage air cargo shipments efficiently with
            real-time updates and a seamless experience.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid sm:grid-cols-2 gap-6 md:gap-10">
          <Link
            href="/flights"
            className="group flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-5 px-10 rounded-2xl shadow-lg hover:shadow-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:-translate-y-1"
          >
            <Search className="h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
            <span>Search Flights</span>
          </Link>

          <Link
            href="/bookings/track"
            className="group flex items-center justify-center space-x-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold py-5 px-10 rounded-2xl shadow-lg hover:shadow-2xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 transform hover:-translate-y-1"
          >
            <Package className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
            <span>Track Booking</span>
          </Link>
        </div>

        {/* Info Section */}
        <div className="mt-14 text-gray-500 max-w-3xl mx-auto border-t border-gray-200 pt-8 text-center">
          <p className="text-base md:text-lg">
            Seamlessly create air cargo bookings, discover available flights,
            and monitor the status of your shipments in real-time — from
            departure to delivery.
          </p>
        </div>
      </div>

      {/* Footer Accent */}
      <div className="mt-10 text-gray-400 text-sm md:text-base">
        &copy; {new Date().getFullYear()} Air Cargo Booking. All rights
        reserved.
      </div>
    </div>
  );
}
