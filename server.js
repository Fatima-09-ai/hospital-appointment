
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// MongoDB connection (SAFE)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Error:', err.message));

// Schema
const appointmentSchema = new mongoose.Schema({
  patient: Object,
  department: String,
  doctor: Object,
  appointmentDate: String,
  appointmentTime: String,
  reason: String,
  consultationFee: Number,
  tax: Number,
  grandTotal: Number,
  appointmentId: String,
  bookedAt: { type: Date, default: Date.now }
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

// Doctors
const doctors = {
  cardiologist: [
    { id:'c1', name:'Dr. Ahmed Khan', fee:3000 },
    { id:'c2', name:'Dr. Ali Raza', fee:3500 },
  ],
  dermatologist: [
    { id:'d1', name:'Dr. Sana Malik', fee:2500 },
  ],
  gynecologist: [
    { id:'g1', name:'Dr. Ayesha Noor', fee:2800 },
  ],
  general: [
    { id:'g2', name:'Dr. Bilal Ahmed', fee:2000 },
  ],
};

// API
app.post('/api/appointments', async (req, res) => {
  try {
    const body = req.body;

    const doctor = doctors[body.department]?.find(
      d => d.id === body.doctorId
    );

    if (!doctor) {
      return res.json({ success: false, error: 'Doctor not found' });
    }

    const fee = doctor.fee;
    const tax = Math.round(fee * 0.05);
    const total = fee + tax;

    const appointment = new Appointment({
      patient: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone,
        dob: body.dob,
        gender: body.gender,
        emergencyContact: body.emergencyContact,
        emergencyPhone: body.emergencyPhone,
      },
      department: body.department,
      doctor: {
        id: doctor.id,
        name: doctor.name,
        fee: doctor.fee,
      },
      appointmentDate: body.appointmentDate,
      appointmentTime: body.appointmentTime,
      reason: body.reason,
      consultationFee: fee,
      tax,
      grandTotal: total,
      appointmentId: 'APT-' + Math.floor(Math.random() * 1000000),
    });

    await appointment.save();

    res.json({ success: true, appointment });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// FIXED PORT (VERY IMPORTANT)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('Server Running on port', PORT);
});