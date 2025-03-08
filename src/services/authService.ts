// Authentication service for Google Calendar
export const getAuthToken = async (): Promise<string> => {
  console.log('Getting auth token');
  return new Promise<string>((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: false }, (token) => {
      if (chrome.runtime.lastError) {
        console.error('Error getting auth token:', chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
      } else if (!token) {
        console.log('No token available, will try interactive auth');
        // Try interactive auth
        chrome.identity.getAuthToken({ interactive: true }, (interactiveToken) => {
          if (chrome.runtime.lastError || !interactiveToken) {
            console.error('Interactive auth failed:', chrome.runtime.lastError);
            reject(chrome.runtime.lastError || new Error('Failed to get token'));
          } else {
            console.log('Got interactive auth token');
            resolve(interactiveToken);
          }
        });
      } else {
        console.log('Got cached auth token');
        resolve(token);
      }
    });
  });
};

// Remove cached token
export const removeCachedToken = async (): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: false }, (token) => {
      if (!token) {
        console.log('No token to remove');
        resolve();
        return;
      }
      
      chrome.identity.removeCachedAuthToken({ token }, () => {
        if (chrome.runtime.lastError) {
          console.error('Error removing token:', chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
        } else {
          console.log('Token removed successfully');
          resolve();
        }
      });
    });
  });
};

// Get a fresh auth token (clear existing token first)
export const getFreshAuthToken = async (): Promise<string> => {
  try {
    // First remove any existing token
    await removeCachedToken();
    
    // Now get a new token with full UI prompt
    return await new Promise<string>((resolve, reject) => {
      chrome.identity.getAuthToken({ 
        interactive: true,
        scopes: [
          'https://www.googleapis.com/auth/calendar',
          'https://www.googleapis.com/auth/calendar.events'
        ]
      }, (token) => {
        if (chrome.runtime.lastError) {
          console.error('Failed to get fresh token:', chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
        } else if (!token) {
          reject(new Error('No token returned'));
        } else {
          console.log('Successfully got fresh token');
          resolve(token);
        }
      });
    });
  } catch (error) {
    console.error('Error getting fresh token:', error);
    throw error;
  }
}; 