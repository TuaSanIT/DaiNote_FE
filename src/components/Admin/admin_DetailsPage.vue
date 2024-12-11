<template>
  <div class="chart-dashboard">
    <div class="chart-layout">
      <!-- Cột bên trái -->
      <div class="left-column">
        <div class="chart-item">
          <h3 class="chart-title" @click="toggleCollapse('usersChart')">
            User Statistics
            <span>{{ isCollapsed.usersChart ? '+' : '-' }}</span>
          </h3>
          <div v-if="!isCollapsed.usersChart">
            <canvas v-if="usersData.length > 0" id="usersLineChart"></canvas>
            <p v-else>No user data available</p>
          </div>
        </div>

        <div class="chart-item">
          <h3 class="chart-title" @click="toggleCollapse('earningsChart')">
            Earnings Growth Comparison
            <span>{{ isCollapsed.earningsChart ? '+' : '-' }}</span>
          </h3>
          <div v-if="!isCollapsed.earningsChart">
            <canvas id="earningsComparisonChart"></canvas>
          </div>
        </div>
      </div>

      <!-- Cột bên phải -->
      <div class="right-column">
        <div class="chart-item">
          <h3 class="chart-title" @click="toggleCollapse('taskChart')">
            Task Creation Comparison
            <span>{{ isCollapsed.taskChart ? '+' : '-' }}</span>
          </h3>
          <div v-if="!isCollapsed.taskChart">
            <canvas id="taskComparisonChart"></canvas>
          </div>
        </div>

        <div class="chart-item">
          <h3 class="chart-title" @click="toggleCollapse('noteChart')">
            Note Creation Comparison
            <span>{{ isCollapsed.noteChart ? '+' : '-' }}</span>
          </h3>
          <div v-if="!isCollapsed.noteChart">
            <canvas id="noteComparisonChart"></canvas>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

