module.exports = {
  env: {
    browser: true,
    es6: true
  },
  parserOptions: {
    ecmaVersion: 6,
    sourceType: "module",
    spread: true,
    ecmaFeatures: {
      experimentalObjectRestSpread: true
    }
  },
  rules: {
    indent: ["error", 2],
    quotes: ["error", "double"],
    semi: ["error", "never"],
    "no-console": "off"
  }
}
