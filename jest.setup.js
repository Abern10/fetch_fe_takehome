// jest.setup.js

import '@testing-library/jest-dom'

jest.mock('react', () => {
    const originalReact = jest.requireActual('react');
    return {
      ...originalReact,
      // Make sure useState works in tests
      useState: jest.fn(initialValue => [initialValue, jest.fn()]),
    };
  });