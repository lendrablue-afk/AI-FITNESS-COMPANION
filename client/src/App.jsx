import React, { useState } from 'react';
import OnboardingForm from './pages/OnboardingForm';
import WorkoutHistory from './components/WorkoutHistory'; // <-- Tambahkan import ini

function App() {
  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [replacingIndex, setReplacingIndex] = useState(null); 
  const [userInputs, setUserInputs] = useState(null); 
  const [activeTab, setActiveTab] = useState('generate'); // <-- State baru untuk melacak halaman aktif

  const handleWorkoutGenerated = (data, originalInputs) => {
    setWorkoutPlan(data);
    setUserInputs(originalInputs); 
  };

  const handleReplaceExercise = async (index, currentExerciseName) => {
    setReplacingIndex(index);
    try {
      const response = await fetch('http://localhost:5000/api/workouts/replace-exercise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentExercise: currentExerciseName,
          fitnessGoal: userInputs.fitnessGoal,
          fitnessLevel: userInputs.fitnessLevel,
          equipment: userInputs.equipment,
          injuries: userInputs.injuries,
        }),
      });

      const result = await response.json();

      if (result.success) {
        const updatedMainWorkout = [...workoutPlan.main_workout];
        updatedMainWorkout[index] = result.data;

        setWorkoutPlan({
          ...workoutPlan,
          main_workout: updatedMainWorkout,
        });
      } else {
        alert('AI gagal mencarikan alternatif gerakan. Coba lagi.');
      }
    } catch (err) {
      alert('Gagal terhubung ke server.');
    } finally {
      setReplacingIndex(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white py-12 px-4 flex flex-col items-center justify-start space-y-8">
      {/* HEADER UTAMA */}
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-emerald-400 mb-2 tracking-wide">
          FITNESS COMPANION AI 🏋️‍♂️
        </h1>
        <p className="text-slate-400 max-w-md mx-auto">
          Dapatkan panduan olahraga yang benar-benar dirancang khusus untuk kondisi tubuhmu secara real-time.
        </p>
      </div>

      {/* TOMBOL NAVIGASI TAB (DARK THEME) */}
      <div className="flex bg-slate-800 p-1.5 rounded-xl border border-slate-700 w-full max-w-md justify-between">
        <button
          onClick={() => setActiveTab('generate')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'generate'
              ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          🚀 Buat Latihan
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'history'
              ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          🗓️ Riwayat Latihan
        </button>
      </div>

      {/* AREA KONTEN DINAMIS BERDASARKAN TAB */}
      {activeTab === 'generate' ? (
        /* HALAMAN 1: FORM INPUT & HASIL GENERATE */
        <div className="w-full flex flex-col md:flex-row items-start justify-center gap-8 max-w-5xl animate-fadeIn">
          {/* Sisi Kiri: Form Input */}
          <OnboardingForm onWorkoutGenerated={(data) => handleWorkoutGenerated(data, JSON.parse(localStorage.getItem('last_inputs') || '{}'))} />

          {/* Sisi Rangan: Output Hasil AI */}
          <div className="w-full md:max-w-lg bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700 min-h-[450px] flex flex-col">
            <h2 className="text-2xl font-bold text-slate-300 mb-4 border-b border-slate-700 pb-2">
              Rencana Latihan Kamu 📋
            </h2>
            
            {workoutPlan ? (
              <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2">
                <p className="text-xl font-bold text-emerald-400">{workoutPlan.program_name}</p>
                <p className="text-sm text-slate-400">Durasi perkiraan: {workoutPlan.estimated_duration_minutes} menit</p>
                
                <div>
                  <h3 className="font-semibold text-amber-400">Pemanasan:</h3>
                  <ul className="list-disc list-inside text-sm text-slate-300">
                    {workoutPlan.warm_up.map((wu, i) => (
                      <li key={i}>{wu.exercise} ({wu.duration})</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-amber-400 mb-2">Latihan Inti:</h3>
                  <div className="space-y-3">
                    {workoutPlan.main_workout.map((mw, i) => (
                      <div key={i} className="bg-slate-900 p-4 rounded-lg border border-slate-700 text-sm flex flex-col justify-between relative group">
                        <div>
                          <div className="flex justify-between items-start">
                            <p className="font-bold text-slate-200 pr-12">{mw.exercise_name}</p>
                            
                            <button
                              onClick={() => handleReplaceExercise(i, mw.exercise_name)}
                              disabled={replacingIndex !== null}
                              className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 px-2 py-1 rounded-md transition disabled:opacity-50"
                            >
                              {replacingIndex === i ? 'Mencari...' : 'Ganti 🔄'}
                            </button>
                          </div>
                          <p className="text-slate-400 text-xs mt-1">{mw.sets} Set x {mw.reps} Reps | Istirahat: {mw.rest_seconds}s</p>
                          {mw.notes && <p className="text-xs text-emerald-400/80 mt-2 bg-emerald-500/5 p-2 rounded border border-emerald-500/10">💡 {mw.notes}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-amber-400">Pendinginan:</h3>
                  <ul className="list-disc list-inside text-sm text-slate-300">
                    {workoutPlan.cool_down.map((cd, i) => (
                      <li key={i}>{cd.exercise} ({cd.duration})</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500">
                <span className="text-5xl mb-2">📋</span>
                <p>Isi form di samping untuk membuat program latihan pintarmu.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* HALAMAN 2: RIWAYAT LATIHAN */
        <div className="w-full max-w-4xl animate-fadeIn">
          <WorkoutHistory />
        </div>
      )}
    </div>
  );
}

export default App;

// Tambahkan komponen ini di bagian paling bawah file App.jsx kamu

function SubTabContainer({ workoutPlan, replacingIndex, handleReplaceExercise }) {
  const [subTab, setSubTab] = React.useState('workout');
  
  React.useEffect(() => {
    window.setSubTab = setSubTab;
    const handleEvent = (e) => setSubTab(e.detail);
    window.addEventListener('change-subtab', handleEvent);
    return () => window.removeEventListener('change-subtab', handleEvent);
  }, []);

  // Update style tombol secara manual biar sinkron dengan state
  React.useEffect(() => {
    const btnW = document.getElementById('btn-sub-workout');
    const btnN = document.getElementById('btn-sub-nutrition');
    if (btnW && btnN) {
      if (subTab === 'workout') {
        btnW.className = "flex-1 py-1.5 rounded bg-emerald-500 text-slate-950 font-bold transition";
        btnN.className = "flex-1 py-1.5 rounded text-slate-400 hover:text-slate-200 transition";
      } else {
        btnN.className = "flex-1 py-1.5 rounded bg-emerald-500 text-slate-950 font-bold transition";
        btnW.className = "flex-1 py-1.5 rounded text-slate-400 hover:text-slate-200 transition";
      }
    }
  }, [subTab]);

  if (subTab === 'workout') {
    return (
      <div className="space-y-4 overflow-y-auto max-h-[450px] pr-2 animate-fadeIn">
        <p className="text-xl font-bold text-emerald-400">{workoutPlan.program_name}</p>
        <p className="text-sm text-slate-400">Durasi perkiraan: {workoutPlan.estimated_duration_minutes} menit</p>
        
        <div>
          <h3 className="font-semibold text-amber-400">Pemanasan:</h3>
          <ul className="list-disc list-inside text-sm text-slate-300">
            {workoutPlan.warm_up?.map((wu, i) => (
              <li key={i}>{wu.exercise} ({wu.duration})</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-amber-400 mb-2">Latihan Inti:</h3>
          <div className="space-y-3">
            {workoutPlan.main_workout?.map((mw, i) => (
              <div key={i} className="bg-slate-900 p-4 rounded-lg border border-slate-700 text-sm flex flex-col justify-between relative">
                <div className="flex justify-between items-start">
                  <p className="font-bold text-slate-200 pr-12">{mw.exercise_name}</p>
                  <button
                    onClick={() => handleReplaceExercise(i, mw.exercise_name)}
                    disabled={replacingIndex !== null}
                    className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 px-2 py-1 rounded-md transition disabled:opacity-50"
                  >
                    {replacingIndex === i ? 'Mencari...' : 'Ganti 🔄'}
                  </button>
                </div>
                <p className="text-slate-400 text-xs mt-1">{mw.sets} Set x {mw.reps} Reps | Istirahat: {mw.rest_seconds}s</p>
                {mw.notes && <p className="text-xs text-emerald-400/80 mt-2 bg-emerald-500/5 p-2 rounded border border-emerald-500/10">💡 {mw.notes}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // TAMPILAN TAB NUTRISI (MENJAWAB PROBLEM KE-4)
  return (
    <div className="space-y-4 overflow-y-auto max-h-[450px] pr-2 animate-fadeIn text-sm">
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 space-y-2">
        <div className="flex justify-between border-b border-slate-800 pb-1.5">
          <span className="text-slate-400">🔥 Target Kalori:</span>
          <span className="font-bold text-emerald-400">{workoutPlan.nutrition_plan?.daily_calories || 'Dihitung AI...'}</span>
        </div>
        <div className="flex justify-between pt-0.5">
          <span className="text-slate-400">🧬 Rasio Makro:</span>
          <span className="font-bold text-amber-400 text-xs">{workoutPlan.nutrition_plan?.macro_split || 'Dihitung AI...'}</span>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-emerald-400 mb-2">🍽️ Rekomendasi Menu Makanan:</h3>
        <div className="space-y-2 text-xs">
          <div className="bg-slate-900/50 p-2.5 rounded border border-slate-700/60">
            <span className="text-amber-400 font-bold block mb-0.5">🍳 Sarapan:</span>
            <p className="text-slate-300">{workoutPlan.nutrition_plan?.meal_recommendations?.breakfast}</p>
          </div>
          <div className="bg-slate-900/50 p-2.5 rounded border border-slate-700/60">
            <span className="text-amber-400 font-bold block mb-0.5">☀️ Makan Siang:</span>
            <p className="text-slate-300">{workoutPlan.nutrition_plan?.meal_recommendations?.lunch}</p>
          </div>
          <div className="bg-slate-900/50 p-2.5 rounded border border-slate-700/60">
            <span className="text-amber-400 font-bold block mb-0.5">🌙 Makan Malam:</span>
            <p className="text-slate-300">{workoutPlan.nutrition_plan?.meal_recommendations?.dinner}</p>
          </div>
          <div className="bg-slate-900/50 p-2.5 rounded border border-slate-700/60">
            <span className="text-amber-400 font-bold block mb-0.5">🍎 Camilan Sela:</span>
            <p className="text-slate-300">{workoutPlan.nutrition_plan?.meal_recommendations?.snacks || 'Buah-buahan segar / Kacang almond'}</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-emerald-400 mb-1.5">⚠️ Aturan Diet Penting:</h3>
        <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
          {workoutPlan.nutrition_plan?.diet_rules?.map((rule, i) => (
            <li key={i}>{rule}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}