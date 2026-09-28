<?php

namespace Tests\Feature;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_the_application_returns_a_successful_response(): void
    {
        $this->get('/')->assertRedirect('/remove-background');

        $this->get('/remove-background')->assertStatus(200);
    }

    public function test_public_support_pages_render_successfully(): void
    {
        $this->get('/contact')->assertStatus(200);
        $this->get('/privacy')->assertStatus(200);
        $this->get('/terms')->assertStatus(200);
    }

    public function test_background_training_example_can_be_saved(): void
    {
        Storage::fake('local');

        $response = $this->post('/remove-background/training-example', [
            'original' => UploadedFile::fake()->create('original.png', 12, 'image/png'),
            'initial_mask' => UploadedFile::fake()->create('initial-mask.png', 4, 'image/png'),
            'corrected_mask' => UploadedFile::fake()->create('corrected-mask.png', 4, 'image/png'),
            'keep_corrections' => UploadedFile::fake()->create('keep-corrections.png', 4, 'image/png'),
            'remove_corrections' => UploadedFile::fake()->create('remove-corrections.png', 4, 'image/png'),
            'source' => 'auto-detect',
            'metadata' => json_encode(['manual_corrections' => 3]),
        ]);

        $response->assertOk()->assertJson(['status' => 'saved']);

        $id = $response->json('id');
        $directory = 'background-training/'.now()->format('Y-m-d')."/{$id}";

        Storage::disk('local')->assertExists($directory.'/metadata.json');
        Storage::disk('local')->assertExists($directory.'/initial-mask.png');
        Storage::disk('local')->assertExists($directory.'/corrected-mask.png');
    }
}
