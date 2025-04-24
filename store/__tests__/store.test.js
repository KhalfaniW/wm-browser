const store = require("../index");
const {
  setUrl,
  startNavigation,
  navigationSuccess,
  navigationFailed,
} = require("../navigationSlice");

describe("Redux Store", () => {
  test("should have the correct initial state", () => {
    const state = store.getState();
    expect(state.navigation).toEqual({
      currentUrl: "",
      status: "idle",
      error: null,
    });
  });

  test("should handle a sequence of navigation actions", () => {
    const testUrl = "https://example.com";

    // Set URL
    store.dispatch(setUrl(testUrl));
    expect(store.getState().navigation.currentUrl).toBe(testUrl);

    // Start navigation
    store.dispatch(startNavigation());
    expect(store.getState().navigation).toEqual({
      currentUrl: testUrl,
      status: "loading",
      error: null,
    });

    // Navigation success
    store.dispatch(navigationSuccess());
    expect(store.getState().navigation).toEqual({
      currentUrl: "",
      status: "succeeded",
      error: null,
    });
  });

  test("should handle navigation failure", () => {
    const errorMessage = "Failed to load page";

    store.dispatch(navigationFailed(errorMessage));
    expect(store.getState().navigation).toEqual({
      currentUrl: "",
      status: "failed",
      error: errorMessage,
    });
  });

  test("should allow state subscription", () => {
    const mockSubscriber = jest.fn();
    const unsubscribe = store.subscribe(mockSubscriber);

    store.dispatch(setUrl("https://test.com"));
    expect(mockSubscriber).toHaveBeenCalled();

    unsubscribe();
    store.dispatch(startNavigation());
    expect(mockSubscriber).toHaveBeenCalledTimes(1);
  });
});
