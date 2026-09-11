<?php

namespace App\Helpers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class TokenHelper
{
    /** Mint a replacement once the current token is this close to its own expiry. */
    private const REFRESH_LEEWAY_SECONDS = 60;

    // Get the Backend API token for that user, saving it in the session or regenerating if it is close to expiration.
    // The return is an array of two elements, the token, and an error message if any.
    /**
     * @return array{0: mixed, 1: string}
     */
    public static function getToken(Request $request): array
    {
        $backend_tok = $request->session()->get('api_jwt');

        // Schedule the refresh off the token's own exp claim rather than a local clock, so
        // this cannot drift from the backend's ACCESS_TOKEN_EXPIRE_MINUTES. The signature is
        // not verifiable here (no shared secret) and is not trusted — the backend checks it.
        $payload = explode('.', (string) $backend_tok)[1] ?? '';
        $exp = json_decode(base64_decode(strtr($payload, '-_', '+/')) ?: '{}', true)['exp'] ?? null;

        // A missing or unreadable exp means we cannot tell how long the token is good for.
        if ($exp === null || $exp - time() < self::REFRESH_LEEWAY_SECONDS) {
            return TokenHelper::makeTokenAPICall($request);
        }

        return [$backend_tok, ''];
    }

    /**
     * @return array{0: mixed, 1: string}
     */
    public static function makeTokenAPICall(Request $request): array
    {
        $headers = [
            'X-API-KEY' => config('services.backend.api_key'),
            'accept' => 'application/json',
            'Cache-Control' => 'no-cache',
            'ENDUSER' => $request->user()->email,
        ];
        $url = config('services.backend.url').'/token-from-api-key';
        $token_response = Http::withHeaders($headers)->post($url);

        if (! $token_response->ok()) {
            return ['', 'Invalid API Key'];
        }

        $tok = json_decode($token_response)->access_token;

        session(['api_jwt' => $tok]);

        return [$tok, ''];
    }
}
