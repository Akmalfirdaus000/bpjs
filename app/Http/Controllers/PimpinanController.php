<?php

namespace App\Http\Controllers;

use App\Models\Pensiunan;
use App\Models\Pegawai;
use App\Models\RiwayatStatusPensiun;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class PimpinanController extends Controller
{
    public function dashboard()
    {
        $totalPegawai = Pegawai::count();
        $totalPengajuan = Pensiunan::count();
        $pending = Pensiunan::where('status', 'pending')->count();
        $diproses = Pensiunan::where('status', 'diproses')->count();
        $selesai = Pensiunan::where('status', 'selesai')->count();
        $ditolak = Pensiunan::where('status', 'ditolak')->count();

        $recentPensions = Pensiunan::with('pegawai.golongan')->latest()->take(5)->get();
        $recentActivities = RiwayatStatusPensiun::with(['pensiunan.pegawai', 'user'])->latest()->take(5)->get();

        $topSatker = Pensiunan::select('satuan_kerja', DB::raw('count(*) as total'))
            ->groupBy('satuan_kerja')
            ->orderByDesc('total')
            ->take(3)
            ->get();

        $golonganDistribution = Pensiunan::join('pegawais', 'pensiunans.pegawai_id', '=', 'pegawais.id')
            ->join('golongans', 'pegawais.golongan_id', '=', 'golongans.id')
            ->select('golongans.nama_golongan', DB::raw('count(*) as total'))
            ->groupBy('golongans.nama_golongan')
            ->orderByDesc('total')
            ->get();

        return Inertia::render('pimpinan/dashboard/dashboard', [
            'stats' => compact('totalPegawai', 'totalPengajuan', 'pending', 'diproses', 'selesai', 'ditolak'),
            'recentPensions' => $recentPensions,
            'recentActivities' => $recentActivities,
            'topSatker' => $topSatker,
            'golonganDistribution' => $golonganDistribution
        ]);
    }

    public function laporanBkpsdm(Request $request)
    {
        $query = Pensiunan::with(['pegawai.golongan', 'user']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->whereHas('pegawai', function($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('nip', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        $pensiunans = $query->orderBy('created_at', 'desc')->paginate(10)->withQueryString();

        return Inertia::render('pimpinan/laporan/bkpsdm', [
            'pensiunans' => $pensiunans,
            'filters' => $request->only(['search', 'status'])
        ]);
    }

    public function laporanBpjs(Request $request)
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

        return Inertia::render('pimpinan/laporan/bpjs', [
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

        return Inertia::render('pimpinan/log/index', [
            'logs' => $logs,
            'filters' => $request->only(['search'])
        ]);
    }

    public function cetakBkpsdm(Request $request)
    {
        $query = Pensiunan::with(['pegawai.golongan', 'user']);

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('tanggal_pensiun', [$request->input('start_date'), $request->input('end_date')]);
        }

        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        $pensiunans = $query->orderBy('tanggal_pensiun', 'asc')->get();

        return Inertia::render('pimpinan/laporan/cetak_bkpsdm', [
            'pensiunans' => $pensiunans,
            'filters' => $request->only(['start_date', 'end_date', 'status'])
        ]);
    }

    public function cetakBpjs(Request $request)
    {
        $query = Pensiunan::with(['pegawai.golongan', 'user', 'verifier']);

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('tanggal_pensiun', [$request->input('start_date'), $request->input('end_date')]);
        }

        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        $pensiunans = $query->orderBy('tanggal_pensiun', 'asc')->get();

        return Inertia::render('pimpinan/laporan/cetak_bpjs', [
            'pensiunans' => $pensiunans,
            'filters' => $request->only(['start_date', 'end_date', 'status'])
        ]);
    }
}
