import { LocalStorageHelper } from "../content/localStorageHelper";
import { localStorageMock } from "./mocks/localStorageMock"

const xhr2 = require('xhr2');

global.XMLHttpRequest = xhr2.XMLHttpRequest;

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