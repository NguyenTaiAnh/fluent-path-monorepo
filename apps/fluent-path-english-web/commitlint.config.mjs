const config = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 0 = disabled, 1 = warning, 2 = error
    // Disable the max line length limit for commit message headers
    'header-max-length': [0, 'always', 100],
  },
};

export default config;
