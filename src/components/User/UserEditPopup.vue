<template>
  <div v-if="isOpen" class="popup">
    <div class="popup-content">
      <h2 class="popup-title">Edit Your Profile</h2>
      <div class="popup-scrollable">
        <div class="popup-body">
          <!-- Profile Form -->
          <form class="profile-form" @submit.prevent="updateUser">
            <div class="form-group">
              <label for="username">Username</label>
              <input type="text" v-model="user.username" id="username" required />
            </div>
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" v-model="user.email" id="email" disabled />
            </div>
            <div class="form-group">
              <label for="phone">Phone Number (optional)</label>
              <input type="tel" v-model="user.phoneNumber" id="phone" placeholder="Enter your phone number" />
              <small v-if="phoneError" class="error-message">{{ phoneError }}</small>
            </div>

            <div class="form-group avatar-upload">
              <label for="avatar">Avatar (optional)</label>
              <input type="file" id="avatar" @change="onFileChange" accept="image/*" />
              <img v-if="previewImage" :src="previewImage" class="avatar-preview" alt="Avatar Preview" />
            </div>
            <div class="form-actions">
              <button type="submit" class="btn-primary">Save Profile Changes</button>
              <button type="button" class="btn-cancel" @click="close">Cancel</button>
            </div>
          </form>

          <!-- Change Password Form -->
          <form class="password-form" @submit.prevent="changePassword">
            <h2 class="popup-title">Change Password</h2>
            <div class="form-group">
              <label for="oldPassword">Current Password</label>
              <div class="input-icon">
                <input :type="showOldPassword ? 'text' : 'password'" v-model="password.oldPassword" id="oldPassword"
                  placeholder="Enter current password" required />
                <i class="toggle-password fa" :class="showOldPassword ? 'fa-eye-slash' : 'fa-eye'"
                  @click="togglePasswordVisibility('old')"></i>
              </div>
            </div>

            <div class="form-group">
              <label for="newPassword">New Password</label>
              <div class="input-icon">
                <input :type="showNewPassword ? 'text' : 'password'" v-model="password.newPassword" id="newPassword"
                  placeholder="Enter new password" required />
                <i class="toggle-password fa" :class="showNewPassword ? 'fa-eye-slash' : 'fa-eye'"
                  @click="togglePasswordVisibility('new')"></i>
              </div>
              <small v-if="errors.newPassword" class="error-message">{{ errors.newPassword }}</small>
            </div>

            <div class="form-group">
              <label for="confirmNewPassword">Confirm New Password</label>
              <div class="input-icon">
                <input :type="showConfirmPassword ? 'text' : 'password'" v-model="password.confirmNewPassword"
                  id="confirmNewPassword" placeholder="Confirm new password" required />
                <i class="toggle-password fa" :class="showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'"
                  @click="togglePasswordVisibility('confirm')"></i>
              </div>
              <small v-if="errors.confirmNewPassword" class="error-message">{{ errors.confirmNewPassword }}</small>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn-primary">Change Password</button>
            </div>
          </form>

        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useToast } from "vue-toastification";

