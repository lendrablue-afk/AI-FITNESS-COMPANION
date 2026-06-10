const express = require('express');
const router = express.Router();
const { 
    generateWorkoutPlan, 
    replaceExercise, 
    getWorkoutHistory 
} = require('../controllers/workoutController');

// 1. Jalur untuk membuat latihan baru (POST)
router.post('/generate', generateWorkoutPlan);

// 2. Jalur untuk mengganti gerakan (POST)
router.post('/replace-exercise', replaceExercise);

// 3. Jalur untuk mengambil semua riwayat latihan (GET)
router.get('/history', getWorkoutHistory);

console.log("API Key Terbaca:", process.env.GEMINI_API_KEY ? "YA" : "TIDAK");

module.exports = router;