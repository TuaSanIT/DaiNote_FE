<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="modal-container">
      <header class="modal-header">
        <h1>Board Settings</h1>
        <button class="close-btn" @click="closeModal">
          <i class="bi bi-x"></i>
        </button>
      </header>

      <main class="modal-body">
        <!-- Board Title -->
        <div class="form-group board-title-group">
          <label for="board-title" class="form-label">Board Title</label>
          <input id="board-title" type="text" class="form-input" v-model="boardTitle" placeholder="Enter board title" />
        </div>

        <!-- Collaborators Input -->
        <div class="form-group">
          <label class="form-label">Collaborators</label>
          <div class="email-input-wrapper">
            <ul class="collaborator-chips">
              <li v-for="(collaborator, index) in collaborators" :key="index" class="chip">
                <img class="avatar" :src="collaborator.avatar" :alt="collaborator.email" />
                <span>{{ collaborator.email }}</span>
                <button class="remove-chip" @click="removeCollaborator(index)">
                  <i class="bi bi-x"></i>
                </button>
              </li>
            </ul>
            <input type="text" class="email-input" v-model="newCollaborator"
              placeholder="Type email and press Enter or Space" @keydown.enter.prevent="addCollaborator"
              @keydown.space.prevent="addCollaborator" />
          </div>
          <span v-if="errorMessage" class="error-message">{{ errorMessage }}</span>
        </div>

        <!-- Message -->
        <div class="form-group">
          <label for="message" class="form-label">Message</label>
          <textarea id="message" class="form-textarea" v-model="message"
            placeholder="Join me and work together on this board"></textarea>
        </div>
      </main>

      <footer class="modal-footer">
        <button class="btn btn-danger" @click="deleteBoard">Delete this board</button>
        <div class="footer-actions">
          <button class="btn btn-secondary" @click="closeModal">Back</button>
          <button class="btn btn-primary" @click="updateBoard" :disabled="isLoading">
            <template v-if="isLoading">
              <span class="spinner"></span> Updating...
            </template>
            <template v-else>
              Update Board
            </template>
          </button>

        </div>
      </footer>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import CryptoJS from "crypto-js";
import { useToast } from "vue-toastification";

