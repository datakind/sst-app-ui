<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Http;
use App\Models\DataDictionary;
use App\Traits\UsesApi;

class DataDictionarySeeder extends Seeder
{
    use UsesApi;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $data = $this->getDataDictionary();
        if (!empty($data)) {
            foreach ($data as $item) {
                DataDictionary::updateOrCreate(
                    [
                        'description'     => $item[4],
                        'field_name'      => $item[1],
                        'location_type'   => $item[2],
                        'category'        => $item[3],
                        'file_name'       => $item[0],
                        'unit'            => $item[5],
                    ],
                    [
                        'created_at'      => now(),
                        'updated_at'      => now(),
                    ]
                );
            }
            $this->command->info('Data dictionary seeded successfully.');
        } else {
            $this->command->error('No data to seed.');
        }
    }

    /**
     * Fetch data dictionary from the API.
     */
    protected function getDataDictionary(): array
    {
        $token = $this->authenticateDkApi();
        // TODO: Define the endpoint URL for the data dictionary API here
        $endpoint = '';
        $headers = [
            'Authorization' => $token->access,
            'Cache-Control' => 'no-cache',
        ];
        $response = Http::withHeaders($headers)->get(env('DK_API_SUITE_URL') . '/' . $endpoint);

        if ($response->successful()) {
            $data = $response->json();
            foreach ($data as &$item) {
                if (is_string($item)) {
                    $item = $this->parseComplexString($item);
                }
            }
            return $data;
        } else {
            throw new \Exception('Failed to fetch data from API: ' . $response->body());
        }
    }

    /**
     * Parse a complex string that includes commas inside quotes.
     */
    private function parseComplexString(string $input): array
    {
        $pattern = '/(?<!\\\),(?=(?:[^"]*|"[^"]*")*$)/';
        $result = preg_split($pattern, $input);
        $result = array_map(function($item) {
            return trim($item, '"');
        }, $result);

        return $result;
    }

}
