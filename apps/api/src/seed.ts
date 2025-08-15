import { DataSource } from 'typeorm';
import { Flight } from './flights/entities/flight.entity';

const cities = ['DEL','BOM','BLR','MAA','CCU','HYD','AMD','IXC','PNQ','CCJ']; // Indian cities only

const airlines = ['IndiGo','Air India','SpiceJet','Vistara'];

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
      Date.now() + Math.floor(Math.random() * 10 * 24 * 60 * 60 * 1000), // next 10 days
    );
    dep_time.setHours(
      Math.floor(Math.random() * 24),
      Math.floor(Math.random() * 60),
      Math.floor(Math.random() * 60),
    );

    const arr_time = new Date(
      dep_time.getTime() +
        (1 + Math.floor(Math.random() * 9)) * 60 * 60 * 1000, // arrival 1-10 hours later
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

  console.log('Indian flight seeding completed ✅');
}
