<template>
  <div id="app">
    <div class="header">MiBand Chat</div>
    <div class="container">
      <div class="list">
        <div
          v-for="(word, i) in list"
          :key="word"
          :class="{
            word: true,
            selected: selectedWord == i,
          }"
          @click="remWord(word, i)"
        >
          <div class="text">{{ word }}</div>
          <div class="delButton">X</div>
        </div>
        <form class="input" @submit="addWord">
          <input type="text" placeholder="Ajouter un mot" v-model="newWord">
          <input type="submit" value="Ajouter">
        </form>
      </div>
      <div class="bottom" v-if="!client" @click="connect">Se connecter</div>
    </div>
  </div>
</template>

<script>
import Blast from 'blast-api';


export default {
  name: 'MiBand-Chat',

  data() {
    return {
      UID: `@${Math.random() * 100000000000000000}`,
      client: false,

      list: [],
      newWord: '',

      selectedWord: 0,
    };
  },

  methods: {
    addWord(e) {
      e.preventDefault();
      if (!this.list || this.list.length === 0) this.list = [];
      if (this.newWord && this.newWord.length > 0 && !this.list.includes(this.newWord)) {
        this.list.push(this.newWord);
        this.newWord = '';

        localStorage.setItem('wordList', JSON.stringify(this.list));
      }
    },

    remWord(word, i) {
      if (this.list && this.selectedWord !== i) {
        this.list = this.list.filter((w) => w !== word);
        localStorage.setItem('wordList', JSON.stringify(this.list));
      }
    },

    connect() {
      if (!this.client) {
        this.client = new Blast({
          app: 'miband-chat',
        });

        this.client.emit('message', this.UID, "Quelqu'un vient de rejoindre !");

        const audio = document.createElement('audio');

        if ('mediaSession' in navigator) {
          navigator.mediaSession.setActionHandler('play', () => {
            if (!this.client) return;
            this.client.emit('message', this.UID, this.list[this.selectedWord]);
            navigator.mediaSession.playbackState = 'playing';
            setTimeout(() => {
              navigator.mediaSession.playbackState = 'paused';
            }, 1000);
          });

          navigator.mediaSession.setActionHandler('previoustrack', () => {
            this.selectedWord -= 1;
            if (this.selectedWord === -1 || !this.list[this.selectedWord]) {
              this.selectedWord = this.list.length - 1;
            }

            navigator.mediaSession.playbackState = 'playing';
            navigator.mediaSession.metadata = new window.MediaMetadata({
              title: this.list[this.selectedWord],
            });
            navigator.mediaSession.playbackState = 'paused';
          });

          navigator.mediaSession.setActionHandler('nexttrack', () => {
            this.selectedWord += 1;
            if (this.selectedWord === this.list.length || !this.list[this.selectedWord]) {
              this.selectedWord = 0;
            }

            navigator.mediaSession.playbackState = 'playing';
            navigator.mediaSession.metadata = new window.MediaMetadata({
              title: this.list[this.selectedWord],
            });
            navigator.mediaSession.playbackState = 'paused';
          });

          audio.src = './null.mp3';
          audio.play().then(() => {
            navigator.mediaSession.metadata = new window.MediaMetadata({
              title: this.list[this.selectedWord],
            });
            audio.pause();
          });
        }

        Notification.requestPermission(() => {
          window.sw.showNotification('', { body: 'Connecté !' });
        });

        this.client.on('message', (UID, message) => {
          if (UID !== this.UID) window.sw.showNotification('', { body: message });
        });
      }
    },
  },

  mounted() {
    this.list = [];
    try {
      this.list = JSON.parse(localStorage.getItem('wordList'));
    } catch (error) {
      throw new Error("Can't parse wordList, so it has been deleted.");
    }
  },
};
</script>

<style>
:root {
  --color0: #7279f9;
  --color1: #e98a98;
  --color2: #686dcc;
  --color3: #b3b6eb;
  --red: #f84d4d;
  --text: #fff7f7;
}

body {
  background-color: var(--color1);
  margin: 0;
  color: var(--text);
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

body * {
  box-sizing: border-box;
  transition-duration: 0.1s;
}

#app {
  font-family: Helvetica, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin-top: 75px;
  margin-bottom: 10px;
}

.header {
  display: flex;
  justify-content: space-between;
  position: fixed;
  top: 0;
  height: 70px;
  width: 100%;
  background-color: var(--color2);
  background: linear-gradient(-15deg,var(--color3),var(--color1));
  z-index: 10;
  opacity: 0.9;
  box-shadow: 0 3px 8px #0000002e;

  color: var(--text);
  font-size: 35px;
  padding: 15px 25px 0;
}

.container {
  background-color: var(--color2);
  opacity: 0.9;
  width: calc(100% - 10px);
  margin: 0 auto;
  border-radius: 6px;
  box-shadow: 0 3px 8px #0000002e;
}

.list {
  padding: 5px 12px;
}

.word {
  display: flex;
  justify-content: space-between;
  margin: 10px 0;
  padding: 10px;
  background-color: var(--color0);
  border-radius: 6px;
  cursor: pointer;
  box-shadow: 0 3px 8px #0000002e;
  opacity: 0.7;
  overflow: auto;
  line-break: auto;
  word-wrap: break-word;
}

.word.selected { opacity: 1 }
.word.selected .delButton { display: none }

.word .text {
  margin-right: 5px;
  overflow: auto;
  line-break: auto;
  word-wrap: break-word;
}

.word .delButton { color: var(--red) }

.input {
  display: flex;
  justify-content: space-between;
  margin: 10px 0;
  border-radius: 6px;
  cursor: pointer;
  box-shadow: 0 3px 8px #0000002e;
}

input {
  border: none;
  padding: 10px;
  font-size: 15px;
}

input[type=text] {
  border-top-left-radius: 6px;
  border-bottom-left-radius: 6px;
  width: 100%;
}

input[type=submit] {
  border-top-right-radius: 6px;
  border-bottom-right-radius: 6px;
  width: 120px;
}

.bottom {
  width: 100%;
  padding: 7px 0;
  text-align: center;
  cursor: pointer;
  background-color: var(--color0);
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
}
</style>
