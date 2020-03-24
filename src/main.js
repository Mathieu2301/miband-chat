import Vue from 'vue';
import app from './app.vue';

if (window.location.hostname !== 'localhost' && window.location.protocol !== 'https:') {
  window.location.replace(`
    https:${window.location.href.substring(window.location.protocol.length)}
  `);
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then((sw) => {
    Vue.prototype.sw = sw;
  });
}

if ('mediaSession' in navigator) {
  navigator.mediaSession.setActionHandler = navigator.mediaSession.setActionHandler
    || function none() {};
  window.MediaMetadata = window.MediaMetadata || function none() {};
}

Vue.config.productionTip = false;

new Vue({
  render: (h) => h(app),
}).$mount('#app');
