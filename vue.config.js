const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      '^/api': {
        target: 'https://kitchen-tech-fqghavb0fychfkhm.brazilsouth-01.azurewebsites.net',
        changeOrigin: true
      }
    }
  }
})
