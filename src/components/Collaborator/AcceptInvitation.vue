<template>
  <div class="invitation-container" v-if="invitation">
    <h1>Join {{ invitation.boardName }}</h1>
    <p>
      <strong>Invited by:</strong> {{ invitation.inviterName }} ({{ invitation.inviterEmail }})
    </p>
    <div class="actions">
      <button class="btn btn-success" @click="acceptInvitation" :disabled="isLoading">
        <span v-if="!isLoading">Accept Invitation</span>
        <span v-else class="spinner"></span>
      </button>
      <button class="btn btn-danger" @click="declineInvitation">Decline</button>
    </div>
  </div>
  <div v-else-if="error">
    <h2>{{ error }}</h2>
    <button class="btn btn-primary" @click="redirectToLogin">Go to Login</button>
  </div>
  <div v-else-if="isChecking" class="checking-message">
    <div class="spinner"></div>
    <p>Checking email and verifying invitation...</p>
  </div>
</template>

<script>
import axios from "axios";
import { useToast } from "vue-toastification";

export default {
  data() {
    return {
      invitation: null,
      isLoading: false,
      isChecking: true,
      error: "",
    };
  },
  methods: {
    async checkIfCollaborator() {
      const toast = useToast();
      const userId = localStorage.getItem("userId");
      if (!userId) {
        toast.error("User not authenticated.");
        this.$router.push("/login");
        return;
      }

      try {
        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/api/collaborator/check-user-in-board`,
          {
            params: {
              code: this.code,
              userId: userId,
            },
          }
        );

        if (response.data.isCollaborator && response.data.boardId) {
          toast.success("You are already a collaborator. Redirecting...");
          this.$router.push(`/board-list/${response.data.boardId}`);
        } else {
          this.fetchInvitationInfo();
        }
      } catch (error) {
        toast.error(error.response?.data || "Failed to check collaborator status.");
        this.logoutUser();
      }finally {
        this.isChecking = false;
      }
    },

    async fetchInvitationInfo() {
      const toast = useToast();
      const userId = localStorage.getItem("userId");
      if (!userId) {
        toast.error("User not authenticated.");
        this.$router.push("/login");
        return;
      }

      try {
        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/api/collaborator/invitation-info?code=${this.code}&userId=${userId}`
        );
        this.invitation = response.data;
        console.log(this.invitation.boardName);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          this.error = "Unauthorized access. Redirecting to login.";
          setTimeout(() => {
            this.redirectToLogin();
          }, 10000);
        } else {
          this.error = error.response?.data || "Failed to fetch invitation info.";
        }
      }
    },
    async acceptInvitation() {
      this.isLoading = true;
      const toast = useToast();
      const userId = localStorage.getItem("userId");
      try {
        await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/api/collaborator/accept-invitation`,
          null,
          {
            params: {
              code: this.code,
              userId: userId,
            },
          }
        );
        console.log(this.invitation.data);
        toast.success("Invitation accepted successfully!");
        this.$router.push(`/board-list/${this.invitation.boardId}`);
      } catch (error) {
        toast.error(error.response?.data || "Failed to accept invitation.");
      } finally {
        this.isLoading = false;
      }
    },

    redirectToLogin() {
      this.$router.push("/login");
    },
    declineInvitation() {
      this.$router.push("/");
    },

    async logoutUser() {
      const toast = useToast();
      try {
        // Lấy `userId` từ localStorage
        const userId = localStorage.getItem("userId");

        if (!userId) {
          throw new Error("User ID is missing.");
        }

        console.log(userId)
        // Gửi yêu cầu logout tới server cùng với `userId`
        await axios.post(`${process.env.VUE_APP_API_BASE_URL}/api/auth/logout?userId=${userId}`);

        // Xóa session token từ localStorage và cookie
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        document.cookie = "userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

        // Hiển thị thông báo và điều hướng tới trang login
        toast.success("Logged out successfully!", "success");
        this.$router.push("/login");
      } catch (err) {
        console.error("Logout failed", err);
        toast.error(
          "Logout failed. Please try again later.",
          "error"
        );
      }
    },
  },
  mounted() {
    const code = this.$route.query.code;
    if (!code) {
      this.error = "Invalid or missing invitation code.";
      return;
    }

    this.code = code; // Set the code for future use
    this.checkIfCollaborator();
  },
};
</script>

<style scoped>
.invitation-container {
  max-width: 600px;
  margin: 50px auto;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 10px;
}

.btn {
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  margin-right: 10px;
}

.btn-success {
  background-color: #28a745;
  color: white;
  border: none;
  transition: background-color 0.3s ease;
}

.btn-success:hover {
  background-color: #218838;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
  border: none;
  transition: background-color 0.3s ease;
}

.btn-danger:hover {
  background-color: #c82333;
}

.btn-primary {
  background-color: #007bff;
  color: white;
  border: none;
  transition: background-color 0.3s ease;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.checking-message {
  max-width: 600px;
  margin: 50px auto;
  padding: 20px;
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.checking-message p {
  margin-top: 10px;
  font-size: 16px;
  color: #6c757d;
}

.spinner {
  display: inline-block;
  width: 32px;
  height: 32px;
  border: 4px solid rgba(0, 0, 0, 0.2);
  border-top-color: #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

</style>
