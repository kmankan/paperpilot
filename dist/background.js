/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/background.ts":
/*!***************************!*\
  !*** ./src/background.ts ***!
  \***************************/
/***/ (function() {


/// <reference types="chrome"/>
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Helper function to check if a tab is ready for messaging
function isTabReady(tabId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield chrome.tabs.sendMessage(tabId, { type: 'PING' });
            return true;
        }
        catch (_a) {
            return false;
        }
    });
}
// Helper function to wait for tab to be ready
function waitForTab(tabId_1) {
    return __awaiter(this, arguments, void 0, function* (tabId, maxAttempts = 10) {
        for (let i = 0; i < maxAttempts; i++) {
            if (yield isTabReady(tabId)) {
                return true;
            }
            yield new Promise(resolve => setTimeout(resolve, 1000));
        }
        return false;
    });
}
chrome.webNavigation.onCompleted.addListener((details) => __awaiter(void 0, void 0, void 0, function* () {
    if (details.url.toLowerCase().endsWith('.pdf')) {
        // Wait for content script to be ready
        const isReady = yield waitForTab(details.tabId);
        if (isReady) {
            chrome.tabs.sendMessage(details.tabId, {
                type: 'PDF_LOADED',
                url: details.url
            });
        }
        else {
            console.error('Content script not ready after maximum attempts');
        }
    }
}), { url: [{ pathSuffix: '.pdf' }] });


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/background.ts"]();
/******/ 	
/******/ })()
;
//# sourceMappingURL=background.js.map