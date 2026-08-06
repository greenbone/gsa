/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {expect, test, type BrowserContext, type Page} from '@playwright/test';
import {login, password, username} from '../credentials';

interface MenuLink {
  href: string;
}

const topLevelMenuLabels = [
  'Scans',
  'Assets',
  'Resilience',
  'Security Information',
  'Configuration',
  'Administration',
  'Help',
];

const isInternalMenuLink = (href: string) =>
  href.startsWith('/') &&
  href !== '/' &&
  href !== '/login' &&
  !href.startsWith('/login?');

const normalizePath = (href: string) => {
  const parsed = new URL(href, 'http://localhost');
  return parsed.pathname;
};

const expandSidebarSections = async (page: Page) => {
  for (const label of topLevelMenuLabels) {
    const section = page.getByRole('link', {name: label, exact: true}).first();
    if ((await section.count()) > 0) {
      await section.click();
    }
  }
};

const collectVisibleMenuLinks = async (page: Page): Promise<MenuLink[]> => {
  const links = await page.locator('a[href]').evaluateAll(anchorElements => {
    return anchorElements
      .map(element => {
        const anchor = element as HTMLAnchorElement;
        const rect = anchor.getBoundingClientRect();
        const style = globalThis.getComputedStyle(anchor);

        return {
          href: anchor.getAttribute('href') ?? '',
          label: (anchor.textContent ?? '').trim(),
          target: anchor.getAttribute('target') ?? '',
          left: rect.left,
          right: rect.right,
          width: rect.width,
          height: rect.height,
          hidden:
            style.visibility === 'hidden' ||
            style.display === 'none' ||
            Number(style.opacity) === 0,
        };
      })
      .filter(
        link =>
          !link.hidden &&
          link.width > 0 &&
          link.height > 0 &&
          // Sidebar links live on the left column in desktop viewport.
          link.left >= 0 &&
          link.right <= 420,
      )
      .map(link => ({
        href: link.href,
        label: link.label,
        target: link.target,
      }));
  });

  const deduplicated = new Map<string, MenuLink>();

  for (const link of links) {
    if (
      !isInternalMenuLink(link.href) ||
      link.target === '_blank' ||
      !link.label.trim()
    ) {
      continue;
    }

    if (!deduplicated.has(link.href)) {
      deduplicated.set(link.href, {
        href: link.href,
      });
    }
  }

  return [...deduplicated.values()];
};

const waitForSidebarLinks = async (page: Page) => {
  await expect
    .poll(() => collectVisibleMenuLinks(page).then(links => links.length), {
      message: 'Waiting for the sidebar links to finish loading',
      timeout: 30000,
    })
    .toBeGreaterThan(0);
};

const navigateAndAssertPath = async (context: BrowserContext, href: string) => {
  const routePage = await context.newPage();
  const expectedPathname = normalizePath(href);

  try {
    await routePage.goto(href);
    await routePage.waitForURL(
      url =>
        url.pathname === expectedPathname ||
        url.pathname.startsWith(`${expectedPathname}/`),
      {timeout: 15000},
    );

    await expect(routePage).not.toHaveURL(/\/login(?:$|\?)/);
  } finally {
    await routePage.close();
  }
};

test.describe('sidebar menu links', () => {
  test.skip(
    !username || !password,
    'Set E2E_USERNAME and E2E_PASSWORD in .env.e2e.local or shell environment.',
  );

  test('all visible internal links navigate', async ({context, page}) => {
    test.setTimeout(120000);

    await login(page);

    await expandSidebarSections(page);
    await waitForSidebarLinks(page);
    const menuLinks = await collectVisibleMenuLinks(page);

    expect(menuLinks.length).toBeGreaterThan(0);

    for (const {href} of menuLinks) {
      try {
        await navigateAndAssertPath(context, href);
      } catch (error) {
        throw new Error(
          `Navigation failed for menu link href="${href}": ${String(error)}`,
        );
      }
    }
  });
});
