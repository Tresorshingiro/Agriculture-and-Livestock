import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'

// jsdom does not implement IntersectionObserver. Nothing in the workspace
// depends on it today, but any lazily-revealed pane would, and a missing
// global throws rather than degrading; this stub reports every observed
// element as immediately intersecting, which is what a test environment with
// no real viewport should do.
let intersecting = true

// Test-only escape hatch: call with `false` to make every observer created
// for the rest of the current test report its target as never intersecting
// (e.g. to assert an in-view gate stays closed). Resets to the default
// (intersecting) after each test, so it never leaks between tests.
globalThis.__setIntersectionObserverIntersecting = (value) => {
  intersecting = value
}

if (typeof globalThis.IntersectionObserver === 'undefined') {
  globalThis.IntersectionObserver = class IntersectionObserver {
    constructor(callback) {
      this.callback = callback
    }
    observe(target) {
      this.callback([{ isIntersecting: intersecting, target }], this)
    }
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return []
    }
  }
}

afterEach(() => {
  intersecting = true
})
