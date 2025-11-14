module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',

    // Point to tests folder
    roots: ['<rootDir>/tests'],

    // Match test files
    testMatch: [
        '**/__tests__/**/*.+(ts|tsx|js)',
        '**/?(*.)+(spec|test).+(ts|tsx|js)'
    ],

    // Transform TS files using ts-jest
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
    },

    // Map uuid import to our mock file
    moduleNameMapper: {
        '^uuid$': '<rootDir>/tests/__mocks__/uuid.js',
    },

    // Coverage settings
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts',
        '!src/app.ts',
        '!src/index.ts'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],

    // Setup file
    // setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],

    testTimeout: 10000,
};