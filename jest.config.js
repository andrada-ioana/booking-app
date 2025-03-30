module.exports = {
    testEnvironment: 'jsdom',
    transform: {
        '^.+\.(js|jsx|ts|tsx)$': 'babel-jest',
    },
    setupFilesAfterEnv: ['@testing-library/jest-dom'],
    collectCoverage: true,
    collectCoverageFrom: [
        "src/**/*.{js,jsx,ts,tsx}",  // adjust the glob to match your project structure
        "!src/index.js"             // optionally ignore entry point or other files
      ],
  coverageDirectory: "coverage",
  coverageReporters: ["html", "text"],
};
