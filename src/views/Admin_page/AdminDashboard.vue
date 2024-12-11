<template>
  <div class="admin-dashboard">
    <Navigation @menu-selected="handleMenuSelection" />
    <div class="main-content" :class="{ active: isSidebarActive }">
      <Dashboard v-if="currentMenu === 'Dashboard'" @toggle-menu="toggleSidebar" />
      <UserList v-if="currentMenu === 'Users'" :currentMenu="currentMenu" />
      <transactionsList v-if="currentMenu === 'Transactions'" :currentMenu="currentMenu" />
    </div>
  </div>
</template>

<script>
import Navigation from "../../components/Admin/admin_Navigation.vue";
import Dashboard from "../../components/Admin/admin_Dashboard.vue";
import UserList from "../../components/Admin/UserList.vue";
import transactionsList from "@/components/Admin/transactionsList.vue";

export default {
  components: {
    Navigation,
    Dashboard,
    UserList,
    transactionsList,
  },
  data() {
    return {
      isSidebarActive: false,
      currentMenu: "Dashboard",
    };
  },
  methods: {
    toggleSidebar() {
      this.isSidebarActive = !this.isSidebarActive;
    },
    handleMenuSelection(menuTitle) {
      this.currentMenu = menuTitle; // Cập nhật menu hiện tại
    },
  },
};
</script>

<style scoped>
.admin-dashboard {
  display: flex;
}

.main-content {
  flex: 1;
  transition: margin-left 0.3s;
}

.main-content.active {
  margin-left: 80px;
}
</style>