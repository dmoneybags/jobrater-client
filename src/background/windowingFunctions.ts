const POPUPTITLE = "ApplicantIQ";

export class WindowingFunctions {
    static async getCurrentTab() {
      let queryOptions = { active: true, lastFocusedWindow: true };
      // `tab` will either be a `tabs.Tab` instance or `undefined`.
      let [tab] = await chrome.tabs.query(queryOptions);
      return tab;
    }
    //Not currently working
    static async closeWindow() {
      console.log("CLOSING WINDOWS");
      console.log("CURRENT WINDOW: ");
      const currentWindow: number = (await chrome.storage.local.get("currentWindow"))["currentWindow"];
      console.log(currentWindow);
      if (currentWindow){
        try {
          const windows = await chrome.windows.getAll();
          console.log("AVAILABLE WINDOWS");
          for (const window of windows) {
            console.log(window);
          }
          console.log("REMOVING WINDOW");
          await chrome.windows.remove(currentWindow);
          console.log("SUCCESSFULLY REMOVED WINDOW");
          chrome.storage.local.set({"currentWindow": null});
        } catch (error) {
          console.error("Error closing window:", error);
          const windows = await chrome.windows.getAll();
          console.log("AVAILABLE WINDOWS");
          for (const window of windows) {
            console.log(window);
          }
        }
      }
    }
    static createDetachedWindow = async (options: Record<string, any>) => {
      const queryString = options
      ? "&" + Object.entries(options)
            .filter(([key, value]) => value != null) // Exclude null or undefined values
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&')
      : '';
      const window = await chrome.windows.create({
          url: 'dist/popup.html?windowType=detached' + queryString, // The HTML page you want to load
          type: 'popup', // Makes the window detached without the usual browser controls
          width: 400,
          height: 630,
          focused: true // Ensures the window is brought to the front
        })
      window.alwaysOnTop = true;
      await chrome.storage.local.set({"currentWindow": window.id});
      // Save the window ID to use later for resizing
      const windowId = window.id;
      console.log("SETTING CURRENT WINDOW TO:");
      console.log(windowId);
    }
    static createOrRefreshWindow = async (options: Record<string, any>=null) => {
      console.log("RELOADING WINDOW");
      await WindowingFunctions.closeWindow();
      await WindowingFunctions.createDetachedWindow(options);
    }
}