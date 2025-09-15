<template>
  <v-main class="modern-setup-main">
    <v-container class="fill-height d-flex align-center justify-center" fluid>
      <v-row align="center" justify="center" class="w-100">
        <v-col cols="12" sm="10" md="8" lg="6" xl="5">
          <div class="setup-container">
            <!-- Welcome Header -->
            <div class="welcome-header text-center mb-8">
              <div class="icon-container mb-6">
                <AppLogo :size="80" :glow="true" class="welcome-icon" />
                <div class="icon-glow"></div>
              </div>
              <h1 class="welcome-title gradient-text mb-3">Welcome to Simple PvP</h1>
            </div>

            <!-- Setup Card -->
            <v-card class="modern-setup-card glass-effect" elevation="0">
              <v-card-title class="setup-card-title">
                <div class="d-flex align-center justify-center">
                  <h3>API Key Configuration</h3>
                </div>
              </v-card-title>
            
              <v-card-text class="setup-card-content">
                <div class="mb-6">
                  <p class="text-body-1 mb-4 text-center">
                    Connect your SimpleMMO account
                  </p>


                </div>

                <!-- Instructions -->
                <div class="instructions-section mb-6">
                  <h4 class="mb-3 d-flex align-center justify-center">
                    <v-icon size="20" color="accent" class="mr-2">mdi-information</v-icon>
                    Setup Instructions
                  </h4>
                  <div class="instruction-steps">
                    <div class="instruction-step">
                      <div class="step-number">1</div>
                      <div class="step-content-centered">
                        <strong>Visit the API page</strong>
                        <p class="text-body-2 text-on-surface-variant">Click the button below to open Simple MMO's API page</p>
                      </div>
                    </div>
                    <div class="instruction-step">
                      <div class="step-number">2</div>
                      <div class="step-content-centered">
                        <strong>Copy your API key</strong>
                        <p class="text-body-2 text-on-surface-variant">Log in and copy your personal API key</p>
                      </div>
                    </div>
                    <div class="instruction-step">
                      <div class="step-number">3</div>
                      <div class="step-content-centered">
                        <strong>Paste and validate</strong>
                        <p class="text-body-2 text-on-surface-variant">Enter your key below and we'll verify it</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- API Page Button -->
                <v-btn
                  color="primary"
                  variant="flat"
                  prepend-icon="mdi-open-in-new"
                  @click="openApiPage"
                  size="large"
                  block
                  class="modern-btn mb-6"
                >
                  Get Your API Key
                </v-btn>
              
                <!-- API Key Input -->
                <div class="api-input-section">
                  <v-text-field
                    v-model="apiKey"
                    label="API Key"
                    placeholder="Enter your Simple MMO API Key"
                    variant="outlined"
                    prepend-inner-icon="mdi-key"
                    :loading="validating"
                    :error="hasError"
                    :error-messages="errorMessage"
                    :disabled="validating"
                    @keyup.enter="validateAndSave"
                    density="comfortable"
                    class="modern-input mb-4"
                    hide-details="auto"
                  ></v-text-field>

                  <!-- Progress indicator during validation -->
                  <v-card
                    v-if="validating"
                    class="validation-progress glass-effect mb-4"
                    elevation="0"
                  >
                    <v-card-text class="pa-4">
                      <v-row align="center" no-gutters>
                        <v-col cols="auto">
                          <v-progress-circular
                            indeterminate
                            size="28"
                            width="3"
                            color="primary"
                          ></v-progress-circular>
                        </v-col>
                        <v-col class="ml-4">
                          <div class="text-body-1 font-weight-medium mb-1">
                            {{ validationStep }}
                          </div>
                          <div class="text-body-2 text-on-surface-variant">
                            {{ validationMessage }}
                          </div>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
              
                  <!-- Action Buttons -->
                  <div class="action-buttons">
                    <v-btn
                      color="success"
                      size="large"
                      :loading="validating"
                      :disabled="!apiKey || apiKey.length < 10 || validating"
                      @click="validateAndSave"
                      prepend-icon="mdi-check-circle"
                      block
                      class="modern-btn primary-action mb-3"
                    >
                      {{ validating ? 'Validating...' : 'Connect & Validate' }}
                    </v-btn>

                    <!-- Retry button for failed attempts -->
                    <v-btn
                      v-if="hasError && !validating && retryCount > 0"
                      color="primary"
                      variant="outlined"
                      size="large"
                      @click="validateAndSave"
                      prepend-icon="mdi-refresh"
                      block
                      class="modern-btn mb-3"
                    >
                      Try Again ({{ maxRetries - retryCount }} attempts left)
                    </v-btn>
                  </div>
                </div>
              </v-card-text>

              <!-- Security & Status Footer -->
              <v-card-text class="setup-footer pt-0">
                <v-divider class="mb-4"></v-divider>

                <div class="security-info">
                  <div class="security-item mb-2">
                    <v-icon size="16" color="success" class="mr-2">mdi-shield-check</v-icon>
                    <span class="text-body-2">Your API key is stored securely on your device</span>
                  </div>

                  <div class="security-item mb-2">
                    <v-icon size="16" color="info" class="mr-2">mdi-lock</v-icon>
                    <span class="text-body-2">All connections use HTTPS encryption</span>
                  </div>

                  <!-- Connection status -->
                  <div class="security-item">
                    <v-icon
                      size="16"
                      class="mr-2"
                      :color="isOnline ? 'success' : 'error'"
                    >
                      {{ isOnline ? 'mdi-wifi' : 'mdi-wifi-off' }}
                    </v-icon>
                    <span class="text-body-2">
                      {{ isOnline ? 'Connected to internet' : 'No internet connection' }}
                    </span>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script lang="ts">
