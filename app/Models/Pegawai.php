<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pegawai extends Model
{
    use HasFactory;

    protected $fillable = [
        'nip', 'nik', 'no_kk', 'nama', 'tempat_lahir', 'tanggal_lahir',
        'jenis_kelamin', 'status_kawin', 'no_hp', 'alamat', 'hub_keluarga',
        'golongan_id'
    ];

    protected $casts = [
        'tanggal_lahir' => 'date',
    ];

    public function golongan()
    {
        return $this->belongsTo(Golongan::class);
    }

    public function pensiunans()
    {
        return $this->hasMany(Pensiunan::class);
    }
}
