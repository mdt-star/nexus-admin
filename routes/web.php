<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Nexus Admin 路由
|--------------------------------------------------------------------------
|
| 提供后台管理界面的入口路由
|
*/

Route::middleware(['web'])->group(function () {
    Route::get('/admin', function () {
        return view('nexus-admin::app');
    })->name('nexus-admin.index');
});
