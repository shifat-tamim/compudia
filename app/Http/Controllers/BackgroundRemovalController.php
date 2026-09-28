<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

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

    public function trainingExample(Request $request)
    {
        $validated = $request->validate([
            'original' => ['required', 'file', 'mimes:jpg,jpeg,png,webp', 'max:20480'],
            'initial_mask' => ['required', 'file', 'mimes:png', 'max:20480'],
            'corrected_mask' => ['required', 'file', 'mimes:png', 'max:20480'],
            'keep_corrections' => ['nullable', 'file', 'mimes:png', 'max:20480'],
            'remove_corrections' => ['nullable', 'file', 'mimes:png', 'max:20480'],
            'source' => ['nullable', 'string', Rule::in(['auto-detect', 'manual-only', 'refine-auto'])],
            'metadata' => ['nullable', 'json'],
        ]);

        $id = (string) Str::uuid();
        $directory = 'background-training/'.now()->format('Y-m-d').'/'.$id;
        $disk = Storage::disk('local');

        $disk->putFileAs($directory, $validated['original'], 'original.'.$validated['original']->extension());
        $disk->putFileAs($directory, $validated['initial_mask'], 'initial-mask.png');
        $disk->putFileAs($directory, $validated['corrected_mask'], 'corrected-mask.png');

        if ($request->hasFile('keep_corrections')) {
            $disk->putFileAs($directory, $validated['keep_corrections'], 'keep-corrections.png');
        }

        if ($request->hasFile('remove_corrections')) {
            $disk->putFileAs($directory, $validated['remove_corrections'], 'remove-corrections.png');
        }

        $metadata = [
            'id' => $id,
            'source' => $validated['source'] ?? 'auto-detect',
            'created_at' => now()->toISOString(),
            'user_agent' => substr((string) $request->userAgent(), 0, 255),
            'client' => json_decode($validated['metadata'] ?? '{}', true) ?: [],
            'files' => [
                'original' => 'original.'.$validated['original']->extension(),
                'initial_mask' => 'initial-mask.png',
                'corrected_mask' => 'corrected-mask.png',
                'keep_corrections' => $request->hasFile('keep_corrections') ? 'keep-corrections.png' : null,
                'remove_corrections' => $request->hasFile('remove_corrections') ? 'remove-corrections.png' : null,
            ],
        ];

        $disk->put($directory.'/metadata.json', json_encode($metadata, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

        return response()->json([
            'status' => 'saved',
            'id' => $id,
        ]);
    }

    private function pngResponse(string $image): Response
    {
        return response($image, 200, [
            'Content-Type' => 'image/png',
            'Cache-Control' => 'no-store, private',
        ]);
    }
}
