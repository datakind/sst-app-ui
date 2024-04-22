<?php

namespace App\Http\Controllers;

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

    public function testApi()
    {
        $response = $this->authenticateDkApi();
        return $response;

    }
    public function getInsights()
    {
        $response = $this->getInsights();
        return $response;
    }
    public function postModelRegistry()
    {
        $response = $this->postModelRegistry();
        return $response;
    }
    public function getModelRegistry()
    {
        $response = $this->getModelRegistry();
        return $response;
    }
    public function getTrainingAssets()
    {
        $response = $this->getTrainingAssets();
        return $response;
    }
    public function postTrainingData(Request $request)
    {
        $token = $this->authenticateDkApi();
        $queryParameters = $request->query->all();
        $queryString = http_build_query($queryParameters);
        $response = Http::withToken($token->access)
            ->get(env('DK_API_SUITE_URL') . 'sst/training_data_upload?' . $queryString);
        dd($response);
        return $response;
    }
    public function getTrainingStatus(Request $request)
    {
        $token = $this->authenticateDkApi();
        $queryParameters = $request->query->all();
        $queryString = http_build_query($queryParameters);
        $response = Http::withToken($token->access)
            ->get(env('DK_API_SUITE_URL') . 'sst/retrieve_training_status?' . $queryString);
        dd($response);
        return $response;
    }
}
