<template>
    <home-sidebar @toggleSidebar="updateSidebarState"></home-sidebar>
    <task-table :isSidebarOpen="isSidebarOpen" ></task-table>
  </template>
  
  <script>
  import HomeSideBar from "@/components/Sidebar/HomeSideBar.vue";
  import TaskTable from "@/components/UI/TaskTable.vue";
  
  export default {
    components: {
      "home-sidebar": HomeSideBar,
      "task-table": TaskTable,
    },
    data() {
      return {
        isSidebarOpen: true, // Track the state of the sidebar
      };
    },
    methods: {
      updateSidebarState(isOpen) {
        this.isSidebarOpen = isOpen; // Update the state when the sidebar toggles
      },
    },
  };
  </script>

  <style scoped>
  .task-table{
    height: 100vh;
  }
  </style>
  