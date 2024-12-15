<template>
  <div class="outer-wrapper">
    <div class="task-table-container" :class="{ 'collapsed-sidebar': !isSidebarOpen }">
      <div class="task-table">
          <div class="header">
              <h1>Ongoing Task</h1>
              <div class="filter-options">
                  <label for="per-page">Per Page</label>
                  <select v-model="perPage" @change="changePerPage">
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="all">All</option>
                  </select>
              </div>
              <input class="search" type="text" placeholder="Search title" v-model="search" @input="filterTasks" />
          </div>
          <table class="table table-striped">
              <thead>
                  <tr>
                      <th>Deadline</th>
                      <th>Days left</th>
                      <th>Task</th>
                      <th>Status</th>
                  </tr>
              </thead>
              <tbody>
                  <tr v-if="this.tasks.length === 0">
                      <td colspan="4">No created tasks</td>
                  </tr>
                  <tr v-for="task in paginatedTasks" :key="task.TaskId">
                      <td>{{ formatDate(task.finish_At) }}</td>
                      <td>{{ getDaysLeft(task.finish_At) }}</td>
                      <td>{{ task.title }}</td>
                      <td>
                          <span :class="getStatusClass(task.status)">{{ task.status }}</span>
                      </td>
                  </tr>
              </tbody>
          </table>
          <div class="pagination">
              <button @click="previousPage" :disabled="currentPage === 1">Back</button>
              <span>{{ currentPage }}</span>
              <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
          </div>
      </div>
  </div>
  </div>
</template>


<script>
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';

export function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

export default {
  data() {
    return {
      tasks: [],
      currentPage: 1,
      perPage: 5,
      search: '',
      userId: '' // Placeholder for user ID (to be retrieved from cookies)
    };
  },
  props: ["isSidebarOpen"], // Receive the sidebar state as a prop
  computed: {
    filteredTasks() {
      if (!this.search) {
        return this.tasks;
      }
      return this.tasks.filter(task =>
        task.title && task.title.toLowerCase().includes(this.search.toLowerCase())
      );
    },
    paginatedTasks() {
      if (this.perPage === 'all') {
        return this.filteredTasks;
      }
      const start = (this.currentPage - 1) * this.perPage;
      const end = start + this.perPage;
      return this.filteredTasks.slice(start, end);
    },
    totalPages() {
      if (this.perPage === 'all') {
        return 1;
      }
      return Math.ceil(this.filteredTasks.length / this.perPage);
    }
  },
  methods: {
    async fetchTasks() {
  try {
    const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/api/task/user/${this.userId}`);
    console.log('API Response:', response.data); // Log to see the structure

    response.data.forEach(task => {
      console.log(task); // Check each task object
    });
    this.tasks = response.data.filter(task => task && task.TaskId && task.Title && task.Finish_At);
    this.tasks.push(...response.data);
    console.log('Tasks:', this.tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
  }
},

    formatDate(date) {
      const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
      return new Date(date).toLocaleDateString('en-GB', options);
    },
    getDaysLeft(date) {
      const now = new Date();
      const deadline = new Date(date);
      const timeDiff = deadline - now;
      const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      return daysLeft < 0 ? 'over' : daysLeft;
    },
    getStatusClass(status) {
      return {
        'status-ongoing': status === 'ongoing',
        'status-over': status === 'over',
        'status-done': status === 'done',
        'status-pending': status === 'pending'
      };
    },
    previousPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    changePerPage() {
      this.currentPage = 1;
    },
    filterTasks() {
      this.currentPage = 1;
    }
  },
  mounted() {
    this.userId = getCookie('userId'); // Retrieve the user ID from cookies
    if (this.userId) {
      this.fetchTasks(); // Fetch tasks if user ID is available
    } else {
      console.error('User ID not found in cookies');
    }
  }
};
</script>


<style scoped>
.outer-wrapper {
  background-color: var(--vt-c-white); 
  min-height: 100vh; 
  
  padding-top: 120px; 
}

.task-table-container {
  flex-grow: 1;
  /* margin-left: 340px;
  margin-top: 120px; */
  margin-left: 340px;
  padding-top: 0px ;
  width: calc(100% - 370px); 
  
  background-color: var(--color-table);
  padding: 20px;
  border-radius: 10px;
  transition: all 0.3s ease; 
  min-height: 27vh;
  height: auto;
  overflow: auto;

  
}

.task-table-container.collapsed-sidebar {
  margin-left: 80px; 
  width: calc(100% - 100px); 
}

.task-table {
margin: 0 20px;
}

.header {
display: flex;
justify-content: space-between;
align-items: center;
margin-bottom: 20px;
}
.header h1{
  color: var(--color-text-white);
}

.filter-options {
display: flex;
align-items: center;
background-color: var(--vt-c-white);
border-radius: 10px;
}

.filter-options label {
margin-right: 10px;
padding: 0 10px;
}

.filter-options select {
margin-right: 20px;
}

table {
width: 100%;
border-collapse: collapse;
margin-bottom: 20px;
text-align: center; 
}

th,
td {
border: 1px solid #ddd;
padding: 8px;
text-align: center; 
}

th {
background-color: #f2f2f2;
}

.status-deadline {
color: red;
}

.status-ongoing {
background-color: yellow;
color: rgb(148, 147, 147);
font-weight: bold;
padding: 5px;
border-radius: 5px;
}

.status-over {
background-color: red;
color: white;
padding: 5px;
border-radius: 5px;
padding: 5px 16.5px;
}

.status-done {
background-color: green;
color: white;
padding: 5px;
border-radius: 5px;
padding: 5px 15.5px;
}

.status-pending {
background-color: gray;
color: white;
padding: 5px;
border-radius: 5px;
}

.pagination {
display: flex;
justify-content: center;
align-items: center;
}

.pagination button {
padding: 5px 10px;
background-color: var(--vt-c-white);
}

.pagination span {
padding: 5px 15px;
background-color: #4d8de4;
}

.search {
background-color: #ffffff;
border-radius: 10px;
padding: 0 10px;
}
</style>
