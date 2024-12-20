<template>
    <div class="popup-overlay" @click.self="closePopup">
      <div class="popup-content">
        <h3>Please choose the file with the right template</h3>
        <p>
          If you don't have the file, please download it
          <a :href="templatePath" download class="download-link">here</a>.
        </p>
        <div class="popup-buttons">
          <button class="add-file" @click="triggerFileInput">Add File</button>
          <button class="cancel" @click="closePopup">Cancel</button>
        </div>
        <input
          type="file"
          ref="fileInput"
          style="display: none"
          accept=".xls,.xlsx"
          @change="uploadFile"
        />
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: ["templatePath"],
    emits: ["fileSelected", "close"],
    methods: {
      triggerFileInput() {
        this.$refs.fileInput.click();
      },
      uploadFile(event) {
        const file = event.target.files[0];
        if (file) {
          this.$emit("fileSelected", file); // Send the file back to parent
          this.$emit("close");
        }
      },
      closePopup() {
        this.$emit("close"); // Close the popup
      },
    },
  };
  </script>
  
  <style scoped>
  .popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999;
  }
  
  .popup-content {
    background: #fff;
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.2);
    text-align: center;
    width: 350px;
    animation: fadeIn 0.3s ease-in-out;
  }
  
  .popup-content h3 {
    font-size: 20px;
    margin-bottom: 15px;
    font-weight: bold;
    color: #333;
  }
  
  .popup-content p {
    font-size: 14px;
    color: #555;
    margin-bottom: 20px;
  }
  
  .download-link {
    color: #007bff;
    font-weight: bold;
    text-decoration: none;
  }
  
  .download-link:hover {
    text-decoration: underline;
    color: #0056b3;
  }
  
  .popup-buttons {
    margin-top: 10px;
    display: flex;
    justify-content: center;
    gap: 15px;
  }
  
  .popup-buttons button {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    transition: background 0.2s ease, transform 0.2s ease;
  }
  
  .add-file {
    background-color: #28a745;
    color: white;
    font-weight: bold;
  }
  
  .add-file:hover {
    background-color: #218838;
    transform: scale(1.05);
  }
  
  .cancel {
    background-color: #dc3545;
    color: white;
    font-weight: bold;
  }
  
  .cancel:hover {
    background-color: #c82333;
    transform: scale(1.05);
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
  </style>
  