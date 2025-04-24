const { configureStore } = require("@reduxjs/toolkit");
const { navigationReducer } = require("./navigationSlice");
const createSagaMiddleware = require("redux-saga").default;
const { navigationSaga } = require("./navigationSaga");
const { puppeteerSaga } = require("./puppeteerSaga");
const { all } = require("redux-saga/effects");

// Create saga middleware
const sagaMiddleware = createSagaMiddleware();

// Configure store with saga middleware
const store = configureStore({
  reducer: {
    navigation: navigationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: false }).concat(sagaMiddleware),
});

// Run sagas
function* rootSaga() {
  yield all([navigationSaga(), puppeteerSaga()]);
}
if (process.env.NODE_ENV !== "test") {
  sagaMiddleware.run(rootSaga);
}

module.exports = store;
