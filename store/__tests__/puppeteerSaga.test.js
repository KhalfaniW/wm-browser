// store/__tests__/puppeteerSaga.test.js
const { runSaga } = require("redux-saga");
const { handlePuppeteerNavigate, __test__ } = require("../puppeteerSaga");
const navigationSlice = require("../navigationSlice");

describe("puppeteerSaga", () => {
  let dispatched;
  let mockBrowser, mockPage;

  beforeEach(() => {
    dispatched = [];
    mockPage = {
      goto: jest.fn(),
    };
    mockBrowser = {
      pages: jest.fn().mockResolvedValue([mockPage]),
    };
    __test__.setBrowser(null);
    __test__.setPage(null);
  });

  it("dispatches navigationSuccess on successful navigation", async () => {
    mockPage.goto.mockResolvedValue();
    const action = { payload: "example.com" };

    // Patch puppeteerSaga's browser/page for test
    __test__.setBrowser(mockBrowser);
    __test__.setPage(null);

    await runSaga(
      {
        dispatch: (action) => dispatched.push(action),
      },
      handlePuppeteerNavigate,
      action
    ).toPromise();

    expect(mockPage.goto).toHaveBeenCalledWith("https://example.com");
    expect(dispatched).toContainEqual(navigationSlice.navigationSuccess());
  });

  it("dispatches navigationFailed on error", async () => {
    mockPage.goto.mockRejectedValue(new Error("fail"));
    const action = { payload: "example.com" };

    __test__.setBrowser(mockBrowser);
    __test__.setPage(null);

    await runSaga(
      {
        dispatch: (action) => dispatched.push(action),
      },
      handlePuppeteerNavigate,
      action
    ).toPromise();

    expect(dispatched).toContainEqual(navigationSlice.navigationFailed("fail"));
  });
});
