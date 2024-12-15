<template>
  <div class="auth-container">
    <div class="auth-box">
      <!-- Icon Home -->
      <div class="home-icon" @click="goHome">
        <i class="fa fa-home"></i>
      </div>

      <!-- Hiển thị tiêu đề động dựa trên trạng thái -->
      <h2 v-if="authMode === 'forgotPassword'">
        {{ forgotPasswordStep === 0 ? "Forgot Password" : forgotPasswordStep === 1 ? "Enter OTP" : "Reset Password" }}
      </h2>
      <h2 v-else>{{ authMode === 'login' ? 'Login' : 'Register' }}</h2>

      <!-- Form Xử Lý Forgot Password -->
      <form v-if="authMode === 'forgotPassword'" @submit.prevent="handleForgotPassword">
        <div v-if="forgotPasswordStep === 0" class="input-group">
          <label for="email">Email</label>
          <div class="input-icon">
            <i class="fa fa-envelope"></i>
            <input type="email" id="email" v-model="email" placeholder="Enter your email" required />
          </div>
        </div>

        <div v-if="forgotPasswordStep === 1" class="input-group">
          <label for="otp">OTP Code</label>
          <div class="input-icon">
            <i class="fa fa-key"></i>
            <input type="text" id="otp" v-model="otp" placeholder="Enter OTP" required />
          </div>
        </div>

        <div v-if="forgotPasswordStep === 2" class="input-group">
          <label for="newPassword">New Password</label>
          <div class="input-icon">
            <i class="fa fa-lock"></i>
            <input type="password" id="newPassword" v-model="newPassword" placeholder="Enter new password" required />
          </div>
        </div>

        <button type="submit" class="submit-btn" :disabled="loading">
          <span v-if="!loading">
            {{ forgotPasswordStep === 0 ? "Send OTP" : forgotPasswordStep === 1 ? "Verify OTP" : "Reset Password" }}
          </span>
          <span v-else>Loading...</span>
        </button>

        <!-- Back to Login Button -->
        <button type="button" class="back-btn" @click="backToLogin_whenForgot" :disabled="loading">
          Back to Login
        </button>
      </form>

      <!-- Form Login -->
      <form v-if="authMode === 'login'" @submit.prevent="login">
        <div class="input-group">
          <label for="email">Email</label>
          <div class="input-icon">
            <i class="fa fa-envelope"></i>
            <input type="email" id="email" v-model="email" placeholder="Enter your email" required />
          </div>
        </div>

        <div class="input-group">
          <label for="password">Password</label>
          <div class="input-icon">
            <i class="fa fa-lock"></i>
            <input type="password" id="password" v-model="password" placeholder="Enter your password" required />
          </div>
        </div>

        <button type="submit" class="submit-btn" :disabled="loading">
          <span v-if="!loading">Login</span>
          <span v-else>Loading...</span>
        </button>

        <!-- Google login button -->
        <div class="google-login" @click="googleLogin">
          <v-icon>fab fa-google-plus-g</v-icon>
        </div>

        <!-- Forgot Password Link -->
        <div class="forgot-password-link">
          <span @click="authMode = 'forgotPassword'; forgotPasswordStep = 0">Forgot your password?</span>
        </div>
      </form>

      <!-- Form Register -->
      <form v-if="authMode === 'register'" @submit.prevent="register">
        <div class="input-group">
          <label for="email">Email</label>
          <div class="input-icon">
            <i class="fa fa-envelope"></i>
            <input type="email" id="email" v-model="email" placeholder="Enter your email" required />
          </div>
        </div>

        <div class="input-group" v-if="otpSent && !otpConfirmed">
          <label for="otp">OTP Code</label>
          <div class="input-icon">
            <i class="fa fa-key"></i>
            <input type="text" id="otp" v-model="otp" placeholder="Enter OTP" required />
          </div>
        </div>

        <div class="input-group" v-if="otpConfirmed">
          <label for="password">Password</label>
          <div class="input-icon">
            <i class="fa fa-lock"></i>
            <input type="password" id="password" v-model="password" placeholder="Enter your password" required />
          </div>
        </div>

        <div v-if="otpConfirmed">
          <div class="input-group">
            <label for="fullName">Full Name</label>
            <div class="input-icon">
              <i class="fa fa-user"></i>
              <input type="text" id="fullName" v-model="fullName" placeholder="Enter your full name" required />
            </div>
          </div>

          <div class="input-group">
            <label for="phoneNumber">Phone Number</label>
            <div class="input-icon">
              <i class="fa fa-phone"></i>
              <input type="text" id="phoneNumber" v-model="phoneNumber" placeholder="Enter your phone number"
                required />
            </div>
          </div>

          <div class="input-group">
            <label for="userName">Username</label>
            <div class="input-icon">
              <i class="fa fa-user-circle"></i>
              <input type="text" id="userName" v-model="userName" placeholder="Enter your username" required />
            </div>
          </div>
        </div>

        <button type="submit" class="submit-btn" :disabled="loading">
          <span v-if="!loading">{{ otpSent ? (otpConfirmed ? "Register" : "Confirm OTP") : "Send OTP" }}</span>
          <span v-else>Loading...</span>
        </button>
      </form>

      <!-- Notification -->
      <div v-if="notification" :class="['notification', notification.type]">
        {{ notification.message }}
      </div>

      <!-- Toggle giữa các chế độ -->
      <div v-if="authMode !== 'forgotPassword'" class="toggle-link">
        <p>
          {{ authMode === 'login' ? "Don't have an account?" : "Already have an account?" }}
          <span @click="toggleAuthMode">
            {{ authMode === 'login' ? 'Register' : 'Login' }}
          </span>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { useToast } from "vue-toastification";
