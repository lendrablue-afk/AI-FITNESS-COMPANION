const mongoose = require('mongoose');

const WorkoutSchema = new mongoose.Schema({
    program_name: { type: String, required: true },
    estimated_duration_minutes: { type: Number, required: true },
    warm_up: [{
        exercise: String,
        duration: String
    }],
    main_workout: [{
        exercise_name: String,
        sets: Number,
        reps: String, // Menggunakan String agar aman jika AI menulis "10-12" atau "Failure"
        rest_seconds: Number,
        notes: String
    }],
    cool_down: [{
        exercise: String,
        duration: String
    }],
    
    // 🥗 TAMBAHAN: Skema baru untuk menyimpan data rencana diet dan nutrisi dari Gemini AI
    nutrition_plan: {
        daily_calories: String,
        macro_split: String,
        diet_rules: [String],
        meal_recommendations: {
            breakfast: String,
            lunch: String,
            dinner: String,
            snacks: String
        }
    },
    
    // Menyimpan data input user saat program ini dibuat
    user_profile: {
        fitnessGoal: String,
        fitnessLevel: String,
        equipment: String,
        injuries: String
    }
}, { timestamps: true }); // Menggunakan timestamps bawaan Mongoose agar otomatis membuat createdAt dan updatedAt secara real-time

module.exports = mongoose.model('Workout', WorkoutSchema);