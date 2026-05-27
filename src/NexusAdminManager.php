<?php

namespace MdtStar\NexusAdmin;

use Illuminate\Support\Facades\File;

/**
 * Nexus Admin 管理器
 * 负责收集扩展包的注册信息（页面、组件、指令、插件）
 *
 * 注册信息收集优先级：
 * 1. composer.json 中 extra.nexus 显式声明（优先级高）
 * 2. 自动扫描 vendor/{包名}/resources/js/nexus-admin/ 下的约定目录（优先级低）
 */
class NexusAdminManager
{
    /**
     * 已注册的页面映射
     * ['page-key' => 'relative/path/to/Page.vue']
     */
    protected array $pages = [];

    /**
     * 已注册的全局组件映射
     * ['ComponentName' => 'relative/path/to/Component.vue']
     */
    protected array $components = [];

    /**
     * 已注册的指令映射
     * ['directive-name' => 'relative/path/to/directive.js']
     */
    protected array $directives = [];

    /**
     * 已注册的插件映射
     * ['plugin-id' => ['hooks' => [...], 'handler' => 'path/to/handler.js']]
     */
    protected array $plugins = [];

    /**
     * 收集所有扩展包的注册信息
     */
    public function collectRegistry(): array
    {
        $installedPackages = $this->getInstalledPackages();

        foreach ($installedPackages as $packageName => $packageConfig) {
            // 跳过自身
            if ($packageName === 'mdt-star/nexus-admin') {
                continue;
            }

            $this->collectPackageRegistry($packageName, $packageConfig);
        }

        return [
            'pages'       => $this->pages,
            'components'  => $this->components,
            'directives'  => $this->directives,
            'plugins'     => $this->plugins,
        ];
    }

    /**
     * 收集单个扩展包的注册信息
     */
    protected function collectPackageRegistry(string $packageName, array $packageConfig): void
    {
        // 获取包名简写（去掉 vendor 前缀）
        $shortName = $this->getShortName($packageName);

        // 优先级 1：从 composer.json 的 extra.nexus 中读取显式声明
        $nexusConfig = $packageConfig['extra']['nexus'] ?? null;

        if ($nexusConfig) {
            $this->collectFromExplicitConfig($shortName, $nexusConfig);
            return;
        }

        // 优先级 2：自动扫描约定目录
        $this->collectFromAutoScan($packageName, $shortName);
    }

    /**
     * 从 composer.json 显式声明中收集注册信息
     */
    protected function collectFromExplicitConfig(string $shortName, array $nexusConfig): void
    {
        // 遍历 nexus 下的每个配置项（可能有多组）
        foreach ($nexusConfig as $key => $config) {
            // 处理 pages
            if (isset($config['pages'])) {
                foreach ($config['pages'] as $pageKey => $pagePath) {
                    $this->pages[$pageKey] = $this->normalizeVendorPath($shortName, $pagePath);
                }
            }

            // 处理 components
            if (isset($config['components'])) {
                foreach ($config['components'] as $compName => $compPath) {
                    $this->components[$compName] = $this->normalizeVendorPath($shortName, $compPath);
                }
            }

            // 处理 directives
            if (isset($config['directives'])) {
                foreach ($config['directives'] as $dirName => $dirPath) {
                    $this->directives[$dirName] = $this->normalizeVendorPath($shortName, $dirPath);
                }
            }

            // 处理 plugins
            if (isset($config['plugins'])) {
                foreach ($config['plugins'] as $pluginId => $pluginConfig) {
                    $pluginConfig['handler'] = $this->normalizeVendorPath($shortName, $pluginConfig['handler']);
                    $this->plugins[$pluginId] = $pluginConfig;
                }
            }
        }
    }

    /**
     * 从约定目录自动扫描收集注册信息
     */
    protected function collectFromAutoScan(string $packageName, string $shortName): void
    {
        // 约定目录：vendor/{包名}/resources/js/nexus-admin/
        $basePath = base_path("vendor/{$packageName}/resources/js/nexus-admin");

        if (!is_dir($basePath)) {
            return;
        }

        // 扫描 pages 目录
        $pagesPath = "{$basePath}/pages";
        if (is_dir($pagesPath)) {
            $files = File::allFiles($pagesPath);
            foreach ($files as $file) {
                if ($file->getExtension() === 'vue') {
                    $relativePath = $file->getRelativePathname();
                    $pageKey = $this->filenameToKey($relativePath);
                    $this->pages[$pageKey] = $this->normalizeVendorPath($shortName, "pages/{$relativePath}");
                }
            }
        }

        // 扫描 components 目录
        $componentsPath = "{$basePath}/components";
        if (is_dir($componentsPath)) {
            $files = File::allFiles($componentsPath);
            foreach ($files as $file) {
                if ($file->getExtension() === 'vue') {
                    $relativePath = $file->getRelativePathname();
                    $compName = pathinfo($relativePath, PATHINFO_FILENAME);
                    $this->components[$compName] = $this->normalizeVendorPath($shortName, "components/{$relativePath}");
                }
            }
        }

        // 扫描 directives 目录
        $directivesPath = "{$basePath}/directives";
        if (is_dir($directivesPath)) {
            $files = File::allFiles($directivesPath);
            foreach ($files as $file) {
                if ($file->getExtension() === 'js') {
                    $relativePath = $file->getRelativePathname();
                    $dirName = $this->filenameToKey($relativePath);
                    $this->directives[$dirName] = $this->normalizeVendorPath($shortName, "directives/{$relativePath}");
                }
            }
        }

        // 扫描 plugins 目录
        $pluginsPath = "{$basePath}/plugins";
        if (is_dir($pluginsPath)) {
            $files = File::allFiles($pluginsPath);
            foreach ($files as $file) {
                if ($file->getExtension() === 'js') {
                    $relativePath = $file->getRelativePathname();
                    $pluginId = $this->filenameToKey($relativePath);
                    $this->plugins[$pluginId] = [
                        'hooks'   => [],
                        'handler' => $this->normalizeVendorPath($shortName, "plugins/{$relativePath}"),
                    ];
                }
            }
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
     * 文件名转键名（kebab-case）
     * UserList.vue → user-list
     * user/Settings.vue → user-settings
     */
    protected function filenameToKey(string $filename): string
    {
        // 去掉扩展名
        $withoutExt = pathinfo($filename, PATHINFO_FILENAME);

        // 替换目录分隔符为 -
        $withDashes = str_replace('/', '-', $withoutExt);
        $withDashes = str_replace('\\', '-', $withDashes);

        // 转 kebab-case
        return $this->toKebabCase($withDashes);
    }

    /**
     * 驼峰转 kebab-case
     */
    protected function toKebabCase(string $str): string
    {
        $result = preg_replace('/([a-z])([A-Z])/', '$1-$2', $str);
        $result = preg_replace('/([A-Z]+)([A-Z][a-z])/', '$1-$2', $result);
        return strtolower($result);
    }
}