Chart.register(
  LineController,
  LineElement,
  PointElement,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

import axios from "axios";

export default {
  data() {
    return {
      usersStartDate: "",
      usersEndDate: "",
      usersData: [],
      taskComparisonData: null,
      noteComparisonData: null,
      earningsData: null,
      isCollapsed: {
        usersChart: false,
        taskChart: false,
        noteChart: false,
        earningsChart: false,
      },
      charts: {
        usersChart: null,
        taskChart: null,
        noteChart: null,
        earningsChart: null,
      },
    };
  },
  mounted() {
    this.fetchUsersData();
    this.fetchTaskComparisonData();
    this.fetchNoteComparisonData();
    this.fetchEarningsData();
  },
  methods: {
    toggleCollapse(chart) {
      this.isCollapsed[chart] = !this.isCollapsed[chart];
      if (!this.isCollapsed[chart]) {
        this.reinitializeChart(chart);
      }
    },
    reinitializeChart(chart) {
      if (chart === "usersChart" && !this.charts.usersChart) {
        this.initializeUsersBarChart();
      } else if (chart === "taskChart" && !this.charts.taskChart) {
        this.initializeTaskComparisonChart();
      } else if (chart === "noteChart" && !this.charts.noteChart) {
        this.initializeNoteComparisonChart();
      }
    },
    async fetchUsersData() {
      try {
        const params = {};
        if (this.usersStartDate) params.startDate = this.usersStartDate;
        if (this.usersEndDate) params.endDate = this.usersEndDate;

        const response = await axios.get(`http://localhost:5141/api/Admin/user-statistics`, { params });
        const { totalUsers, activeUsers, vipUsers } = response.data;

        // Transform the response for Chart.js
        this.usersData = [
          { label: "Total Users", count: totalUsers },
          { label: "Active Users", count: activeUsers },
          { label: "VIP Users", count: vipUsers }
        ];

        this.initializeUsersBarChart();
      } catch (error) {
        console.error("Error fetching user statistics:", error);
        this.usersData = [];
      }
    },

    initializeUsersBarChart() {
      this.$nextTick(() => {
        const canvas = document.getElementById("usersLineChart");
        if (!canvas) {
          console.error("Canvas element with id 'usersLineChart' not found.");
          return;
        }

        const ctx = canvas.getContext("2d");

        const labels = this.usersData.map((item) => item.label);
        const data = this.usersData.map((item) => item.count);

        new Chart(ctx, {
          type: "bar",
          data: {
            labels,
            datasets: [
              {
                label: "User Statistics",
                data,
                backgroundColor: ["#2196F3", "#4CAF50", "#FF9800"],
                borderColor: "#ddd",
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: "top",
              },
            },
          },
        });
      });
    },
    async fetchTaskComparisonData() {
      try {
        const response = await axios.get("http://localhost:5141/api/Admin/tasks-monthly-growth");
        this.taskComparisonData = response.data;
        this.initializeTaskComparisonChart();
      } catch (error) {
        console.error("Error fetching task comparison data:", error);
      }
    },
    initializeTaskComparisonChart() {
      this.$nextTick(() => {
        const canvas = document.getElementById("taskComparisonChart");
        if (!canvas) {
          console.error("Canvas element with id 'taskComparisonChart' not found.");
          return;
        }

        const ctx = canvas.getContext("2d");

        const { currentMonthTasks, previousMonthTasks, growthPercentage } = this.taskComparisonData;
        // Dữ liệu biểu đồ
        const labels = ["Previous Month", "Current Month"];
        const taskData = [previousMonthTasks, currentMonthTasks];
        const growthData = [0, growthPercentage]; // Growth chỉ hiển thị cho tháng hiện tại

        // Tạo biểu đồ kết hợp
        new Chart(ctx, {
          type: "bar", // Biểu đồ dạng kết hợp
          data: {
            labels,
            datasets: [
              {
                type: "bar", // Dạng cột cho số lượng task
                label: "Tasks Created",
                data: taskData,
                backgroundColor: ["#FF9800", "#4CAF50"],
                borderColor: "#ddd",
                borderWidth: 1,
              },
              {
                type: "line", // Dạng đường cho tỷ lệ tăng trưởng
                label: "Growth (%)",
                data: growthData,
                borderColor: "#FF5722",
                backgroundColor: "#FF5722",
                borderWidth: 2,
                tension: 0.4,
                yAxisID: "yGrowth", // Gắn với trục Y thứ 2
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: "top",
              },
              title: {
                display: true,
                text: `Task Growth Comparison`,
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: "Number of Tasks",
                },
              },
              yGrowth: {
                beginAtZero: true,
                position: "right", // Trục Y thứ 2 bên phải
                title: {
                  display: true,
                  text: "Growth (%)",
                },
                grid: {
                  drawOnChartArea: false, // Không chồng lưới lên trục Y chính
                },
              },
            },
          },
        });
      });
    },
    async fetchNoteComparisonData() {
      try {
        const response = await axios.get("http://localhost:5141/api/Admin/notes-monthly-growth");
        this.noteComparisonData = response.data;
        this.initializeNoteComparisonChart();
      } catch (error) {
        console.error("Error fetching note comparison data:", error);
      }
    },
    initializeNoteComparisonChart() {
      this.$nextTick(() => {
        const canvas = document.getElementById("noteComparisonChart");
        if (!canvas) return console.error("Canvas for Note Comparison not found.");

        const ctx = canvas.getContext("2d");
        const { currentMonthNotes, previousMonthNotes, growthPercentage } = this.noteComparisonData;

        new Chart(ctx, {
          type: "bar",
          data: {
            labels: ["Previous Month", "Current Month"],
            datasets: [
              {
                label: "Notes Created",
                data: [previousMonthNotes, currentMonthNotes],
                backgroundColor: ["#FF9800", "#4CAF50"],
              },
              {
                label: "Growth (%)",
                data: [0, growthPercentage],
                type: "line",
                borderColor: "#FF5722",
                tension: 0.4,
                yAxisID: "yGrowth",
              },
            ],
          },
          options: {
            scales: {
              y: {
                beginAtZero: true,
                title: { text: "Notes", display: true },
              },
              yGrowth: {
                position: "right",
                beginAtZero: true,
                title: { text: "Growth (%)", display: true },
              },
            },
          },
        });
      });
    },

    async fetchEarningsData() {
      try {
        const response = await axios.get("http://localhost:5141/api/Admin/earnings-monthly-growth");
        this.earningsData = response.data;
        this.initializeEarningsComparisonChart();
      } catch (error) {
        console.error("Error fetching earnings data:", error);
      }
    },
    initializeEarningsComparisonChart() {
      this.$nextTick(() => {
        const canvas = document.getElementById("earningsComparisonChart");
        if (!canvas) return console.error("Canvas for Earnings Comparison not found.");

        const ctx = canvas.getContext("2d");
        const { currentMonthEarnings, previousMonthEarnings, growthPercentage } = this.earningsData;

        new Chart(ctx, {
          type: "bar",
          data: {
            labels: ["Previous Month", "Current Month"],
            datasets: [
              {
                label: "Earnings (VNĐ)",
                data: [previousMonthEarnings, currentMonthEarnings],
                backgroundColor: ["#FF9800", "#4CAF50"],
              },
              {
                label: "Growth (%)",
                data: [0, growthPercentage],
                type: "line",
                borderColor: "#FF5722",
                tension: 0.4,
                yAxisID: "yGrowth",
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: { position: "top" },
              title: {
                display: true,
                text: "Earnings Growth Comparison",
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                title: { display: true, text: "Earnings (VNĐ)" },
              },
              yGrowth: {
                position: "right",
                beginAtZero: true,
                title: { display: true, text: "Growth (%)" },
              },
            },
          },
        });
      });
    },
  },
};
</script>

<style scoped>
.chart-dashboard {
  padding: 20px;
  font-family: Arial, sans-serif;
  margin: 0 auto;
}

.chart-layout {
  display: flex;
  gap: 20px;
}

.left-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.right-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.chart-item {
  background: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.chart-item canvas {
  max-width: 100%;
  max-height: 300px;
}

.chart-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-title span {
  font-size: 24px;
  line-height: 1;
}
</style>
