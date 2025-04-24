// store/__tests__/navigationSaga.test.js
const { runSaga } = require("redux-saga");
const { call, put } = require("redux-saga/effects");
const navigationSagaModule = require("../navigationSaga");
const navigationSlice = require("../navigationSlice");

describe("navigationSaga", () => {
  let dispatched;
  let originalIpcRenderer;

  let mockIpcRenderer;

  beforeEach(() => {
    dispatched = [];
    mockIpcRenderer = {
      invoke: jest.fn(),
    };
  });

  afterEach(() => {
    mockIpcRenderer = null;
  });

  it("dispatches navigationSuccess on successful navigation", async () => {
    mockIpcRenderer.invoke.mockResolvedValue(true);

    await runSaga(
      {
        dispatch: (action) => dispatched.push(action),
      },
      navigationSagaModule.handleNavigate,
      { payload: "http://example.com" },
      mockIpcRenderer
    ).toPromise();

    expect(dispatched).toContainEqual(navigationSlice.navigationSuccess());
  });

  it("dispatches navigationFailed on failed navigation", async () => {
    mockIpcRenderer.invoke.mockResolvedValue(false);

    await runSaga(
      {
        dispatch: (action) => dispatched.push(action),
      },
      navigationSagaModule.handleNavigate,
      { payload: "http://example.com" },
      mockIpcRenderer
    ).toPromise();

    expect(dispatched).toContainEqual(
      navigationSlice.navigationFailed("Navigation failed")
    );
  });

  it("dispatches navigationFailed on error", async () => {
    mockIpcRenderer.invoke.mockRejectedValue(new Error("test error"));

    await runSaga(
      {
        dispatch: (action) => dispatched.push(action),
      },
      navigationSagaModule.handleNavigate,
      { payload: "http://example.com" },
      mockIpcRenderer
    ).toPromise();

    expect(dispatched).toContainEqual(
      navigationSlice.navigationFailed("test error")
    );
  });
});
