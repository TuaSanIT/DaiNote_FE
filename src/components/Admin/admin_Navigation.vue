<template>
  <div class="navigation" :class="{ active: isActive }">
    
    <div class="logo-container">
      <span class="img">
        <img :src="logoPath" alt="DAI System Logo" />
      </span>
      <span class="title">DAI System</span>
    </div>
    <ul class="menu-items">
      <li v-for="(item, index) in menuItems" :key="index" :class="{ hovered: hoveredItem === index }"
        @click="navigateTo(item.title)">
        <a href="#">
          <span class="icon"><ion-icon :name="item.icon"></ion-icon></span>
          <span class="title">{{ item.title }}</span>
        </a>
      </li>
    </ul>

    <!-- User Info and Sign Out Button -->
    <div class="user-info">
      <div class="user-details">
        <img :src="userAvatar" alt="User Avatar" class="avatar" />
        <span class="username">{{ username }}</span>
      </div>
      <button class="signout-button" @click="signOut">Sign Out</button>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { useToast } from "vue-toastification";

export default {
  data() {
    return {
      isActive: false,
      hoveredItem: null,
      logoPath: require("../../assets/logo_dai.png"),
      menuItems: [
        { title: "Dashboard", icon: "home-outline" },
        { title: "Users", icon: "people-outline" },
        { title: "Transactions", icon: "cash-outline" },
      ],
      username: "User",
      userAvatar: "/default-avatar.png",
    };
  },
  methods: {
    navigateTo(title) {
      this.$emit("menu-selected", title); // Gửi sự kiện ra ngoài
    },
    async fetchUserInfo() {
      const userId = localStorage.getItem("userId");

      if (!userId) {
        console.error("User ID is missing.");
        // this.$router.push("/login");
        return;
      }

      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/api/user/${userId}`);
        if (response && response.data) {
          this.username = response.data.userName || "User";
          this.userAvatar = response.data.avatarImage || "/default-avatar.png";
        } else {
          console.warn("No user data returned from API.");
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
        if (error.response?.status === 401) {
          console.error("Unauthorized: Redirecting to login.");
          this.$router.push("/login");
        }
      }
    },
    async signOut() {
      const toast = useToast();
      // Hàm xử lý Sign Out
      this.$emit("sign-out");
      try {
        // Lấy `userId` từ localStorage
        const userId = localStorage.getItem("userId");

        if (!userId) {
          throw new Error("User ID is missing.");
        }
        // Gửi yêu cầu logout tới server cùng với `userId`
        await axios.post(`${process.env.VUE_APP_API_BASE_URL}/api/auth/logout?userId=${userId}`);

        localStorage.clear();
        // Xóa session token từ localStorage và cookie
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("role");
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
    this.fetchUserInfo(); // Lấy thông tin người dùng khi component được mount
  },
};
</script>

<style scoped>
.navigation {
  position: fixed;
  width: 300px;
  height: 100%;
  background: #2a2185;
  transition: 0.5s;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.user-details {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #fff;
}

.username {
  color: #fff;
  font-size: 1rem;
  font-weight: bold;
}

.signout-button {
  background-color: #e74c3c;
  color: #fff;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
}

.signout-button:hover {
  background-color: #c0392b;
}
.navigation.active {
  width: 80px;
}

.logo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
  margin-bottom: 20px;
}

.logo-container .img img {
  width: 60px;
  height: auto;
  margin-bottom: 10px;
}

.logo-container .title {
  color: #fff;
  font-size: 1.2rem;
  font-weight: bold;
}

.menu-items {
  flex-grow: 1; /* Tăng không gian cho menu để đẩy User Info xuống cuối */
  width: 100%;
}

.menu-items li {
  position: relative;
  width: 100%;
  list-style: none;
  border-top-left-radius: 30px;
  border-bottom-left-radius: 30px;
}

.menu-items li:hover,
.menu-items li.hovered {
  background-color: #fff;
}

.menu-items li a {
  display: flex;
  text-decoration: none;
  color: #fff;
}

.menu-items li:hover a,
.menu-items li.hovered a {
  color: #2a2185;
}

.menu-items li a .icon {
  min-width: 80px;
  height: 80px;
  line-height: 75px;
  text-align: center;
}

.menu-items li a .icon ion-icon {
  font-size: 1.75rem;
}

.menu-items li a .title {
  padding: 0 10px;
  height: 60px;
  line-height: 60px;
}

.navigation ul {
  width: 100%;
}

.navigation ul li {
  position: relative;
  width: 100%;
  list-style: none;
  border-top-left-radius: 30px;
  border-bottom-left-radius: 30px;
}

.navigation ul li:hover,
.navigation ul li.hovered {
  background-color: #fff;
}

.navigation ul li a {
  display: flex;
  text-decoration: none;
  color: #fff;
}

.navigation ul li:hover a,
.navigation ul li.hovered a {
  color: #2a2185;
}

.navigation ul li a .icon {
  min-width: 60px;
  height: 60px;
  line-height: 75px;
  text-align: center;
}

.navigation ul li a .icon ion-icon {
  font-size: 1.75rem;
}

.navigation ul li a .title {
  padding: 0 10px;
  height: 60px;
  line-height: 60px;
}
</style>
