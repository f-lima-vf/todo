import { createApp } from 'vue'
import App from './App.vue'
// import Vuetify from 'vuetify'
import vuetify from './plugins/vuetify'
import { loadFonts } from './plugins/webfontloader'

loadFonts()

createApp(App)
  .use(vuetify)
  .mount('#app')
  
// Vue.use(Vuetify)
