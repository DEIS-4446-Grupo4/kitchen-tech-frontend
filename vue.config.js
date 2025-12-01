const { defineConfig } = require('@vue/cli-service')
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
  }
})