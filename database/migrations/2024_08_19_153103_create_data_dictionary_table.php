<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('data_dictionary');

        Schema::create('data_dictionary', function (Blueprint $table) {
            $table->id();
            $table->string('publisher');
            $table->string('table_name');
            $table->string('name');
            $table->string('map_name');
            $table->string('measure_type');
            $table->string('display');
            $table->text('description')->nullable();
            $table->string('source_url')->nullable();
            $table->string('description_url')->nullable();
            $table->string('geographies');
            $table->string('year');
            $table->string('published_year');
            $table->string('frequency');
            $table->text('notes')->nullable();
            $table->string('origin_code')->nullable();
            $table->string('domain')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('data_dictionary');
    }
};
