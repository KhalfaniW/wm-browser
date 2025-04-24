const {
  navigationReducer,
  setUrl,
  startNavigation,
  navigationSuccess,
  navigationFailed,
  resetStatus,
} = require("../navigationSlice");

describe("Navigation Slice", () => {
  let initialState;

  beforeEach(() => {
    initialState = {
      currentUrl: "",
      status: "idle",
      error: null,
    };
  });

  describe("reducers", () => {
    test("should handle initial state", () => {
      expect(navigationReducer(undefined, { type: "unknown" })).toEqual({
        currentUrl: "",
        status: "idle",
        error: null,
      });
    });

    test("should handle setUrl", () => {
      const url = "https://example.com";
      const actual = navigationReducer(initialState, setUrl(url));
      expect(actual.currentUrl).toEqual(url);
    });

    test("should handle startNavigation", () => {
      const actual = navigationReducer(initialState, startNavigation());
      expect(actual.status).toEqual("loading");
      expect(actual.error).toBeNull();
    });

    test("should handle navigationSuccess", () => {
      const loadingState = {
        currentUrl: "https://example.com",
        status: "loading",
        error: null,
      };
      const actual = navigationReducer(loadingState, navigationSuccess());
      expect(actual.status).toEqual("succeeded");
      expect(actual.currentUrl).toEqual("");
      expect(actual.error).toBeNull();
    });

    test("should handle navigationFailed", () => {
      const error = "Navigation failed";
      const actual = navigationReducer(initialState, navigationFailed(error));
      expect(actual.status).toEqual("failed");
      expect(actual.error).toEqual(error);
    });

    test("should handle resetStatus", () => {
      const errorState = {
        currentUrl: "",
        status: "failed",
        error: "Navigation failed",
      };
      const actual = navigationReducer(errorState, resetStatus());
      expect(actual.status).toEqual("idle");
      expect(actual.error).toBeNull();
    });
  });

  describe("action creators", () => {
    test("setUrl should create correct action", () => {
      const url = "https://example.com";
      expect(setUrl(url)).toEqual({
        type: "navigation/setUrl",
        payload: url,
      });
    });

    test("startNavigation should create correct action", () => {
      expect(startNavigation()).toEqual({
        type: "navigation/startNavigation",
      });
    });

    test("navigationSuccess should create correct action", () => {
      expect(navigationSuccess()).toEqual({
        type: "navigation/navigationSuccess",
      });
    });

    test("navigationFailed should create correct action", () => {
      const error = "Navigation failed";
      expect(navigationFailed(error)).toEqual({
        type: "navigation/navigationFailed",
        payload: error,
      });
    });

    test("resetStatus should create correct action", () => {
      expect(resetStatus()).toEqual({
        type: "navigation/resetStatus",
      });
    });
  });
});
