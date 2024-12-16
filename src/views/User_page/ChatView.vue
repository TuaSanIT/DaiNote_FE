<template>
    <board-sidebar :boardId="boardId" @toggleSidebar="updateSidebarState"></board-sidebar>
    <chat-room :boardId="boardId" :isSidebarOpen="isSidebarOpen"></chat-room>
  </template>
  
  <script>
  import BoardSidebar from '@/components/Sidebar/BoardSidebar.vue';
  import ChatRoom from '@/components/Chat/ChatRoom.vue';
  
  export default {
    components: {
      'board-sidebar': BoardSidebar,
      'chat-room': ChatRoom
    },
    props: ['boardId'],
    data() {
      return {
        isSidebarOpen: true,
      };
    },
    methods: {
      updateSidebarState(isOpen) {
        this.isSidebarOpen = isOpen;
      },
    },
  };
  </script>
  