export default {
  props: {
    isOpen: {
      type: Boolean,
      required: true,
    },
    boardId: {
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
      boardTitle: "",
      collaborators: [],
      newCollaborator: "",
      message: "",
      errorMessage: "",
      isLoading: false,
    };
  },
  watch: {
    boardId: "fetchBoardData",
  },
  mounted() {
    this.fetchBoardData();
  },
  methods: {
    async fetchBoardData() {
      const toast = useToast();
      if (!this.boardId) {
        toast.error("Invalid board ID.");
        return;
      }

      const userId = localStorage.getItem("userId");
      if (!userId) {
        toast.error("User not logged in. Redirecting to login.");
        this.$router.push("/login");
        return;
      }

      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/api/board/${this.boardId}`, {
          headers: { "UserId": userId },
        });

        const { board, isOwner, isEditor } = response.data;
        this.boardTitle = board.name;
        this.boardStatus = board.status || "Unknown";
        this.isOwner = isOwner;
        this.isEditor = isEditor;

        console.log("Fetched board data:", board);
      } catch (error) {
        console.error("Error fetching board data:", error);
        toast.error(error.response?.data?.message || "Failed to fetch board data.");
      }
    },
    async updateBoard() {
      const toast = useToast();
      const userId = localStorage.getItem("userId");

      if (!userId) {
        toast.error("User not logged in. Redirecting to login.");
        this.$router.push("/login");
        return;
      }

      if (!this.boardTitle.trim()) {
        toast.error("Board title cannot be empty.");
        return;
      }

      this.isLoading = true;

      try {
        const updatedData = { name: this.boardTitle, status: this.boardStatus || "Active" };

        await axios.put(`${process.env.VUE_APP_API_BASE_URL}/api/board/${this.boardId}`, updatedData, {
          headers: { "UserId": userId },
        });


        if (this.collaborators.length > 0) {
          const emails = this.collaborators.map((collab) => collab.email);

          try {
            const invitationData = {
              boardId: this.boardId,
              senderUserId: userId,
              emails,
            };

            await axios.post(
              `${process.env.VUE_APP_API_BASE_URL}/api/collaborator/invite`,
              invitationData
            );

            toast.success("Invitation to board sent successfully");
          } catch (error) {
            const message =
              error.response?.data?.Message || "Failed to send invitations.";
            toast.error(message);
            console.log(error.response?.data?.Message);
          }
        }

        toast.success("Board updated successfully!");
        this.$emit("update-board", updatedData);
        this.closeModal();
      } catch (error) {
        console.error("Error updating board title:", error);
        toast.error("Failed to update board title.");
      } finally {
        this.isLoading = false;
      }
    },

    async deleteBoard() {
      const toast = useToast();
      const userId = localStorage.getItem("userId");

      if (!this.boardId) {
        toast.error("Invalid board ID.");
        return;
      }

      if (!userId) {
        toast.error("User not logged in. Redirecting to login.");
        this.$router.push("/login");
        return;
      }

      try {
        await axios.delete(`${process.env.VUE_APP_API_BASE_URL}/api/board/${this.boardId}`, {
          headers: { "UserId": userId },
        });

        toast.success("Board deleted successfully!");
        this.fetchBoardData();
        this.$emit("delete-board", this.boardId);
        this.closeModal();
      } catch (error) {
        console.error("Error deleting board:", error);
        toast.error(error.response?.data?.message || "Failed to delete the board.");
      }
    },

    async addCollaborator() {
      const email = this.newCollaborator.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email)) {
        this.errorMessage = "Please enter a valid email address.";
        return;
      }

      if (this.collaborators.some((collab) => collab.email === email)) {
        this.errorMessage = "This email is already added.";
        return;
      }

      try {
        const response = await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/api/collaborator/check`,
          {
            email,
            boardId: this.boardId,
          }
        );

        const { isCollaborator, canBeInvited, message } = response.data;

        if (isCollaborator) {
          this.errorMessage = (message);
        } else if (canBeInvited) {
          const avatarUrl = this.generateAvatar(email);
          this.collaborators.push({ email, avatar: avatarUrl });
          this.newCollaborator = "";
          this.errorMessage = "";
        } else {
          this.errorMessage = message || "Unable to add this collaborator.";
        }
      } catch (error) {
        console.error("Error checking collaborator status:", error);
        this.errorMessage = "User not found in the system.";
      }
    },

    removeCollaborator(index) {
      this.collaborators.splice(index, 1);
    },

    generateAvatar(email) {
      const hash = CryptoJS.MD5(email.trim().toLowerCase()).toString();
      return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=40`;
    },

    closeModal() {
      this.$emit("close");
    },
  },
};
</script>

<style scoped>

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  overflow-y: auto;
}


.modal-container {
  background: #ffffff;
  padding: 30px;
  border-radius: 15px;
  width: 90%;
  max-width: 1080px;
  max-height: 90%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  animation: fadeIn 0.3s ease-in-out;
  overflow-y: auto;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}


.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h1 {
  font-size: 24px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.close-btn:hover {
  color: #000;
}

.board-title-group {
  margin-bottom: 20px;
}

.board-title {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #595e69;
  color: var(--vt-c-white);
  padding: 20px;
  margin-bottom: 10px;
  font-size: 20px;
  font-weight: bold;
}


.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.form-input {
  width: 50%;
  padding: 12px 16px;
  font-size: 16px;
  border: 2px solid #ccc;
  border-radius: 8px;
  background-color: #595e69;
  color: var(--vt-c-white);
  transition: border-color 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease;
}


.form-input:focus {
  border-color: #007bff;
  box-shadow: 0 0 8px rgba(0, 123, 255, 0.4);
  background-color: #595e69;
  outline: none;
}

.form-textarea {
  width: 100%;
  padding: 10px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 6px;
  transition: border-color 0.2s;
}

.form-textarea:focus {
  border-color: #007bff;
  outline: none;
}

.form-textarea {
  min-height: 80px;
}


.email-input-wrapper {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 10px;
  position: relative;
}

.collaborator-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  display: flex;
  align-items: center;
  background: #e9ecef;
  border-radius: 16px;
  padding: 5px 10px;
  font-size: 14px;
}

.chip img.avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 8px;
}

.remove-chip {
  background: none;
  border: none;
  font-size: 14px;
  color: #dc3545;
  margin-left: 8px;
  cursor: pointer;
}

.remove-chip:hover {
  color: #c82333;
}

.email-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 5px;
  min-width: 200px;
}


.autocomplete-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ccc;
  border-radius: 6px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  list-style: none;
  padding: 0;
  margin: 5px 0 0;
  max-height: 150px;
  overflow-y: auto;
}

.autocomplete-item {
  padding: 10px;
  font-size: 14px;
  cursor: pointer;
}

.autocomplete-item:hover {
  background: #007bff;
  color: white;
}


.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn {
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
}


.notification {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 15px 20px;
  background-color: #28a745;
  
  color: white;
  font-size: 16px;
  border-radius: 8px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 9999;
  animation: fadeInOut 3s forwards;
}

.notification.error {
  background-color: #dc3545;
  
}


@keyframes fadeInOut {
  0% {
    opacity: 0;
    transform: translateY(-20px);
  }

  10% {
    opacity: 1;
    transform: translateY(0);
  }

  90% {
    opacity: 1;
    transform: translateY(0);
  }

  100% {
    opacity: 0;
    transform: translateY(-20px);
  }
}

.error-message {
  color: #dc3545;
  font-size: 14px;
  margin-top: 5px;
}


@media (max-width: 768px) {
  .modal-container {
    padding: 20px;
    width: 95%;
    max-width: 600px;
    
  }

  .modal-header h1 {
    font-size: 20px;
  }

  .form-label {
    font-size: 16px;
  }

  .form-input,
  .form-textarea {
    font-size: 14px;
    padding: 10px;
  }
}

@media (max-width: 480px) {
  .modal-container {
    padding: 15px;
    width: 100%;
    max-width: 400px;
    
    border-radius: 10px;
  }

  .modal-header h1 {
    font-size: 18px;
  }

  .form-group {
    margin-bottom: 15px;
  }

  .form-input,
  .form-textarea {
    font-size: 14px;
    padding: 8px;
  }

  .modal-footer {
    flex-direction: column;
    
    gap: 10px;
  }

  .btn {
    width: 100%;
    
  }

  .spinner {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: #fff;
    animation: spin 0.8s linear infinite;
    margin-right: 8px;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }


}
</style>
