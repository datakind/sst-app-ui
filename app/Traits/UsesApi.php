<?php

namespace App\Traits;

use App\Models\DkApiToken;
use App\Models\File;
use App\Helpers\File\FileHelper;
use App\Models\Run;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use GuzzleHttp\Psr7;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;


trait UsesApi
{
    /**
     * Authenticates application to DK API Suite
     *
     * @param string $token_id
     * @return mixed
     */
    protected function authenticateDkApi(string $token_id = null): mixed
    {
        $response = Http::withHeaders([
            'Cache-Control' => 'no-cache',
            'subscription-key' => env('DK_API_SUITE_SUBSCRIPTION_KEY'),
        ])->get(env('DK_API_SUITE_URL') . 'authenticate/get_jwt?api=' . env('DK_API_SUITE_PRODUCT'));
        $body = json_decode($response->body());
        $token = !empty($token_id) ? DkApiToken::where('id', $token_id)->first() : new DkApiToken();
        $token->access = $body->access_token;
        $token->type = 'access';
        $token->save();

        return $token;
    }

    /**
     * Formats DK API Suite request URL string and sends Request to API and decodes JSON response
     *
     * @param string $token
     * @param string $endpoint
     * @param string $type
     * @return mixed
     */
    protected function makesDkApiRequest(string $token, string $endpoint, string $type = 'get'): mixed
    {

        if ($type == 'post') {
            $response = Http::withToken($token)->post(env('DK_API_SUITE_URL') . '/' . env('DK_API_SUITE_VERSION') . $endpoint);
        } else {
            $response = Http::withToken($token)->get(env('DK_API_SUITE_URL') . '/' . env('DK_API_SUITE_VERSION') . $endpoint);
        }

        return json_decode($response->body());
    }

}
