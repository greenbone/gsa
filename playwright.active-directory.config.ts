import {defineConfig} from '@playwright/test';
import config, {directoryFixtureSpecs} from './playwright.config';

const baseURL = 'http://127.0.0.1:4175';

export default defineConfig(config, {
  testMatch: directoryFixtureSpecs,
  testIgnore: [],
  use: {baseURL},
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 4175 --strictPort',
    url: baseURL,
    timeout: 120_000,
  },
});
