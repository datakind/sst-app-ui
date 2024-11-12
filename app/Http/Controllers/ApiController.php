<?php

namespace App\Http\Controllers;

use App\Models\DataDictionary;
use App\Traits\UsesApi;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ApiController extends Controller
{
    use UsesApi;

    public function exampleFunction(Request $request)
    {
        $query = http_build_query($request->query());
        $token = $this->authenticateDkApi(null);
        $endpoint = 'product/endpoint';
        $headers = [
            'Authorization' => $token->access,
            'Cache-Control' => 'no-cache',
        ];
        $response = Http::withHeaders($headers)->get(env('DK_API_SUITE_URL') . '/' . env('DK_API_SUITE_VERSION') . '/' . $endpoint . '?' . $query);
        return $response;
    }

    protected function readDataDictionary(): mixed
    {
        $response = DataDictionary::all();
        return $response;
    }

}
