<template>
  <div v-if="isOpen" class="modal">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Board Members</h3>
        <button class="close-modal-btn" @click="$emit('close')">&times;</button>
      </div>

      <ul class="member-list">
        <li v-for="member in members" :key="member.user_Id" class="member-item">
          <div class="member-info">
            <img :src="member.avatarImage || '/default-avatar.png'" alt="Avatar" class="avatar" />
            <div class="member-details">
              <span class="member-name">{{ member.fullName }}</span>
              <span class="member-username">@{{ member.userName }} </span>
              <span class="member-permission"> ({{ member.permission }})</span>
            </div>
          </div>
          <button v-if="isOwner && member.permission.toLowerCase() === 'editor'" @click="removeMember(member.user_Id)"
            class="remove-btn">
            Remove
          </button>

        </li>
      </ul>

      <div class="modal-footer">
        <button @click="$emit('close')" class="close-btn">Close</button>
      </div>
    </div>
  </div>
</template>



<script>
import axios from "axios";
import { useToast } from "vue-toastification";

export default {
  props: {
    boardId: {
      type: String,
      required: true,
    },
    isOpen: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      members: [],
      isOwner: false,
    };
  },

  created() {
    console.log("Modal created");
    if (this.isOpen) {
      console.log("Modal is open, fetching collaborators");
      this.fetchCollaborators();
    }
  },

  watch: {
    isOpen(newVal) {
      if (newVal) {
        this.fetchCollaborators();
      }
    },
  },

  methods: {

    async fetchCollaborators() {
      const toast = useToast();
      const userId = localStorage.getItem("userId");

      if (!userId) {
        toast.error("User not authenticated.");
        this.$emit("close");
        return;
      }

      try {
        console.log("Fetching collaborators for board:", this.boardId);

        const response = await axios.get(
          `http://localhost:5141/api/Board/${this.boardId}/collaborators`,
          { headers: { UserId: userId } }
        );

        if (response.status === 200) {
          const { collaborators, isOwner } = response.data;

          this.members = collaborators.filter(
            (member) => member.permission.toLowerCase() !== "owner"
          );

          this.isOwner = isOwner;

          console.log("Filtered Collaborators:", this.members);
          console.log("Is current user owner:", this.isOwner);
        } else {
          this.members = [];
          console.warn("No collaborators found.");
        }
      } catch (error) {
        console.error("Failed to fetch collaborators:", error);
        if (error.response?.status === 403) {
          toast.error("You do not have permission to view collaborators.");
          this.$emit("close");
        } else {
          toast.error("An error occurred while fetching collaborators.");
        }
      }
    },

    async checkIfOwner() {
      try {
        const response = await axios.get(
          `http://localhost:5141/api/board/${this.boardId}`,
          {
            headers: {
              UserId: localStorage.getItem("userId"),
            },
          }
        );

        this.isOwner = response.data.isOwner;
        console.log("Is owner:", this.isOwner);
      } catch (error) {
        console.error("Failed to check owner status:", error);
      }
    },

    async removeMember(userId) {
      const toast = useToast();
      try {
        console.log("Removing collaborator:", userId);
        await axios.delete(
          `http://localhost:5141/api/Board/${this.boardId}/collaborator/${userId}`,
          {
            headers: { UserId: localStorage.getItem("userId") },
          }
        );
        this.members = this.members.filter((member) => member.user_Id !== userId);
        toast.success("Removed member successfully.");
      } catch (error) {
        console.error("Failed to remove member:", error);
        toast.error(
          error.response?.data?.message || "Failed to remove member."
        );
      }
    },
  },
};
</script>

<style scoped>
/* Modal Overlay */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.7);
  /* Tối màu nền */
  z-index: 1000;
  padding: 10px;
}

/* Modal Content */
.modal-content {
  background: #ffffff;
  padding: 20px;
  border-radius: 12px;
  width: 500px;
  max-width: 100%;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
}

/* Modal Header */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eaeaea;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.modal-header h3 {
  font-size: 1.5rem;
  color: #333;
  margin: 0;
}

.close-modal-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  font-weight: bold;
  color: #888;
  cursor: pointer;
}

.close-modal-btn:hover {
  color: #555;
}

/* Member List */
.member-list {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 300px;
  /* Giới hạn chiều cao */
  overflow-y: auto;
}

.member-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #eaeaea;
}

.member-info {
  display: flex;
  align-items: center;
}

.member-details {
  margin-left: 10px;
}

.member-name {
  font-weight: bold;
  color: #333;
  font-size: 1rem;
  margin-bottom: 2px;
  display: block;
}

.member-username {
  font-size: 0.9rem;
  color: #666;
}

.member-permission {
  font-size: 0.8rem;
  color: #aaa;
}

/* Avatar */
.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 2px solid #ddd;
}

/* Remove Button */
.remove-btn {
  background: #ff4d4f;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.remove-btn:hover {
  background: #d9363e;
}

/* Modal Footer */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.close-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.close-btn:hover {
  background: #0056b3;
}
</style>