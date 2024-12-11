<template>
  <WorkspaceSideBar :workspaceId="workspaceId" :currentUser="currentUser" @workspaceChanged="onWorkspaceChanged"
    @toggleSidebar="toggleSidebar" />
  <div class="main" :class="{ 'collapsed-sidebar': !isSidebarOpen }">
    <div class="workspace-container">
      <!-- Search bar -->
      <div class="search-bar">
        <input type="text" v-model="searchQuery" @input="filterBoards" placeholder="Search boards by name..." />
      </div>
      <div v-if="isLoading" class="loading-spinner">Loading boards...</div>
      <ul v-else class="workspace-list">
        <!-- Filtered Boards -->
        <board-item v-for="board in filteredBoards" :key="board.id" :boardId="board.id" :name="board.name"
          :status="board.status" :workspaceId="workspaceId" :userId="userId" @boardDeleted="removeBoardFromUI"
          @boardUpdated="updateBoardInUI" />

        <!-- Add Board Form -->
        <li class="add-board" v-if="isDisplay">
          <form @submit.prevent="addBoard">
            <div class="add-board-name">
              <input type="text" v-model="newBoardName" placeholder="Enter board name" required />
              <div class="error" v-if="inputValidate">
                Board name must be at least 3 characters
              </div>
            </div>
            <div class="add-board-status">
              <select v-model="newBoardStatus" required>
                <option value="" disabled selected>Select status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div class="add-button">
              <button class="add" type="submit">Add Board</button>
              <button type="button" class="cancel" @click="changeVisibility">
                <i class="bi bi-x-square"></i>
              </button>
            </div>
          </form>
        </li>

        <!-- Add Confirm Button -->
        <li class="add-confirm" v-if="!isDisplay">
          <button @click="changeVisibility">
            <i class="bi bi-plus"></i>
            <span>Add Board</span>
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { useToast } from "vue-toastification";
import WorkspaceSideBar from "../Sidebar/WorkspaceSidebar.vue";
import BoardItem from "./BoardItem.vue";
import axios from "axios";

