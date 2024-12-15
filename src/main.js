import './assets/main.css';

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import vuetify from './plugins/vuetify';
import { createI18n } from 'vue-i18n'; //Admin
import { createPinia } from 'pinia'; //Admin

import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';
import { createVuestic } from 'vuestic-ui'; //Admin
import 'vuestic-ui/css'; //Admin







import { loadFonts } from './plugins/webfontloader';

loadFonts();

const toastOptions = {
  position: 'top-right', 
  timeout: 3000,        
  closeOnClick: true,   
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false,
};

const messages = {
  en: {
    welcome: 'Welcome',
    message: 'This is an internationalized message',
  },
  vi: {
    welcome: 'Chào mừng',
    message: 'Đây là một thông điệp quốc tế hóa',
  },
};

const i18n = createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages,
});

const pinia = createPinia();

createApp(App)
  .use(router)
  .use(createVuestic())
  .use(store)
  .use(vuetify)
  .use(Toast, toastOptions)
  .use(i18n)
  .use(pinia)
  .mount('#app')

