<template>
    <div>
      <!-- <base-header></base-header> -->
      <home-sidebar @toggleSidebar="updateSidebarState" @popupStateChange = "updatePopupState"></home-sidebar>
      <TaskCalendar :isSidebarOpen="isSidebarOpen" :popupActive="isPopupActive" />
    </div>
  </template>
  
  <script>

  import TaskCalendar from '@/components/Calender/TaskCalendar.vue';
  import HomeSideBar from '@/components/Sidebar/HomeSideBar.vue';
  
  export default {
    components: {

      TaskCalendar,
      'home-sidebar': HomeSideBar,
    },
    data() {
      return {
        isSidebarOpen: true, // Track the state of the sidebar
        isPopupActive: false,
      };
    },
    methods: {
      updateSidebarState(isOpen) {
        this.isSidebarOpen = isOpen; // Update the state when the sidebar toggles
      },
      updatePopupState(isActive) {
        this.isPopupActive = isActive; // Update the state when the sidebar toggles
      },
    },
  };
  </script>
  