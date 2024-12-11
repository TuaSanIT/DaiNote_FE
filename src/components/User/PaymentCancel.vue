<template>
  <div class="payment-container cancel">
      <img :src="logoSrc" alt="Project Logo" class="logo" />
      <h1>Payment Canceled</h1>
      <p>It seems you canceled the payment. If this was a mistake, you can try again or contact support for assistance.</p>
      <div class="action-buttons">
          <router-link to="/homepage">
              <button class="btn-home">Back to Homepage</button>
          </router-link>
          <button class="btn-support" @click="navigateToContact">Contact Support</button>
      </div>
  </div>
</template>

<script>
export default {
  name: "PaymentCancel",
  data() {
      return {
          logoSrc: require('@/assets/logo_dai.png'), // Đảm bảo file ảnh nằm trong src/assets
      };
  },
  methods: {
    navigateToContact() {
      this.$router.push({ path: "/", hash: "#contact" });
    },
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap");

.payment-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
  font-family: "Poppins", sans-serif;
}

.logo {
  width: 120px;
  margin-bottom: 20px;
}

h1 {
  font-size: 28px;
  font-weight: 700;
  color: #e63946;
  margin-bottom: 10px;
}

p {
  font-size: 16px;
  font-weight: 400;
  color: #6c757d;
  margin-bottom: 30px;
}

.action-buttons {
  display: flex;
  gap: 15px;
}

button {
  padding: 12px 25px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-home {
  background-color: #007bff;
  color: white;
}

.btn-home:hover {
  background-color: #0056b3;
}

.btn-support {
  background-color: #e63946;
  color: white;
}

.btn-support:hover {
  background-color: #c82333;
}
</style>
