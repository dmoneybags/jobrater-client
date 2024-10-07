const POPUPTITLE = "ApplicantIQ";

export class WindowingFunctions {
    static closeWindowsWithTitle(targetTitle: string) {
        chrome.windows.getAll({ populate: true }, (windows) => {
          windows.forEach((window) => {
            // Check each tab in the window
            window.tabs.forEach((tab) => {
              if (tab.title === targetTitle) {
                console.log(`Closing window with ID: ${window.id} and title: ${tab.title}`);
                chrome.windows.remove(window.id, () => {
                  if (chrome.runtime.lastError) {
                    console.error("Error closing window:", chrome.runtime.lastError);
                  }
                });
              }
            });
          });
        });
      }
    static createDetachedWindow = () => {
        chrome.windows.create({
            url: 'dist/popup.html', // The HTML page you want to load
            type: 'popup', // Makes the window detached without the usual browser controls
            width: 400,
            height: 630,
            focused: true // Ensures the window is brought to the front
          }, function(window) {
            // Save the window ID to use later for resizing
            const windowId = window.id;
          
            // Start a timer to monitor the window size and reset it if resized
            const intervalId = setInterval(() => {
              chrome.windows.get(windowId, (win) => {
                if (win) {
                  // If the window size has changed, reset it
                  if (win.width !== 400 || win.height !== 600) {
                    chrome.windows.update(windowId, {
                      width: 400,
                      height: 630
                    });
                  }
                } else {
                  // If the window has been closed, stop the interval
                  clearInterval(intervalId);
                }
              });
            }, 100); // Check every 100ms (adjust if necessary)
          });
    }
    static createOrRefreshWindow = () => {
        WindowingFunctions.closeWindowsWithTitle(POPUPTITLE);
        WindowingFunctions.createDetachedWindow();
    }
}