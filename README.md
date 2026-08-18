<div align="center">

# 🏥 MediCare
### Hospital Appointment Booking System

*A full-stack appointment booking app — pick a department, choose a doctor, book a slot.*

[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](#-license)

</div>

---

## ✨ Features

- 🩺 **Department & doctor selection** — browse doctors by department (Cardiology, Dermatology, Gynecology, General Medicine)
- 📅 **Appointment booking** — pick a date, time, and reason for visit
- 🧾 **Automatic billing** — consultation fee + tax calculated automatically, with a generated grand total
- 🆔 **Unique appointment ID** generated per booking
- 💾 **Persistent storage** — appointments saved to MongoDB
- 🌐 **Single-server setup** — Express serves both the API and the static frontend

## 🛠️ Tech Stack

| Layer | Stack |
|---|---|
| **Backend** | Node.js, Express |
| **Database** | MongoDB (Mongoose) |
| **Frontend** | Static HTML (served from `public/`) |
| **Other** | dotenv, CORS |

## 📁 Project Structure

```
hospital-appointment/
├── public/
│   └── index.html       # Frontend booking UI
├── server.js             # Express app, API routes, doctor data, Mongoose schema
├── package.json
└── .gitignore
```

## 🚀 Getting Started

### Prerequisites
- Node.js installed
- A MongoDB connection string (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### Setup

```bash
npm install
```

Create a `.env` file in the project root:
```
MONGO_URI=your_mongodb_connection_string
PORT=3000
```

### Run it

```bash
npm start
```

Open **http://localhost:3000** in your browser.

## 📡 API

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/appointments` | Book a new appointment — returns the created appointment with a generated `appointmentId` and calculated fees |

**Request body example:**
```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "phone": "0300-0000000",
  "dob": "1995-01-01",
  "gender": "female",
  "department": "cardiologist",
  "doctorId": "c1",
  "appointmentDate": "2026-08-25",
  "appointmentTime": "10:00",
  "reason": "Routine checkup"
}
```

## 🩺 Available Departments & Doctors

| Department | Doctors |
|---|---|
| Cardiologist | Dr. Ahmed Khan, Dr. Ali Raza |
| Dermatologist | Dr. Sana Malik |
| Gynecologist | Dr. Ayesha Noor |
| General | Dr. Bilal Ahmed |

## ⚠️ Security Note

Never commit your real `.env` file — it's already excluded via `.gitignore`. Keep your `MONGO_URI` private, especially if it includes a username/password.

## 🗺️ Roadmap

- [ ] Doctor availability / time-slot conflict checks
- [ ] Email/SMS appointment confirmation
- [ ] Patient login & appointment history
- [ ] Admin dashboard for managing doctors and bookings

## 📄 License

ISC
