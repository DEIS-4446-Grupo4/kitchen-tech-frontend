const { defineConfig } = require('@vue/cli-service')
const fs = require('fs')
const path = require('path')

module.exports = defineConfig({
  publicPath: '/',
  transpileDependencies: true,
  devServer: {
    historyApiFallback: true,
    proxy: {
      '^/api': {
        target: 'https://kitchen-tech-backend.onrender.com',
        changeOrigin: true,
      }
    },
  },
  configureWebpack: {
    devServer: {
      historyApiFallback: true
    }
  },
  chainWebpack: config => {
    config.plugin('generate-redirects').use({
      apply: (compiler) => {
        compiler.hooks.done.tap('GenerateRedirectsPlugin', () => {
          const redirectsPath = path.join(__dirname, 'dist', '_redirects');
          const content = '/*    /index.html   200';
          fs.mkdirSync(path.dirname(redirectsPath), { recursive: true });
          fs.writeFileSync(redirectsPath, content, 'utf8');
          console.log('✅ _redirects generado para Netlify');
        });
      }
    });
  }
})
