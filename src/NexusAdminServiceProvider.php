<?php

namespace MdtStar\NexusAdmin;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\File;

class NexusAdminServiceProvider extends ServiceProvider
{
    /**
     * 注册服务
     */
    public function register(): void
    {
        $this->app->singleton(NexusAdminManager::class, function () {
            return new NexusAdminManager();
        });
    }

    /**
     * 启动服务
     */
    public function boot(): void
    {
        // 发布前端资源
        $this->publishes([
            __DIR__ . '/../resources/js' => resource_path('js/nexus-admin'),
        ], 'nexus-admin-assets');

        // 发布配置文件
        $this->publishes([
            __DIR__ . '/../config/nexus-admin.php' => config_path('nexus-admin.php'),
        ], 'nexus-admin-config');

        // 加载路由
        $this->loadRoutesFrom(__DIR__ . '/../routes/web.php');

        // 加载视图
        $this->loadViewsFrom(__DIR__ . '/../resources/views', 'nexus-admin');

        // 收集扩展包注册信息并注入到视图
        $manager = $this->app->make(NexusAdminManager::class);
        $registry = $manager->collectRegistry();

        view()->composer('nexus-admin::app', function ($view) use ($registry) {
            $view->with('nexusRegistry', $registry);
        });
    }
}
