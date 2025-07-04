module.exports = {
  // moduleNameMapper: {
  //   "^app/model/(.*)$": "<rootDir>/src/model/$1",
  // },
  resolver: 'jest-webpack-resolver',

  // Настройка покрытия
  collectCoverage: true,

  // Куда сохранять отчёт
  coverageDirectory: 'dev/coverage',

  // Какие файлы должны попадать в анализ
  // По умолчанию: все .ts, .tsx, .js, .jsx, если не указано иное
  collectCoverageFrom: [
    'dev/src/**/*.{ts,tsx,js,jsx}',
    '!dev/src/**/*.d.ts',     // исключаем типы
    '!dev/src/index.ts',      // исключаем точки входа
    '!dev/src/reportWebVitals.ts',
  ],

  // Форматы отчёта
  coverageReporters: ['json', 'lcov', 'text', 'clover'],

  // Минимальные пороги (опционально)
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};