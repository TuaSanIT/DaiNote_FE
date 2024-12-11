<template>
    <div>
      <board-sidebar @popupStateChange="updatePopupState" @toggleSidebar="updateSidebarState" />
      <note-list :notes="filteredNotes" :popupActive="isPopupActive" :isSidebarOpen="isSidebarOpen"/> <!-- Passing filtered notes to note-list (BaseNote) -->
    </div>
  </template>
  
  <script>
  import NoteLabelSidebar from '@/components/Sidebar/HomeSideBar.vue';
  import BaseNote from '@/components/Note/BaseNote.vue';
  
  export default {
    name: 'NoteView',
    components: {
      'board-sidebar': NoteLabelSidebar,
      'note-list': BaseNote,
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