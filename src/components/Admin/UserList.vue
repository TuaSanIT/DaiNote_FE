<template>
  <div class="User-list">
    <h2>User List</h2>

    <!-- Filter Section -->
    <div class="filter-container">
      <div class="filter-group">
        <div class="filter-item">
          <label for="start-date">Start Date:</label>
          <input type="date" id="start-date" v-model="filterStartDate" :max="filterEndDate || null" />
        </div>
        <div class="filter-item">
          <label for="end-date">End Date:</label>
          <input type="date" id="end-date" v-model="filterEndDate" :min="filterStartDate || null" />
        </div>
        <button class="reset-button" @click="resetFilters">Reset</button>
      </div>

      <div class="search-group">
        <input type="text" id="search" v-model="searchQuery" placeholder="Search by username or email" />
        <button class="export-button" @click="exportToPDF">Export PDF</button>
      </div>
    </div>


    <table class="user-table">
      <thead>
        <tr>
          <th>Avatar</th>
          <th>Username</th>
          <th>Email</th>
          <th>Full Name</th>
          <th>Added On</th>
          <th>
            Online
            <button class="sort-button" @click="sortBy('isOnline')">⬆⬇</button>
          </th>
          <th>
            VIP
            <button class="sort-button" @click="sortBy('isVipSupplier')">⬆⬇</button>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in paginatedUsers" :key="user.id">
          <td>
            <img :src="user.avatarImage || defaultAvatar" alt="Avatar" class="avatar" />
          </td>
          <td>{{ user.userName }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.fullName }}</td>
          <td>{{ user.addedOn }}</td>
          <td>{{ user.isOnline ? "Yes" : "No" }}</td>
          <td>{{ user.isVipSupplier ? "Yes" : "No" }}</td>
        </tr>
      </tbody>
    </table>

    <div class="pagination">
      <button :disabled="currentPage === 1" @click="changePage(currentPage - 1)">Previous</button>
      <span>Page {{ currentPage }} of {{ totalPages }}</span>
      <button :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">Next</button>
    </div>
  </div>
</template>

<script>
import jsPDF from "jspdf";
import "jspdf-autotable";
import axios from "axios";

