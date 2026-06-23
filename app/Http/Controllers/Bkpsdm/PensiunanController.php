<?php

namespace App\Http\Controllers\Bkpsdm;

use App\Http\Controllers\Controller;
use App\Models\Pensiunan;
use App\Models\Pegawai;
use App\Models\RiwayatStatusPensiun;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class PensiunanController extends Controller
{
    public function index(Request $request)
    {
        $query = Pensiunan::with(['pegawai.golongan', 'user']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->whereHas('pegawai', function($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('nip', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $pensiunans = $query->orderBy('created_at', 'desc')->paginate(10)->withQueryString();
        
        // Ambil pegawai yang bisa diajukan pensiun (belum pernah diajukan pensiun, atau yang pensiunnya ditolak)
        // Agar dinamis, kita ambil semua pegawai yang tidak sedang memiliki status aktif (pending/diproses/selesai)
        $pegawais = Pegawai::whereDoesntHave('pensiunans', function ($query) {
            $query->whereIn('status', ['pending', 'diproses', 'selesai']);
        })->with('golongan')->get();

        return Inertia::render('bkpsdm/pensiun/index', [
            'pensiunans' => $pensiunans,
            'pegawais' => $pegawais,
            'filters' => $request->only(['search', 'status'])
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'pegawai_id' => 'required|exists:pegawais,id',
            'tanggal_pensiun' => 'required|date',
            'satuan_kerja' => 'required|string',
            'gaji_pokok' => 'required|numeric|min:0',
            'dokumen_sk' => 'required|file|mimes:pdf,jpg,jpeg,png|max:2048',
        ]);

        DB::beginTransaction();
        try {
            if ($request->hasFile('dokumen_sk')) {
                $path = $request->file('dokumen_sk')->store('dokumen_sk_pensiun', 'public');
                $validated['dokumen_sk'] = $path;
            }

            $validated['user_id'] = auth()->id();
            $validated['status'] = 'pending';

            $pensiunan = Pensiunan::create($validated);

            // Log status
            RiwayatStatusPensiun::create([
                'pensiunan_id' => $pensiunan->id,
                'status_sebelumnya' => null,
                'status_baru' => 'pending',
                'catatan' => 'Pengajuan pensiun didaftarkan oleh BKPSDM',
                'user_id' => auth()->id()
            ]);

            DB::commit();
            return redirect()->back()->with('success', 'Pengajuan pensiun berhasil dikirim.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    public function destroy(Pensiunan $pensiunan)
    {
        if ($pensiunan->status !== 'pending' && $pensiunan->status !== 'ditolak') {
            return redirect()->back()->with('error', 'Pengajuan yang sudah diproses tidak dapat dihapus.');
        }

        DB::beginTransaction();
        try {
            if ($pensiunan->dokumen_sk) {
                Storage::disk('public')->delete($pensiunan->dokumen_sk);
            }

            $pensiunan->delete();
            DB::commit();
            return redirect()->back()->with('success', 'Pengajuan pensiun berhasil dihapus.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    public function update(Request $request, Pensiunan $pensiunan)
    {
        $validated = $request->validate([
            'tanggal_pensiun' => 'required|date',
            'satuan_kerja' => 'required|string',
            'gaji_pokok' => 'required|numeric|min:0',
            'dokumen_sk' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
        ]);

        DB::beginTransaction();
        try {
            if ($request->hasFile('dokumen_sk')) {
                // Delete old file
                if ($pensiunan->dokumen_sk) {
                    Storage::disk('public')->delete($pensiunan->dokumen_sk);
                }
                $path = $request->file('dokumen_sk')->store('dokumen_sk_pensiun', 'public');
                $validated['dokumen_sk'] = $path;
            }

            // Reset status to pending when edited/resubmitted
            $validated['status'] = 'pending';
            $validated['catatan'] = null; // Clear old rejection note

            $pensiunan->update($validated);

            // Log status
            RiwayatStatusPensiun::create([
                'pensiunan_id' => $pensiunan->id,
                'status_sebelumnya' => $pensiunan->status,
                'status_baru' => 'pending',
                'catatan' => 'Perbaikan data & dokumen dikirim ulang oleh BKPSDM',
                'user_id' => auth()->id()
            ]);

            DB::commit();
            return redirect()->back()->with('success', 'Perbaikan pengajuan pensiun berhasil dikirim.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    public function laporan(Request $request)
    {
        $query = Pensiunan::with(['pegawai.golongan', 'user']);

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('tanggal_pensiun', [$request->input('start_date'), $request->input('end_date')]);
        }

        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        $pensiunans = $query->orderBy('tanggal_pensiun', 'asc')->get();

        return Inertia::render('bkpsdm/pensiun/laporan', [
            'pensiunans' => $pensiunans,
            'filters' => $request->only(['start_date', 'end_date', 'status'])
        ]);
    }
}
