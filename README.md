# Air Cargo Booking & Tracking System

This project is a full-stack application designed to manage the booking and tracking of air cargo shipments. The system provides a robust backend for handling booking logic, flight information, and real-time status updates, complemented by a simple and intuitive UI for user interaction.

---

## 🚀 Project Objective

The primary goal is to build a system that allows users to create an air-cargo booking and track its status from the point of origin to its final destination.

---

## 📊 Data Models

The system is built around two core data models:

### **`Booking`**

- `ref_id`: A human-friendly, unique identifier for each booking.
- `origin`: The starting location of the cargo.
- `destination`: The final destination of the cargo.
- `pieces`: The number of items in the shipment.
- `weight_kg`: The total weight of the shipment in kilograms.
- `status`: The current state of the booking (e.g., `BOOKED`, `DEPARTED`, `ARRIVED`, `DELIVERED`).
- `timestamps`: Timestamps for creation and last update.
- `flight_ids`: An array of Flight IDs associated with the booking.

### **`Flights`**

- `flight_id`: Unique identifier for the flight.
- `flight_number`: The specific flight number.
- `airline_name`: The name of the airline operating the flight.
- `departure_datetime`: Scheduled departure date and time.
- `arrival_datetime`: Scheduled arrival date and time.
- `origin`: The airport of origin.
- `destination`: The airport of destination.

---

## ✨ Functional Requirements

The backend API provides the following core functionalities:

1.  **Get Route**
    - **Input**: `origin`, `destination`, `departure_date`.
    - **Output**:
      - Direct flights matching the request.
      - Single transit routes where the connecting flight departs on the same day or the day after the first leg's arrival.

2.  **Create Booking**
    - Creates a new booking with the provided basic details.
    - Initializes the booking status to `BOOKED`.

3.  **Depart Booking**
    - Updates a booking's status to `DEPARTED`.
    - Records a departure event in the booking's timeline, including origin and optional flight details.

4.  **Arrive Booking**
    - Updates a booking's status to `ARRIVED` at a specified location.
    - Records an arrival event in the booking's timeline.

5.  **Get Booking History (by `ref_id`)**
    - **Input**: `ref_id`.
    - **Output**: Returns all basic booking details along with a full, chronological event timeline. This is used by the UI to display tracking history.

6.  **Cancel Booking**
    - Marks a booking as `CANCELLED`.
    - A booking cannot be canceled once its status is `ARRIVED`.

---

## 🛠️ Non-Functional Requirements

- **Concurrency**: The system must handle concurrent operations on the same booking from multiple users. Distributed locks will be used to ensure data integrity.
- **Scalability**: The system is designed to handle high transaction volumes:
  - **Bookings**: \~50,000 new bookings per day.
  - **Updates**: \~150,000 updates per day.
  - **Flights**: \~100,000 active flights with roughly 10 flights per Origin-Destination pair daily.
- **Logging**: A basic logging system is in place for debugging and monitoring.

---

## 🖥️ User Interface (UI)

The frontend provides the following pages:

- **Create Booking Form**: A form for users to submit new cargo bookings.
- **Search Booking**: A page to search for a specific booking using its `ref_id`.
- **Booking Detail Panel**: A detailed view showing the booking's current status and its complete timeline history.

---

## 🚀 Getting Started

Follow these steps to set up the project and run the API and UI locally.

### **1. Project Setup**

1.  **Clone the repository:**

    ```bash
    git clone [repository_url]
    cd air-cargo-booking-tracking
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

### **2. Environment Variables**

Before running the applications, you need to set up the environment variables.

#### API

Create a `.env` file in the root of the `apps/api/` directory with the following configuration:

```
PORT=9001

# DATABASE
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=829107
DB_NAME=aircargo
```

#### Web UI

Create a `.env` file in the `apps/web/` directory. This file should contain the URL of your API.

```
NEXT_PUBLIC_API_URL=http://localhost:9001
```

### **3. Running the Project**

To run both the API and Web UI, you can use a unified command if your project uses a tool like Turborepo. Otherwise, you'll need to start them separately:

- **To start the API:**

  ```bash
  cd apps/api
  npm run dev
  ```

- **To start the Web UI:**

  ```bash
  cd apps/web
  npm run dev
  ```

---

## ✅ Evaluation Criteria

The final solution will be evaluated based on the following:

1.  **Database Design**: Choice of database and effective data modeling.
2.  **Code Structure**: Clean, modular, and maintainable code.
3.  **Performance**: Optimized for high-throughput and low-latency operations.
4.  **Indexing**: Proper database indexing for efficient queries.
5.  **Caching**: Strategic use of caching to improve performance.
6.  **Testing**: Comprehensive unit tests to ensure reliability.
7.  **Monitoring**: Implementation of monitoring tools to track system health.
8.  **UI/UX**: Clean, simple, and usable user interface.
9.  **Documentation**: Clear and concise High-Level Design (HLD) and Low-Level Design (LLD) documentation.

---

## 📦 Final Deliverables

The complete project will include:

1.  **Backend Code**: The source code for the API and business logic.
2.  **Frontend Code**: The source code for the user interface.
3.  **Recorded Demo**: A video demonstration of the system's functionality.
4.  **Documentation**: All relevant design and implementation documents.
