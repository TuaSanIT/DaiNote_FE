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
    <!-- Navigation Links -->
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
      <!-- Manage Labels Section -->
      <div class="nav-item dropdown">
        <div class="nav-link dropdown-toggle" @click="toggleDropdown" id="labelDropdown" role="button"
          :aria-expanded="isDropdownOpen.toString()">
          <i class="bi bi-tag"></i>
          <span>Manage Label</span>
        </div>
        <transition name="dropdown">
          <ul v-show="isDropdownOpen" class="dropdown-menu" aria-labelledby="labelDropdown"
            :style="{ maxHeight: dropdownMaxHeight + 'px' }">
            <li v-for="label in labels" :key="label.labelId"
              class="dropdown-item d-flex justify-content-between align-items-center">
              <span class="label-name" :title="label.name">
                {{ truncateLabelName(label.name) }}
              </span>
              <button @click.stop="showOptions(label)" class="btn btn-secondary btn-sm">
                ...
              </button>
              <div v-if="label.showOptions" class="options-menu">
                <button @click.stop="editLabel(label)" class="btn btn-primary btn-sm">
                  Update
                </button>
                <button @click.stop="deleteLabel(label.labelId)" class="btn btn-danger btn-sm">
                  Delete
                </button>
              </div>
            </li>
          </ul>
        </transition>
      </div>
      <div class="nav-item">
        <router-link class="nav-link" to="/collaborator-boards">
          <i class="bi bi-people-fill"></i>
          <span>Collaborator Boards</span>
        </router-link>
      </div>
    </ul>

    <!-- Separator with Dynamic Style -->
    <hr class="nav-separator" :style="separatorStyle" />

    <div v-if="isSidebarOpen" class="nav-heading" style="margin-bottom: 30px; margin-top: 20px">
      Workspaces

      <button @click="openCreateModal" class="btn btn-primary btn-sm" style="float: right">
        Create Workspace
      </button>
    </div>

    <!-- Dynamic Workspace List -->
    <ul v-if="isSidebarOpen" class="sidebar-nav">
      <li v-for="workspace in visibleWorkspaces" :key="workspace.id" class="nav-item">
        <router-link class="nav-link" :to="{ path: `/workspace-list/${workspace.id}` }">
          <i class="bi bi-folder-fill"></i>
          <span>{{ workspace.name }}</span>
        </router-link>
        <!-- Edit/Delete Buttons for Each Workspace -->
        <button @click="openEditModal(workspace)" class="btn btn-sm btn-warning mr-3">
          Edit
        </button>
        <button @click="openDeleteModal(workspace)" class="btn btn-sm btn-danger">
          Delete
        </button>
      </li>

      <!-- Dấu "..." nếu có nhiều hơn 3 workspace -->
      <li v-if="showMoreWorkspaces" class="nav-item">
        <div class="nav-link" @click="toggleDropdownWSP">
          <i class="bi bi-three-dots"></i>
          <span>More</span>
        </div>
        <!-- Dropdown danh sách workspace đầy đủ -->
        <transition name="fade">
          <ul v-show="isDropdownOpenWSP" class="workspace-dropdown">
            <li v-for="workspace in hiddenWorkspaces" :key="workspace.id" class="dropdown-item">
              <router-link class="nav-link" :to="{ path: `/workspace-list/${workspace.id}` }">
                <i class="bi bi-folder-fill"></i>
                <span>{{ workspace.name }}</span>
              </router-link>
              <!-- Edit/Delete Buttons for Each Workspace -->
              <button @click="openEditModal(workspace)" class="btn btn-sm btn-warning mr-3">
                Edit
              </button>
              <button @click="openDeleteModal(workspace)" class="btn btn-sm btn-danger">
                Delete
              </button>
            </li>
          </ul>
        </transition>
      </li>
    </ul>

    <hr class="nav-separator" />

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

      <UserEditPopup :isOpen="isSettingsOpen" :userId="userId" @close="closeSettings" @updated="fetchUserInfo" />
    </div>

    <!-- Popup nâng cấp -->
    <PopupUpgrade :isOpen="isUpgradePopupOpen" @close="closeUpgradePopup" @upgrade="handleUpgradeToVip" />

    <!-- Modals (Create/Edit/Delete Workspaces) -->
    <!-- Create Modal -->
    <div v-if="showCreateModal" class="modal">
      <div class="modal-content">
        <h3>Create Workspace</h3>
        <label for="name">Workspace Name:</label>
        <input v-model="newWorkspace.name" type="text" placeholder="Enter workspace name" />
        <button @click="createWorkspace" class="btn btn-primary mb-2 mt-2">
          Create
        </button>
        <button @click="closeCreateModal" class="btn btn-secondary">
          Cancel
        </button>
      </div>
    </div>
    <!-- Edit Modal -->
    <div v-if="showEditModal" class="modal">
      <div class="modal-content">
        <h3>Edit Workspace</h3>
        <label for="name">Workspace Name:</label>
        <input v-model="currentWorkspace.name" type="text" placeholder="Enter new name" />
        <button @click="updateWorkspace" class="btn btn-primary mb-2 mt-2">
          Save Changes
        </button>
        <button @click="closeEditModal" class="btn btn-secondary">
          Cancel
        </button>
      </div>
    </div>
    <!-- Delete Modal -->
    <div v-if="showDeleteModal" class="modal">
      <div class="modal-content">
        <h3>Confirm Delete</h3>
        <p>Are you sure you want to delete this workspace?</p>
        <button @click="deleteWorkspace" class="btn btn-danger mb-2 mt-2">
          Delete
        </button>
        <button @click="closeDeleteModal" class="btn btn-secondary">
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>


