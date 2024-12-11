<template>
  <div>
    <img :src="iconSrc" id="icon" @click="toggleTheme" />

    <header class="header">
      <router-link to="/">
        <img src="/Dai_Shogun.png(1).png" style="height: 50px;" alt="Logo" />
      </router-link>

      <div class="search-bar">
        <form class="search-form d-flex align-items-center" method="POST" action="#">
          <input type="text" name="query" placeholder="Search" title="Enter search keyword" />
          <button type="submit" title="Search">
            <i class="bi bi-search"></i>
          </button>
        </form>
      </div>
    </header>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isDarkTheme: false,
    };
  },

  methods: {
    toggleTheme() {
      this.isDarkTheme = !this.isDarkTheme; 
      document.body.classList.toggle("dark-theme"); 
      localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light');
    },
  },
  mounted() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.isDarkTheme = true;
      document.body.classList.add("dark-theme");
    }
  },
};
</script>

<style scoped>
.dark-theme {
  --color-background: var(--vt-c-black);
  --color-background-soft: var(--vt-c-black-soft);
  --color-background-mute: var(--vt-c-black-mute);

  --color-border: var(--vt-c-divider-dark-2);
  --color-border-hover: var(--vt-c-divider-dark-1);

  --color-heading: var(--vt-c-text-dark-1);
  --color-text: var(--vt-c-text-dark-2);
}

#icon {
  width: 30px;
  cursor: pointer;
}

.header {
  background-color: #323338;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 0;

  display: flex;
  align-items: center;
}

a {
  display: inline-block;
  padding: 0;
  margin: 5px 0 0px 20px;
  width: auto;
}

.header .search-bar {
  min-width: 360px;
  height: 36px;
  padding: 0 20px;
  display: inline;
  margin-left: 250px;
}

.header .search-bar input {
  padding: 7px 38px 7px 8px;
  border: 1px solid rgba(1, 41, 112, 0.2);
  border-radius: 3%;
  width: 272.4px;
  background-color: var(--vt-c-white);
}

.header .search-bar button {
  margin-left: -30px;
  border: 0;
  background: none;
}
</style>
