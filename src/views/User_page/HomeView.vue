<template>

  <v-app id="home">
    <NavBar />
    <v-container fluid>
      <div class="head">
        <v-row>
          <v-col cols="5" class="d-flex align-center justify-center">
            <div style="position: relative; margin-left: 100px;" class="mt-16 text-center">
              <h1 class="text-grey text-left">"DAI" Build something beautiful.</h1><br />
              <h1 class="text-white text-left">Write down your thought (add note, image to out website)</h1>
              <h1 class="text-white text-left">Assemble all your note, team's member and all your tools togethers</h1>
              <br />
              <span class="text-grey text-left">DAI Note & Task Management</span><br />

              <v-btn tile dark class="mt-8" variant="outlined" style="color: #009688" @click="navigateToLogin">
                Get try DAI
              </v-btn>


            </div>
          </v-col>
          <v-col cols="2">
            <div style="
                position: absolute;
                z-index: 9999;
                bottom: 0;
                margin-left: auto;
                margin-right: auto;
                left: 0;
                right: 0;
                text-align: center;
              " class="mt-16">
              <v-icon>fas fa-angle-double-down</v-icon>
            </div>
          </v-col>
          <v-col cols="5">
            <div style="position: relative; z-index: 9999; margin-right: 100px" class="mt-16">
              <v-img src="i1.png" contain max-height="800"></v-img>
            </div>
          </v-col>
        </v-row>
      </div>

      <v-col cols="12" class="padd" id="portfolio">
        <div class="first" id="project">
          <v-row>
            <v-col cols="12">
              <div class="child">
                <v-btn icon="bi bi-journals" color="#009688" class="text-white"></v-btn>
                <h3 class="ml-3 mt-4">Take Note</h3>
                <p class="ml-3 mt-4 text-caption">
                  Experience effortless organization<br />with our Take Note feature! Capture, save
                  <br />and manage your notes seamlessly anytime
                </p>
              </div>
              <div class="child">
                <v-btn icon="bi bi-file-earmark-spreadsheet-fill" color="#009688" class="text-white"></v-btn>
                <h3 class="ml-3 mt-4">Task Management</h3>
                <p class="ml-3 mt-4 text-caption">
                  Boost productivity with our Task-Management feature!<br />Organize, prioritize and track tasks
                  effortlessly
                  <br />...
                </p>
              </div>
              <div class="child">
                <v-btn icon="bi bi-chat-dots" color="#009688" class="text-white"></v-btn>
                <h3 class="ml-3 mt-4">Chatting</h3>
                <p class="ml-3 mt-4 text-caption">
                  Stay connected with our Chat feature!<br />Chat one-on-one or in groups, make calls
                  <br />and share files and images effortlessly.
                </p>
              </div>
            </v-col>
          </v-row>
          <v-divider></v-divider>
        </div>
      </v-col>
      <v-col cols="12" sm="12" id="services">
        <div class="d-flex justify-center mb-6">
          <v-btn :color="selectedService === 'take_note' ? '#009688' : ''" class="mr-2"
            @click="selectService('take_note')">
            Take Note
          </v-btn>

          <v-btn :color="selectedService === 'task_management' ? '#009688' : ''" class="mr-2"
            @click="selectService('task_management')">
            Task Management
          </v-btn>

          <v-btn :color="selectedService === 'view_calendar' ? '#009688' : ''" class="mr-2"
            @click="selectService('view_calendar')">
            View Calendar
          </v-btn>

          <v-btn :color="selectedService === 'collaborator' ? '#009688' : ''" class="mr-2"
            @click="selectService('collaborator')">
            Collaborator
          </v-btn>

          <v-btn :color="selectedService === 'chatting' ? '#009688' : ''" @click="selectService('chatting')">
            Chatting
          </v-btn>
        </div>

        <div class="d-flex justify-center">
          <v-img v-if="currentImage" :src="currentImage" contain max-width="80%"></v-img>
        </div>
      </v-col>

      <v-col cols="12" sm="12" class="px-16" id="contact">
        <v-row>
          <v-col cols="12" sm="3">
            <div class="child">
              <h1>Contact info.</h1>
              <v-btn icon="fas fa-map-marker-alt" color="" class="mt-10" variant="outlined"></v-btn><br />
              <span class="text-caption">FPTU Da Nang </span><br />
              <v-btn icon="fas fa-phone-alt" color="" class="mt-10" variant="outlined"></v-btn><br />
              <span class="text-caption">(+84) 399918513</span> <br />
              <v-btn icon="fas fa-envelope" color="" class="mt-10" variant="outlined"></v-btn><br />
              <span class="text-caption">daitask.note@gmail.com</span> <br />
            </div>
          </v-col>
          <v-col cols="12" sm="8">
            <h1 class="mt-8">Contact Support</h1>
            <v-divider></v-divider>
            <span class="text-caption">Need assistance? Submit a request below and we will get to work!</span> <br />
            <v-row class="mt-10">
              <v-col cols="12" sm="6">
                <v-text-field v-model="name" label="Name" persistent-hint variant="outlined" required></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field v-model="email" label="Your Email" persistent-hint variant="outlined"
                  required></v-text-field>
              </v-col>
            </v-row>
            <v-row class="mt-10">
              <v-col cols="12" sm="6">
                <v-text-field v-model="phoneNo" label="Phone No" persistent-hint variant="outlined"
                  required></v-text-field>
              </v-col>
            </v-row>
            <v-textarea v-model="message" label="Message" persistent-hint variant="outlined" required></v-textarea>
            <v-btn color="#009688" class="mt-2" @click="submitForm" :disabled="isLoading">
              <template v-if="isLoading">
                <v-progress-circular indeterminate color="white" size="20"></v-progress-circular>
              </template>
              <template v-else>
                Submit Now
              </template>
            </v-btn>
          </v-col>
        </v-row>
      </v-col>
    </v-container>
    <FooterView />
  </v-app>
