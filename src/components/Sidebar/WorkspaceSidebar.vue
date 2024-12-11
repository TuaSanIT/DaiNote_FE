<template>
  <div :class="['sidebar', { collapsed: !isSidebarOpen }]">
    <div class="toggle-icon" @click="toggleSidebar">
      <i :class="isSidebarOpen ? 'bi bi-chevron-left' : 'bi bi-chevron-right'"></i>
    </div>
    <div v-if="isSidebarOpen" class="sidebar-header">
      <router-link to="/">
        <img src="/Dai_Shogun.png(1).png" class="sidebar-logo" alt="Logo" />
      </router-link>
    </div>
    <ul v-if="isSidebarOpen" class="sidebar-nav-top">
      <div class="nav-item">
        <router-link class="nav-link" to="/homepage">
          <i class="bi bi-house-door-fill"></i>
          <span>Main Page</span>
        </router-link>
      </div>
      <div class="nav-item">
        <router-link class="nav-link" to="/calender-view">
          <i class="bi bi-calendar-event"></i>
          <span>Calendar</span>
        </router-link>
      </div>
      <div class="nav-item">
        <router-link class="nav-link" to="/take-note">
          <i class="bi bi-journal-text"></i>
          <span>Take Note</span>
        </router-link>
      </div>

      <div class="nav-item">
        <router-link class="nav-link" to="/collaborator-boards">
          <i class="bi bi-people-fill"></i>
          <span>Collaborator Boards</span>
        </router-link>
      </div>
    </ul>

    <hr class="nav-separator" />
    <div v-if="isSidebarOpen" class="nav-heading" style="margin-bottom: 30px; margin-top: 20px;">Workspace</div>
    <div v-if="isSidebarOpen" class="sidebar-header" style="margin-bottom: 10px;">
      <p>{{ workspaceData.name || 'Loading...' }}</p>
    </div>

    <!-- Workspace List -->
    <ul v-if="isSidebarOpen" class="sidebar-nav">
      <li
        v-for="workspace in workspaces"
        :key="workspace.id"
        class="nav-item"
        @click="switchWorkspace(workspace.id)"
      >
        <router-link :to="`/workspace-list/${workspace.id}`" class="nav-link">
          <i class="bi bi-clipboard2-fill"></i>
          <span>{{ workspace.name }}</span>
        </router-link>
      </li>
    </ul>

    <div v-if="isSidebarOpen" class="user-nav">
      <div v-if="isVip" class="vip-badge">
        <i class="bi bi-star-fill"></i> VIP Member
      </div>
      <div v-else class="classic-badge">
        <i class="bi bi-person-fill"></i> Classic
        <i class="bi bi-arrow-up-circle upgrade-icon" @click="openUpgradePopup" title="Upgrade to VIP"></i>
      </div>
      <div class="user-info-actions">
        <div class="user-info">
          <img :src="userImage" alt="User" class="user-img">
          <span>{{ username }}</span>
        </div>
        <div class="user-actions">
          <i class="bi bi-gear" @click="openSettings"></i>
          <i class="bi bi-box-arrow-right" @click="logout"></i>
        </div>
      </div>
      <UserEditPopup :isOpen="isSettingsOpen" :userId="userId" @close="closeSettings" @updated="fetchUserInfo" />
    </div>

    <!-- Popup nâng cấp -->
    <PopupUpgrade :isOpen="isUpgradePopupOpen" @close="closeUpgradePopup" @upgrade="handleUpgradeToVip" />
  </div>
</template>

<script>
import axios from 'axios';
import UserEditPopup from '../User/UserEditPopup.vue';
import PopupUpgrade from '../User/PopupUpgrade.vue';

