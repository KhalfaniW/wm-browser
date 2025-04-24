// store/navigationSaga.js
const { call, put, takeLatest } = require("redux-saga/effects");
let ipcRenderer = null;
try {
  ipcRenderer = require("electron").ipcRenderer;
} catch {
  // In test environments, ipcRenderer may not be available
}

const {
  navigationSuccess,
  navigationFailed,
  navigateRequested,
} = require("./navigationSlice");

// Worker saga: handles navigation effect
function* handleNavigate(action, injectedIpcRenderer) {
  const ipc = injectedIpcRenderer || ipcRenderer;
  try {
    const success = yield call([ipc, ipc.invoke], "navigate", action.payload);
    if (success) {
      yield put(navigationSuccess());
    } else {
      yield put(navigationFailed("Navigation failed"));
    }
  } catch (error) {
    yield put(navigationFailed(error.message));
  }
}

// Watcher saga: spawns a new task on each navigateRequested
function* navigationSaga(injectedIpcRenderer) {
  yield takeLatest(navigateRequested.type, function* (action) {
    yield* handleNavigate(action, injectedIpcRenderer);
  });
}

module.exports = {
  navigationSaga,
  handleNavigate,
};
