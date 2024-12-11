<template>
    <div class="workspace-item">
      <div v-if="showOptions" class="workspace-options-dropdown">
        <div class="options-item update" @click="showUpdateWorkspace">
          <i class="bi bi-screwdriver"></i>Update
        </div>
        <div class="options-item delete" @click="deleteWorkspace">
          <i class="bi bi-x"></i>Delete
        </div>
      </div>
  
      <teleport to="body">
        <div v-if="showOptions" class="workspace-background" @click="closeForm"></div>
      </teleport>
  
      <div class="workspace-header">
        <span class="name">{{ workspace.name }}</span>
        <button class="workspace-setting" @click="showOptions = !showOptions">
          <i class="bi bi-three-dots-vertical"></i>
        </button>
      </div>
  
      <button class="board-add" @click="showCreateBoard">
        <i class="bi bi-plus-circle-fill"></i>
      </button>
  
      <update-workspace 
        v-if="showWorkspaceUpdate"
        :workspace="workspace"
        @closeForm="closeWorkspaceForm"
        @workspaceUpdated="handleWorkspaceUpdate"
      ></update-workspace>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  import UpdateWorkspace from './UpdateWorkspace.vue';
  
  export default {
    props: {
      workspace: {
        type: Object,
        required: true,
      },
    },
    data() {
      return {
        showOptions: false,
        showWorkspaceUpdate: false,
      };
    },
    components: {
      UpdateWorkspace,
    },
    methods: {
      closeForm(event) {
        if (!event.target.closest('.workspace-options-dropdown')) {
          this.showOptions = false;
        }
      },
      showUpdateWorkspace() {
        this.showWorkspaceUpdate = true;
      },
      async deleteWorkspace() {
        if (confirm('Do you want to delete this Workspace?')) {
          try {
            await axios.delete(`http://localhost:5141/api/workspace/${this.workspace.id}`);
            this.$emit('workspaceDeleted', this.workspace.id);
          } catch (error) {
            console.error('Error deleting workspace:', error);
          }
        }
      },
      handleWorkspaceUpdate(updatedWorkspace) {
        this.$emit('workspaceUpdated', updatedWorkspace);
        this.showWorkspaceUpdate = false;
      },
    },
  };
  </script>
  
    
    <style scoped>
    .workspace-background {
      background: none;
      position: absolute;
      z-index: 1000;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }
    
    .workspace-item {
      width: 320px;
      margin: 20px;
      padding: 10px;
      background-color: #f9f9f9;
      border-radius: 10px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      position: relative;
    }
    
    .workspace-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 10px;
    }
    
    .workspace-header .name {
      font-weight: bold;
    }
    
    .workspace-header .workspace-setting {
      background: none;
      border: none;
      cursor: pointer;
    }
    
    .workspace-options-dropdown {
      position: absolute;
      right: 0;
      top: 40px;
      background-color: #333;
      color: white;
      border-radius: 5px;
      z-index: 2000;
      padding: 5px 10px;
    }
    
    .workspace-options-dropdown .options-item {
      padding: 5px 10px;
      cursor: pointer;
    }
    
    .workspace-options-dropdown .options-item:hover {
      background-color: #555;
    }
    
    .workspace-boards {
      margin: 10px 0;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    
    .board-add {
      background: none;
      border: none;
      cursor: pointer;
      margin-top: 10px;
    }
    
    .board-add i {
      font-size: 24px;
    }
    </style>
    