<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;

class BackgroundRemovalController extends Controller
{
    public function rembg(Request $request): Response
    {
        $validated = $request->validate([
            'image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:20480'],
        ]);

        $image = $validated['image'];
        $imageBytes = file_get_contents($image->getRealPath());

        $rembgServiceUrl = rtrim((string) config('services.background_ai.url'), '/');

        if (! $rembgServiceUrl) {
            abort(503, 'Compudia rembg service is not configured.');
        }

        try {
            $response = Http::timeout((int) config('services.background_ai.timeout', 180))
                ->attach(
                    'image',
                    $imageBytes,
                    $image->getClientOriginalName()
                )
                ->post($rembgServiceUrl.'/remove-background');
        } catch (ConnectionException) {
            abort(503, 'Compudia rembg service is unavailable.');
        }

        if (! $response->successful()) {
            abort($response->status(), 'Compudia rembg background removal failed.');
        }

        return $this->pngResponse($response->body());
    }

    private function pngResponse(string $image): Response
    {
        return response($image, 200, [
            'Content-Type' => 'image/png',
            'Cache-Control' => 'no-store, private',
        ]);
    }
}
