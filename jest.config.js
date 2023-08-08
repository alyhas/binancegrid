module.exports = {
  roots: ["<rootDir>/source"],
  testMatch: ["**/*tests.ts"],
  transform: {
    "^.+\\.(ts)$": "ts-jest",
  },
};
