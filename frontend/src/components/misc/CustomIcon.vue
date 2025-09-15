<template>
  <img
    :src="iconSrc"
    :alt="name"
    class="custom-icon"
    :style="iconStyle"
    @error="handleImageError"
  />
</template>

<script lang="ts">
export default {
  name: "CustomIcon",
  props: {
    name: {
      type: String,
      required: true
    },
    size: {
      type: [String, Number],
      default: 24
    },
    extension: {
      type: String,
      default: 'png'
    }
  },
  data() {
    return {
      iconSrc: '',
      imageError: false
    };
  },
  computed: {
    iconStyle() {
      return {
        width: `${this.size}px`,
        height: `${this.size}px`,
        display: 'inline-block',
        objectFit: 'contain' as const
      };
    }
  },
  async mounted() {
    await this.loadIcon();
  },
  watch: {
    name: {
      handler: 'loadIcon',
      immediate: false
    }
  },
  methods: {
    async loadIcon() {
      try {
        // Dynamically import the PNG file
        const iconModule = await import(`../../assets/icons/${this.name}.${this.extension}`);
        this.iconSrc = iconModule.default;
        this.imageError = false;
      } catch (error) {
        console.warn(`Icon "${this.name}.${this.extension}" not found in assets/icons/`);
        this.handleImageError();
      }
    },
    handleImageError() {
      this.imageError = true;
      // You can set a fallback image here if needed
      // this.iconSrc = '/path/to/fallback-icon.png';
    }
  }
};
</script>

<style scoped>
.custom-icon {
  vertical-align: middle;
  max-width: 100%;
  max-height: 100%;
  border-radius: 0;
  /* Smooth scaling for high-res images */
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
}

/* For retina displays */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .custom-icon {
    image-rendering: auto;
  }
}
</style>
