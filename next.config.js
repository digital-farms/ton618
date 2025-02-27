/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Отключаем автоматическую оптимизацию изображений
  images: {
    unoptimized: true,
  },
  // Разрешаем доступ к статическим файлам
  async rewrites() {
    return [
      {
        source: '/:path*',
        destination: '/:path*',
      },
    ];
  },
}

module.exports = nextConfig;
