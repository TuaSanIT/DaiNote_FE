<template>
  <div :class="['sidebar', { collapsed: !isSidebarOpen }]">
    <div class="toggle-icon" @click="toggleSidebar">
      <i :class="isSidebarOpen ? 'bi bi-chevron-left' : 'bi bi-chevron-right'"></i>
    </div>
    <div v-if="isSidebarOpen" class="sidebar-home">
      <router-link to="/">
        <img src="/Dai_Shogun.png(1).png" class="sidebar-logo" alt="Logo" />
      </router-link>
    </div>
    <div v-if="isSidebarOpen" class="sidebar-header">
      <p>{{ boardName }}</p>
    </div>
    <ul v-if="isSidebarOpen" class="sidebar-nav">
      <li class="nav-item">
        <a class="nav-link" href="javascript:void(0)" @click="openMemberModal">
          <i class="bi bi-person"></i>
          <span>Member</span>
          <span class="member-count">({{ memberCount !== undefined ? memberCount : 0 }})</span>
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="#" @click="openBoardSettings">
          <i class="bi bi-gear"></i>
          <span>Setting</span>
        </a>
      </li>

      <!-- New Chatting Nav Item -->
      <div class="nav-item">
        <router-link v-if="localBoardId" class="nav-link" :to="{ name: 'ChatView', params: { boardId: localBoardId } }">
          <i class="bi bi-chat-dots"></i>
          <span>Chatting</span>
        </router-link>
      </div>



      <div class="nav-item">
        <router-link class="nav-link" to="/collaborator-boards">
          <i class="bi bi-people-fill"></i>
          <span>Collaborator Boards</span>
        </router-link>
      </div>

      <!-- Modal: SettingsBoard -->
      <SettingsBoardModal v-if="isBoardSettingsOpen" title="Board Settings" :isOpen="isBoardSettingsOpen"
        :board-id="boardId" @close="closeBoardSettings" @update-board="fetchBoardAndWorkspaceData">
        <div>
          <label for="board-title">Board Title:</label>
          <input id="board-title" v-model="boardTitle" type="text" />

          <label for="collaborators">Collaborators:</label>
          <input id="collaborators" v-model="collaborators" type="text" />

          <textarea placeholder="Write your message"></textarea>
        </div>
      </SettingsBoardModal>

      <li class="nav-item">
        <router-link class="nav-link" :to="isOwner ? workspaceLink : '/homepage'">
          <i class="bi bi-person-workspace"></i>
          <span>Back to {{ isOwner ? 'workspace' : 'homepage' }}</span>
        </router-link>
      </li>


      <hr class="nav-separator" />
      <li class="nav-heading">Your boards</li>
      <ul v-if="isSidebarOpen" class="nav-list">
        <li v-for="board in boards" :key="board.id" class="nav-item">
          <router-link class="nav-link" :to="`/board-list/${board.id}`">
            <i class="bi bi-clipboard2-fill"></i>
            <span>{{ board.name }}</span>
          </router-link>
        </li>
      </ul>
    </ul>
    <div v-if="isSidebarOpen" class="user-nav">
      <!-- Kiểm tra trạng thái VIP -->
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

      <!-- Modal: UserEditPopup -->
      <UserEditPopup v-if="isUserSettingsOpen" :isOpen="isUserSettingsOpen" :userId="userId" @close="closeUserSettings"
        @updated="fetchUserInfo" />
    </div>

    <!-- Popup nâng cấp -->
    <PopupUpgrade :isOpen="isUpgradePopupOpen" @close="closeUpgradePopup" @upgrade="handleUpgradeToVip" />

    <!-- Modal: Member List -->
    <MemberModal v-if="isMemberModalOpen" :board-id="boardId" :isOpen="isMemberModalOpen" @close="closeMemberModal" />
  </div>
</template>

