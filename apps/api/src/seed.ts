import { DataSource } from 'typeorm';
import { Flight } from './flights/entities/flight.entity';

const cities = [
  'DEL',
  'BOM',
  'BLR',
  'MAA',
  'CCU',
  'HYD',
  'AMD',
  'DXB',
  'JFK',
  'LHR',
  'SIN',
  'NRT',
  'FRA',
  'HKG',
  'SFO',
  'DOH',
  'CDG',
  'LAX',
  'ZRH',
  'IXC',
  'PNQ',
  'CCJ',
];

const airlines = [
  'IndiGo',
  'Air India',
  'SpiceJet',
  'Vistara',
  'Emirates',
  'Lufthansa',
  'Singapore Airlines',
];

export async function seedFlights(dataSource: DataSource) {
  const flightRepo = dataSource.getRepository(Flight);

  const count = await flightRepo.count();
  if (count > 0) {
    console.log('Flights already seeded ✅');
    return; // skip seeding
  }

  for (let i = 1; i <= 1000; i++) {
    const origin = cities[Math.floor(Math.random() * cities.length)];
    let destination;
    do {
      destination = cities[Math.floor(Math.random() * cities.length)];
    } while (destination === origin);

    const airline = airlines[Math.floor(Math.random() * airlines.length)];
    const flight_num = `${airline}-${100 + (i % 900)}-${i}`;

    const dep_time = new Date(
      Date.now() + Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000),
    );
    dep_time.setHours(
      Math.floor(Math.random() * 24),
      Math.floor(Math.random() * 60),
      Math.floor(Math.random() * 60),
    );

    const arr_time = new Date(
      dep_time.getTime() +
        (1 + Math.floor(Math.random() * 11)) * 60 * 60 * 1000,
    );

    try {
      await flightRepo.insert({
        flight_number: flight_num,
        airline_name: airline,
        departure_datetime: dep_time,
        arrival_datetime: arr_time,
        origin,
        destination,
      });
    } catch (err) {
      // skip duplicate key errors
      continue;
    }
  }

  console.log('Flight seeding completed ✅');
}
