<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Golongan;
use App\Models\Pegawai;
use App\Models\Pensiunan;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Admins
        $adminBpjs = User::create([
            'name' => 'Admin BPJS Padang',
            'email' => 'admin.bpjs@gmail.com',
            'password' => Hash::make('123'),
            'role' => 'admin_bpjs',
        ]);

        $adminBkpsdm = User::create([
            'name' => 'Admin BKPSDM Padang',
            'email' => 'admin.bkpsdm@gmail.com',
            'password' => Hash::make('123'),
            'role' => 'admin_bkpsdm',
        ]);

        // 3. Create Golongans
        $gol1 = Golongan::create(['nama_golongan' => 'IV/a', 'pangkat' => 'Pembina']);
        $gol2 = Golongan::create(['nama_golongan' => 'IV/b', 'pangkat' => 'Pembina Tingkat I']);
        $gol3 = Golongan::create(['nama_golongan' => 'III/d', 'pangkat' => 'Penata Tingkat I']);

        // 4. Create Pegawais
        $pegawai1 = Pegawai::create([
            'nip' => '196501011990011001',
            'nik' => '1371000000000001',
            'no_kk' => '1371000000000011',
            'nama' => 'Budi Santoso',
            'tempat_lahir' => 'Padang',
            'tanggal_lahir' => '1965-01-01',
            'jenis_kelamin' => 'Laki-laki',
            'status_kawin' => 'Menikah',
            'no_hp' => '081234567890',
            'alamat' => 'Jl. Khatib Sulaiman No. 1, Padang',
            'hub_keluarga' => 'PESERTA',
            'golongan_id' => $gol1->id,
        ]);

        $pegawai2 = Pegawai::create([
            'nip' => '196602021991022002',
            'nik' => '1371000000000002',
            'no_kk' => '1371000000000012',
            'nama' => 'Siti Aminah',
            'tempat_lahir' => 'Bukittinggi',
            'tanggal_lahir' => '1966-02-02',
            'jenis_kelamin' => 'Perempuan',
            'status_kawin' => 'Menikah',
            'no_hp' => '081298765432',
            'alamat' => 'Jl. Sudirman No. 2, Padang',
            'hub_keluarga' => 'PESERTA',
            'golongan_id' => $gol2->id,
        ]);

        $pegawai3 = Pegawai::create([
            'nip' => '197003031995031003',
            'nik' => '1371000000000003',
            'no_kk' => '1371000000000013',
            'nama' => 'Ahmad Fauzi',
            'tempat_lahir' => 'Padang',
            'tanggal_lahir' => '1970-03-03',
            'jenis_kelamin' => 'Laki-laki',
            'status_kawin' => 'Menikah',
            'no_hp' => '081211112222',
            'alamat' => 'Jl. Gajah Mada No. 3, Padang',
            'hub_keluarga' => 'PESERTA',
            'golongan_id' => $gol3->id,
        ]);

        $pegawai4 = Pegawai::create([
            'nip' => '197504042000032004',
            'nik' => '1371000000000004',
            'no_kk' => '1371000000000014',
            'nama' => 'Rina Herawati',
            'tempat_lahir' => 'Solok',
            'tanggal_lahir' => '1975-04-04',
            'jenis_kelamin' => 'Perempuan',
            'status_kawin' => 'Menikah',
            'no_hp' => '081233334444',
            'alamat' => 'Jl. Hamka No. 4, Padang',
            'hub_keluarga' => 'PESERTA',
            'golongan_id' => $gol2->id,
        ]);

        // 5. Create Pensiunan (Pengajuan)
        Pensiunan::create([
            'pegawai_id' => $pegawai1->id,
            'tanggal_pensiun' => Carbon::now()->addMonth(),
            'satuan_kerja' => 'Dinas Pendidikan Kota Padang',
            'gaji_pokok' => 4500000.00,
            'status' => 'pending',
            'user_id' => $adminBkpsdm->id,
        ]);

        Pensiunan::create([
            'pegawai_id' => $pegawai2->id,
            'tanggal_pensiun' => Carbon::now()->subMonth(),
            'satuan_kerja' => 'Dinas Kesehatan Kota Padang',
            'gaji_pokok' => 4200000.00,
            'status' => 'selesai',
            'user_id' => $adminBkpsdm->id,
            'verified_by' => $adminBpjs->id,
            'verified_at' => Carbon::now(),
        ]);
    }
}
