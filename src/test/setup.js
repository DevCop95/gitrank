import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Auto-unmount rendered components between tests
afterEach(cleanup);

// jsdom does not implement matchMedia
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent() {}
  });
}
