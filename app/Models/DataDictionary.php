<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DataDictionary extends Model
{
    use HasFactory;

    // Specify the table associated with the model
    protected $table = 'data_dictionary';

    // Allow specific attributes to be mass assignable
    protected $fillable = [
        'file_name',
        'field_name',
        'location_type',
        'category',
        'description',
        'unit',
    ];

    // Indicate that the model should use timestamps
    public $timestamps = true;

    // Add a method to parse and save the array data
    public static function createFromArray(array $data)
    {
        // Assuming the array structure is:
        // [dataset, field_name, region_type, category, details, field_label]

        $details = json_decode($data[4], true); // Parse the JSON string in the details element

        return self::create([
            'file_name' => $data[0] ?? null,
            'field_name' => $data[1] ?? null,
            'location_type' => $data[2] ?? null,
            'category' => $data[3] ?? null,
            'description' => $data[4] ?? null,
            'unit' => $data[5] ?? null,
        ]);
    }
}
