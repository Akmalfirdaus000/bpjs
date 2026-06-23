<?php

namespace App\Http\Controllers\Bkpsdm;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('role', 'like', "%{$search}%");
        }

        $users = $query->orderBy('name', 'asc')->paginate(10)->withQueryString();

        return Inertia::render('bkpsdm/user/index', [
            'users' => $users,
            'filters' => $request->only(['search'])
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:3',
            'role' => 'required|in:admin_bpjs,admin_bkpsdm',
        ]);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
        ]);

        return redirect()->back()->with('success', 'User admin berhasil ditambahkan.');
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:3',
            'role' => 'required|in:admin_bpjs,admin_bkpsdm',
        ]);

        $updateData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
        ];

        if ($request->filled('password')) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $user->update($updateData);

        return redirect()->back()->with('success', 'User admin berhasil diperbarui.');
    }

    public function destroy(User $user)
    {
        // Jangan biarkan admin menghapus dirinya sendiri
        if (auth()->id() === $user->id) {
            return redirect()->back()->with('error', 'Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif digunakan.');
        }

        // Jangan biarkan menghapus user jika ada relasi
        if ($user->pensiunans()->exists() || \App\Models\Pensiunan::where('verified_by', $user->id)->exists()) {
            return redirect()->back()->with('error', 'User admin tidak dapat dihapus karena telah melakukan transaksi verifikasi / pengajuan pensiun.');
        }

        $user->delete();

        return redirect()->back()->with('success', 'User admin berhasil dihapus.');
    }
}