</template>

<script>
import { defineComponent } from "vue";
import { useToast } from "vue-toastification";
import NavBar from "@/components/NavBar.vue";
import FooterView from "@/components/FooterView.vue";
import axios from "axios";


export default defineComponent({
  name: "HomeView",
  setup() {
    return {
      slider2: 50,

      items: [
        {
          img: "Dai_Shogun.png(1)",
        },
        {
          img: "Dai_Shogun.png(1)",
        },
        {
          img: "Dai_Shogun.png(1)",
        },
        {
          img: "Dai_Shogun.png(1)",
        },
        {
          img: "Dai_Shogun.png(1)",
        },
        {
          img: "Dai_Shogun.png(1)",
        },
      ],
    };
  },
  components: {
    NavBar,
    FooterView
  },

  mounted() {
    this.scrollToSection();
  },
  watch: {
    $route(to) {
      if (to.hash) {
        this.scrollToSection();
      }
    },
  },
  data() {
    return {
      name: '',
      email: '',
      phoneNo: '',
      message: '',

      isLoading: false,
      currentImage: require('../../../public/Take_note.jpg'),
      selectedService: 'take_note',
      images: {
        take_note: require('../../../public/Take_note.jpg'),
        task_management: require('../../../public/TaskManagement.jpg'),
        view_calendar: require('../../../public/View_calendar.jpg'),
        collaborator: require('../../../public/Collaborator.jpg'),
        chatting: 'path/to/your/illustration_image.jpg',
      }
    };
  },

  methods: {


    async submitForm() {
      const toast = useToast();
      console.log('Submit button clicked!');
      if (!this.name || !this.email || !this.phoneNo || !this.message) {
        toast.error('Please fill in all fields.');
        return;
      }

      const mailRequest = {
        ToEmail: 'dainote.task@gmail.com',
        Subject: `Support request from ${this.name}`,
        Body: `
      <p>Name: ${this.name}</p>
      <p>Email: ${this.email}</p>
      <p>Phone No: ${this.phoneNo}</p>
      <p>Message: ${this.message}</p>
    `,
      };

      this.isLoading = true;
      try {
        await axios.post(`${process.env.VUE_APP_API_BASE_URL}/api/SupportMail/send`, mailRequest);
        toast.success('Email sent successfully!');
        this.name = '';
        this.email = '';
        this.phoneNo = '';
        this.message = '';
      } catch (error) {
        toast.error('Failed to send email: ' + (error.response ? error.response.data : error.message));
      } finally {
        this.isLoading = false;
      }
    },

    scroll(refName) {
      const element = document.getElementById(refName);
      element.scrollIntoView({ behavior: "smooth" });
    },

    async navigateToLogin() {
      const token = sessionStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (token && userId) {
        try {
          const response = await this.$axios.get(`${process.env.VUE_APP_API_BASE_URL}/api/auth/validate-token`, {
            headers: {
              Authorization: `Bearer ${token}`,
              UserId: userId, 
            },
          });

          if (response.data.isValid && response.data.userId === userId) {
            console.log("Login successful. Redirecting to homepage...");
            this.$router.push("/homepage");
          } else {
            console.error("Invalid token or userId. Logging out...");
            this.logout();
          }
        } catch (error) {
          console.error("Error during token validation:", error.response?.data || error.message);
          this.logout();
        }
      } else {
        console.warn("Missing token or userId. Redirecting to login page...");
        this.$router.push("/homepage");
      }
    },


    showImage(imageKey) {
      this.currentImage = this.images[imageKey];
    },

    selectService(service) {
      this.selectedService = service;
      this.currentImage = this.images[service];
    },

    logout() {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      document.cookie = "userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      this.$router.push("/login");
    },
    scrollToSection(sectionId) {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    },
  },

  created() {
    this.currentImage = this.images.take_note;
    const hash = this.$route.hash; // Lấy hash từ URL
    if (hash) {
      this.scrollToSection(hash.substring(1));
    }
  },


});
</script>
<style scoped>
.dark-theme {
  --color-background: var(--vt-c-black);
  --color-background-soft: var(--vt-c-black-soft);
  --color-background-mute: var(--vt-c-black-mute);

  --color-border: var(--vt-c-divider-dark-2);
  --color-border-hover: var(--vt-c-divider-dark-1);

  --color-heading: var(--vt-c-text-dark-1);
  --color-text: var(--vt-c-text-dark-2);
}