<script>
import axios from "axios";
import UserEditPopup from "../User/UserEditPopup.vue";
import SettingsBoardModal from "../Board/settingsBoard.vue";
import MemberModal from "../Board/MemberModal.vue";
import PopupUpgrade from '../User/PopupUpgrade.vue';

export default {
  components: {
    UserEditPopup,
    SettingsBoardModal,
    MemberModal,
    PopupUpgrade,
  },
  props: {
    boardId: {
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
      localBoardId: this.$route.params.boardId,
      boardName: "",
      workspaceLink: "",
      boards: [],
      memberCount: 0,
      isUserSettingsOpen: false, 
      isBoardSettingsOpen: false, 
      isMemberModalOpen: false, 
      isSidebarOpen: true,
      isOwner: false,
      username: "User",
      userImage: "https://dainoteblob.blob.core.windows.net/dainotecontainer/avatars/1d509570-73e2-4e74-91ce-2d0e5cb9ef62.jpg",
      boardTitle: "",
      collaborators: "",
      isVip: false,
      isUpgradePopupOpen: false,
    };
  },
  created() {
    this.fetchUserInfo();
    this.fetchBoardAndWorkspaceData();
    this.fetchMemberCount();
  },
  mounted() {
    this.fetchBoardAndWorkspaceData();
  },
  watch: {
    boardId: "fetchBoardAndWorkspaceData", 
  },

  methods: {
    openSettings() {
      this.isUserSettingsOpen = true;
    },
    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen;
      this.$emit("toggleSidebar", this.isSidebarOpen); 
    },
    async fetchMemberCount() {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          console.error("User not logged in.");
          this.$router.push("/login");
          return;
        }

        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/api/board/${this.boardId}/collaborators`,
          {
            headers: { UserId: userId },
          }
        );

        if (response.status === 200) {
          const { isOwner, collaborators } = response.data;

          this.memberCount = collaborators.filter(
            (member) => member.permission.toLowerCase() !== "owner"
          ).length;

          this.collaborators = collaborators.filter(
            (member) => member.permission.toLowerCase() !== "owner"
          );

          this.isOwner = isOwner;
        } else {
          this.memberCount = 0;
          this.collaborators = [];
          console.warn("No collaborators found.");
        }
      } catch (error) {
        console.error("Error fetching collaborators:", error);

        if (error.response) {
          if (error.response.status === 403) {
            console.error("Permission denied:", error.response.data?.message);
            this.showNotification(
              "You do not have permission to access this board.",
              "error"
            );
            this.$router.push("/homepage");
          } else if (error.response.status === 404) {
            this.memberCount = 0;
            this.collaborators = [];
            console.warn("No collaborators found.");
          } else {
            this.showNotification(
              error.response?.data?.message || "An error occurred.",
              "error"
            );
          }
        } else {
          console.error("Unexpected error:", error);
          this.showNotification("Network error. Please try again.", "error");
        }
      }
    },

    async fetchUserInfo() {
      const userId = this.getUserIdFromCookies();
      if (!userId) {
        console.error("User ID not found in cookies");
        return;
      }

      try {
        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/api/user/${userId}`
        );
        if (response.data) {
          this.username = response.data.userName || "User";
          this.userImage = response.data.avatarImage || "/default-avatar.png";
          this.isVip = response.data.isVipSupplier || false;
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    },

    async fetchBoardAndWorkspaceData() {
      this.fetchMemberCount();
      try {
        const userId = localStorage.getItem("userId");

        if (!userId || !this.boardId) {
          console.error("Missing userId or boardId.");
          return;
        }

        const boardResponse = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/api/board/${this.boardId}`,
          {
            headers: {
              UserId: userId,
            },
          }
        );
        const boardData = boardResponse.data;
        const { isOwner, board } = boardData;

        this.isOwner = isOwner;
        this.boardName = board.name;

        if (isOwner) {
          const workspaceResponse = await axios.get(
            `${process.env.VUE_APP_API_BASE_URL}/api/workspace/${board.workspaceId}`,
            {
              headers: {
                UserId: userId,
              },
            }
          );
          const workspace = workspaceResponse.data;

          this.workspaceLink = `/workspace-list/${workspace.id}`;
          this.boards = workspace.board || [];
        } else {
          this.workspaceLink = "/homepage";
        }
      } catch (error) {
        console.error("Error fetching board or workspace data:", error);
      }
    },
    getUserIdFromCookies() {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; userId=`); 
      if (parts.length === 2) return parts.pop().split(";").shift();
    },
    openUserSettings() {
      this.isUserSettingsOpen = true;
    },
    closeUserSettings() {
      this.isUserSettingsOpen = false;
    },

    openBoardSettings() {
      this.isBoardSettingsOpen = true;
    },
    closeBoardSettings() {
      this.isBoardSettingsOpen = false;
    },
    openMemberModal() {
      this.isMemberModalOpen = true;
    },
    closeMemberModal() {
      this.isMemberModalOpen = false;
    },


    openUpgradePopup() {
      this.isUpgradePopupOpen = true;
    },
    closeUpgradePopup() {
      this.isUpgradePopupOpen = false;
    },

    async logout() {
      try {
        const userId = localStorage.getItem("userId");

        if (!userId) {
          throw new Error("User ID is missing.");
        }
        await axios.post(`${process.env.VUE_APP_API_BASE_URL}/api/auth/logout?userId=${userId}`);
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        document.cookie = "userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
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

  beforeRouteUpdate(to, from, next) {
    this.localBoardId = to.params.boardId;
    this.fetchBoardAndWorkspaceData();
    next();
  },
};
</script>

<style scoped>
#icon {
  width: 30px;
  cursor: pointer;
}

