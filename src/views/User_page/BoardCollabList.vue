<template>
    <div>
        <home-sidebar @popupStateChange="updatePopupState" @toggleSidebar="updateSidebarState"></home-sidebar>
        <joined-boards :isSidebarOpen="isSidebarOpen" :popupActive="isPopupActive" />
    </div>
  </template>
  
  <script>
  import HomeSideBar from "@/components/Sidebar/HomeSideBar.vue";
  import JoinedBoards from "@/components/Board/JoinedBoards.vue";
  
  export default {
    components: {
      "home-sidebar": HomeSideBar,
      "joined-boards": JoinedBoards,
    },
    data() {
      return {
        isPopupActive: false,
        isSidebarOpen: true, 
      };
    },
    methods: {
      updatePopupState(isActive) {
      this.isPopupActive = isActive; // Update the popup state
    },
      updateSidebarState(isOpen) {
        this.isSidebarOpen = isOpen; 
      },
    },
  };
  </script>