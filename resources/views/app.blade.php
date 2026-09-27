<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <meta name="robots" content="index, follow, max-image-preview:large">
        <meta name="theme-color" content="#94c044">
        <meta property="og:site_name" content="Compudia">
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
        <link rel="icon" type="image/png" href="/logo/compudia-logo.png">
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">

        <title inertia>{{ config('app.name', 'Compudia') }}</title>

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.jsx'])
        @inertiaHead
    </head>
    <body>
        @inertia
    </body>
</html>
