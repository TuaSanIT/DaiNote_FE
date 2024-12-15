<template>
  <div :class="['board-item', boardColor]">
    <div class="board-content">
      <h3>{{ name }}</h3>
      <p>Status: <strong>{{ status }}</strong></p>
    </div>
    <div class="board-actions">
      <button class="info-btn" @click.stop="openUpdateModal" aria-label="Update board details">
        <i class="bi bi-pencil"></i>
      </button>
      <button class="navigate-btn" @click="navigateToBoard" aria-label="Navigate to board">
        <i class="bi bi-info-circle"></i> <!-- Replace this with your preferred icon -->
      </button>
      <button class="delete-btn" @click="showModal" aria-label="Delete board">
        <i class="bi bi-trash"></i>
      </button>
    </div>

    <!-- Inline Update Modal -->
    <div v-if="isUpdateModalVisible" class="modal-overlay">
      <div class="modal-content">
        <h4>Update Board</h4>
        <label for="board-name">Name:</label>
        <input id="board-name" v-model="updateBoardDto.Name" />

        <label for="board-status">Status:</label>
        <input id="board-status" v-model="updateBoardDto.Status" />

        <div class="modal-actions">
          <button class="confirm-btn" @click="updateBoard(boardId)">Update</button>
          <button class="cancel-btn" @click="isUpdateModalVisible = false">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Inline Confirmation Modal -->
    <div v-if="isModalVisible" class="modal-overlay">
      <div class="modal-content">
        <h4>Confirm Deletion</h4>
        <p>Are you sure you want to delete the board "{{ name }}"?</p>
        <div class="modal-actions">
          <button class="confirm-btn" @click="deleteBoard(boardId)">Yes</button>
          <button class="cancel-btn" @click="isModalVisible = false">No</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { useToast } from "vue-toastification";

export default {
  props: {
    name: {
      type: String,
      required: true,
    },
    boardId: {
      type: String,
      required: true,
    },
    boardColor: {
      type: String,
      default: 'gray',
    },
    status: {
      type: String,
      required: true,
    },
    workspaceId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      isModalVisible: false,
      isUpdateModalVisible: false, // Thêm state cho modal cập nhật
      updateBoardDto: { // DTO cho yêu cầu cập nhật
        Name: this.name,
        Status: this.status,
      },
    };
  },

  methods: {
    navigateToBoard() {
      if (!this.boardId || !this.workspaceId || !this.userId) {
        console.error("Missing boardId, workspaceId, or userId");
        console.log(this.boardId + "..." + this.workspaceId + "..." + this.userId);
        return;
      }
      this.$router.push({ path: `/board-list/${this.boardId}` });
    },

    showModal(event) {
      event.stopPropagation();
      console.log('Showing modal for board:', this.name);
      this.isModalVisible = true; // Show the modal
    },

    async deleteBoard(boardId) {
      const toast = useToast();

      if (!boardId) {
        console.error("Board ID is undefined");
        toast.error("Cannot delete the board. Invalid board ID.");
        return;
      }

      try {
        await axios.delete(`${process.env.VUE_APP_API_BASE_URL}/api/board/${boardId}`, {
          headers: {
            UserId: localStorage.getItem("userId"),
          },
        });

        this.$emit("boardDeleted", boardId);

        console.log("Deleted board successfully:", boardId);

        toast.success("Board deleted successfully!");
      } catch (error) {
        console.error("Error deleting board:", error);

        toast.error(
          error.response?.data?.message || "Failed to delete the board. Please try again."
        );
      } finally {
        this.isModalVisible = false;
      }
    },

    openUpdateModal() {
      this.isUpdateModalVisible = true;
    },

    async updateBoard(boardId) {
      const toast = useToast();

      if (!boardId || !this.updateBoardDto) {
        console.error("Board ID or update data is undefined");
        toast.error("Cannot update the board. Missing required data.");
        return;
      }

      try {
        await axios.put(`${process.env.VUE_APP_API_BASE_URL}/api/board/${boardId}`, this.updateBoardDto, {
          headers: {
            UserId: localStorage.getItem("userId"),
          },
        });

        console.log("Updated board successfully:", this.updateBoardDto);

        this.$emit("boardUpdated", { boardId, ...this.updateBoardDto });

        toast.success("Board updated successfully!");
      } catch (error) {
        console.error("Error updating board:", error);
        toast.error(
          error.response?.data?.message || "Failed to update the board. Please try again."
        );
      } finally {
        this.isUpdateModalVisible = false;
      }
    },
  },
};
</script>

<style scoped>
.board-item {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: #595e69;
  border-radius: 10px;
  margin: 15px;
  width: 220px;
  height: auto;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  color: #f1f2f4;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.board-item:hover {
  background-color: #4a4e58;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  cursor: pointer;
}

.board-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  word-wrap: break-word;
  word-break: break-word;
  white-space: normal;
  overflow-wrap: break-word;
  width: 100%;
  min-height: 60px;
  padding: 10px;
}

.board-actions {
  display: flex;
  justify-content: space-around;
  width: 100%;
  margin-top: 10px;
}

.info-btn,
.navigate-btn,
.delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 5px;
}

.info-btn i,
.navigate-btn i,
.delete-btn i {
  font-size: 22px;
}

.info-btn i {
  color: #61dafb;
}

.navigate-btn i {
  color: #ffc107;
  
}

.delete-btn i {
  color: #ff4d4d;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  width: 300px;
  text-align: center;
  color: black;
}

.modal-actions {
  margin-top: 20px;
}

.confirm-btn,
.cancel-btn {
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.confirm-btn {
  background-color: #ff4d4d;
  color: black;
  margin-right: 5px;
}

.cancel-btn {
  background-color: #61dafb;
  color: black;
  margin-left: 5px;
}
</style>
