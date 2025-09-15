<template>
  <v-main style="height: 100vh; overflow: hidden">
    <v-container class="fill-height" fluid>
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="6" lg="4">
          <v-card class="elevation-12 pa-6">
            <v-card-title class="text-center mb-4">
              <v-icon size="64" color="primary" class="mb-4">mdi-key</v-icon>
              <h2>Welcome to Simple PvP!</h2>
            </v-card-title>
            
            <v-card-text class="text-center">
              <p class="text-h6 mb-4">
                To get started, you'll need to set up your Simple MMO API key.
              </p>
              
              <v-divider class="my-4"></v-divider>
              
              <div class="mb-4">
                <h3 class="mb-2">How to get your API key:</h3>
                <ol class="text-left">
                  <li class="mb-2">Visit the Simple MMO API page</li>
                  <li class="mb-2">Log in to your Simple MMO account</li>
                  <li class="mb-2">Copy your API key</li>
                  <li class="mb-2">Paste it in the field below</li>
                </ol>
              </div>
              
              <v-btn
                color="primary"
                variant="outlined"
                prepend-icon="mdi-open-in-new"
                @click="openApiPage"
                class="mb-4"
                block
              >
                Get Your API Key
              </v-btn>
              
              <v-divider class="my-4"></v-divider>
              
              <v-text-field
                v-model="apiKey"
                label="Enter your API Key"
                placeholder="Your Simple MMO API Key"
                variant="outlined"
                prepend-inner-icon="mdi-key"
                :loading="validating"
                :error="hasError"
                :error-messages="errorMessage"
                :disabled="validating"
                @keyup.enter="validateAndSave"
                class="mb-4"
              ></v-text-field>

              <!-- Progress indicator during validation -->
              <v-card
                v-if="validating"
                class="mb-4 pa-4"
                color="primary"
                variant="tonal"
              >
                <v-row align="center" no-gutters>
                  <v-col cols="auto">
                    <v-progress-circular
                      indeterminate
                      size="24"
                      width="3"
                      color="primary"
                    ></v-progress-circular>
                  </v-col>
                  <v-col class="ml-3">
                    <div class="text-body-2 font-weight-medium">
                      {{ validationStep }}
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      {{ validationMessage }}
                    </div>
                  </v-col>
                </v-row>
              </v-card>
              
              <v-btn
                color="success"
                size="large"
                :loading="validating"
                :disabled="!apiKey || apiKey.length < 10 || validating"
                @click="validateAndSave"
                prepend-icon="mdi-check"
                block
                class="mb-2"
              >
                {{ validating ? 'Validating...' : 'Save API Key' }}
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
                class="mb-2"
              >
                Try Again
              </v-btn>
              
              <!-- Network status and security info -->
              <div class="mt-4">
                <div class="text-caption text-medium-emphasis mb-2">
                  <v-icon size="small" class="mr-1">mdi-shield-check</v-icon>
                  Your API key is stored securely on your device
                </div>

                <!-- Connection status -->
                <div class="text-caption text-medium-emphasis">
                  <v-icon
                    size="small"
                    class="mr-1"
                    :color="isOnline ? 'success' : 'error'"
                  >
                    {{ isOnline ? 'mdi-wifi' : 'mdi-wifi-off' }}
                  </v-icon>
                  {{ isOnline ? 'Connected to internet' : 'No internet connection' }}
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script lang="ts">
import axios from 'axios';

export default {
  name: "ApiKeySetup",
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