h1 {
  font-size: 1.5rem;
  font-weight: bold;
  line-height: 1.2;
}

#icon {
  width: 30px;
  cursor: pointer;
}

.v-container {
  padding: 16px 0 16px 0;
}

.sticky-navbar {
  position: sticky;
  top: 0;
  z-index: 1000;
  width: 100%;
}

.head {
  position: relative;
  text-align: center;
  padding: 12px;
  margin-bottom: 6px;
  height: 800px;
  width: 100%;
  color: white;
}

.my-4 {
  margin: 1rem 0;
}

.head:before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 50%;
  background: black;
  transform: skew(0deg, 6deg);
}

.head:after {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  width: 50%;
  background: black;
  transform: skew(0deg, -6deg);
}

.egg {
  display: block;
  margin-left: 10%;
  margin-top: 5%;
  width: 356px;
  height: 300px;
  background-color: #009688;
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
}

.first {
  width: 100%;
  height: 280px;
  text-align: center;
  padding: 2rem 2rem;
}

.child {
  display: inline-block;
  padding: 2rem 1rem;
  vertical-align: middle;
  text-align: center;
  margin-right: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.child:hover {
  transform: scale(1.05);
  background-color: #009688;
  color: white;
  transition: transform 0.3s ease, background-color 0.3s ease;
}

.child p:hover {
  color: white;
}

.imgHover {
  padding: 0 200px;
}

.pre {
  width: 100%;
  height: 380px;
  text-align: center;
  padding: 0 200px;
  background-color: #f5f5f5;
}

.hire {
  width: 100%;
  height: 200px;
  padding: 0 200px;
  background-color: #e9e9e9;
  margin-top: -24px;
}
</style>