<?php

namespace App\Http\Controllers\Bkpsdm;

use App\Http\Controllers\Controller;
use App\Models\Pegawai;
use App\Models\Golongan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PegawaiController extends Controller
{
    public function index(Request $request)
    {
        $query = Pegawai::with('golongan');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('nip', 'like', "%{$search}%")
                  ->orWhere('nik', 'like', "%{$search}%");
            });
        }

        $pegawais = $query->paginate(10)->withQueryString();
        $golongans = Golongan::all();

        return Inertia::render('bkpsdm/pegawai/index', [
            'pegawais' => $pegawais,
            'golongans' => $golongans,
            'filters' => $request->only('search')
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nip' => 'required|string|unique:pegawais,nip',
            'nik' => 'nullable|string|unique:pegawais,nik',
            'no_kk' => 'nullable|string',
            'nama' => 'required|string',
            'tempat_lahir' => 'nullable|string',
            'tanggal_lahir' => 'required|date',
            'jenis_kelamin' => 'nullable|string',
            'status_kawin' => 'nullable|string',
            'no_hp' => 'nullable|string',
            'alamat' => 'nullable|string',
            'hub_keluarga' => 'required|string',
            'golongan_id' => 'required|exists:golongans,id',
        ]);

        Pegawai::create($validated);

        return redirect()->back()->with('success', 'Data pegawai berhasil ditambahkan.');
    }

    public function update(Request $request, Pegawai $pegawai)
    {
        $validated = $request->validate([
            'nip' => 'required|string|unique:pegawais,nip,' . $pegawai->id,
            'nik' => 'nullable|string|unique:pegawais,nik,' . $pegawai->id,
            'no_kk' => 'nullable|string',
            'nama' => 'required|string',
            'tempat_lahir' => 'nullable|string',
            'tanggal_lahir' => 'required|date',
            'jenis_kelamin' => 'nullable|string',
            'status_kawin' => 'nullable|string',
            'no_hp' => 'nullable|string',
            'alamat' => 'nullable|string',
            'hub_keluarga' => 'required|string',
            'golongan_id' => 'required|exists:golongans,id',
        ]);

        $pegawai->update($validated);

        return redirect()->back()->with('success', 'Data pegawai berhasil diubah.');
    }

    public function destroy(Pegawai $pegawai)
    {
        $pegawai->delete();
        return redirect()->back()->with('success', 'Data pegawai berhasil dihapus.');
    }
}
