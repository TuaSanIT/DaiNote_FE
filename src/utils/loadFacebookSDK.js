
export const loadFacebookSDK = () => {
    return new Promise((resolve, reject) => {
      if (window.FB) {
        resolve(); // FB is already loaded
        return;
      }
  
      window.fbAsyncInit = function () {
        window.FB.init({
          appId: 'YOUR_APP_ID', // Replace with your app ID
          autoLogAppEvents: true,
          xfbml: true,
          version: 'v13.0', // Use the latest version
        });
        resolve();
      };
  
      const script = document.createElement('script');
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.onload = () => {
        if (window.FB) {
          window.FB.init();
          resolve();
        } else {
          reject('Facebook SDK not loaded');
        }
      };
      document.body.appendChild(script);
    });
  };
  