import { jwtDecode } from 'jwt-decode';

export default {
  data() {
    return {
      authMode: 'login', // 'login', 'register', 'forgotPassword'
      forgotPasswordStep: 0, // 0: Request OTP, 1: Enter OTP, 2: Reset Password
      email: '',
      password: '',
      fullName: '',
      phoneNumber: '',
      userName: '',
      otp: '',
      otpSent: false,
      otpConfirmed: false,
      newPassword: '',
      notification: null,
      loading: false,
    };
  },
  mounted() {
    if (window.google && window.google.accounts && window.google.accounts.id) {
      const clientId = '550006306214-8quf2qirdqt4opb9ub680fqs551bhn2o.apps.googleusercontent.com';

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: this.handleCredentialResponse.bind(this),
        prompt: 'select_account',
      });

      window.google.accounts.id.renderButton(
        document.querySelector(".google-login"),
        { theme: "outline", size: "large" }
      );
    } else {
      console.error("Google accounts script not loaded.");
    }
  },

  methods: {

    backToLogin_whenForgot() {
      this.authMode = 'login';
      this.clearFields();
    },

    goHome() {
      this.$router.push('/');
    },

    toggleAuthMode() {
      this.authMode = this.authMode === 'login' ? 'register' : 'login';
      this.clearFields();
    },
    clearFields() {
      this.email = '';
      this.password = '';
      this.fullName = '';
      this.phoneNumber = '';
      this.userName = '';
      this.otp = '';
      this.otpSent = false;
      this.otpConfirmed = false;
      this.newPassword = '';
    },
    async register() {
      if (!this.otpSent) {
        try {
          const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/api/auth/register/${this.email}`);
          this.otpSent = true;
          this.showNotification(response.data.message + '. OTP sent successfully. Please check your email.', 'success');
        } catch (error) {
          console.error('Registration error:', error);
          this.showNotification('Email already exists or email fail', 'error');
        }
      } else if (!this.otpConfirmed) {
        try {
          const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/api/auth/confirm-otp/${this.email}/${this.otp}`);
          this.showNotification(response.data.message + '. OTP confirmed successfully', 'success');
          this.otpConfirmed = true;
        } catch (error) {
          console.error('OTP Confirmation error:', error);
          this.showNotification('OTP Confirmation failed: ' + (error.response?.data?.message));
        }
      } else {
        await this.registerComplete();
      }
    },
    async registerComplete() {
      const toast = useToast();
      try {
        const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/api/auth/register-complete/${this.email}`, {
          password: this.password,
          fullName: this.fullName,
          phoneNumber: this.phoneNumber,
          userName: this.userName,
        });
        this.showNotification(response.data.message || 'Registration successful!', 'success');
        this.toggleAuthMode();
      } catch (error) {
        console.error('Registration complete error:', error);
        toast.error('Registration failed: ' + (error.response?.data?.message || 'An unknown error occurred.'));
      }
    },
    async login() {
      const toast = useToast();
      this.loading = true;
      try {
        const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/api/auth/login`, {
          email: this.email,
          password: this.password,
        });

        console.log('Login successful', response.data);

        const { accessToken, refreshToken, role } = response.data;

        sessionStorage.setItem("token", accessToken);

        document.cookie = `refreshToken=${refreshToken}; path=/; Secure; HttpOnly; SameSite=Strict`;

        const decodedToken = jwtDecode(accessToken);
        const userId = decodedToken.sub;

        localStorage.setItem('userId', userId);
        document.cookie = `userId=${userId}; path=/; Secure; SameSite=Strict`;

        localStorage.setItem('userRoles', role);
        this.showNotification('Login successful!', 'success');
        if (role === "Admin") {
          this.$router.push("/admin/dashboard");
        } else {
          const redirectUrl = this.$route.query.redirect || '/homepage';
          this.$router.push(redirectUrl);
        }
      } catch (error) {
        const message = error.response?.data?.message || 'Unknown error occurred';
        toast.error(`Login failed: ${message}`);
      } finally {
        this.loading = false;
      }
    },

    backToLogin() {
      this.$emit('toggleForgotPassword', false); // Quay lại Login
      this.clearForgotPasswordFields();
    },
    clearForgotPasswordFields() {
      this.email = '';
      this.otp = '';
      this.newPassword = '';
      this.forgotPasswordStep = 0;
    },
    async handleForgotPassword() {
      if (this.forgotPasswordStep === 0) {
        await this.requestForgotPassword();
      } else if (this.forgotPasswordStep === 1) {
        await this.verifyOtp();
      } else if (this.forgotPasswordStep === 2) {
        await this.resetPassword();
      }
    },
    async requestForgotPassword() {
      try {
        this.loading = true;
        const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/api/auth/forgot-password/${this.email}`);
        this.showNotification(response.data.message, 'success');
        this.forgotPasswordStep = 1; // Chuyển đến bước nhập OTP
      } catch (error) {
        console.error('Forgot password error:', error);
        this.showNotification('Error requesting password reset. Please check your email.', 'error');
      } finally {
        this.loading = false;
      }
    },
    async verifyOtp() {
      try {
        this.loading = true;
        const response = await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/api/auth/verify-otp-for-password/${this.email}/${this.otp}`
        );
        this.showNotification(response.data.message, 'success');
        this.forgotPasswordStep = 2; // Chuyển đến bước đặt lại mật khẩu
      } catch (error) {
        this.showNotification('OTP verification failed. Please check your OTP.', 'error');
      } finally {
        this.loading = false;
      }
    },
    async resetPassword() {
      try {
        this.loading = true;
        const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/api/auth/reset-password/${this.email}`, {
          newPassword: this.newPassword,
        });
        this.showNotification(response.data.message, 'success');
        this.backToLogin(); // Quay lại đăng nhập sau khi đặt lại mật khẩu thành công
      } catch (error) {
        this.showNotification('Error resetting password. Please try again.', 'error');
      } finally {
        this.loading = false;
      }
    },

    handleCredentialResponse(response) {
      const idToken = response.credential;
      console.log("Google ID Token: ", idToken);

      this.loading = true;
      this.googleLogin(idToken);
    },

    async getClientIp() {
      try {
        const response = await fetch("https://api.ipify.org?format=json");
        const data = await response.json();
        return data.ip;
      } catch (error) {
        console.error("Failed to fetch client IP:", error);
        return "Unknown";
      }
    },

    async googleLogin(idToken) {
      const toast = useToast();
      const clientIp = await this.getClientIp();
      this.loading = true;

      if (!idToken) {
        toast.error("Google ID Token is missing. Please try again.");
        return;
      }

      try {
        const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/api/auth/login-google`, { idToken, clientIp });

        const token = response.data.token;
        const decodedToken = jwtDecode(token);

        const userId = decodedToken.sub;
        document.cookie = `userId=${userId}; path=/;`;
        localStorage.setItem("userId", userId);

        toast.success("Google Login successful!");

        const redirectUrl = this.$route.query.redirect || "/homepage";
        this.$router.push(redirectUrl);
      } catch (error) {
        console.error("Google login failed:", error);

        if (error.response?.status === 400) {
          this.showNotification('Please select your Google account to login.', 'success');
        } else {
          toast.error(error.response?.data || "Google login failed. Please try again.");
        }
      } finally {
        this.loading = false;
      }
    },

    showNotification(message, type) {
      this.notification = { message, type };
      setTimeout(() => { this.notification = null; }, 3000);
    },
  },
};
</script>

