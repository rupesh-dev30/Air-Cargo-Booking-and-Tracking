import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

interface SearchParams {
  origin: string;
  destination: string;
  date: string; // YYYY-MM-DD
}

interface Flight {
  id: string;
  flight_number: string;
  airline_name: string;
  departure_datetime: Date;
  arrival_datetime: Date;
  origin: string;
  destination: string;
}

export function useFlights(searchParams?: SearchParams) {
  return useQuery<Flight[]>({
    queryKey: ["flights", searchParams],
    queryFn: async () => {
      if (!searchParams) return [];

      const res = await api.get<Flight[]>(
        `/flights/direct?origin=${encodeURIComponent(searchParams.origin)}&destination=${encodeURIComponent(searchParams.destination)}&date=${encodeURIComponent(searchParams.date)}`
      );

      return res.data.map((f) => ({
        ...f,
        departure_datetime: new Date(f.departure_datetime),
        arrival_datetime: new Date(f.arrival_datetime),
      }));
    },
    enabled: Boolean(searchParams),
  });
}
