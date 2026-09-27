<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="robots" content="noindex, follow">
        <title>Page Not Found | Compudia</title>
        <link rel="icon" type="image/png" href="/logo/compudia-logo.png">
        @vite(['resources/css/app.css'])
    </head>
    <body>
        <main class="error-page">
            <a class="brand" href="/remove-background" aria-label="Compudia home">
                <img class="brand-mark" src="/logo/compudia-logo.png" alt="">
                <span class="brand-text"><strong>COMPU</strong>DIA</span>
            </a>
            <section>
                <p class="error-code">404</p>
                <h1>Page not found</h1>
                <p>The page you requested does not exist. Use Compudia's Remove Background tool to upload an image, refine the selection, and download your result.</p>
                <a class="primary-button" href="/remove-background">Open Remove Background</a>
            </section>
        </main>
    </body>
</html>
