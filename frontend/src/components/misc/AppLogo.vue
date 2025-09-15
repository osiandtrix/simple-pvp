<template>
  <div class="app-logo" :style="logoStyle">
    <img 
      :src="logoSrc" 
      :alt="alt"
      :style="imageStyle"
      @error="handleImageError"
      class="logo-image"
    />
  </div>
</template>

<script lang="ts">
import LogoImage from '../../assets/Logo.png';

export default {
  name: 'AppLogo',
  props: {
    size: {
      type: [Number, String],
      default: 32
    },
    alt: {
      type: String,
      default: 'Simple PvP Logo'
    },
    color: {
      type: String,
      default: 'primary'
    },
    glow: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      logoSrc: LogoImage,
      imageError: false
    };
  },
  computed: {
    logoStyle() {
      return {
        width: `${this.size}px`,
        height: `${this.size}px`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative' as const
      };
    },
    imageStyle() {
      const baseStyle = {
        width: '100%',
        height: '100%',
        objectFit: 'contain' as const,
        borderRadius: '0',
        imageRendering: '-webkit-optimize-contrast' as const
      };

      if (this.glow) {
        const sizeNum = typeof this.size === 'string' ? parseInt(this.size, 10) : this.size;
        return {
          ...baseStyle,
          filter: `drop-shadow(0 0 ${sizeNum * 0.3}px rgba(79, 70, 229, 0.5))`
        };
      }

      return baseStyle;
    }
  },
  methods: {
    handleImageError() {
      this.imageError = true;
      console.warn('App logo failed to load, falling back to default');
      // Could set a fallback here if needed
    }
  }
};
</script>

<style scoped>
.app-logo {
  vertical-align: middle;
  flex-shrink: 0;
}

.logo-image {
  transition: all 0.3s ease;
  max-width: 100%;
  max-height: 100%;
}

.logo-image:hover {
  transform: scale(1.05);
}

/* Ensure crisp rendering for the logo */
.logo-image {
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
  image-rendering: pixelated;
}

@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .logo-image {
    image-rendering: -webkit-optimize-contrast;
  }
}
</style>
