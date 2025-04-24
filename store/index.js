const { configureStore } = require("@reduxjs/toolkit");
const { navigationReducer } = require("./navigationSlice");

const store = configureStore({
  reducer: {
    navigation: navigationReducer,
  },
});

module.exports = store;
