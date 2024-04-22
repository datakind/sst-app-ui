<?php

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ApiController;


Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
})->name('home');

Route::get('/login', function () {
    return Inertia::render('Auth/Login');
})->name('login');

Route::get('/resources', function () {
    return Inertia::render('Resources');
})->name('resources');

Route::get('/documentation', function () {
    return Inertia::render('Documentation');
})->name('documentation');

Route::get('/explore-data', function () {
    return Inertia::render('ExploreData');
})->name('explore-data');

Route::get('/help', function () {
    return Inertia::render('Help');
})->name('help');

Route::get('/about', function () {
    return Inertia::render('About');
})->name('about');

Route::get('/privacy-policy', function () {
    return Inertia::render('PrivacyPolicy');
})->name('privacy-policy');

Route::get('/license', function () {
    return Inertia::render('License');
})->name('license');

Route::get('/terms-of-service', function () {
    return Inertia::render('TermsOfService');
})->name('terms-of-service');

Route::middleware([
    'auth:sanctum',
    config('jetstream.auth_session'),
    'verified',
])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::get('/apitest', [ApiController::class, 'testApi'])->name('api.test');
Route::get('/insights', [ApiController::class, 'getInsights'])->name('get.insights');
Route::post('/model-registry', [ApiController::class, 'postModelRegistry'])->name('post.model-registry');
Route::get('/model-registry', [ApiController::class, 'getModelRegistry'])->name('get.model-registry');
Route::get('/training-assets', [ApiController::class, 'getTrainingAssets'])->name('get.training-assets');
Route::post('/training-data', [ApiController::class, 'postTrainingData'])->name('post.training-data');
Route::get('/training-status', [ApiController::class, 'getTrainingStatus'])->name('get.training-status');

