<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pensiunan extends Model
{
    use HasFactory;

    protected $fillable = [
        'pegawai_id',
        'tanggal_pensiun',
        'satuan_kerja',
        'gaji_pokok',
        'status',
        'dokumen_sk',
        'dokumen_ktp',
        'catatan',
        'user_id',
        'verified_by',
        'verified_at',
    ];

    protected $casts = [
        'tanggal_pensiun' => 'date',
        'verified_at' => 'datetime',
    ];

    public function pegawai()
    {
        return $this->belongsTo(Pegawai::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function riwayatStatus()
    {
        return $this->hasMany(RiwayatStatusPensiun::class);
    }
}
