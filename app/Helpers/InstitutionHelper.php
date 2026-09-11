<?php

namespace App\Helpers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use TokenHelper;

class InstitutionHelper
{
    public const SET_INST_REQUIRED_MESSAGE = 'Datakinder must set an institution to proceed.';

    /**
     * Sync the authenticated user's inst_id and access_type from the backend (check-self).
     * Call once after login. Updates the user row and, for non-DATAKINDER, sets session institution.
     */
    public static function syncUserFromBackend(Request $request): void
    {
        if (! $request->user()) {
            return;
        }
        [$tok] = TokenHelper::GetToken($request);
        if ($tok === '') {
            return;
        }
        $resp = Http::withHeaders([
            'Authorization' => 'Bearer '.$tok,
            'accept' => 'application/json',
            'Cache-Control' => 'no-cache',
        ])->get(config('services.backend.url').'/check-self');
        if ($resp->status() !== 200 || (($resp['inst_id'] ?? '') === '' && ($resp['access_type'] ?? '') === '')) {
            return;
        }
        $accessType = $resp['access_type'] ?? '';
        $instIdFromApi = (string) ($resp['inst_id'] ?? '');
        $update = ['access_type' => $accessType];
        if ($instIdFromApi !== '') {
            $update['inst_id'] = $instIdFromApi;
        }
        DB::table('users')
            ->where('email', $request->user()->email)
            ->update($update);
        $request->user()->access_type = $accessType;
        if ($instIdFromApi !== '') {
            $request->user()->inst_id = $instIdFromApi;
        }

        if ($accessType !== 'DATAKINDER' && $instIdFromApi !== '') {
            $full = self::fetchInstitutionById($request, $instIdFromApi);
            session(['institution' => $full ?? ['inst_id' => $instIdFromApi]]);
        }
    }

    /**
     * Returns [inst_id, error]. Session is source of truth; non-DATAKINDER fallback is user row (synced at login).
     *
     * @return array{0: string, 1: string}
     */
    public static function GetInstitution(Request $request): array
    {
        $institution = session('institution');
        if (is_array($institution) && ($institution['inst_id'] ?? '') !== '') {
            return [$institution['inst_id'], ''];
        }
        if ($request->user()->access_type === 'DATAKINDER') {
            return ['', self::SET_INST_REQUIRED_MESSAGE];
        }
        $inst = $request->user()->inst_id ?? '';
        if ($inst !== '') {
            $full = self::fetchInstitutionById($request, $inst);
            session(['institution' => $full ?? ['inst_id' => $inst]]);

            return [$inst, ''];
        }

        return ['', ''];
    }

    /**
     * Fetch full institution by inst_id from backend. Returns array or null.
     *
     * @return array<string, mixed>|null
     */
    public static function fetchInstitutionById(Request $request, string $inst_id): ?array
    {
        [$tok] = TokenHelper::GetToken($request);
        if ($tok === '') {
            return null;
        }
        $headers = [
            'Authorization' => 'Bearer '.$tok,
            'accept' => 'application/json',
            'Cache-Control' => 'no-cache',
        ];
        $resp = Http::withHeaders($headers)->get(config('services.backend.url').'/institutions');
        if ($resp->status() !== 200) {
            return null;
        }
        $list = $resp->json();
        if (! is_array($list)) {
            return null;
        }
        foreach ($list as $inst) {
            if (is_array($inst) && ($inst['inst_id'] ?? '') === $inst_id) {
                return $inst;
            }
        }

        return null;
    }

    // Set session institution. Only DataKinders; they choose via Set Institution.
    public static function actAsInstitution(Request $request, string $inst_id): string
    {
        if ($request->user()->access_type !== 'DATAKINDER') {
            return 'User must be DATAKINDER access type to set institution.';
        }
        if ($inst_id === '') {
            return 'No institution id specified.';
        }
        $institution = self::fetchInstitutionById($request, $inst_id);
        session(['institution' => $institution ?? ['inst_id' => $inst_id]]);
        $request->session()->forget('act_as');

        return '';
    }

    // Toggle institution view (hide DataKinder-only chrome). Only DataKinders.
    public static function setInstitutionView(Request $request, bool $institution_view): string
    {
        if ($request->user()->access_type !== 'DATAKINDER') {
            return 'User must be DATAKINDER access type to set institution view.';
        }
        if ($institution_view) {
            session(['institution_view' => true]);
        } else {
            $request->session()->forget('institution_view');
        }

        return '';
    }
}