import axios from 'axios';
import AppLogo from '../misc/AppLogo.vue';

export default {
  name: "ApiKeySetup",
  components: {
    AppLogo
  },
  data() {
    return {
      apiKey: '',
      validating: false,
      hasError: false,
      errorMessage: '',
      validationStep: '',
      validationMessage: '',
      retryCount: 0,
      maxRetries: 3,
      isOnline: navigator.onLine
    };
  },
  mounted() {
    // Listen for online/offline events
    window.addEventListener('online', this.updateOnlineStatus);
    window.addEventListener('offline', this.updateOnlineStatus);
  },
  beforeUnmount() {
    // Clean up event listeners
    window.removeEventListener('online', this.updateOnlineStatus);
    window.removeEventListener('offline', this.updateOnlineStatus);
  },
  methods: {
    openApiPage() {
      // Open the API page in the user's default browser
      window.open('https://web.simple-mmo.com/p-api/home', '_blank');
    },
    
    async validateAndSave() {
      if (!this.apiKey || this.apiKey.length < 10) {
        this.showError('Please enter a valid API key');
        return;
      }

      // Check internet connectivity first
      if (!navigator.onLine) {
        this.showError('No internet connection. Please check your connection and try again.');
        return;
      }

      this.validating = true;
      this.hasError = false;
      this.errorMessage = '';
      this.retryCount = 0;

      await this.attemptValidation();
    },

    async attemptValidation() {
      try {
        this.updateValidationProgress('Connecting...', 'Establishing connection to Simple MMO API');

        // Add a small delay to show the progress indicator
        await this.delay(500);

        this.updateValidationProgress('Validating API Key...', 'Checking your credentials with Simple MMO');

        // Validate the API key by making a test request
        const url = `https://api.simple-mmo.com/v1/player/me`;
        const response = await axios.post(url, {
          api_key: this.apiKey
        }, {
          timeout: 10000, // 10 second timeout
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.status === 200 && response.data) {
          this.updateValidationProgress('Success!', 'Saving your configuration...');

          // API key is valid, save it
          const { id } = response.data;
          const guildId = response.data.guild?.id;

          if (!id) {
            throw new Error('Invalid response: Missing user ID');
          }

          // Save user data
          this.$store.dispatch("user/setUserId", { userId: id });
          if (guildId) {
            this.$store.dispatch("user/setGuildId", { guildId: guildId });
          }

          // Save API key
          this.$store.dispatch("settings/saveAPIKey", { api_key: this.apiKey });

          await this.delay(1000); // Show success message briefly

          this.$toast.success("API Key saved successfully! Welcome to Simple PvP!");

          // Emit event to parent to switch to main view
          this.$emit('apiKeyConfigured');

        } else {
          throw new Error('Invalid response from API');
        }
      } catch (error) {
        console.error('API validation error:', error);
        await this.handleValidationError(error);
      } finally {
        this.validating = false;
        this.validationStep = '';
        this.validationMessage = '';
      }
    },

    async handleValidationError(error: any) {
      this.retryCount++;

      let errorMessage = '';
      let shouldRetry = false;

      if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        errorMessage = 'Network connection failed. Please check your internet connection.';
        shouldRetry = true;
      } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        errorMessage = 'Request timed out. The server might be slow or unreachable.';
        shouldRetry = true;
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        errorMessage = 'Invalid API key. Please check your key and try again.';
        shouldRetry = false;
      } else if (error.response?.status === 429) {
        errorMessage = 'Too many requests. Please wait a moment and try again.';
        shouldRetry = true;
      } else if (error.response?.status >= 500) {
        errorMessage = 'Simple MMO server error. Please try again in a few moments.';
        shouldRetry = true;
      } else if (error.message?.includes('Invalid response')) {
        errorMessage = 'Unexpected response from server. Please try again.';
        shouldRetry = false;
      } else {
        errorMessage = 'Connection error. Please check your internet connection and try again.';
        shouldRetry = true;
      }

      if (shouldRetry && this.retryCount < this.maxRetries) {
        this.updateValidationProgress(
          `Retrying... (${this.retryCount}/${this.maxRetries})`,
          `${errorMessage} Attempting to reconnect...`
        );

        await this.delay(2000); // Wait 2 seconds before retry
        await this.attemptValidation();
      } else {
        if (this.retryCount >= this.maxRetries) {
          errorMessage += ` Failed after ${this.maxRetries} attempts.`;
        }
        this.showError(errorMessage);
      }
    },
    
    showError(message: string) {
      this.hasError = true;
      this.errorMessage = message;
      this.$toast.error(message);
    },

    updateValidationProgress(step: string, message: string) {
      this.validationStep = step;
      this.validationMessage = message;
    },

    delay(ms: number) {
      return new Promise(resolve => setTimeout(resolve, ms));
    },

    updateOnlineStatus() {
      this.isOnline = navigator.onLine;
      if (!this.isOnline && this.validating) {
        this.validating = false;
        this.showError('Internet connection lost. Please check your connection and try again.');
      }
    }
  }
};
</script>

