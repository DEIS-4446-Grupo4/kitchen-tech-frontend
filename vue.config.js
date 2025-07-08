const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      '^/api': {
        target: 'https://kitchen-tech-backend.onrender.com/api/kitchentech/v1',
        changeOrigin: true
      }
    }
  }
})
