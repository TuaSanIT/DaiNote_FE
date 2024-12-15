<template>
  <div class="cardBox">
    <div class="card" v-for="(card, index) in cards" :key="index">
      <div>
        <div class="numbers">{{ card.numbers }}</div>
        <div class="cardName">{{ card.name }}</div>
      </div>
      <div class="iconBx">
        <ion-icon :name="card.icon"></ion-icon>
      </div>
    </div>
  </div>
</template>
<script>
import axios from "axios";

export default {
  data() {
    return {
      cards: [], 
    };
  },
  mounted() {
    this.fetchDashboardData();
  },
  methods: {
    async fetchDashboardData() {
      try {
        const usersResponse = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/api/Admin/get-all-users`);
        const notesResponse = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/api/Admin/get-all-notes`);
        const tasksResponse = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/api/Admin/get-all-tasks`);
        const transactionsResponse = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/api/Admin/get-all-transactions`);

        const totalAmount = transactionsResponse.data.totalPaidAmount || 0;

        this.cards = [
          {
            numbers: usersResponse.data.totalUsers || 0,
            name: "Users",
            icon: "people-outline",
          },
          {
            numbers: notesResponse.data.totalNotes || 0,
            name: "Take Note",
            icon: "clipboard-outline",
          },
          {
            numbers: tasksResponse.data.totalTasks || 0,
            name: "Tasks",
            icon: "document-text-outline",
          },
          {
            numbers: `${totalAmount.toLocaleString()} VNĐ`,
            name: "Earning",
            icon: "cash-outline",
          },
        ];
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    },
  },
};
</script>

<style scoped>
.cardBox {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-gap: 30px;
  padding: 20px;
}

.card {
  background: #fff;
  padding: 30px;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  
  align-items: center;
  
  justify-content: center;
  
  box-shadow: 0 7px 25px rgba(0, 0, 0, 0.08);
  transition: background 0.3s, color 0.3s;
  text-align: center;
  
}

.card:hover {
  background: #01944a;
  color: #fff;
}

.card .numbers {
  font-size: 2.5rem;
  color: #2a2185;
}

.card .cardName {
  font-size: 1.1rem;
  margin-top: 10px;
  
}

.card .iconBx {
  margin-top: 20px;
  
}

.card .iconBx ion-icon {
  font-size: 3.5rem;
}
</style>