@import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.1/font/bootstrap-icons.css");

.sidebar {
  position: fixed;
  
  top: 0px;
  left: 0;
  bottom: 0;
  width: 300px;
  transition: width 0.3s ease;
  padding: 20px;
  box-shadow: 0px 0px 20px rgba(1, 41, 112, 0.1);
  background-color: var(--vt-c-white);
  z-index: 1;
}

.sidebar-home {
  background-color: #323338;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80px;
  margin-bottom: 20px;
  margin-left: -20px;
  margin-right: -20px;
  margin-top: -20px;
  width: calc(100% + 40px);
}


.sidebar-logo {
  height: 50px;
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

.sidebar-header {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #595e69;
  color: var(--vt-c-white);
  padding: 15px;
  margin-bottom: 10px;
}

.sidebar-header p {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
}

.sidebar-nav {
  padding: 0;
  margin: 0;
  list-style: none;
  overflow-y: auto;
  max-height: 66vh;
}

.sidebar-nav li {
  padding: 0;
  margin: 0;
  list-style: none;
}

.sidebar-nav .nav-item {
  margin-bottom: 5px;
}

.sidebar-nav .nav-link {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: #4154f1;
  transition: 0.3;
  padding: 10px 15px;
  border-radius: 4px;
}

.sidebar-nav .nav-link:hover,
.sidebar-nav .nav-link:hover span,
.sidebar-nav .nav-link:hover i {
  color: #4154f1;
  background: #f6f9ff;
}

.sidebar-nav .nav-link i {
  font-size: 16px;
  margin-right: 10px;
  color: #899bbd;
}

.sidebar-nav .nav-link span {
  color: #000000;
}

.sidebar-nav .nav-heading {
  font-size: 11px;
  text-transform: uppercase;
  color: #73767b;
  font-weight: 600;
}

.sidebar-nav .nav-link .member-count {
  margin-left: 5px;
  font-size: 14px;
  font-weight: bold;
  color: #73767b;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-separator {
  border: 0;
  height: 1px;
  margin: 1rem 0;
  margin-top: 50px;
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
  
  word-break: break-word;
  
  white-space: normal;
  
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