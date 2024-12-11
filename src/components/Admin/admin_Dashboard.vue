<template>
    <div class="main">
      <div class="topbar">
        <div class="toggle" @click="toggleMenu">
          <ion-icon name="menu-outline"></ion-icon>
        </div>
      </div>
  
      <CardBox />
      <admin_DetailsPage />
    </div>
  </template>
  
  <script>
  import CardBox from "./CardBox.vue";
  import admin_DetailsPage from "./admin_DetailsPage.vue";
  
  export default {
    components: { CardBox, admin_DetailsPage },
    methods: {
      toggleMenu() {
        this.$emit("toggle-menu");
      },
    },
  };
  </script>
  
  <style scoped>
  .main {
    position: absolute;
    width: calc(100% - 300px);
    left: 300px;
    min-height: 100vh;
    background: #fff;
    transition: 0.5s;
  }
  .main.active {
    width: calc(100% - 80px);
    left: 80px;
  }

  .toggle {
    width: 60px;
    height: 60px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 2.5rem;
    cursor: pointer;
  }
  .search label {
    position: relative;
    width: 400px;
  }
  .search label input {
    width: 100%;
    height: 40px;
    border-radius: 40px;
    padding-left: 35px;
    font-size: 18px;
    border: 1px solid #999;
  }
  .search label ion-icon {
    position: absolute;
    top: 0;
    left: 10px;
    font-size: 1.2rem;
  }
  .user img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
  }
  </style>
  