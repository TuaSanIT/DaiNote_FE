<template>
  <div class="filter-bar">
    <select v-model="selectedStatus" @change="applyFilters">
      <option value="">All Status</option>
      <option value="ongoing">Ongoing</option>
      <option value="pending">Pending</option>
      <option value="done">Done</option>
      <option value="over">Over</option>
    </select>

    <select v-model="selectedAvailableCheck" @change="applyFilters">
      <option value="">All Availability</option>
      <option :value="true">Available</option>
      <option :value="false">Unavailable</option>
    </select>

    <button @click="resetFilters">Reset</button>
    <button @click="downloadPdf" class="pdf-button">
      <i class="bi bi-filetype-pdf"></i>
    </button>
    <button @click="triggerFileUpload" class="excel-button">
      <i class="bi bi-file-earmark-excel"></i>
    </button>
    <input
      type="file"
      ref="excelInput"
      style="display: none"
      accept=".xls,.xlsx"
      @change="importExcel"
    />
  </div>
</template>

<script>
import { useToast } from "vue-toastification";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default {
  props: ["boardId", "onFilter"],
  data() {
    return {
      selectedStatus: "",
      selectedAvailableCheck: "",
      emailFilter: false,
    };
  },
  created() {
    this.fetchCollaboratorEmail();
  },
  methods: {
    async fetchCollaboratorEmail() {
      try {
        const response = await fetch(
          `${process.env.VUE_APP_API_BASE_URL}/api/Collaborator/${this.boardId}`
        );
        const data = await response.json();
        this.emailFilter = data === 1;
        this.applyFilters();
      } catch (error) {
        console.error("Failed to fetch collaborator data", error);
      }
    },
    applyFilters() {
      const filters = {
        status: this.selectedStatus,
        availableCheck: this.selectedAvailableCheck,
        emailFilter: this.emailFilter,
      };
      this.$emit("filter", filters);
    },
    resetFilters() {
      this.selectedStatus = "";
      this.selectedAvailableCheck = "";
      this.emailFilter = false;
      this.applyFilters();
    },
    async downloadPdf() {
      const toast = useToast();

      try {
        const response = await fetch(
          `${process.env.VUE_APP_API_BASE_URL}/api/Pdf/generate-report?boardId=${this.boardId}`,
          { method: "GET" }
        );

        if (!response.ok) {
          throw new Error("Failed to download the PDF.");
        }

        const reportData = await response.json();
        this.generatePdf(reportData);

        toast.success("Download PDF file successful");
      } catch (error) {
        console.error("Error downloading the PDF:", error);
        toast.error("Failed to download the PDF.");
      }
    },
    generatePdf(reportData) {
      const doc = new jsPDF();

      const titleFont = { fontSize: 16, fontStyle: "bold" };
      const sectionFont = { fontSize: 12, fontStyle: "bold" };
      const bodyFont = { fontSize: 10 };

      const text = (content, x, y, font) => {
        if (content) {
          doc.setFontSize(font.fontSize);
          doc.setFont("times", font.fontStyle);
          doc.text(content, x, y);
        }
      };

      try {
        text("Monthly Task Report", 20, 20, titleFont);
        text("Tasks Created This Month", 20, 30, sectionFont);

        let yPosition = 40; 

        if (
          !reportData.tasksCreatedThisMonth ||
          !reportData.tasksCreatedThisMonth.length
        ) {
          text("No tasks created this month.", 20, yPosition, bodyFont);
          yPosition += 10; 
        } else {
          doc.autoTable({
            startY: yPosition,
            head: [["Task Title", "Created At", "Finished At"]],
            body: reportData.tasksCreatedThisMonth.map((task) => [
              task.title || "",
              task.create_At || "",
              task.finish_At || "N/A",
            ]),
          });
          yPosition = doc.autoTable.previous.finalY + 10; 
        }

        text("Tasks Done This Month", 20, yPosition, sectionFont);
        yPosition += 10; 

        if (
          !reportData.tasksDoneThisMonth ||
          !reportData.tasksDoneThisMonth.length
        ) {
          text("No tasks done this month.", 20, yPosition, bodyFont);
          yPosition += 10; 
        } else {
          doc.autoTable({
            startY: yPosition,
            head: [["Task Title", "Created At", "Finished At"]],
            body: reportData.tasksDoneThisMonth.map((task) => [
              task.title || "",
              task.create_At || "",
              task.finish_At || "",
            ]),
          });
          yPosition = doc.autoTable.previous.finalY + 10; 
        }

        text("Tasks Over This Month", 20, yPosition, sectionFont);
        yPosition += 10; 

        if (
          !reportData.tasksOverThisMonth ||
          !reportData.tasksOverThisMonth.length
        ) {
          text("No tasks over this month.", 20, yPosition, bodyFont);
        } else {
          doc.autoTable({
            startY: yPosition,
            head: [["Task Title", "Created At", "Finished At"]],
            body: reportData.tasksOverThisMonth.map((task) => [
              task.title || "",
              task.create_At || "",
              task.finish_At || "",
            ]),
          });
        }

        doc.save("MonthlyTaskReport.pdf");
      } catch (error) {
        console.error("Error generating PDF:", error);
      }
    },
    triggerFileUpload() {
      this.$refs.excelInput.click();
    },
    async importExcel(event) {
      const toast = useToast();

      if (!event.target.files || event.target.files.length === 0) {
        toast.error("No file selected.");
        return;
      }

      const file = event.target.files[0];
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch(
          `${process.env.VUE_APP_API_BASE_URL}/api/Board/${this.boardId}/import`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (response.ok) {
          toast.success("Import successful.");
          this.$emit("refresh");
        } else if (response.status === 400) {
          toast.error("This board cannot import an Excel file.");
        } else {
          throw new Error("Unexpected error during import.");
        }
      } catch (error) {
        console.error("Error importing Excel file:", error);
        toast.error("Failed to import Excel file.");
      } finally {
        event.target.value = "";
      }
    },
  },
};
</script>

<style scoped>
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 925px;
  height: 40px;
  padding: 5px 10px;
  background-color: #f5f5f5;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  margin-left: 345px;
  margin-top: 50px;
}

.filter-bar select {
  padding: 5px;
  margin: 0 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  flex-grow: 1;
}

.filter-bar button {
  padding: 5px 15px;
  margin: 0 5px;
  border: none;
  border-radius: 5px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
}

.filter-bar button:hover {
  background-color: #0056b3;
}

.filter-bar .pdf-button {
  background-color: red;
  color: white;
  font-size: 18px;
}

.filter-bar .pdf-button:hover {
  background-color: #c9302c;
}

.filter-bar .excel-button {
  background-color: green;
  color: white;
  font-size: 18px;
}

.filter-bar .excel-button:hover {
  background-color: #218838;
}
</style>