import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";

export async function installExt() {
  try {
    // Check if we're in development mode
    if (process.env.NODE_ENV === "production") {
      console.log("Skipping Vue DevTools installation in production");
      return;
    }

    // Install Vue DevTools extension
    const name = await installExtension(VUEJS_DEVTOOLS, {
      loadExtensionOptions: {
        allowFileAccess: true,
      },
    });
    
    console.log(`Vue DevTools extension "${name}" installed successfully`);
  } catch (err: any) {
    // Handle common extension installation errors gracefully
    if (err.message) {
      if (err.message.includes("already exists") || err.message.includes("already installed")) {
        console.log("Vue DevTools extension is already installed");
        return;
      }
      
      if (err.message.includes("Invalid header") || err.message.includes("Cr24")) {
        console.log("Vue DevTools installation skipped (extension format issue - this is harmless)");
        return;
      }
      
      if (err.message.includes("ENOTFOUND") || err.message.includes("network")) {
        console.warn("Vue DevTools installation failed due to network issues (this is harmless)");
        return;
      }
    }
    
    // For any other errors, log them but don't crash the app
    console.warn("Vue DevTools installation failed (this is usually harmless):", err.message || err);
  }
}
