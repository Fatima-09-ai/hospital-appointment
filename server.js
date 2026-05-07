

// const express = require('express');
// const cors = require('cors');

// const app = express();

// app.use(cors());
// app.use(express.json());

// const doctors = {
//   cardiologist: [
//     { id:'c1', name:'Dr. Ahmed Khan', fee:3000 },
//     { id:'c2', name:'Dr. Ali Raza', fee:3500 },
//   ],
//   dermatologist: [
//     { id:'d1', name:'Dr. Sana Malik', fee:2500 },
//   ],
//   gynecologist: [
//     { id:'g1', name:'Dr. Ayesha Noor', fee:2800 },
//   ],
//   general: [
//     { id:'g2', name:'Dr. Bilal Ahmed', fee:2000 },
//   ],
// };

// app.post('/api/appointments', (req, res) => {

//   const body = req.body;

//   const doctor = doctors[body.department]?.find(
//     d => d.id === body.doctorId
//   );

//   if (!doctor) {
//     return res.json({
//       success: false,
//       error: 'Doctor not found'
//     });
//   }

//   const fee = doctor.fee;
//   const tax = Math.round(fee * 0.05);
//   const total = fee + tax;

//   const appointment = {
//     appointmentId:
//       'APT-' + Math.floor(Math.random() * 1000000),

//     bookedAt: new Date(),

//     patient: {
//       firstName: body.firstName,
//       lastName: body.lastName,
//       email: body.email,
//       phone: body.phone,
//       dob: body.dob,
//       gender: body.gender,
//       emergencyContact: body.emergencyContact,
//       emergencyPhone: body.emergencyPhone,
//     },

//     department: body.department,

//     doctor: {
//       id: doctor.id,
//       name: doctor.name,
//     },

//     appointmentDate: body.appointmentDate,
//     appointmentTime: body.appointmentTime,

//     consultationFee: fee,
//     tax: tax,
//     grandTotal: total,
//   };

//   res.json({
//     success: true,
//     appointment,
//   });
// });

// app.listen(3000, () => {
//   console.log('Server running on http://localhost:3000');
// });
// const express = require('express');
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');

const cors = require('cors');
// const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err));

const appointmentSchema = new mongoose.Schema({
  patient: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    dob: String,
    gender: String,
    emergencyContact: String,
    emergencyPhone: String,
  },

  department: String,

  doctor: {
    id: String,
    name: String,
    fee: Number,
  },

  appointmentDate: String,
  appointmentTime: String,
  reason: String,

  consultationFee: Number,
  tax: Number,
  grandTotal: Number,

  appointmentId: String,
  bookedAt: {
    type: Date,
    default: Date.now,
  },
});

const Appointment = mongoose.model(
  'Appointment',
  appointmentSchema
);

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

app.post('/api/appointments', async (req, res) => {

  try {

    const body = req.body;

    const doctor = doctors[body.department]?.find(
      d => d.id === body.doctorId
    );

    if (!doctor) {
      return res.json({
        success: false,
        error: 'Doctor not found',
      });
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
      tax: tax,
      grandTotal: total,

      appointmentId:
        'APT-' + Math.floor(Math.random() * 1000000),
    });

    await appointment.save();

    res.json({
      success: true,
      appointment,
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      error: err.message,
    });

  }

});

app.listen(process.env.PORT, () => {
  console.log('Server Running');
});