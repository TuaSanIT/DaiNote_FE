<template>
    <board-sidebar :boardId="boardId" @toggleSidebar="updateSidebarState"></board-sidebar>
    <base-list :boardId="boardId" :isSidebarOpen="isSidebarOpen"></base-list>
  </template>
  
  <script>
  import BoardSidebar from '@/components/Sidebar/BoardSidebar.vue';
  import BaseList from '@/components/List/BaseList.vue';
  
  export default {
    components: {
      'board-sidebar': BoardSidebar,
      'base-list': BaseList
    },
    props: ['boardId'],
    data() {
      return {
        isSidebarOpen: true, // Initial state
      };
    },
    methods: {
      updateSidebarState(isOpen) {
        this.isSidebarOpen = isOpen;
      },
    },
  };
  </script>
  