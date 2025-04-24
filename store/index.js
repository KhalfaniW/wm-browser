const { configureStore } = require("@reduxjs/toolkit");
const { navigationReducer } = require("./navigationSlice");
const createSagaMiddleware = require("redux-saga").default;
const { navigationSaga } = require("./navigationSaga");

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
sagaMiddleware.run(navigationSaga);

module.exports = store;
