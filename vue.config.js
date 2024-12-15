const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,

  pluginOptions: {
    vuetify: {

		}
  },

  devServer: {
    proxy: {
      '/chatHub': {
        target: 'https://dainoteapi.azurewebsites.net', 
        changeOrigin: true, 
        ws: true, 
      },
    },
  },

})
