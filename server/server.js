const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');

// Koneksi ke MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Berhasil terhubung ke MongoDB Database'))
  .catch((err) => console.error('Gagal terhubung ke MongoDB:', err));

// Import controller yang baru kita buat
const workoutController = require('./controllers/workoutController');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Route Testing
app.get('/', (req, res) => {
    res.send('Server AI Fitness Companion Berjalan Lancar! 🚀');
});

// Endpoint untuk memanggil AI Workout Planner
app.post('/api/generate-workout', workoutController.generateWorkoutPlan);
app.post('/api/replace-exercise', workoutController.replaceExercise);

// 📍 TAMBAHAN: Jalur baru untuk mengambil semua riwayat latihan (GET)
app.get('/api/history', workoutController.getWorkoutHistory);

app.delete('/api/history/:id', workoutController.deleteWorkout);

// Menjalankan Server
app.listen(PORT, () => {
    console.log(`Server aktif di port http://localhost:${PORT}`);
});