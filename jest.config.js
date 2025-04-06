module.exports = {
    testEnvironment: "jsdom",
    transform: {
      "^.+\\.[jt]sx?$": "babel-jest",
    },
    setupFilesAfterEnv: ["@testing-library/jest-dom"],
    collectCoverage: true,
    collectCoverageFrom: [
      "src/testApp/SortingTests.js"
    ],
    coverageDirectory: "coverage",
    coverageReporters: ["html", "text"],
    testMatch: [
      "**/src/testApp/**/*.test.js"
    ],
  };
  