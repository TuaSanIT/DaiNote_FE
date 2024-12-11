<template>
    <div :class="['joined-boards', { 'collapsed-sidebar': !isSidebarOpen }, { 'popup-active': popupActive }]">
      <h2>Your Collaborator Boards</h2>
  
      <!-- Loading State -->
      <div v-if="isLoading" class="loading">
        Loading your boards...
      </div>
  
      <!-- Error Message -->
      <div v-if="error" class="error">
        {{ error }}
      </div>
  
      <!-- Board List -->
      <ul v-if="boards.length > 0" class="board-list">
        <li v-for="board in boards" :key="board.id" class="board-item">
          <h3>{{ board.name }}</h3>
          <p><strong>Workspace:</strong> {{ board.workspaceName }}</p>
          <p><strong>Status:</strong> {{ board.status }}</p>
          <button @click="openBoard(board.id)">Open Board</button>
        </li>
      </ul>
  
      <!-- No Boards Message -->
      <div v-else-if="!isLoading && !error" class="no-boards">
        You have not joined any boards yet.
      </div>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    props: ["isSidebarOpen", "popupActive"],
    data() {
      return {
        boards: [],
        isLoading: true,
        error: null,
      };
    },
    watch: {
    popupActive(newValue) {
      if (newValue) {
        this.$el.style.zIndex = "-1"; // Lower z-index when popup is active
      } else {
        this.$el.style.zIndex = "1"; // Restore default z-index
      }
    },
  },
    methods: {
      async fetchJoinedBoards() {
        this.isLoading = true;
        this.error = null;
  
        const userId = localStorage.getItem("userId");
        if (!userId) {
          this.error = "User ID not found. Please log in.";
          this.isLoading = false;
          return;
        }
  
        try {
          const response = await axios.get(
            `http://localhost:5141/api/board/joined?userId=${userId}`
          );
  
          if (response.data) {
            this.boards = response.data;
          } else {
            this.boards = [];
          }
        } catch (err) {
          console.error("Error fetching joined boards:", err);
          this.error = "Failed to fetch boards. Please try again later.";
        } finally {
          this.isLoading = false;
        }
      },
      openBoard(boardId) {
        // Redirect to the board details page or perform an action
        this.$router.push(`/board-list/${boardId}`);
      },
    },
    mounted() {
      this.fetchJoinedBoards(); // Fetch boards when the component is mounted
    },
  };
  </script>
  
  <style scoped>
  .joined-boards {
    position: relative;
    margin-left: 350px; /* Default with sidebar open */
    margin-right: 30px;
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    margin-top: 60px;
    transition: margin-left 0.3s ease, width 0.3s ease;
    z-index: 1;
  }
  .popup-active {
  z-index: -1; /* Lower z-index when popup is active */
}

  .collapsed-sidebar {
    margin-left: 50px; /* Adjust content position when sidebar is collapsed */
  }
  
  .loading {
    text-align: center;
    font-size: 18px;
    color: #555;
  }
  
  .error {
    color: red;
    text-align: center;
    margin-bottom: 20px;
  }
  
  .no-boards {
    text-align: center;
    font-size: 18px;
    color: #888;
  }
  
  .board-list {
    list-style: none;
    padding: 0;
  }
  
  .board-item {
    background: #ffffff;
    padding: 15px;
    border: 1px solid #ddd;
    border-radius: 6px;
    margin-bottom: 15px;
  }
  
  .board-item h3 {
    margin: 0;
    font-size: 20px;
    color: #333;
  }
  
  .board-item p {
    margin: 5px 0;
    color: #666;
  }
  
  .board-item button {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
  }
  
  .board-item button:hover {
    background-color: #0056b3;
  }
  </style>
  