<?php

namespace App\Http\Middleware;

use App\Helpers\InstitutionHelper;
use App\Http\Controllers\ApiController;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class RequireInstitution
{
    private const SKIP_ACTIONS = [
        'createInstApi', 'addDatakinderApi', 'viewAllInstitutions',
    ];

    /** Route names (and patterns) that do not require an institution. */
    private const SKIP_ROUTES = [
        'set-inst',
        'logout',
        'profile.*',
        'add-dk',
        'create-inst',
        'admin.invites',
        'admin.invites.*',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()) {
            return $next($request);
        }

        if ($request->user()->access_type !== 'DATAKINDER') {
            [$inst] = InstitutionHelper::GetInstitution($request);
            if ($inst !== '') {
                $institution = session('institution');
                if (is_array($institution) && ! empty($institution['inst_id'] ?? '')) {
                    $request->attributes->set('institution', $institution);
                } else {
                    $request->attributes->set('institution', ['inst_id' => $inst]);
                }
            }

            return $next($request);
        }

        foreach (self::SKIP_ROUTES as $pattern) {
            if ($request->routeIs($pattern)) {
                return $next($request);
            }
        }
        if ($request->is('set-inst-api*')) {
            return $next($request);
        }

        $action = $request->route()?->getActionName();
        if ($action && str_contains($action, ApiController::class.'@')) {
            $method = Str::after($action, '@');
            if (in_array($method, self::SKIP_ACTIONS, true)) {
                return $next($request);
            }
        }

        [$inst] = InstitutionHelper::GetInstitution($request);
        if ($inst !== '') {
            $institution = session('institution');
            if (is_array($institution) && ! empty($institution['inst_id'] ?? '')) {
                $request->attributes->set('institution', $institution);
            } else {
                $request->attributes->set('institution', ['inst_id' => $inst]);
            }

            return $next($request);
        }

        if ($request->expectsJson()) {
            return response()->json(['error' => 'Institution required.'], 401);
        }

        return redirect()->route('set-inst');
    }
}