<script>
import axios from "axios";
import { useToast } from "vue-toastification";
import UserEditPopup from "../User/UserEditPopup.vue";
import PopupUpgrade from '../User/PopupUpgrade.vue';

export default {
  components: {
    UserEditPopup,
    PopupUpgrade,
  },
  props: {
    currentUser: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      // Sidebar and User Info
      isSidebarOpen: true,
      username: "User",
      userImage:
        "https://dainoteblob.blob.core.windows.net/dainotecontainer/avatars/1d509570-73e2-4e74-91ce-2d0e5cb9ef62.jpg",
      userId: null,
      isVip: false,
      isUpgradePopupOpen: false,

      // Workspace Data
      workspaces: [],
      newWorkspace: { name: "" },
      currentWorkspace: { id: null, name: "" },
      isDropdownOpenWSP: false,
      maxVisibleWorkspaces: 3,

      // Label Data
      labels: [],
      isDropdownOpen: false,
      dropdownMaxHeight: 0,

      // Modal States
      showCreateModal: false,
      showEditModal: false,
      showDeleteModal: false,

      // Settings Modal
      isSettingsOpen: false,
      currentTheme: localStorage.getItem("theme") || "dark",

      // Notifications
      notification: null,
    };
  },
  computed: {
    visibleWorkspaces() {
      return this.workspaces.slice(0, this.maxVisibleWorkspaces);
    },
    hiddenWorkspaces() {
      return this.workspaces.slice(this.maxVisibleWorkspaces);
    },
    showMoreWorkspaces() {
      return this.workspaces.length > this.maxVisibleWorkspaces;
    },
    separatorStyle() {
      const labelHeight = this.labels.length; // Estimate height per label
      return this.isDropdownOpen ? { marginTop: `${labelHeight}px` } : {};
    },
  },
  created() {
    this.fetchWorkspaces();
    this.fetchUserInfo();
    this.fetchLabels();
  },
  methods: {
    toggleDropdownWSP() {
      this.isDropdownOpenWSP = !this.isDropdownOpenWSP;
    },
    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen;
      this.$emit("toggleSidebar", this.isSidebarOpen); // Emit the state change
    },
    // setTheme(theme) {
    //   this.currentTheme = theme;

    //   if (theme === "dark") {
    //     document.documentElement.classList.add("dark-theme");
    //   } else {
    //     document.documentElement.classList.remove("dark-theme");
    //   }

    //   // Save the theme preference in localStorage
    //   localStorage.setItem("theme", theme);
    // },
    // initializeTheme() {
    //   const savedTheme = localStorage.getItem("theme") || "light";
    //   this.currentTheme = savedTheme;

    //   if (savedTheme === "dark") {
    //     document.documentElement.classList.add("dark-theme");
    //   } else {
    //     document.documentElement.classList.remove("dark-theme");
    //   }
    // },
    async fetchUserInfo() {
      const userId = this.getUserIdFromLocalStorage();
      if (!userId) {
        console.error("User ID not found in cookies");
        return;
      }

      try {
        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/api/user/${userId}`
        );
        if (response.data) {
          console.log(response.data);
          this.username = response.data.userName || "User";
          this.userImage = response.data.avatarImage || "/default-avatar.png";
          this.isVip = response.data.isVipSupplier || false;
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    },

    openSettings() {
      this.isSettingsOpen = true;
      this.$emit("popupStateChange", true);
    },
    closeSettings() {
      this.isSettingsOpen = false;
      this.$emit("popupStateChange", false);
    },
    openUpgradePopup() {
      this.isUpgradePopupOpen = true;
      this.$emit("popupStateChange", true);
    },
    closeUpgradePopup() {
      this.isUpgradePopupOpen = false;
      this.$emit("popupStateChange", false);
    },
    getUserIdFromLocalStorage() {
      return localStorage.getItem("userId");
    },

    async fetchWorkspaces() {
      try {
        const userId = this.getUserIdFromLocalStorage();
        if (!userId) {
          console.error("User not logged in.");
          return;
        }
        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/api/workspace/user/${userId}`
        );
        this.workspaces = response.data;
      } catch (error) {
        console.error("Error fetching workspaces:", error);
      }
    },

    // Create a new workspace
    async createWorkspace() {
      const toast = useToast();
      try {
        if (!this.newWorkspace.name || this.newWorkspace.name.trim() === "") {
          toast.error("Workspace name is required!");
          return;
        }
        const createWorkspaceDto = {
          name: this.newWorkspace.name,
        };
        const response = await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/api/workspace`,
          createWorkspaceDto,
          {
            headers: {
              UserId: this.getUserIdFromLocalStorage(),
            },
          }
        );
        this.workspaces.push(response.data); // Add the new workspace to the list
        this.closeCreateModal(); // Close modal after creation
        await this.fetchWorkspaces();
        toast.success("Workspace created successfully!");
      } catch (error) {
        // Xử lý lỗi từ backend
        if (error.response && error.response.data && error.response.data.message) {
          // Hiển thị lỗi từ BE
          toast.warning(error.response.data.message);
        } else {
          // Hiển thị lỗi mặc định nếu BE không trả về message
          toast.error("Failed to create workspace. Please try again.");
        }
        console.error("Error creating workspace:", error);
      }
    },

    // Edit an existing workspace
    async updateWorkspace() {
      const toast = useToast();
      try {
        const response = await axios.put(
          `${process.env.VUE_APP_API_BASE_URL}/api/workspace/${this.currentWorkspace.id}`,
          {
            name: this.currentWorkspace.name,
            status: this.currentWorkspace.status,
          },
          {
            headers: {
              UserId: this.getUserIdFromLocalStorage(),
            },
          }
        );
        if (response.status === 204) {
          this.$emit("workspaceUpdated");
          this.closeEditModal();
          await this.fetchWorkspaces();
          toast.success("Workspace updated successfully!");
        }
      } catch (error) {
        console.error("Error updating workspace:", error);
        toast.error("Failed to update workspace.");
      }
    },

    async deleteWorkspace() {
      const toast = useToast();
      try {
        const response = await axios.delete(
          `${process.env.VUE_APP_API_BASE_URL}/api/workspace/${this.currentWorkspace.id}`,
          {
            headers: {
              UserId: this.getUserIdFromLocalStorage(),
            },
          }
        );
        if (response.status === 204) {
          this.$emit("workspaceDeleted");
          this.closeDeleteModal();
          await this.fetchWorkspaces();
          toast.success("Workspace deleted successfully!");
        }
      } catch (error) {
        console.error("Error deleting workspace:", error);
        toast.error("Failed to delete workspace.");
      }
    },

    // Open modals
    openCreateModal() {
      this.showCreateModal = true;
      this.$emit("popupStateChange", true);
    },
    openEditModal(workspace) {
      this.currentWorkspace = { ...workspace };
      this.showEditModal = true;
      this.$emit("popupStateChange", true);
    },
    openDeleteModal(workspace) {
      this.currentWorkspace = { ...workspace };
      this.showDeleteModal = true;
      this.$emit("popupStateChange", true);
    },

    // Close modals
    closeCreateModal() {
      this.showCreateModal = false;
      this.newWorkspace.name = ""; // Reset input
    },
    closeEditModal() {
      this.showEditModal = false;
    },
    closeDeleteModal() {
      this.showDeleteModal = false;
    },

    // Label Management
    async fetchLabels() {
      const userId = this.userId || this.getUserIdFromLocalStorage();
      if (!userId) {
        console.error("User ID not available. Cannot fetch labels.");
        return;
      }
      try {
        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/api/Label/user/${userId}`
        );
        if (Array.isArray(response.data)) {
          this.labels = response.data.map((label) => ({
            ...label,
            showOptions: false,
          }));
        } else {
          console.error("Invalid data format:", response.data);
          alert("Failed to load labels.");
        }
      } catch (error) {
        console.error("Error fetching labels:", error);
        alert("Failed to load labels.");
      }
    },
    async updateLabel(id, name) {
      try {
        await axios.put(`${process.env.VUE_APP_API_BASE_URL}/api/Label/${id}`, {
          Name: name,
        });
        alert("Label updated successfully!");
        await this.fetchLabels();
      } catch (error) {
        console.error("Error updating label:", error);
        alert("Failed to update label.");
      }
    },
    async deleteLabel(id) {
      if (confirm("Are you sure you want to delete this label?")) {
        try {
          await axios.delete(`${process.env.VUE_APP_API_BASE_URL}/api/Label/${id}`);
          alert("Label deleted successfully!");
          await this.fetchLabels();
        } catch (error) {
          console.error("Error deleting label:", error);
          alert("Failed to delete label.");
        }
      }
    },
    toggleDropdown() {
      this.isDropdownOpen = !this.isDropdownOpen;
      this.dropdownMaxHeight = this.isDropdownOpen
        ? this.labels.length * 45 // Adjust this to fit the height of your dropdown items
        : 0;
    },
    truncateLabelName(name) {
      return name.length > 20 ? name.substring(0, 20) + "..." : name;
    },
    showOptions(label) {
      label.showOptions = !label.showOptions;
    },
    editLabel(label) {
      const newName = prompt("Enter new name for the label:", label.name);
      if (newName) {
        this.updateLabel(label.labelId, newName);
      }
      label.showOptions = false;
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
        await axios.post(`${process.env.VUE_APP_API_BASE_URL}/api/auth/logout?userId=${userId}`);

        // Xóa session token từ localStorage và cookie
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        document.cookie =
          "userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

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
      setTimeout(() => {
        this.notification = null;
      }, 3000);
    },
  },
  mounted() {
    this.fetchUserInfo();
    this.fetchLabels();
    //this.initializeTheme();
  },
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
  background-color: var(--vt-c-white);
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

