import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypeScript from 'eslint-config-next/typescript';

const config = [
  {
    ignores: ['.qa/**', 'scratch/**', 'scratch*.ts'],
  },
  ...nextCoreWebVitals,
  ...nextTypeScript,
];

export default config;
