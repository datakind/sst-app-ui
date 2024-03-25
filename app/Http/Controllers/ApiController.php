<?php

namespace App\Http\Controllers;

use App\Traits\UsesApi;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
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
}
