import React, { useState, useEffect } from 'react';

const WorkoutHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedWorkout, setSelectedWorkout] = useState(null);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5000/api/history');
            const result = await response.json();

            if (result.success) {
                setHistory(result.data);
            } else {
                setError('Gagal mengambil data riwayat.');
            }
        } catch (err) {
            setError('Terjadi kesalahan koneksi ke server.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // FUNGSI UNTUK MENGHAPUS DATA DARI MONGODB VIA BACKEND
    const handleDelete = async (e, id) => {
        e.stopPropagation(); // 💡 PENTING: Biar pas klik hapus, pop-up modal detail GAK IKUT KEBUKA!
        
        if (!window.confirm('Apakah kamu yakin ingin menghapus riwayat latihan ini?')) return;

        try {
            const response = await fetch(`http://localhost:5000/api/history/${id}`, {
                method: 'DELETE',
            });
            const result = await response.json();

            if (result.success) {
                // Update state history di layar secara real-time tanpa perlu reload page
                setHistory(history.filter(workout => workout._id !== id));
            } else {
                alert(result.message || 'Gagal menghapus.');
            }
        } catch (err) {
            alert('Gagal terhubung ke server untuk menghapus.');
            console.error(err);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    if (loading) return <div className="text-center p-8 text-slate-400 animate-pulse">Sedang memuat riwayat latihan... ⏳</div>;
    if (error) return <div className="text-red-400 text-center p-8 border border-red-500/20 bg-red-500/5 rounded-xl">{error}</div>;
    if (history.length === 0) return <div className="text-center p-12 text-slate-500 bg-slate-800 rounded-2xl border border-slate-700">Belum ada riwayat latihan. Yuk, buat program pertamamu! 💪</div>;

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-300 border-b border-slate-700 pb-2 mb-6">🗓️ Riwayat Latihan AI Kamu</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {history.map((workout) => (
                    <div 
                        key={workout._id} 
                        onClick={() => setSelectedWorkout(workout)}
                        className="border border-slate-700 rounded-2xl p-5 bg-slate-800 shadow-xl flex flex-col justify-between hover:border-emerald-500 hover:scale-[1.01] cursor-pointer transition duration-300 relative group"
                    >
                        <div>
                            <div className="flex justify-between items-start mb-3 gap-2">
                                <h3 className="text-lg font-bold text-emerald-400 leading-snug pr-6">{workout.program_name}</h3>
                                <span className="bg-emerald-500/10 text-emerald-400 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-500/20 shrink-0">
                                    ⏱️ {workout.estimated_duration_minutes} Min
                                </span>
                            </div>
                            
                            <p className="text-xs text-slate-500 mb-3">
                                Dibuat: {new Date(workout.createdAt).toLocaleDateString('id-ID', {
                                    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                })}
                            </p>

                            <div className="grid grid-cols-3 gap-2 text-[11px] bg-slate-900 p-2.5 rounded-lg border border-slate-700/60 mb-4 text-slate-300 text-center">
                                <div>🎯 <div className="font-semibold text-slate-400 truncate mt-0.5">{workout.user_profile?.fitnessGoal}</div></div>
                                <div>📈 <div className="font-semibold text-slate-400 truncate mt-0.5">{workout.user_profile?.fitnessLevel}</div></div>
                                <div>💪 <div className="font-semibold text-slate-400 truncate mt-0.5">{workout.user_profile?.equipment}</div></div>
                            </div>
                        </div>

                        <div className="text-xs text-slate-400 flex justify-between items-center border-t border-slate-700/50 pt-3">
                            <span className="text-slate-500 font-medium group-hover:text-slate-400 transition">✨ Klik untuk detail gerakan</span>
                            
                            {/* TOMBOL SAMPAH / HAPUS (Hanya muncul/terang saat kartu di-hover) */}
                            <button 
                                onClick={(e) => handleDelete(e, workout._id)}
                                className="text-slate-500 hover:text-red-400 p-1 rounded transition duration-200"
                                title="Hapus Riwayat"
                            >
                                🗑️
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL DETAIL */}
            {selectedWorkout && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl">
                        <div className="p-6 border-b border-slate-700 flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold text-emerald-400">{selectedWorkout.program_name}</h3>
                                <p className="text-xs text-slate-400 mt-1">Estimasi Waktu: {selectedWorkout.estimated_duration_minutes} Menit</p>
                            </div>
                            <button 
                                onClick={() => setSelectedWorkout(null)}
                                className="text-slate-400 hover:text-white bg-slate-700/50 hover:bg-slate-700 p-2 rounded-lg text-sm transition"
                            >
                                ✕ Tutup
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-5 text-sm">
                            <div>
                                <h4 className="font-bold text-amber-400 mb-2 border-b border-slate-700 pb-1">🏃‍♂️ Pemanasan (Warm Up)</h4>
                                <ul className="list-disc list-inside space-y-1 text-slate-300">
                                    {selectedWorkout.warm_up?.map((wu, i) => (
                                        <li key={i}><span className="font-medium text-slate-200">{wu.exercise}</span> — {wu.duration}</li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-bold text-amber-400 mb-3 border-b border-slate-700 pb-1">🏋️ Latihan Inti (Main Workout)</h4>
                                <div className="space-y-3">
                                    {selectedWorkout.main_workout?.map((mw, i) => (
                                        <div key={i} className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/50">
                                            <p className="font-bold text-slate-200">{mw.exercise_name}</p>
                                            <p className="text-xs text-slate-400 mt-0.5">{mw.sets} Set x {mw.reps} Reps | Istirahat: {mw.rest_seconds}s</p>
                                            {mw.notes && <p className="text-xs text-emerald-400/80 bg-emerald-500/5 border border-emerald-500/10 p-2 rounded mt-2">💡 {mw.notes}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 className="font-bold text-amber-400 mb-2 border-b border-slate-700 pb-1">🧘‍♂️ Pendinginan (Cool Down)</h4>
                                <ul className="list-disc list-inside space-y-1 text-slate-300">
                                    {selectedWorkout.cool_down?.map((cd, i) => (
                                        <li key={i}><span className="font-medium text-slate-200">{cd.exercise}</span> — {cd.duration}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkoutHistory;