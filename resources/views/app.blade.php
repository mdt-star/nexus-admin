<!DOCTYPE html>
<html lang="{{ config('nexus-admin.locale', 'zh-CN') }}" data-theme="{{ config('nexus-admin.theme', 'light') }}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{{ config('nexus-admin.app_name', 'Nexus Admin') }}</title>

  {{-- 注入扩展包 Provider 路径到前端 --}}
  {{-- provider 格式: { 'nexus-blog': 'vendor/nexus-blog/provider.js' } --}}
  <script>
    window.__NEXUS_ADMIN_PROVIDERS__ = @json($nexusProviders ?? (object)[]);
  </script>

  {{-- Vite 构建资源 --}}
  @vite(['resources/js/nexus-admin/app.js'])
</head>
<body>
  <div id="app"></div>
</body>
</html>
