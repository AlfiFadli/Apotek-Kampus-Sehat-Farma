export default function DatabasePage() {
  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-3xl bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Struktur Database</h1>
          <p className="mt-2 text-sm text-slate-600">Blueprint tabel utama untuk sistem apotek profesional yang siap dikembangkan ke produksi.</p>
        </header>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {['users','roles','obat','kategori_obat','jenis_obat','penyakit','penyakit_obat','supplier','pembelian','detail_pembelian','penjualan','detail_penjualan','stok_log','pengeluaran','laporan_bulanan','laporan_tahunan'].map((table) => (
              <div key={table} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="font-semibold text-slate-800">{table}</p>
                <p className="mt-1 text-sm text-slate-500">Tabel inti sistem apotek</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
