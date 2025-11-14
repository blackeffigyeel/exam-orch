// tests/__mocks__/uuid.js
// This mock provides the same interface as the real uuid module
// but returns predictable values for testing purposes.

// Mock implementation returning a fixed UUID
const mockV4 = jest.fn(() => '123e4567-e89b-12d3-a456-426614174000');

// It is possible to make it return different values if needed for different tests
// const mockV4 = jest.fn()
//   .mockReturnValueOnce('123e4567-e89b-12d3-a456-426614174000')
//   .mockReturnValueOnce('123e4567-e89b-12d3-a456-426614174001');

module.exports = {
  v4: mockV4,
  // For other functions from uuid, mock them here too
  // NIL: require('uuid').NIL,
  // version: require('uuid').version,
  // validate: require('uuid').validate,
  // stringify: require('uuid').stringify,
  // parse: require('uuid').parse,
};

// Alternative: Uncomment for the *real* uuid functionality during tests
// module.exports = jest.requireActual('uuid');