.theme-toggle i,
.theme-toggle button {
  font-size: 20px;
  /* Adjust the size as needed */
  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 50%;
  /* Makes it circular */
  background-color: #323338;
  /* Background color */
  color: white;
  /* Icon color */
  transition: transform 0.2s, background-color 0.3s;
  /* Smooth effect */
}

.theme-toggle i:hover,
.theme-toggle button:hover {
  transform: scale(1.2);
  /* Slightly enlarge on hover */
  background-color: #4d8de4;
  /* Change the background color on hover */
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
  font-weight: 600;
  color: #595e69;
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

.sidebar-nav {
  list-style: none;
  padding: 0;
  margin: 0;
  overflow-y: auto;
  max-height: 66vh;
}

.sidebar-nav .nav-item {
  margin-bottom: 5px;
}

.sidebar-nav .nav-link {
  display: flex;
  align-items: center;
  font-size: 15px;
  font-weight: 600;
  color: #4154f1;
  padding: 10px 15px;
  border-radius: 4px;
}

.sidebar-nav .nav-link:hover,
.sidebar-nav .nav-link:hover span,
.sidebar-nav .nav-link:hover i {
  color: #4154f1;
  background: #f6f9ff;
}

/* Dropdown Menu Styling */
.dropdown-menu {
  position: absolute;
  background-color: #fff;
  box-shadow: 0px 0px 20px rgba(1, 41, 112, 0.1);
  border: none;
  padding: 10px 0;
  z-index: 1000;
  width: 100%;
  position: absolute;
  z-index: 1000;
  /* Ensure visibility */
  background-color: #fff;
  display: block;
  /* Ensure it's displayed */
  overflow: auto;
  transition: max-height 0.5s ease-in-out, opacity 0.5s ease;
  max-height: 0;
}

/* Active state for when dropdown is open */
.dropdown-menu.open {
  max-height: 300px;
  opacity: 1;
}

/* Dropdown Item Styling */
.dropdown-item {
  padding: 10px 20px;
  font-size: 14px;
  color: #595e69;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
}

.dropdown-item:hover {
  background-color: #e4e6eb;
  color: #4154f1;
}

/* Label name truncation */
.label-name {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Options Menu */
.options-menu {
  display: flex;
  gap: 5px;
  margin-top: 5px;
}

.options-menu button {
  font-size: 12px;
  padding: 5px;
}

.nav-separator {
  border: 0;
  height: 1px;
  margin: 1rem 0;
  background-color: #595e69;
  transition: margin-top 0.3s ease;
}

.nav-heading {
  color: black;
}

.separator-shift {
  margin-top: 80px;
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

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  /* Adds a dark overlay */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  /* Ensure it appears above other elements */
}

.modal-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  /* Adjust width as needed */
  max-width: 500px;
  /* Prevent it from getting too large */
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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
.workspace-dropdown {
  position: absolute;
  background-color: #fff;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  padding: 10px 0;
  list-style: none;
  max-height: 200px; /* Chiều cao tối đa của dropdown */
  overflow-y: auto; /* Cho phép cuộn nếu danh sách quá dài */
  z-index: 1000;
}

.workspace-dropdown .dropdown-item {
  padding: 10px 20px;
  font-size: 14px;
  color: #595e69;
  cursor: pointer;
}

.workspace-dropdown .dropdown-item:hover {
  background-color: #e4e6eb;
  color: #4154f1;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>