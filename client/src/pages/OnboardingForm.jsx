import React, { useState } from 'react';

function OnboardingForm({ onWorkoutGenerated }) {
  const [formData, setFormData] = useState({
    fitnessGoal: 'Menurunkan berat badan & bakar lemak',
    fitnessLevel: 'Beginner',
    equipment: 'tanpa alat',
    timeAvailability: 30,
    injuries: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/generate-workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        localStorage.setItem('last_inputs', JSON.stringify(formData)); 
        onWorkoutGenerated(result.data);
      } else {
        setError(result.message || 'Terjadi kesalahan pada AI server.');
      }
    } catch (err) {
      setError('Gagal terhubung ke backend server. Pastikan backend sudah menyala.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700">
      <h2 className="text-2xl font-bold text-center text-emerald-400 mb-6">
        Rancang Program AI-mu 🤖
      </h2>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-400 p-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 1. Fitness Goal */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Target Kebugaran</label>
          <select name="fitnessGoal" value={formData.fitnessGoal} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500">
            <option>Menurunkan berat badan & bakar lemak</option>
            <option>Membentuk otot & hipertrofi</option>
            <option>Meningkatkan stamina & kardio</option>
          </select>
        </div>

        {/* 2. Fitness Level */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Tingkat Kebugaran</label>
          <select name="fitnessLevel" value={formData.fitnessLevel} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500">
            <option value="Beginner">Pemula (Beginner)</option>
            <option value="Intermediate">Menengah (Intermediate)</option>
            <option value="Advanced">Mahir (Advanced)</option>
          </select>
        </div>

        {/* 3. Equipment */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Alat yang Tersedia</label>
          <select name="equipment" value={formData.equipment} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500">
            <option value="tanpa alat">Tanpa Alat (Calisthenics)</option>
            <option value="hanya dumbbell">Punya Dumbbell saja</option>
            <option value="gym lengkap">Fasilitas Gym Lengkap</option>
          </select>
        </div>

        {/* 4. Time Availability */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Durasi Latihan (Menit)</label>
          <input type="number" name="timeAvailability" value={formData.timeAvailability} onChange={handleChange} min="10" max="180" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500" />
        </div>

        {/* 5. Injuries */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Cedera / Keluhan Fisik (Opsional)</label>
          <input type="text" name="injuries" value={formData.injuries} onChange={handleChange} placeholder="Contoh: Sakit lutut, cedera bahu kiri" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500 placeholder-slate-500" />
        </div>

        {/* Submit Button */}
        <button type="submit" disabled={loading} className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 text-slate-950 font-bold py-3 px-4 rounded-lg transition duration-200 mt-2">
          {loading ? 'AI sedang meracik program...' : 'Buat Program Latihan ✨'}
        </button>
      </form>
    </div>
  );
}

export default OnboardingForm;