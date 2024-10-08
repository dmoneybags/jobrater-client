const { LocalStorageHelper } =  require("../content/localStorageHelper");
const { localStorageMock } = require("./mocks/localStorageMock");

global.CLIENT_ENV = {
    ENVIRONMENT: 'development',
    PROD_API_URL: 'https://api.applicantiq.org/',
    DEV_API_URL: 'http://localhost:5001/',
  };

jest.spyOn(LocalStorageHelper, '__sendMessageToBgScript').mockImplementation((message) => {
    return new Promise((resolve) => {
        if (message.action === "storeData"){
            localStorageMock.setItem(message.key, message.value);
            resolve({ success: true, message: 'Data stored successfully' });
        } else if (message.action === "getData"){
            localStorageMock.getItem(message.key);
            resolve({ success: true, message: localStorageMock.getItem(message.key) });
        }
    });
})