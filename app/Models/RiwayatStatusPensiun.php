<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RiwayatStatusPensiun extends Model
{
    use HasFactory;

    protected $fillable = [
        'pensiunan_id',
        'status_sebelumnya',
        'status_baru',
        'catatan',
        'user_id'
    ];

    public function pensiunan()
    {
        return $this->belongsTo(Pensiunan::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
