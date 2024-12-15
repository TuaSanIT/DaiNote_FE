<template>
  <div class="calendar-wrapper">
    <div
      :class="[ 
        'calendar',
        { 'popup-active': popupActive },
        { 'collapsed-sidebar': !isSidebarOpen },
      ]"
    >
      <FullCalendar :options="calendarOptions" />
    </div>
  </div>
</template>


<script>
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";


export default {
  components: {
    FullCalendar,
  },
  props: ["isSidebarOpen", "popupActive"],
  data() {
    return {
      calendarOptions: {
        plugins: [dayGridPlugin, timeGridPlugin],
        initialView: "dayGridMonth",
        events: [],
        eventContent: this.renderEventContent,
      },
      userId: "",
      isPopupActive: true,
    };
  },
  watch: {
    popupActive(newValue) {
      if (newValue) {
        this.$el.style.zIndex = "-1"; 
      } else {
        this.$el.style.zIndex = "0"; 
      }
    },
  },
  mounted() {
    this.userId = this.getCookie("userId");
    console.log("User ID from cookie:", this.userId); 
    if (this.userId) {
      this.fetchTasks();
    } else {
      console.error("User ID not found in cookies");
    }
  },
  methods: {
    getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(";").shift();
      return null;
    },
    async fetchTasks() {
      try {
        const userEmail = this.getCookie("userEmail"); 
        let url = `${process.env.VUE_APP_API_BASE_URL}/api/task/user/${this.userId}`;
        if (userEmail) {
          url += `?userEmail=${encodeURIComponent(userEmail)}`;
        }


        const response = await axios.get(url);
        console.log("API Response:", response.data); 
        if (Array.isArray(response.data)) {
          const events = this.transformTasksToEvents(response.data);
          this.calendarOptions.events = events;
        } else {
          console.error("Unexpected API response format:", response.data);
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    },

    transformTasksToEvents(tasksData) {
      if (!Array.isArray(tasksData)) {
        console.error("Expected tasksData to be an array:", tasksData);
        return [];
      }
      return tasksData.map((task) => {
        let backgroundColor, borderColor, textColor;
        switch (task.status) {
          case "ongoing":
            backgroundColor = "#ffc107";
            borderColor = "#ffc107";
            textColor = "#000000";
            break;
          case "over":
            backgroundColor = "#dc3545";
            borderColor = "#dc3545";
            textColor = "#ffffff";
            break;
          case "done":
            backgroundColor = "#28a745";
            borderColor = "#28a745";
            textColor = "#ffffff";
            break;
          case "pending":
            backgroundColor = "#6c757d";
            borderColor = "#6c757d";
            textColor = "#ffffff";
            break;
          default:
            backgroundColor = "#007bff";
            borderColor = "#007bff";
            textColor = "#ffffff";
        }
        return {
          id: task.taskId,
          title: task.title,
          start: task.create_At,
          end: task.finish_At,
          description: task.description,
          boardName: task.boardName,
          status: task.status,
          backgroundColor,
          borderColor,
          textColor,
        };
      });
    },
    renderEventContent(eventInfo) {
      return {
        html: `<div><b>${eventInfo.timeText}</b> <i>${eventInfo.event.title}</i> - <b>${eventInfo.event.extendedProps.boardName}</b></div> `,
      };
    },
  },
};
</script>


<style scoped>
.calendar {
  position: relative;
  margin-left: 300px; 
  margin-top: 60px;
  padding: 0 20px;
  transition: margin-left 0.3s ease, width 0.3s ease;
  display: block;
  z-index: 1;
  
}

.popup-active {
  z-index: -1;
}

.collapsed-sidebar .calendar {
  margin-left: 0px;
  margin-top: 60px;
  padding-right: 0;
  position: relative;
  z-index: 1;
}
.collapsed-sidebar{
  margin-left: 50px;
}
.fc-scrollgrid-liquid {
  z-index: 0;
}
.fc-view, .fc-scroller, .fc-scrollgrid {
  z-index: 0 !important;
  position: relative !important;
}
</style>