<template>
  <div class="payment-container success">
    <div class="payment-card">
      <div class="payment-header">
        <i class="fas fa-check-circle success-icon"></i>
        <h1 class="title">Payment Successful</h1>
      </div>
      <p class="description">
        Thank you for upgrading to <strong>VIP</strong>! Enjoy exclusive features and premium benefits.
      </p>
      <div v-if="isLoading" class="loading-message">
        <p>Checking your VIP status...</p>
      </div>
      <div v-else>
        <p v-if="isVip" class="status-message success">
          Your VIP status is active! It will expire on <strong>{{ vipExpiryDate }}</strong>.
        </p>
        <p v-else class="status-message error">
          There was an issue updating your VIP status. Please contact support.
        </p>
      </div>
      <router-link to="/homepage">
        <button class="btn-homepage">Go to Homepage</button>
      </router-link>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "PaymentSuccess",
  data() {
    return {
      isVip: false,
      vipExpiryDate: "",
      isLoading: true,
    };
  },
  methods: {
    async fetchVipStatus() {
      try {
        const response = await axios.get("http://localhost:5141/api/payment/user-status", {
          headers: {
            UserId: localStorage.getItem("userId"),
          },
        });
        this.isVip = response.data.isVip;
        this.vipExpiryDate = response.data.vipExpiryDate
          ? new Date(response.data.vipExpiryDate).toLocaleDateString()
          : "N/A";
      } catch (error) {
        console.error("Error fetching VIP status:", error);
        this.isVip = false;
      } finally {
        this.isLoading = false;
      }
    },
  },
  mounted() {
    this.fetchVipStatus();
  },
};
</script>

<style scoped>
/* Background container */
.payment-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #1de9b6, #1dc4e9);
  font-family: "Poppins", sans-serif;
  color: #333;
}

/* Card style */
.payment-card {
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  text-align: center;
  padding: 40px 30px;
  max-width: 450px;
  width: 90%;
  animation: slideIn 0.8s ease-in-out;
}

/* Header section */
.payment-header {
  margin-bottom: 20px;
}

.success-icon {
  font-size: 80px;
  color: #4caf50;
  margin-bottom: 10px;
}

.title {
  font-size: 28px;
  font-weight: 700;
  color: #333;
}

/* Description text */
.description {
  font-size: 16px;
  line-height: 1.6;
  color: #666;
  margin-bottom: 30px;
}

/* Status message */
.status-message {
  font-size: 16px;
  margin-bottom: 20px;
}

.status-message.success {
  color: #4caf50;
}

.status-message.error {
  color: #f44336;
}

/* Button style */
.btn-homepage {
  padding: 14px 30px;
  font-size: 16px;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #1de9b6, #1dc4e9);
  border: none;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.btn-homepage:hover {
  background: linear-gradient(135deg, #1dc4e9, #1de9b6);
  transform: translateY(-2px);
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.25);
}

.btn-homepage:active {
  transform: translateY(1px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
}

/* Loading message */
.loading-message {
  font-size: 14px;
  color: #666;
}

/* Animation for card */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
