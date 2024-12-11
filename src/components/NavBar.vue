<template>

  <v-app-bar app color="black" dark flat class="px-12 sticky-navbar">

    <v-img src="../assets/logo_dai.png" class="logo"></v-img>

    <v-spacer></v-spacer>
    <v-btn text @click="scroll('home')" class="text-yellow">Home</v-btn>
    <v-btn text @click="scroll('portfolio')">Portfolio</v-btn>
    <v-btn text @click="scroll('services')">Services</v-btn>
    <v-btn text @click="scroll('contact')">Contact</v-btn>
  </v-app-bar>

</template>

<script>
export default {
  methods: {
    scroll(refName) {
      const element = document.getElementById(refName);
      element.scrollIntoView({ behavior: "smooth" });
    },
  },
};
</script>

<style scoped>


#icon {
  width: 30px;
  cursor: pointer;
}

.sticky-navbar {
  position: sticky; 
  top: 0;          
  z-index: 1000;   
}

.logo {
  display: flex;
  margin-left: 0;
}
</style>
