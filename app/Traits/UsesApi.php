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
    protected function authenticateDkApi(string $token_id = null)
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
     * Get insights from DK API Suite
     *
     * @param string $study
     * @param string|null $token_id
     * @return \Illuminate\Http\Client\Response
     */
    public static function getInsights(string $study, string $token_id = null)
    {
        $token = self::authenticateDkApi($token_id);

        $response = Http::withToken($token->access)
            ->get(env('DK_API_SUITE_URL') . '/studies/' . $study);

        return $response;
    }

}
