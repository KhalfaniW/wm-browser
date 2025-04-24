// store/puppeteerSaga.js
const { call, put, takeLatest } = require("redux-saga/effects");
const puppeteer = require("puppeteer");
const {
  navigationSuccess,
  navigationFailed,
  puppeteerNavigateRequested,
} = require("./navigationSlice");

// Puppeteer browser/page state (for demo/test, not for production)
let browser = null;
let page = null;

// Worker saga: handles Puppeteer navigation
function* handlePuppeteerNavigate(action) {
  try {
    // Launch browser if not already
    if (!browser) {
      browser = yield call(puppeteer.launch, { headless: true });
    }
    // Get page if not already
    if (!page) {
      const pages = yield call([browser, browser.pages]);
      page = pages[0];
    }
    let url = action.payload;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }
    yield call([page, page.goto], url);
    yield put(navigationSuccess());
  } catch (error) {
    yield put(navigationFailed(error.message));
  }
}

// Watcher saga
function* puppeteerSaga() {
  yield takeLatest(puppeteerNavigateRequested.type, handlePuppeteerNavigate);
}

module.exports = {
  puppeteerSaga,
  handlePuppeteerNavigate,
  // For testability, expose browser/page for cleanup
  __test__: { setBrowser: (b) => (browser = b), setPage: (p) => (page = p) },
};
