import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';

const eslintConfig = [
  ...nextCoreWebVitals.map((config) =>
    config.plugins && config.plugins['react-hooks']
      ? {
          ...config,
          rules: {
            ...config.rules,
            // New in eslint-config-next 16 (React Compiler rules). It flags pre-existing
            // code; kept as a warning until those components are refactored.
            'react-hooks/set-state-in-effect': 'warn',
          },
        }
      : config,
  ),
  {
    rules: {
      '@next/next/no-html-link-for-pages': 'off',
    },
  },
  {
    ignores: ['node_modules/**', '.next/**', 'out/**', 'build/**', 'next-env.d.ts'],
  },
];

export default eslintConfig;
