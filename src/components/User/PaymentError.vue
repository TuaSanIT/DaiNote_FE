<template>
  <div class="payment-container error">
    <div class="icon-container">
      <i class="fa fa-times-circle"></i>
    </div>
    <h1>Payment Failed</h1>
    <p>Something went wrong with the payment process. Please try again later.</p>
    <router-link to="/homepage">
      <button>Return to Homepage</button>
    </router-link>
  </div>
</template>

<script>
export default {
  name: "PaymentError",
};
</script>

<style scoped>
.payment-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #f6d365, #fda085);
  color: #ffffff;
  text-align: center;
  font-family: "Poppins", sans-serif;
  padding: 20px;
  box-sizing: border-box;
}

.icon-container {
  font-size: 80px;
  color: #ff5722;
  margin-bottom: 20px;
}

.payment-container h1 {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #ffffff;
}

.payment-container p {
  font-size: 16px;
  margin-bottom: 20px;
}

.payment-container button {
  padding: 12px 25px;
  background-color: #ff5722;
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
}

.payment-container button:hover {
  background-color: #e64a19;
  transform: translateY(-2px);
  box-shadow: 0px 8px 15px rgba(0, 0, 0, 0.3);
}

.payment-container button:active {
  transform: translateY(0);
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
}
</style>
