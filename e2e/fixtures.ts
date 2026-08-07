/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {test as base} from '@playwright/test';
import {credentialsRequiredMessage, hasCredentials} from 'e2e/credentials';

type E2EFixtures = {
  credentialsGuard: void;
};

export const test = base.extend<E2EFixtures>({
  credentialsGuard: [
    async ({page: _page}, use, testInfo) => {
      testInfo.skip(!hasCredentials, credentialsRequiredMessage);
      await use();
    },
    {auto: true},
  ],
});

export {expect} from '@playwright/test';
export type {BrowserContext, Page} from '@playwright/test';
