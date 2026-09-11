<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyDatakinder
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() && $request->user()->access_type === 'DATAKINDER') {
            return $next($request);
        }

        return response()->json(['error' => 'Access denied. You must be a Datakinder user.'], 403);
    }
}
