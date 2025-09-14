module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    mocha: true,
  },
  extends: ["eslint:recommended"],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {
    // Code style and formatting
    indent: ["error", 4],
    "linebreak-style": ["error", "unix"],
    quotes: ["error", "single"],
    semi: ["error", "always"],

    // Best practices
    "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "no-console": "off", // Allow console.log for test debugging
    "prefer-const": "error",
    "no-var": "error",

    // Async/await best practices
    "require-await": "error",
    "no-return-await": "error",

    // Error prevention
    "no-undef": "error",
    "no-duplicate-imports": "error",
    "no-unreachable": "error",

    // Code complexity
    complexity: ["warn", 10],
    "max-depth": ["warn", 4],
    "max-params": ["warn", 5],

    // Documentation
    "require-jsdoc": [
      "warn",
      {
        require: {
          FunctionDeclaration: true,
          ClassDeclaration: true,
          MethodDefinition: true,
        },
      },
    ],

    // Modern JavaScript
    "arrow-spacing": "error",
    "template-curly-spacing": "error",
    "object-curly-spacing": ["error", "always"],
  },
  globals: {
    // Mocha globals
    describe: "readonly",
    it: "readonly",
    before: "readonly",
    beforeEach: "readonly",
    after: "readonly",
    afterEach: "readonly",

    // Browser automation globals
    window: "readonly",
    document: "readonly",
  },
};
