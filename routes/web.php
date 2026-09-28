<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\BackgroundRemovalController;
use App\Http\Controllers\ContactMessageController;

Route::get('/', function () {
    return redirect()->route('remove-background', status: 301);
})->name('home');

Route::get('/remove-background', function () {
    return Inertia::render('Home');
})->name('remove-background');

Route::post('/remove-background/rembg', [BackgroundRemovalController::class, 'rembg'])
    ->name('remove-background.rembg');

Route::post('/remove-background/training-example', [BackgroundRemovalController::class, 'trainingExample'])
    ->name('remove-background.training-example');

Route::get('/contact', function () {
    return Inertia::render('Contact');
})->name('contact');

Route::post('/contact', [ContactMessageController::class, 'store'])->name('contact.store');

Route::get('/privacy', function () {
    return Inertia::render('Privacy');
})->name('privacy');

Route::get('/terms', function () {
    return Inertia::render('Terms');
})->name('terms');
