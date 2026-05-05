const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Doctor data
const doctors = {
  cardiologist: [
    { id: 'c1', name: 'Dr. Ahmed Raza', specialty: 'Cardiologist', fee: 3500, availability: 'Mon, Wed, Fri' },
    { id: 'c2', name: 'Dr. Sarah Malik', specialty: 'Cardiologist', fee: 4000, availability: 'Tue, Thu, Sat' },
    { id: 'c3', name: 'Dr. Omar Farooq', specialty: 'Cardiologist', fee: 3000, availability: 'Mon-Fri' }
  ],
  dermatologist: [
    { id: 'd1', name: 'Dr. Ayesha Khan', specialty: 'Dermatologist', fee: 2500, availability: 'Mon, Wed, Fri' },
    { id: 'd2', name: 'Dr. Bilal Hussain', specialty: 'Dermatologist', fee: 2000, availability: 'Tue, Thu' },
    { id: 'd3', name: 'Dr. Nadia Saleem', specialty: 'Dermatologist', fee: 2800, availability: 'Mon-Sat' }
  ],
  gynecologist: [
    { id: 'g1', name: 'Dr. Fatima Zahra', specialty: 'Gynecologist', fee: 3000, availability: 'Mon, Wed, Fri' },
    { id: 'g2', name: 'Dr. Hina Baig', specialty: 'Gynecologist', fee: 3500, availability: 'Tue, Thu, Sat' },
    { id: 'g3', name: 'Dr. Sana Qureshi', specialty: 'Gynecologist', fee: 2800, availability: 'Mon-Fri' }
  ],
  general: [
    { id: 'gp1', name: 'Dr. Usman Ali', specialty: 'General Physician', fee: 1000, availability: 'Daily' },
    { id: 'gp2', name: 'Dr. Mariam Iqbal', specialty: 'General Physician', fee: 800, availability: 'Daily' },
    { id: 'gp3', name: 'Dr. Tariq Mehmood', specialty: 'General Physician', fee: 1200, availability: 'Mon-Sat' }
  ]
};

// In-memory appointments store
const appointments = [];

// API: Get doctors by department
app.get('/api/doctors/:department', (req, res) => {
  const dept = req.params.department.toLowerCase();
  const list = doctors[dept];
  if (!list) return res.status(404).json({ error: 'Department not found' });
  res.json(list);
});

// API: Book appointment
app.post('/api/appointments', (req, res) => {
  const {
    firstName, lastName, email, phone, dob, gender,
    department, doctorId, appointmentDate, appointmentTime,
    reason, emergencyContact, emergencyPhone
  } = req.body;

  // Find doctor
  const deptDoctors = doctors[department.toLowerCase()];
  if (!deptDoctors) return res.status(400).json({ error: 'Invalid department' });

  const doctor = deptDoctors.find(d => d.id === doctorId);
  if (!doctor) return res.status(400).json({ error: 'Doctor not found' });

  const appointmentId = 'APT-' + uuidv4().split('-')[0].toUpperCase();
  const bookedAt = new Date().toISOString();

  const appointment = {
    appointmentId,
    bookedAt,
    patient: { firstName, lastName, email, phone, dob, gender, emergencyContact, emergencyPhone },
    doctor,
    department,
    appointmentDate,
    appointmentTime,
    reason,
    status: 'Confirmed',
    totalFee: doctor.fee,
    tax: Math.round(doctor.fee * 0.05),
    grandTotal: Math.round(doctor.fee * 1.05)
  };

  appointments.push(appointment);
  res.json({ success: true, appointment });
});

// Serve main HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Hospital Appointment Server running on port ${PORT}`);
});
