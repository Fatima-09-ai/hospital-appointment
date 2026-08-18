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

// ═════════════════════════════════════════════════════════════════════════════
// IMPROVED MONGODB CONNECTION HANDLING
// ═════════════════════════════════════════════════════════════════════════════

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log('✅ Using existing MongoDB connection');
    return;
  }

  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI environment variable is not set. Create a .env file with MONGO_URI=your_connection_string');
    }

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,  // 5s timeout for server selection
      socketTimeoutMS: 45000,          // 45s timeout for socket operations
      connectTimeoutMS: 10000,         // 10s timeout for initial connection
      retryWrites: true,
      w: 'majority',
    });

    isConnected = true;
    console.log('✅ MongoDB Connected Successfully');

  } catch (err) {
    isConnected = false;
    console.error('❌ MongoDB Connection Error:', err.message);
    throw err;
  }
};

// Connect on startup
connectDB().catch(err => {
  console.error('⚠️  Initial connection failed, will retry on first request');
});

// Middleware to ensure connection before each request
app.use(async (req, res, next) => {
  try {
    if (!isConnected || mongoose.connection.readyState !== 1) {
      console.log('🔄 Reconnecting to MongoDB...');
      await connectDB();
    }
    next();
  } catch (err) {
    console.error('Database connection middleware error:', err.message);
    return res.status(503).json({
      success: false,
      error: 'Database connection failed. Please try again in a moment.',
      details: err.message,
    });
  }
});

// ═════════════════════════════════════════════════════════════════════════════
// MONGOOSE SCHEMA & MODEL
// ═════════════════════════════════════════════════════════════════════════════

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

// ═════════════════════════════════════════════════════════════════════════════
// DOCTOR DATA
// ═════════════════════════════════════════════════════════════════════════════

const doctors = {
  cardiologist: [
    { id: 'c1', name: 'Dr. Ahmed Khan', fee: 3000 },
    { id: 'c2', name: 'Dr. Ali Raza', fee: 3500 },
  ],
  dermatologist: [
    { id: 'd1', name: 'Dr. Sana Malik', fee: 2500 },
  ],
  gynecologist: [
    { id: 'g1', name: 'Dr. Ayesha Noor', fee: 2800 },
  ],
  general: [
    { id: 'g2', name: 'Dr. Bilal Ahmed', fee: 2000 },
  ],
};

// ═════════════════════════════════════════════════════════════════════════════
// API ROUTES
// ═════════════════════════════════════════════════════════════════════════════

// Health check endpoint (useful for debugging)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mongoConnected: isConnected && mongoose.connection.readyState === 1,
    timestamp: new Date().toISOString(),
  });
});

// Book appointment
app.post('/api/appointments', async (req, res) => {
  const startTime = Date.now();

  try {
    // Double-check connection is ready
    if (!isConnected || mongoose.connection.readyState !== 1) {
      console.log('⚠️  Connection lost, attempting reconnect...');
      await connectDB();
    }

    const body = req.body;

    // ─────── Validation ───────
    if (!body.firstName || !body.email || !body.phone) {
      return res.status(400).json({
        success: false,
        error: 'Missing required patient information',
      });
    }

    if (!body.department || !body.doctorId) {
      return res.status(400).json({
        success: false,
        error: 'Must select department and doctor',
      });
    }

    // ─────── Find Doctor ───────
    const doctor = doctors[body.department]?.find(
      d => d.id === body.doctorId
    );

    if (!doctor) {
      return res.status(400).json({
        success: false,
        error: 'Doctor not found',
      });
    }

    // ─────── Calculate Fees ───────
    const fee = doctor.fee;
    const tax = Math.round(fee * 0.05);
    const total = fee + tax;

    // ─────── Create Appointment ───────
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

    // ─────── Save to Database ───────
    console.log(`📝 Saving appointment ${appointment.appointmentId}...`);
    
    const savedAppointment = await appointment.save();
    
    const elapsed = Date.now() - startTime;
    console.log(`✅ Appointment saved successfully in ${elapsed}ms`);

    res.status(201).json({
      success: true,
      appointment: savedAppointment,
    });

  } catch (err) {
    const elapsed = Date.now() - startTime;
    console.error(`❌ Error saving appointment (${elapsed}ms):`, err.message);

    // Specific error handling
    if (err.name === 'MongoTimeoutError' || err.name === 'MongoServerSelectionError') {
      return res.status(503).json({
        success: false,
        error: 'Database timeout. Please check your connection and try again.',
      });
    }

    if (err.name === 'MongoNetworkError') {
      return res.status(503).json({
        success: false,
        error: 'Cannot reach database server. Check your MONGO_URI.',
      });
    }

    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid appointment data: ' + err.message,
      });
    }

    // Generic error
    res.status(500).json({
      success: false,
      error: 'Failed to book appointment',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
});

// ═════════════════════════════════════════════════════════════════════════════
// SERVER STARTUP
// ═════════════════════════════════════════════════════════════════════════════

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║  🏥 Hospital Appointment Server            ║
╠════════════════════════════════════════════╣
║  Server: http://localhost:${PORT}
║  Status: Ready (waiting for DB connection)
║  Env: ${process.env.NODE_ENV || 'development'}
╚════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⏹️  Shutting down...');
  await mongoose.disconnect();
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
});