<style scoped>
.modern-setup-main {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.setup-container {
  max-width: 100%;
  margin: 0 auto;
  width: 100%;
}

.welcome-header {
  position: relative;
}

.icon-container {
  position: relative;
  display: inline-block;
}

.welcome-icon {
  position: relative;
  z-index: 2;
  filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.3));
}

.icon-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120px;
  height: 120px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  border-radius: 50%;
  z-index: 1;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.7;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.1);
    opacity: 1;
  }
}

.welcome-title {
  font-size: 2.5rem;
  font-weight: 700;
  letter-spacing: -0.025em;
}

.welcome-subtitle {
  font-size: 1.125rem;
  font-weight: 400;
}

.modern-setup-card {
  background: rgba(26, 26, 26, 0.85) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.modern-setup-card:hover {
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.setup-card-title {
  padding: 24px 24px 16px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  text-align: center;
}

.setup-card-content {
  padding: 24px;
  text-align: center;
}



.feature-item:hover {
  background: rgba(58, 58, 58, 0.6);
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.instructions-section {
  background: rgba(42, 42, 42, 0.6);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  text-align: left;
  max-width: 500px;
  margin: 0 auto;
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

.instruction-steps {
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: center;
}

.instruction-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
  max-width: 300px;
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #4a4a4a 0%, #6a6a6a 100%);
  color: white;
  border-radius: 50%;
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.step-content {
  flex: 1;
  padding-top: 4px;
}

.step-content-centered {
  text-align: center;
  margin-top: 8px;
}

.step-content strong {
  display: block;
  margin-bottom: 4px;
  color: rgb(var(--v-theme-on-surface));
}

.modern-input {
  transition: all 0.3s ease;
}

.modern-input:hover {
  transform: translateY(-1px);
}

.validation-progress {
  background: rgba(42, 42, 42, 0.8) !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.modern-btn {
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.025em;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  height: 48px;
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.modern-btn:hover {
  transform: translateY(-2px);
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.1) !important;
}

.primary-action {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
  color: white !important;
}

.primary-action:hover {
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
}

.setup-footer {
  padding: 16px 24px 24px 24px;
}

.security-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  text-align: center;
}

.security-item {
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.8;
  transition: opacity 0.3s ease;
}

.security-item:hover {
  opacity: 1;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .welcome-title {
    font-size: 2rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .instruction-step {
    flex-direction: column;
    text-align: center;
  }

  .step-number {
    align-self: center;
  }
}
</style>

<style scoped>
.v-card {
  border-radius: 16px;
}

.text-h6 {
  color: rgb(var(--v-theme-on-surface));
  opacity: 0.8;
}

ol {
  margin-left: 1rem;
}

ol li {
  color: rgb(var(--v-theme-on-surface));
  opacity: 0.9;
}

/* Progress indicator animations */
.v-progress-circular {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
  100% {
    opacity: 1;
  }
}

/* Smooth transitions for error states */
.v-text-field {
  transition: all 0.3s ease;
}

/* Enhanced button styling */
.v-btn {
  transition: all 0.2s ease;
}

.v-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
</style>
