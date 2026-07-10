const diseaseData = [
  { penyakit: 'Demam', obat: ['Paracetamol', 'Ibuprofen'] },
  { penyakit: 'Flu', obat: ['Decolgen', 'Bodrex Flu'] },
  { penyakit: 'Batuk', obat: ['OBH', 'Woods'] },
  { penyakit: 'Maag', obat: ['Antasida', 'Omeprazole'] },
  { penyakit: 'Diare', obat: ['Oralit', 'Loperamide'] },
];

export default function PenyakitPage() {
  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Penyakit & Rekomendasi Obat</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Hubungkan penyakit dengan beberapa obat untuk memberikan rekomendasi yang cepat dan terstruktur.</p>
        </header>

        <section className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Daftar Penyakit</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Rekomendasi obat otomatis berdasarkan penyakit yang dipilih.</p>
            </div>
            <button className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white">+ Tambah Penyakit</button>
          </div>

          <div className="space-y-3">
            {diseaseData.map((item) => (
              <div key={item.penyakit} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800">
                <p className="font-semibold text-slate-800 dark:text-slate-100">{item.penyakit}</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Obat terkait: {item.obat.join(', ')}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
