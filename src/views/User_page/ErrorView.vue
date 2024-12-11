<template>
    <div class="error-container">
      <div class="error-box">
        <h1>403</h1>
        <p class="error-message">You do not have permission to access this page.</p>
        <button @click="goHome" class="back-home-btn">Return to Homepage</button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    methods: {
      goHome() {
        this.$router.push('/homepage');
      },
    },
  };
  </script>
  
  <style scoped>
  .error-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: linear-gradient(to right, #ff7e5f, #feb47b);
    font-family: 'Arial', sans-serif;
  }
  
  .error-box {
    text-align: center;
    background: white;
    padding: 2rem;
    border-radius: 15px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    animation: fadeIn 0.6s ease-in-out;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .error-box h1 {
    font-size: 5rem;
    color: #ff6b6b;
    margin-bottom: 1rem;
  }
  
  .error-message {
    font-size: 1.2rem;
    color: #333;
    margin-bottom: 2rem;
  }
  
  .back-home-btn {
    background-color: #ff6b6b;
    color: white;
    border: none;
    padding: 0.8rem 2rem;
    font-size: 1rem;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  .back-home-btn:hover {
    background-color: #e65a5a;
  }
  
  .back-home-btn:focus {
    outline: none;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
  }
  </style>
  