export default {
  components: {
    UserEditPopup,
    PopupUpgrade,
  },
  props: {
    workspaceId: {
      type: String,
      required: true,
    },
    currentUser: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      isSidebarOpen: true,
      workspaceData: {},
      boards: [],
      username: 'User',
      workspaces: [],
      // userImage: '/default-avatar.png',
      userImage: 'https://dainoteblob.blob.core.windows.net/dainotecontainer/avatars/1d509570-73e2-4e74-91ce-2d0e5cb9ef62.jpg',
      isSettingsOpen: false,
      isVip: false,
      isUpgradePopupOpen: false,
    };
  },
  created() {
    this.fetchWorkspaceData();
    this.fetchUserInfo();
    this.fetchWorkspaces();
  },
  watch: {
    workspaceId: "fetchWorkspaces", // Watch for changes to boardId
  },
  methods: {
    switchWorkspace(newWorkspaceId) {
    this.$emit("workspaceChanged", newWorkspaceId);
  },
    async fetchWorkspaces() {
      try {
        const userId = localStorage.getItem("userId");
        const response = await axios.get(`http://localhost:5141/api/workspace/user/${userId}`, {
          headers: { UserId: userId },
        });

        this.workspaces = response.data || [];
      } catch (error) {
        console.error("Error fetching workspaces:", error);
      }
    },
    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen;
      this.$emit("toggleSidebar", this.isSidebarOpen);
    },
    async fetchUserInfo() {
      const userId = this.getUserIdFromCookies();
      if (!userId) {
        console.error('User ID not found in cookies');
        return;
      }

      try {
        const response = await axios.get(`http://localhost:5141/api/user/${userId}`);
        if (response.data) {
          console.log(response.data);
          this.username = response.data.userName || 'User';
          this.userImage = response.data.avatarImage || '/default-avatar.png';
          this.isVip = response.data.isVipSupplier || false;
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    },

    getUserIdFromCookies() {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; userId=`); // Replace 'userId' with the actual cookie name
      if (parts.length === 2) return parts.pop().split(';').shift();
    },

    async fetchWorkspaceData() {
      if (!this.workspaceId) {
        console.error('Workspace ID is undefined');
        return;
      }

      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          console.error("No userId found. User might not be logged in.");
          this.$router.push("/login");
          return;
        }

        const response = await axios.get(
          `http://localhost:5141/api/workspace/${this.workspaceId}`,
          {
            headers: {
              "UserId": userId,
            },
          }
        );

        this.workspaceData = response.data;
        this.boards = this.workspaceData.board || [];

      } catch (error) {
        if (error.response && error.response.status === 403) {
          console.error("Access denied: ", error.response.data.message);
          this.$router.push("/error");
        } else if (error.response && error.response.status === 404) {
          console.error("Workspace not found: ", error.response.data.message);
          this.$router.push("/not-found");
        } else {
          console.error("Error fetching workspace data:", error);
        }
      }
    },
    openSettings() {
      this.isSettingsOpen = true;
    },
    closeSettings() {
      this.isSettingsOpen = false;
    },
    openUpgradePopup() {
      this.isUpgradePopupOpen = true;
    },
    closeUpgradePopup() {
      this.isUpgradePopupOpen = false;
    },
    async logout() {
      try {
        // Lấy `userId` từ localStorage
        const userId = localStorage.getItem("userId");

        if (!userId) {
          throw new Error("User ID is missing.");
        }

        console.log(userId)
        // Gửi yêu cầu logout tới server cùng với `userId`
        await axios.post(`http://localhost:5141/api/auth/logout?userId=${userId}`);

        // Xóa session token từ localStorage và cookie
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        document.cookie = "userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

        // Hiển thị thông báo và điều hướng tới trang login
        this.showNotification("Logged out successfully!", "success");
        this.$router.push("/login");
      } catch (err) {
        console.error("Logout failed", err);
        this.showNotification(
          "Logout failed. Please try again later.",
          "error"
        );
      }
    },

    showNotification(message, type) {
      this.notification = { message, type };
      setTimeout(() => { this.notification = null; }, 3000);
    }
  },
  mounted() {
    this.fetchUserInfo();
    this.fetchWorkspaces();
  }
};
</script>


<style scoped>
@import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.1/font/bootstrap-icons.css");

.sidebar {
  position: fixed;
  /* top: 60px; */
  top: 0px;
  left: 0;
  bottom: 0;
  width: 300px;
  padding: 20px;
  box-shadow: 0px 0px 20px rgba(1, 41, 112, 0.1);
  background-color: #fff;
  transition: width 0.3s ease;
}

.sidebar-header {
  background-color: #323338;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80px;
  margin-bottom: 20px;

  /* Override the padding of the sidebar */
  margin-left: -20px;
  margin-right: -20px;
  margin-top: -20px;
  width: calc(100% + 40px);
}