export default {
  props: {
    isOpen: {
      type: Boolean,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      user: {
        username: "",
        email: "",
        phoneNumber: "",
        avatarImage: null,
      },
      password: {
        oldPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      },
      errors: {
        newPassword: "",
        confirmNewPassword: "",
      },

      phoneError: "",
      previewImage: null,
      showOldPassword: false,
      showNewPassword: false,
      showConfirmPassword: false,
    };
  },
  watch: {
    "password.newPassword"(newValue) {
      if (newValue.length < 6) {
        this.errors.newPassword = "New password must be at least 6 characters.";
      } else {
        this.errors.newPassword = "";
      }
    },
    "password.confirmNewPassword"(newValue) {
      if (newValue !== this.password.newPassword) {
        this.errors.confirmNewPassword = "Passwords do not match.";
      } else {
        this.errors.confirmNewPassword = "";
      }
    },
    "user.phoneNumber"(newVal) {
      const phoneRegex = /^[0-9]{10}$/;
      if (newVal && !phoneRegex.test(newVal)) {
        this.phoneError = "Phone number must contain exactly 10 digits and no letters.";
      } else {
        this.phoneError = "";
      }
    },
  },
  methods: {
    async fetchUserData() {
      const toast = useToast();
      const userId = this.getUserIdFromCookies();
      const response = await fetch(`${process.env.VUE_APP_API_BASE_URL}/api/user/${userId}`);
      if (response.ok) {
        const userData = await response.json();
        this.user.username = userData.userName || "";
        this.user.email = userData.email || "";
        this.user.phoneNumber = userData.phoneNumber || "";

        this.previewImage = userData.avatarImage
          ? userData.avatarImage // URL to the avatar image
          : "/default-avatar.png";
      } else {
        toast.error("User not found, please login before trying DAI.");
      }
    },
    getUserIdFromCookies() {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; userId=`);
      if (parts.length === 2) return parts.pop().split(";").shift();
    },
    onFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.previewImage = e.target.result;
          this.user.avatarImage = file;
        };
        reader.readAsDataURL(file);
      }
    },
    async updateUser() {
      const toast = useToast();

      // Kiểm tra tính hợp lệ của số điện thoại
      const phoneRegex = /^[0-9]{10}$/;
      if (this.user.phoneNumber && !phoneRegex.test(this.user.phoneNumber)) {
        toast.error("Phone number must contain exactly 10 digits and no letters.");
        return;
      }

      const userId = this.getUserIdFromCookies();
      const formData = new FormData();

      if (this.user.username) {
        formData.append("UserName", this.user.username);
      }
      if (this.user.phoneNumber) {
        formData.append("UserContact", this.user.phoneNumber);
      }
      if (this.user.avatarImage) {
        formData.append("AvatarImage", this.user.avatarImage);
      }

      if (formData.has("UserName") || formData.has("UserContact") || formData.has("AvatarImage")) {
        try {
          const response = await fetch(
            `${process.env.VUE_APP_API_BASE_URL}/api/user/editProfile/${userId}`,
            {
              method: "PUT",
              body: formData,
            }
          );

          if (response.ok) {
            this.$emit("updated");
            toast.success("Profile updated successfully!");
            this.fetchUserData();
          } else {
            const errorData = await response.json();
            this.fetchUserData();
            toast.error(`Failed to update profile: ${errorData.Message || "Unknown error occurred."}`);
            console.error("Error updating profile:", errorData);
          }
        } catch (error) {
          this.fetchUserData();
          console.error("Error updating profile:", error);
          toast.error("An error occurred while updating the profile. Please try again.");
        }
      } else {
        toast.warning("Please provide at least one field to update.");
      }
    },

    togglePasswordVisibility(field) {
      if (field === "old") {
        this.showOldPassword = !this.showOldPassword;
      } else if (field === "new") {
        this.showNewPassword = !this.showNewPassword;
      } else if (field === "confirm") {
        this.showConfirmPassword = !this.showConfirmPassword;
      }
    },

    async changePassword() {
      const toast = useToast();
      const userId = this.getUserIdFromCookies();

      if (this.password.newPassword.length < 6) {
        this.errors.newPassword = "New password must be at least 6 characters.";
        return;
      }
      
      if (this.password.newPassword !== this.password.confirmNewPassword) {
        this.errors.confirmNewPassword = "Passwords do not match.";
        return;
      }

      this.loading = true;

      try {
        const response = await fetch(`${process.env.VUE_APP_API_BASE_URL}/api/user/changePassword/${userId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            oldPassword: this.password.oldPassword,
            newPassword: this.password.newPassword,
            confirmNewPassword: this.password.confirmNewPassword,
          }),
        });

        if (response.ok) {
          toast.success("Password changed successfully!");
          this.password.oldPassword = "";
          this.password.newPassword = "";
          this.password.confirmNewPassword = "";
        } else {
          const errorData = await response.json();
          toast.error(errorData || "Failed to change password.");
        }
      } catch (error) {
        toast.error("An error occurred while changing the password.");
        console.error(error);
      } finally {
        this.loading = false;
      }
    },
    close() {
      this.$emit("close");
    },
  },
  mounted() {
    this.fetchUserData();
  },
};
</script>

<style scoped>
.popup {
  position: fixed; 
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999 !important;
}

.popup-content {
  position: fixed;
  background: #2f3136;
  color: #ffffff;
  border-radius: 8px;
  padding: 20px;
  width: 90%;
  max-width: 900px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  max-height: 90vh; 
  overflow: hidden; 
  z-index: 19999 !important;
}

.popup-scrollable {
  overflow-y: auto; 
  overflow-x: hidden; 
  max-height: calc(90vh - 50px); 
  padding-right: 10px;
}

.popup-body {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}

/* Profile Form và Password Form có cùng chiều rộng */
.profile-form,
.password-form {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.popup-title {
  font-size: 24px;
  margin-bottom: 15px;
  font-weight: 600;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #40444b;
  border-radius: 4px;
  background-color: #40444b;
  color: #ffffff;
}

.avatar-upload input {
  color: black;
  background-color: #595E69;
}

.avatar-preview {
  margin-top: 10px;
  width: 100px;
  height: auto;
  border-radius: 50%;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.btn-primary {
  background-color: #7289da;
  color: #ffffff;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.btn-cancel {
  background-color: #202225;
  color: #ffffff;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.btn-primary:hover {
  background-color: #5b6eae;
}

.btn-cancel:hover {
  background-color: #292b2f;
}

@media (max-width: 768px) {
  .popup-body {
    flex-direction: column;
  }

  .popup-content {
    width: 95%;
  }

  .form-actions {
    flex-direction: column;
    gap: 10px;
  }

  .btn-primary,
  .btn-cancel {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .popup-content {
    padding: 15px;
  }

  .popup-title {
    font-size: 20px;
  }

  .form-group input {
    padding: 8px;
  }

  .avatar-preview {
    width: 80px;
  }
}

.input-icon {
  position: relative;
  width: 100%;
}

.input-icon input {
  width: 100%;
  padding: 10px;
  padding-right: 40px;
  border: 1px solid #40444b;
  border-radius: 4px;
  background-color: #40444b;
  color: #ffffff;
}

.toggle-password {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #cccccc;
}

.toggle-password:hover {
  color: #ffffff;
}

.error-message {
  color: #e74c3c;
  font-size: 12px;
  margin-top: 5px;
}


</style>