export default {
  props: {
    currentMenu: String, // Nhận currentMenu từ parent
  },
  data() {
    return {
      users: [], // Dữ liệu toàn bộ người dùng
      filteredUsers: [], // Dữ liệu sau khi lọc
      currentPage: 1,
      itemsPerPage: 10,
      defaultAvatar: require("../../../public/default-avatar.png"),
      filterStartDate: "", // Lọc ngày bắt đầu
      filterEndDate: "", // Lọc ngày kết thúc
      searchQuery: "", // Tìm kiếm theo username hoặc email
      sortColumn: "", // Cột đang sắp xếp
      sortDirection: "asc",
    };
  },
  watch: {
    // Theo dõi sự thay đổi của bộ lọc và tìm kiếm
    filterStartDate: "applyFilters",
    filterEndDate: "applyFilters",
    searchQuery: "applyFilters",
    currentMenu(newMenu) {
      if (newMenu === "Users") {
        this.fetchUsers();
      }
    },
  },
  mounted() {
    this.fetchUsers();
  },
  methods: {
    async fetchUsers() {
      try {
        const response = await axios.get("http://localhost:5141/api/Admin/get-all-users");
        this.users = response.data.users || [];
        this.filteredUsers = this.users; // Khởi tạo danh sách lọc mặc định
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    },
    sortBy(column) {
      if (this.sortColumn === column) {
        // Đổi hướng sắp xếp nếu cột đã được chọn
        this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc";
      } else {
        // Chọn cột mới để sắp xếp
        this.sortColumn = column;
        this.sortDirection = "asc";
      }

      // Sắp xếp danh sách đã lọc
      this.filteredUsers.sort((a, b) => {
        if (this.sortDirection === "asc") {
          return a[column] > b[column] ? 1 : -1;
        } else {
          return a[column] < b[column] ? 1 : -1;
        }
      });
    },
    applyFilters() {
      let filtered = this.users;

      // Lọc theo ngày
      if (this.filterStartDate && this.filterEndDate) {
        const startDate = new Date(this.filterStartDate);
        const endDate = new Date(this.filterEndDate);

        filtered = filtered.filter((user) => {
          const addedOnDate = new Date(user.addedOn);
          return addedOnDate >= startDate && addedOnDate <= endDate;
        });
      }

      // Lọc theo tìm kiếm
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (user) =>
            user.userName.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query)
        );
      }

      this.filteredUsers = filtered;
      this.currentPage = 1; // Reset về trang đầu
    },
    resetFilters() {
      // Đặt lại tất cả bộ lọc và hiển thị toàn bộ dữ liệu
      this.filterStartDate = "";
      this.filterEndDate = "";
      this.searchQuery = "";
      this.filteredUsers = this.users;
      this.currentPage = 1;
    },
    changePage(page) {
      if (page > 0 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
    exportToPDF() {
      const doc = new jsPDF();

      // Tiêu đề và thông tin bộ lọc
      doc.text("Users Export by Admin", 14, 10);
      if (this.filterStartDate || this.filterEndDate) {
        doc.text(
          `Filtered from ${this.filterStartDate || "Start"} to ${this.filterEndDate || "End"}`,
          14,
          20
        );
      }
      doc.text(`Search Query: ${this.searchQuery || "None"}`, 14, 30);

      // Cấu hình bảng dữ liệu
      const tableColumns = [
        "Username",
        "Email",
        "Full Name",
        "Added On",
        "Online",
        "VIP",
      ];
      const tableRows = this.filteredUsers.map((user) => [
        user.userName,
        user.email,
        user.fullName,
        user.addedOn,
        user.isOnline ? "Yes" : "No",
        user.isVipSupplier ? "Yes" : "No",
      ]);

      // Thêm bảng vào PDF
      doc.autoTable({
        startY: 40,
        head: [tableColumns],
        body: tableRows,
      });

      // Xuất file PDF
      doc.save("User_Export.pdf");
    },
  },
  computed: {
    totalPages() {
      return Math.ceil(this.filteredUsers.length / this.itemsPerPage);
    },
    paginatedUsers() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredUsers.slice(start, end);
    },
  },
};
</script>

<style scoped>
.User-list {
  position: absolute;
  width: calc(100% - 300px);
  left: 300px;
  min-height: 100vh;
  padding: 20px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
  transition: 0.5s;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #ddd;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  font-size: 14px;
}

.user-table th,
.user-table td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: left;
  vertical-align: middle;
}

.user-table th {
  background-color: #2a2185;
  color: #fff;
  text-transform: uppercase;
}

.user-table tr:nth-child(even) {
  background-color: #f9f9f9;
}

.user-table tr:hover {
  background-color: #f1f1f1;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.pagination button {
  background-color: #2a2185;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 5px;
  cursor: pointer;
}

.pagination button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.pagination span {
  font-size: 16px;
}

.filter-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background-color: #f9f9f9;
  padding: 15px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.filter-group {
  display: flex;
  gap: 20px;
  align-items: center;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.filter-item label {
  font-size: 14px;
  font-weight: bold;
  color: #2a2185;
}

.filter-item input[type="date"] {
  padding: 8px 12px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 5px;
  width: 150px;
  background: #fff;
  transition: border-color 0.3s ease;
}

.filter-item input[type="date"]:focus {
  border-color: #4caf50;
  outline: none;
}

.reset-button {
  background-color: #e74c3c;
  color: #fff;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
}

.reset-button:hover {
  background-color: #c0392b;
}

.search-group {
  display: flex;
  gap: 10px;
  align-items: center;
}

.search-group input {
  padding: 8px 12px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 5px;
  width: 250px;
  transition: border-color 0.3s ease;
}

.search-group input:focus {
  border-color: #3498db;
  outline: none;
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #ddd;
}

.export-button {
  background-color: #3498db;
  color: #fff;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
}

.export-button:hover {
  background-color: #2980b9;
}

.sort-button {
  background: none;
  border: none;
  font-size: 12px;
  cursor: pointer;
  color: #fff;
  margin-left: 5px;
}

.sort-button:hover {
  color: #3498db;
}
</style>