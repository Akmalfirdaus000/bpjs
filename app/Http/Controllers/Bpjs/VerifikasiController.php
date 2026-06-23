<?php

namespace App\Http\Controllers\Bpjs;

use App\Http\Controllers\Controller;
use App\Models\Pensiunan;
use App\Models\RiwayatStatusPensiun;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class VerifikasiController extends Controller
{
    public function index(Request $request)
    {
        $query = Pensiunan::with(['pegawai.golongan', 'user', 'verifier', 'riwayatStatus.user']);

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

        return Inertia::render('bpjs/verifikasi/index', [
            'pensiunans' => $pensiunans,
            'filters' => $request->only(['search', 'status'])
        ]);
    }

    public function updateStatus(Request $request, Pensiunan $pensiunan)
    {
        $validated = $request->validate([
            'status' => 'required|in:diproses,selesai,ditolak',
            'catatan' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            $statusSebelumnya = $pensiunan->status;
            $statusBaru = $validated['status'];

            $updateData = [
                'status' => $statusBaru,
            ];

            if (in_array($statusBaru, ['selesai', 'ditolak'])) {
                $updateData['verified_by'] = auth()->id();
                $updateData['verified_at'] = now();
            } else {
                $updateData['verified_by'] = null;
                $updateData['verified_at'] = null;
            }

            $pensiunan->update($updateData);

            // Log status change
            RiwayatStatusPensiun::create([
                'pensiunan_id' => $pensiunan->id,
                'status_sebelumnya' => $statusSebelumnya,
                'status_baru' => $statusBaru,
                'catatan' => $validated['catatan'] ?? ('Status diubah menjadi ' . $statusBaru),
                'user_id' => auth()->id(),
            ]);

            DB::commit();
            return redirect()->back()->with('success', 'Status pengajuan berhasil diperbarui.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    public function laporan(Request $request)
    {
        $query = Pensiunan::with(['pegawai.golongan', 'user', 'verifier']);

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('tanggal_pensiun', [$request->input('start_date'), $request->input('end_date')]);
        }

        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        $pensiunans = $query->orderBy('tanggal_pensiun', 'asc')->get();

        return Inertia::render('bpjs/verifikasi/laporan', [
            'pensiunans' => $pensiunans,
            'filters' => $request->only(['start_date', 'end_date', 'status'])
        ]);
    }

    public function selesai(Request $request)
    {
        $query = Pensiunan::where('status', 'selesai')->with(['pegawai.golongan', 'user', 'verifier']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->whereHas('pegawai', function($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('nip', 'like', "%{$search}%");
            });
        }

        $pensiunans = $query->orderBy('verified_at', 'desc')->paginate(10)->withQueryString();

        return Inertia::render('bpjs/verifikasi/selesai', [
            'pensiunans' => $pensiunans,
            'filters' => $request->only(['search'])
        ]);
    }

    public function logAktivitas(Request $request)
    {
        $query = RiwayatStatusPensiun::with(['pensiunan.pegawai', 'user']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->whereHas('pensiunan.pegawai', function($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('nip', 'like', "%{$search}%");
            })->orWhereHas('user', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        $logs = $query->orderBy('created_at', 'desc')->paginate(15)->withQueryString();

        return Inertia::render('bpjs/verifikasi/log', [
            'logs' => $logs,
            'filters' => $request->only(['search'])
        ]);
    }
}
