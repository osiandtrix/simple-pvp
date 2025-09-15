<template>
  <div class="icon-examples">
    <h3>Custom Icon Examples</h3>
    
    <!-- Example 1: Basic usage -->
    <div class="example-section">
      <h4>Basic Usage:</h4>
      <CustomIcon name="my-icon" :size="24" />
      <CustomIcon name="my-icon" :size="32" />
      <CustomIcon name="my-icon" :size="48" />
    </div>
    
    <!-- Example 2: In buttons -->
    <div class="example-section">
      <h4>In Buttons:</h4>
      <v-btn>
        <CustomIcon name="my-icon" :size="20" />
        <span class="ml-2">Button with Custom Icon</span>
      </v-btn>
    </div>
    
    <!-- Example 3: In app bar -->
    <div class="example-section">
      <h4>In App Bar:</h4>
      <v-app-bar density="compact">
        <v-btn icon>
          <CustomIcon name="my-icon" :size="24" />
        </v-btn>
        <v-app-bar-title>App with Custom Icon</v-app-bar-title>
      </v-app-bar>
    </div>
    
    <!-- Example 4: Different file types -->
    <div class="example-section">
      <h4>Different File Types:</h4>
      <CustomIcon name="icon1" extension="png" :size="32" />
      <CustomIcon name="icon2" extension="jpg" :size="32" />
      <CustomIcon name="icon3" extension="webp" :size="32" />
    </div>
  </div>
</template>

<script lang="ts">
import CustomIcon from './CustomIcon.vue';

export default {
  name: "IconExample",
  components: {
    CustomIcon
  }
};
</script>

<style scoped>
.icon-examples {
  padding: 20px;
}

.example-section {
  margin: 20px 0;
  padding: 15px;
  border: 1px solid #333;
  border-radius: 8px;
}

.example-section h4 {
  margin-bottom: 10px;
}
</style>