.sidebar-logo {
  height: 50px;
}

.sidebar-nav-top {
  margin-bottom: 20px;
  padding-left: 0;
}

.sidebar-nav-top .nav-item {
  margin-bottom: 10px;
}

.sidebar-nav-top .nav-link {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  border: 5px;
  font-weight: 600;
  color: #595E69;
  padding: 10px 15px;
  border-radius: 4px;
  margin-left: 0;
  padding-left: 0;
}

.sidebar-nav-top .nav-link i {
  font-size: 16px;
  margin-right: 10px;
}

.sidebar-nav-top .nav-link:hover {
  background-color: #e4e6eb;
}

.sidebar-header {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #323338;
  color: white;
  padding: 15px;
}

.sidebar-header p {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
}

.sidebar-nav {
  list-style: none;
  padding: 0;
  margin: 0;
  overflow-y: auto;
  max-height: 66vh;
}

.sidebar-nav .nav-item {
  margin-bottom: 10px;
}

.sidebar-nav .nav-link {
  display: flex;
  align-items: center;
  font-size: 15px;
  font-weight: 600;
  color: #495057;
  padding: 10px 15px;
  border-radius: 5px;
  text-decoration: none;
  transition: background-color 0.2s, color 0.2s;
}

.sidebar-nav .nav-link:hover,
.sidebar-nav .nav-link:hover span,
.sidebar-nav .nav-link:hover i {
  background-color: #f8f9fa;
  color: #007bff;
}

.sidebar-nav .nav-link i {
  font-size: 18px;
  margin-right: 10px;
  color: #6c757d;
}

.sidebar-nav .nav-heading {
  font-size: 11px;
  text-transform: uppercase;
  color: #73767B;
  font-weight: 600;
}

.nav-separator {
  border: 0;
  height: 1px;
  margin: 1rem 0;
  background-color: #595e69;
}

.user-nav {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 10px;
  background-color: #323338;
  color: white;
}

.user-info-actions {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  padding: 10px 0;
}

.user-info {
  display: flex;
  align-items: center;
  word-wrap: break-word;
  /* Break long words and wrap text to the next line */
  word-break: break-word;
  /* Ensure long words are broken and don't overflow */
  white-space: normal;
  /* Allow wrapping of text */
}

.user-img {
  height: 50px;
  width: 50px;
  border-radius: 50%;
  margin-right: 10px;
}

.user-actions {
  display: flex;
  margin-left: auto;
}

.user-actions i {
  font-size: 1.5em;
  margin-left: 10px;
  cursor: pointer;
}

.user-actions i:hover {
  color: #a1a1a1;
}

.sidebar.collapsed {
  width: 0px;
  padding: 0 5px;
}

.toggle-icon {
  position: absolute;
  top: 50%;
  left: 100%;
  transform: translate(-50%, -50%);
  background-color: #595e69;
  color: #fff;
  border: 1px solid #ddd;
  border-radius: 50%;
  padding: 5px;
  cursor: pointer;
}

.vip-badge {
  background: linear-gradient(45deg, #ffd700, #ffa500);
  color: white;
  font-weight: bold;
  font-size: 14px;
  padding: 5px 10px;
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
  animation: glow 1.5s infinite;
}

.vip-badge i {
  font-size: 16px;
  margin-right: 5px;
}
.classic-badge {
  background: linear-gradient(45deg, #808080, #505050);
  color: white;
  font-weight: bold;
  font-size: 14px;
  padding: 5px 10px;
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
}

.classic-badge i {
  font-size: 16px;
  margin-right: 5px;
}
.upgrade-icon {
  font-size: 20px;
  color: #ffa500;
  margin-left: 10px;
  cursor: pointer;
  transition: transform 0.3s, color 0.3s;
}

.upgrade-icon:hover {
  color: #ff4500;
  transform: scale(1.2);
}
@keyframes glow {
  0% {
    box-shadow: 0 0 5px rgba(255, 223, 0, 0.5);
  }

  50% {
    box-shadow: 0 0 20px rgba(255, 223, 0, 0.8);
  }

  100% {
    box-shadow: 0 0 5px rgba(255, 223, 0, 0.5);
  }
}
</style>