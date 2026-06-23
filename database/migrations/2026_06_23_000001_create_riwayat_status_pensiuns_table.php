<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('riwayat_status_pensiuns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pensiunan_id')->constrained()->cascadeOnDelete();
            $table->enum('status_sebelumnya', ['pending', 'diproses', 'selesai', 'ditolak'])->nullable();
            $table->enum('status_baru', ['pending', 'diproses', 'selesai', 'ditolak']);
            $table->text('catatan')->nullable();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('riwayat_status_pensiuns');
    }
};