export default {
  components: {
    "board-item": BoardItem,
    WorkspaceSideBar,
  },
  data() {
    return {
      isLoading: false,
      isSidebarOpen: true,
      isDisplay: false,
      boards: [],
      filteredBoards: [],
      searchQuery: "",
      newBoardName: "",
      newBoardStatus: "",
      inputValidate: false,
      workspaceId: this.$route.params.workspaceId,
      userId: localStorage.getItem("userId"),
    };
  },

  mounted() {
    this.getBoards();
  },
  watch: {
    workspaceId: {
      immediate: true, // Gọi ngay khi component được mount
      handler(newWorkspaceId) {
        if (newWorkspaceId) {
          this.getBoards(); // Tải lại board khi workspaceId thay đổi
        }
      },
    },
  },
  methods: {
    onWorkspaceChanged(newWorkspaceId) {
      this.workspaceId = newWorkspaceId;
      this.getBoards(); // Tải lại board khi workspaceId thay đổi
    },
    toggleSidebar(isOpen) {
      this.isSidebarOpen = isOpen;
    },
    changeVisibility() {
      this.isDisplay = !this.isDisplay;
    },

    async getBoards() {
      this.isLoading = true;
      try {
        // Fetch boards from workspace API
        const response = await axios.get(`http://localhost:5141/api/workspace/${this.workspaceId}`, {
          headers: {
            UserId: localStorage.getItem("userId"), // Include UserId in the headers
          },
        });

        // Assign boards data from the response
        this.boards = response.data.board || [];
        this.filteredBoards = this.boards;
        console.log("Boards data fetched successfully:", this.boards);
      } catch (error) {
        // Handle various error responses
        if (error.response) {
          const status = error.response.status;
          const message = error.response.data?.message;

          if (status === 403) {
            console.error("Permission denied:", message);
            this.$router.push("/error");
          } else if (status === 401) {
            console.error("User not logged in:", message);
            this.$router.push("/login");
          } else if (status === 404) {
            console.error("Workspace or board not found:", message);
            alert("Workspace or board not found.");
          } else {
            console.error("Unexpected error:", error);
          }
        } else {
          console.error("Error fetching boards:", error);
        }
      } finally {
        this.isLoading = false;
      }
    },
    filterBoards() {
      const query = this.searchQuery.toLowerCase();
      this.filteredBoards = this.boards.filter((board) =>
        board.name.toLowerCase().includes(query)
      );
    },
    async addBoard() {
      const toast = useToast();

      const trimmedName = this.newBoardName.trim();

      if (trimmedName.length < 3) {
        this.inputValidate = true;
        toast.error("Board name must be at least 3 characters long.");
        return;
      }

      this.inputValidate = false;

      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          toast.error("User is not logged in. Please log in and try again.");
          return;
        }

        const response = await axios.post(
          `http://localhost:5141/api/board/${this.workspaceId}`,
          {
            Name: trimmedName,
            Status: this.newBoardStatus || "Active",
          },
          {
            headers: {
              UserId: userId,
            },
          }
        );

        this.boards.push(response.data);
        this.filteredBoards = this.boards;
        this.newBoardName = "";
        this.newBoardStatus = "";
        this.isDisplay = false;

        toast.success("Board added successfully!"); // User feedback
      } catch (error) {
        console.error("Error adding board:", error);
        toast.warning(
          error.response?.data?.message || "Failed to add board. Please try again."
        ); // Detailed feedback
      }
    },
    removeBoardFromUI(boardId) {
      this.boards = this.boards.filter((board) => board.id !== boardId);
      this.filteredBoards = this.boards;
    },

    updateBoardInUI(updatedBoard) {
      const index = this.boards.findIndex(
        (board) => board.id === updatedBoard.id
      );
      if (index !== -1) {
        this.boards.splice(index, 1, updatedBoard);
        this.filteredBoards = this.boards;
      }
      this.getBoards();
    },
  },
};
</script>

<style scoped>
.main {
  margin-left: 300px;
  margin-top: 60px;
  width: calc(100% - 300px);
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  transition: all 0.3s ease;
}

.main.collapsed-sidebar {
  margin-left: 50px;
  width: calc(100% - 50px);
}

.workspace-container {
  width: 100%;
  height: 88vh;
  display: flex;
  flex-direction: column;
}

.search-bar {
  margin: 10px 20px;
  display: flex;
  justify-content: center;
}

.search-bar input {
  width: 100%;
  max-width: 400px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 25px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
  outline: none;
  font-size: 16px;
}

.search-bar input:focus {
  border-color: #007bff;
}

.workspace-list {
  list-style: none;
  padding: 0;
  margin: 10px 17px 0 15px;
  display: flex;
  flex-wrap: nowrap;
  align-items: flex-start;
}

.add-board {
  margin-top: 20px;
  min-width: 200px;
  display: inline-block;
  margin-left: 20px;
  background-color: var(--list-item-color);
  padding: 10px;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.add-board-name input {
  width: 100%;
  padding: 5px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: var(--vt-c-white);
}

.add-board-name .error {
  color: red;
}

.add-board-status select {
  width: 100%;
  padding: 5px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: var(--vt-c-white);
}

.add-button {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.add-button .add {
  background-color: #007bff;
  color: var(--vt-c-white);
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
}

.add-button .add:hover {
  background-color: #0056b3;
}

.add-confirm {
  min-width: 200px;
  display: inline-block;
  margin-left: 20px;
  margin-top: 20px;
  padding: 10px;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  background-color: var(--vt-c-white);
}

.add-confirm:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.add-confirm button {
  width: 100%;
  height: 100%;
  display: flex;
  background: none;
  border: none;
  padding: 4px;
  font-size: 16px;
}

.add-confirm i {
  margin-right: 10px;
  font-size: 20px;
}
.loading-spinner {
  text-align: center;
  font-size: 18px;
  color: #007bff;
  padding: 20px;
}

</style>