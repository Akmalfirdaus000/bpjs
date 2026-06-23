<?php

use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        $role = auth()->user()->role;
        if ($role === 'admin_bpjs') {
            return redirect()->route('bpjs.dashboard');
        } elseif ($role === 'admin_bkpsdm') {
            return redirect()->route('bkpsdm.dashboard');
        }
        abort(403, 'Unauthorized role.');
    })->name('dashboard');

    Route::middleware(['role:admin_bpjs'])->group(function () {
        Route::get('bpjs/dashboard', function () {
            $total = \App\Models\Pensiunan::count();
            $pending = \App\Models\Pensiunan::where('status', 'pending')->count();
            $diproses = \App\Models\Pensiunan::where('status', 'diproses')->count();
            $selesai = \App\Models\Pensiunan::where('status', 'selesai')->count();
            $ditolak = \App\Models\Pensiunan::where('status', 'ditolak')->count();
            $riwayats = \App\Models\RiwayatStatusPensiun::with(['pensiunan.pegawai', 'user'])->latest()->take(5)->get();

            // Additional stats for chart
            $topSatker = \App\Models\Pensiunan::select('satuan_kerja', \DB::raw('count(*) as total'))
                ->groupBy('satuan_kerja')
                ->orderByDesc('total')
                ->take(3)
                ->get();

            return Inertia\Inertia::render('bpjs/dashboard/dashboard', [
                'stats' => compact('total', 'pending', 'diproses', 'selesai', 'ditolak'),
                'recentActivities' => $riwayats,
                'topSatker' => $topSatker
            ]);
        })->name('bpjs.dashboard');

        Route::get('bpjs/verifikasi/laporan', [App\Http\Controllers\Bpjs\VerifikasiController::class, 'laporan'])->name('bpjs.verifikasi.laporan');
        Route::get('bpjs/verifikasi-selesai', [App\Http\Controllers\Bpjs\VerifikasiController::class, 'selesai'])->name('bpjs.verifikasi.selesai');
        Route::get('bpjs/log-aktivitas', [App\Http\Controllers\Bpjs\VerifikasiController::class, 'logAktivitas'])->name('bpjs.log-aktivitas');
        Route::get('bpjs/verifikasi', [App\Http\Controllers\Bpjs\VerifikasiController::class, 'index'])->name('bpjs.verifikasi.index');
        Route::patch('bpjs/verifikasi/{pensiunan}/status', [App\Http\Controllers\Bpjs\VerifikasiController::class, 'updateStatus'])->name('bpjs.verifikasi.status');
    });

    Route::middleware(['role:admin_bkpsdm'])->group(function () {
        Route::get('bkpsdm/dashboard', function () {
            $totalPegawai = \App\Models\Pegawai::count();
            $totalPengajuan = \App\Models\Pensiunan::count();
            $pending = \App\Models\Pensiunan::where('status', 'pending')->count();
            $diproses = \App\Models\Pensiunan::where('status', 'diproses')->count();
            $selesai = \App\Models\Pensiunan::where('status', 'selesai')->count();
            $ditolak = \App\Models\Pensiunan::where('status', 'ditolak')->count();
            $recentPensions = \App\Models\Pensiunan::with('pegawai.golongan')->latest()->take(5)->get();

            // Extra stats for charts
            $topSatker = \App\Models\Pensiunan::select('satuan_kerja', \DB::raw('count(*) as total'))
                ->groupBy('satuan_kerja')
                ->orderByDesc('total')
                ->take(3)
                ->get();

            $golonganDistribution = \App\Models\Pensiunan::join('pegawais', 'pensiunans.pegawai_id', '=', 'pegawais.id')
                ->join('golongans', 'pegawais.golongan_id', '=', 'golongans.id')
                ->select('golongans.nama_golongan', \DB::raw('count(*) as total'))
                ->groupBy('golongans.nama_golongan')
                ->orderByDesc('total')
                ->get();

            return Inertia\Inertia::render('bkpsdm/dashboard/dashboard', [
                'stats' => compact('totalPegawai', 'totalPengajuan', 'pending', 'diproses', 'selesai', 'ditolak'),
                'recentPensions' => $recentPensions,
                'topSatker' => $topSatker,
                'golonganDistribution' => $golonganDistribution
            ]);
        })->name('bkpsdm.dashboard');

        // Master Pegawai
        Route::get('bkpsdm/pegawai', [App\Http\Controllers\Bkpsdm\PegawaiController::class, 'index'])->name('bkpsdm.pegawai.index');
        Route::post('bkpsdm/pegawai', [App\Http\Controllers\Bkpsdm\PegawaiController::class, 'store'])->name('bkpsdm.pegawai.store');
        Route::put('bkpsdm/pegawai/{pegawai}', [App\Http\Controllers\Bkpsdm\PegawaiController::class, 'update'])->name('bkpsdm.pegawai.update');
        Route::delete('bkpsdm/pegawai/{pegawai}', [App\Http\Controllers\Bkpsdm\PegawaiController::class, 'destroy'])->name('bkpsdm.pegawai.destroy');

        // Master Golongan
        Route::get('bkpsdm/golongan', [App\Http\Controllers\Bkpsdm\GolonganController::class, 'index'])->name('bkpsdm.golongan.index');
        Route::post('bkpsdm/golongan', [App\Http\Controllers\Bkpsdm\GolonganController::class, 'store'])->name('bkpsdm.golongan.store');
        Route::put('bkpsdm/golongan/{golongan}', [App\Http\Controllers\Bkpsdm\GolonganController::class, 'update'])->name('bkpsdm.golongan.update');
        Route::delete('bkpsdm/golongan/{golongan}', [App\Http\Controllers\Bkpsdm\GolonganController::class, 'destroy'])->name('bkpsdm.golongan.destroy');

        // Master User
        Route::get('bkpsdm/user', [App\Http\Controllers\Bkpsdm\UserController::class, 'index'])->name('bkpsdm.user.index');
        Route::post('bkpsdm/user', [App\Http\Controllers\Bkpsdm\UserController::class, 'store'])->name('bkpsdm.user.store');
        Route::put('bkpsdm/user/{user}', [App\Http\Controllers\Bkpsdm\UserController::class, 'update'])->name('bkpsdm.user.update');
        Route::delete('bkpsdm/user/{user}', [App\Http\Controllers\Bkpsdm\UserController::class, 'destroy'])->name('bkpsdm.user.destroy');

        // Pengajuan Pensiun
        Route::get('bkpsdm/pensiun/laporan', [App\Http\Controllers\Bkpsdm\PensiunanController::class, 'laporan'])->name('bkpsdm.pensiun.laporan');
        Route::get('bkpsdm/pensiun', [App\Http\Controllers\Bkpsdm\PensiunanController::class, 'index'])->name('bkpsdm.pensiun.index');
        Route::post('bkpsdm/pensiun', [App\Http\Controllers\Bkpsdm\PensiunanController::class, 'store'])->name('bkpsdm.pensiun.store');
        Route::post('bkpsdm/pensiun/{pensiunan}', [App\Http\Controllers\Bkpsdm\PensiunanController::class, 'update'])->name('bkpsdm.pensiun.update');
        Route::delete('bkpsdm/pensiun/{pensiunan}', [App\Http\Controllers\Bkpsdm\PensiunanController::class, 'destroy'])->name('bkpsdm.pensiun.destroy');
    });
});

require __DIR__.'/settings.php';
