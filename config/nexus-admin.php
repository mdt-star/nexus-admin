<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Nexus Admin 配置
    |--------------------------------------------------------------------------
    |
    | 此配置文件用于定义 nexus-admin 基座的全局行为
    |
    */

    // 应用名称
    'app_name' => env('NEXUS_ADMIN_APP_NAME', 'Nexus Admin'),

    // 应用 Logo URL
    'app_logo' => env('NEXUS_ADMIN_APP_LOGO', ''),

    // 默认布局模式: desktop | sidebar
    'layout' => env('NEXUS_ADMIN_LAYOUT', 'sidebar'),

    // 默认主题: light | dark
    'theme' => env('NEXUS_ADMIN_THEME', 'light'),

    // 默认主色调
    'primary_color' => env('NEXUS_ADMIN_PRIMARY_COLOR', '#409EFF'),

    // 默认语言
    'locale' => env('NEXUS_ADMIN_LOCALE', 'zh-CN'),

    // 底部版权信息
    'footer' => env('NEXUS_ADMIN_FOOTER', ''),
];
