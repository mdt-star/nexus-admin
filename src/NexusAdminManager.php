<?php

namespace MdtStar\NexusAdmin;

use Illuminate\Support\Facades\File;

/**
 * Nexus Admin 管理器
 * 负责收集扩展包的 provider 入口文件路径
 *
 * 第三方包通过 composer.json 的 extra.nexus.provider 声明入口文件：
 *
 *   ```json
 *   {
 *     "extra": {
 *       "nexus": {
 *         "provider": "resources/js/nexus-admin/provider.js"
 *       }
 *     }
 *   }
 *   ```
 *
 * 基座在 Blade 视图中注入 __NEXUS_ADMIN_PROVIDERS__ 变量，
 * 前端 app.js 读取后动态加载所有 provider。
 *
 * 不再维护 pages/components/directives/plugins 四类清单，
 * 第三方在 provider.js 中自行完成所有注册。
 */
class NexusAdminManager
{
    /**
     * 已收集的 provider 映射
     * ['nexus-blog' => 'vendor/nexus-blog/provider.js']
     */
    protected array $providers = [];

    /**
     * 收集所有扩展包的 provider 路径
     *
     * @return array { 'package-short-name': 'vendor/xxx/provider.js' }
     */
    public function collectProviders(): array
    {
        $installedPackages = $this->getInstalledPackages();

        foreach ($installedPackages as $packageName => $packageConfig) {
            // 跳过自身
            if ($packageName === 'mdt-star/nexus-admin') {
                continue;
            }

            $this->collectPackageProvider($packageName, $packageConfig);
        }

        return $this->providers;
    }

    /**
     * 收集单个扩展包的 provider 路径
     */
    protected function collectPackageProvider(string $packageName, array $packageConfig): void
    {
        $shortName = $this->getShortName($packageName);

        // 从 composer.json 的 extra.nexus.provider 中读取
        $nexusConfig = $packageConfig['extra']['nexus'] ?? null;

        if ($nexusConfig && isset($nexusConfig['provider'])) {
            $providerPath = $nexusConfig['provider'];
            $this->providers[$shortName] = $this->normalizeVendorPath($shortName, $providerPath);
        }
    }

    /**
     * 获取已安装的 Composer 包列表
     */
    protected function getInstalledPackages(): array
    {
        $installedPath = base_path('vendor/composer/installed.json');

        if (!file_exists($installedPath)) {
            return [];
        }

        $installed = json_decode(file_get_contents($installedPath), true);

        if (!$installed) {
            return [];
        }

        // installed.json 可能是根对象数组，也可能是包含 'packages' 键的对象
        $packages = $installed['packages'] ?? $installed;

        $result = [];
        foreach ($packages as $package) {
            $name = $package['name'] ?? '';
            if ($name) {
                $result[$name] = $package;
            }
        }

        return $result;
    }

    /**
     * 获取包名简写（去掉 vendor 前缀）
     * 例如：mdt-star/nexus-blog → nexus-blog
     */
    protected function getShortName(string $packageName): string
    {
        $parts = explode('/', $packageName, 2);
        return $parts[1] ?? $parts[0];
    }

    /**
     * 规范化 vendor 路径
     * 将相对路径转为 resources/js/nexus-admin/vendor/{shortName}/ 下的路径
     */
    protected function normalizeVendorPath(string $shortName, string $path): string
    {
        return "vendor/{$shortName}/{$path}";
    }

    /**
     * @deprecated 保留兼容方法，最终移除
     */
    public function collectRegistry(): array
    {
        return [
            'pages'      => [],
            'components' => [],
            'directives' => [],
            'plugins'    => [],
            'providers'  => $this->collectProviders(),
        ];
    }
}