<?php

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ApiController;
use App\Http\Controllers\LoginController;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
})->name('home');

Route::get('/login', function () {
    return Inertia::render('Auth/Login', [
        'canResetPassword' => Route::has('password.request'),
    ]);
})->name('login');

Route::middleware(['auth:sanctum', config('jetstream.auth_session'), 'verified',])->group(function () {
    Route::get('/dashboard', function () {return redirect()->route('home');})->name('dashboard');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware('auth')->get('/data-dictionary', function () {
    return Inertia::render('DataDictionary');
})->name('data-dictionary');

Route::middleware('auth')->get('/faq', function () {
    return Inertia::render('Faq');
})->name('FAQ');

Route::get('/license', function () {
    return Inertia::render('License');
})->name('license');

Route::get('/privacy-policy', function () {
    return Inertia::render('PrivacyPolicy');
})->name('privacy-policy');

Route::get('/terms-of-service', function () {
    return Inertia::render('TermsOfService');
})->name('terms-of-service');

Route::middleware('auth')->get('/read-data-dictionary', [ApiController::class, 'readDataDictionary'])->name('read.data-dictionary');

Route::get('auth/google', [LoginController::class, 'redirectToGoogle']);
Route::get('auth/google/callback', [LoginController::class, 'handleGoogleCallback']);

Route::get('auth/azure', [LoginController::class, 'redirectToAzure']);
Route::get('auth/azure/callback', [LoginController::class, 'handleAzureCallback']);

