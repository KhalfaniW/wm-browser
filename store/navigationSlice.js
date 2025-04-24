const { createSlice } = require("@reduxjs/toolkit");

const initialState = {
  currentUrl: "",
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const navigationSlice = createSlice({
  name: "navigation",
  initialState,
  reducers: {
    setUrl: (state, action) => {
      state.currentUrl = action.payload;
    },
    startNavigation: (state) => {
      state.status = "loading";
      state.error = null;
    },
    navigationSuccess: (state) => {
      state.status = "succeeded";
      state.currentUrl = "";
      state.error = null;
    },
    navigationFailed: (state, action) => {
      state.status = "failed";
      state.error = action.payload;
    },
    resetStatus: (state) => {
      state.status = "idle";
      state.error = null;
    },
    // Action to trigger puppeteer navigation from saga
    puppeteerNavigateRequested: (state, action) => {
      state.status = "loading";
      state.error = null;
      state.currentUrl = action.payload;
    },
  },
});

module.exports = {
  navigationReducer: navigationSlice.reducer,
  ...navigationSlice.actions,
};
