<?php

namespace App\Http\Controllers\Bkpsdm;

use App\Http\Controllers\Controller;
use App\Models\Golongan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GolonganController extends Controller
{
    public function index(Request $request)
    {
        $query = Golongan::query();

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('nama_golongan', 'like', "%{$search}%")
                  ->orWhere('pangkat', 'like', "%{$search}%");
        }

        $golongans = $query->orderBy('nama_golongan', 'asc')->paginate(10)->withQueryString();

        return Inertia::render('bkpsdm/golongan/index', [
            'golongans' => $golongans,
            'filters' => $request->only(['search'])
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_golongan' => 'required|string|unique:golongans,nama_golongan|max:20',
            'pangkat' => 'required|string|max:100',
        ]);

        Golongan::create($validated);

        return redirect()->back()->with('success', 'Golongan berhasil ditambahkan.');
    }

    public function update(Request $request, Golongan $golongan)
    {
        $validated = $request->validate([
            'nama_golongan' => 'required|string|max:20|unique:golongans,nama_golongan,' . $golongan->id,
            'pangkat' => 'required|string|max:100',
        ]);

        $golongan->update($validated);

        return redirect()->back()->with('success', 'Golongan berhasil diperbarui.');
    }

    public function destroy(Golongan $golongan)
    {
        // Pastikan tidak ada pegawai yang terhubung ke golongan ini
        if ($golongan->pegawais()->exists()) {
            return redirect()->back()->with('error', 'Golongan tidak dapat dihapus karena masih digunakan oleh data pegawai.');
        }

        $golongan->delete();

        return redirect()->back()->with('success', 'Golongan berhasil dihapus.');
    }
}