<style scoped>
.home-icon {
  cursor: pointer;
  font-size: 1.5rem;
  color: #007bff;
  margin-bottom: 1rem;
  text-align: left;
}

.home-icon i {
  margin-right: 8px;
}

.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(to right, #6a11cb, #2575fc);
  font-family: 'Arial', sans-serif;
}

.auth-box {
  background: white;
  padding: 2.5rem;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  text-align: center;
  width: 380px;
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

.auth-box h2 {
  font-size: 1.8rem;
  margin-bottom: 2rem;
  color: #333;
}

.input-group {
  margin-bottom: 1.5rem;
  text-align: left;
}

.input-group label {
  font-weight: bold;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.input-icon {
  position: relative;
  width: 100%;
}

.input-icon i {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
}

.input-icon input {
  width: 100%;
  padding: 0.8rem 0.8rem 0.8rem 2.5rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  transition: border 0.3s ease;
}

.input-icon input:focus {
  border: 1px solid #007bff;
  outline: none;
}

.submit-btn {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 0.8rem 0;
  font-size: 1rem;
  border-radius: 8px;
  width: 100%;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.submit-btn:hover {
  background-color: #0056b3;
}

.back-btn {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 0.8rem 0;
  font-size: 1rem;
  border-radius: 8px;
  width: 100%;
  cursor: pointer;
  margin-top: 1rem;
  transition: background-color 0.3s ease;
}

.back-btn:hover {
  background-color: #5a6268;
}

.google-login {
  color: black;
  border: none;
  padding: 0.8rem 0;
  font-size: 1rem;
  border-radius: 8px;
  width: 100%;
  cursor: pointer;
  margin-top: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.google-login i {
  margin-right: 10px;
}

.toggle-link {
  margin-top: 1.5rem;
}

.toggle-link span {
  color: #007bff;
  cursor: pointer;
  text-decoration: underline;
}

.notification {
  margin-top: 1.5rem;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
}

.notification.success {
  background-color: #d4edda;
  color: #155724;
}

.notification.error {
  background-color: #f8d7da;
  color: #721c24;
}

.submit-btn[disabled] {
  background-color: #6c757d;
  
  cursor: not-allowed;
}


.forgot-password-link {
  text-align: center;
  margin-top: 10px;
}

.forgot-password-link span {
  color: #007bff;
  cursor: pointer;
  text-decoration: underline;
}
</style>