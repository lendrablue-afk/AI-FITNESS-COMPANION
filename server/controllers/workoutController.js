const { GoogleGenerativeAI } = require('@google/generative-ai');
const Workout = require('../models/Workout');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 1. FUNGSI UNTUK MEMBUAT PROGRAM LATIHAN + DIET BARU DAN SIMPAN KE MONGODB
exports.generateWorkoutPlan = async (req, res) => {
    try {
        const { fitnessGoal, fitnessLevel, equipment, timeAvailability, injuries } = req.body;

        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes("PASTE_API_KEY")) {
            throw new Error("API Key Gemini belum dipasang dengan benar di file .env");
        }

        // Menggunakan model gemini-3.5-flash yang super cepat, stabil, dan cerdas
        const model = genAI.getGenerativeModel({ 
            model: "gemini-3.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `
        Kamu adalah seorang Personal Trainer bersertifikasi internasional sekaligus Ahli Gizi (Nutritionist) profesional. 
        Tugasmu adalah membuatkan program latihan harian beserta panduan nutrisi/diet (meal plan) dalam format JSON murni yang saling mendukung demi mencapai target klien.

        Data Klien:
        - Fitness Goal: ${fitnessGoal}
        - Fitness Level: ${fitnessLevel}
        - Alat yang Tersedia: ${equipment}
        - Ketersediaan Waktu: ${timeAvailability} menit sehari
        - Cedera/Keterbatasan Fisik: ${injuries || "Tidak ada"}

        Aturan Ketat Latihan:
        1. Jika ada cedera, hindari gerakan yang membebani area tersebut dan berikan alternatif aman.
        2. Sesuaikan intensitas latihan dengan Fitness Level klien.
        3. Jangan berikan latihan menggunakan alat jika pilihan alat adalah "tanpa alat".

        Aturan Ketat Nutrisi (Diet):
        1. Berikan estimasi target kalori harian dan pembagian makronutrisi (protein, karbohidrat, lemak) yang rasional sesuai goal mereka.
        2. Tuliskan rekomendasi menu makan yang spesifik, sehat, mudah dicari, dan padat nutrisi dari sarapan hingga makan malam.

        Kamu WAJIB mengembalikan data dalam struktur JSON dengan format persis seperti contoh di bawah ini tanpa variasi nama field:
        {
          "program_name": "Nama Program Latihan",
          "estimated_duration_minutes": 30,
          "warm_up": [
            { "exercise": "Nama Gerakan Pemanasan", "duration": "Durasi" }
          ],
          "main_workout": [
            { "exercise_name": "Nama Gerakan Inti", "sets": 3, "reps": "10", "rest_seconds": 60, "notes": "Tips aman atau tempo" }
          ],
          "cool_down": [
            { "exercise": "Nama Gerakan Pendinginan", "duration": "Durasi" }
          ],
          "nutrition_plan": {
            "daily_calories": "Estimasi kalori (misal: 1800 kcal atau 2500 kcal)",
            "macro_split": "Rasio makro (misal: Protein 120g, Karbohidrat 180g, Lemak 60g)",
            "diet_rules": [
              "Aturan wajib diet 1 sesuai goal mereka",
              "Aturan wajib diet 2 sesuai goal mereka"
            ],
            "meal_recommendations": {
              "breakfast": "Menu rekomendasi untuk sarapan pagi",
              "lunch": "Menu rekomendasi untuk makan siang",
              "dinner": "Menu rekomendasi untuk makan malam",
              "snacks": "Menu rekomendasi camilan sehat di sela waktu makan"
            }
          }
        }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let textOutput = response.text().trim();

        // Pembersihan format markdown code block jika tidak sengaja keluar
        if (textOutput.startsWith("```json")) {
            textOutput = textOutput.replace(/```json|```/g, "").trim();
        } else if (textOutput.startsWith("```")) {
            textOutput = textOutput.replace(/```/g, "").trim();
        }

        const jsonOutput = JSON.parse(textOutput);
        
        // Simpan otomatis hasil AI (Termasuk skema struktur nutrisi baru) ke database MongoDB Cloud Atlas
        const newWorkout = new Workout({
            program_name: jsonOutput.program_name,
            estimated_duration_minutes: jsonOutput.estimated_duration_minutes,
            warm_up: jsonOutput.warm_up,
            main_workout: jsonOutput.main_workout,
            cool_down: jsonOutput.cool_down,
            nutrition_plan: jsonOutput.nutrition_plan, // <-- Otomatis tersimpan rapi di DB
            user_profile: { fitnessGoal, fitnessLevel, equipment, injuries }
        });
        
        const savedWorkout = await newWorkout.save();

        return res.status(200).json({
            success: true,
            data: savedWorkout 
        });

    } catch (error) {
        console.error("====== ERROR DI SERVER (GENERATE) ======");
        console.error(error);
        console.error("========================================");

        return res.status(500).json({
            success: false,
            message: "Gagal membuat program latihan dan diet lewat AI.",
            error: error.message
        });
    }
};

// 2. FUNGSI UNTUK MENGGANTI SATU GERAKAN YANG TIDAK COCOK
exports.replaceExercise = async (req, res) => {
    try {
        const { currentExercise, fitnessGoal, fitnessLevel, equipment, injuries } = req.body;

        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `
        Kamu adalah seorang Personal Trainer bersertifikasi. Klien ingin mengganti satu gerakan dari program latihan mereka karena merasa tidak cocok, terlalu sulit, atau tidak nyaman.

        Gerakan yang ingin diganti: ${currentExercise}

        Profil Klien Saat Ini:
        - Target: ${fitnessGoal}
        - Level: ${fitnessLevel}
        - Alat: ${equipment}
        - Cedera/Keluhan: ${injuries || "Tidak ada"}

        Tugasmu:
        Berikan SATU gerakan alternatif yang menargetkan kelompok otot yang sama, aman untuk kondisi cederanya, dan sesuai dengan alat yang tersedia.

        Kamu WAJIB mengembalikan data dalam struktur JSON murni yang berisi 1 objek gerakan saja dengan format persis seperti ini:
        {
          "exercise_name": "Nama Gerakan Alternatif Baru",
          "sets": 3,
          "reps": "10",
          "rest_seconds": 60,
          "notes": "Alasan memilih gerakan ini atau tips keamanan baru"
        }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let textOutput = response.text().trim();

        if (textOutput.startsWith("```json")) {
            textOutput = textOutput.replace(/```json|```/g, "").trim();
        } else if (textOutput.startsWith("```")) {
            textOutput = textOutput.replace(/```/g, "").trim();
        }

        const jsonOutput = JSON.parse(textOutput);
        
        return res.status(200).json({
            success: true,
            data: jsonOutput
        });

    } catch (error) {
        console.error("Error Replace Exercise:", error);
        return res.status(500).json({
            success: false,
            message: "Gagal mencarikan gerakan alternatif.",
            error: error.message
        });
    }
};

// 3. FUNGSI UNTUK MENGAMBIL SEMUA RIWAYAT LATIHAN DARI MONGODB
exports.getWorkoutHistory = async (req, res) => {
    try {
        // Mengambil seluruh riwayat latihan dan diurutkan dari yang paling baru dibuat
        const history = await Workout.find().sort({ createdAt: -1 });
        
        return res.status(200).json({
            success: true,
            data: history
        });
    } catch (error) {
        console.error("====== ERROR AMBIL RIWAYAT ======");
        console.error(error);
        console.error("=================================");
        
        return res.status(500).json({
            success: false,
            message: "Gagal mengambil riwayat latihan.",
            error: error.message
        });
    }
};

// 4. FUNGSI UNTUK MENGHAPUS SATU RIWAYAT LATIHAN
exports.deleteWorkout = async (req, res) => {
    try {
        const { id } = req.params; // Mengambil ID dari URL
        
        const deletedWorkout = await Workout.findByIdAndDelete(id);
        
        if (!deletedWorkout) {
            return res.status(404).json({
                success: false,
                message: "Data latihan tidak ditemukan."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Riwayat latihan berhasil dihapus!"
        });
    } catch (error) {
        console.error("====== ERROR HAPUS RIWAYAT ======");
        console.error(error);
        console.error("=================================");
        return res.status(500).json({
            success: false,
            message: "Gagal menghapus riwayat latihan.",
            error: error.message
        });
    }
};