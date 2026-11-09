/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {afterEach, beforeEach, expect, test, testing} from '@gsa/testing';
import type LoadMfeScript from 'web/pages/agent-control-ui/load-mfe-script';

let loadMfeScript: typeof LoadMfeScript;
let sequence = 0;
let elementName: string;
const scriptElement = () => document.getElementById('ac-inventory-mfe');

beforeEach(async () => {
  testing.resetModules();
  loadMfeScript = (await import('web/pages/agent-control-ui/load-mfe-script'))
    .default;
  elementName = `test-loader-${++sequence}`;
  testing.useFakeTimers();
});

afterEach(() => {
  document.getElementById('ac-inventory-mfe')?.remove();
  testing.useRealTimers();
});

test('shares the pending script and waits for asynchronous registration', async () => {
  const pending = loadMfeScript('/inventory.js', elementName);
  expect(loadMfeScript('/inventory.js', elementName)).toBe(pending);
  scriptElement()?.dispatchEvent(new Event('load'));
  const ready = testing.fn();
  void pending.then(ready);
  await Promise.resolve();
  expect(ready).not.toHaveBeenCalled();
  customElements.define(elementName, class extends HTMLElement {});
  await expect(pending).resolves.toBeUndefined();
  expect(testing.getTimerCount()).toBe(0);
});

test('registration timeout removes the script and allows retry', async () => {
  const pending = loadMfeScript('/inventory.js', elementName);
  const failed = expect(pending).rejects.toThrow('register');
  scriptElement()?.dispatchEvent(new Event('load'));
  await testing.advanceTimersByTimeAsync(10_000);
  await failed;
  expect(scriptElement()).toBeNull();
  const retry = loadMfeScript('/inventory.js', elementName);
  expect(retry).not.toBe(pending);
  customElements.define(elementName, class extends HTMLElement {});
  scriptElement()?.dispatchEvent(new Event('load'));
  await expect(retry).resolves.toBeUndefined();
});

test('network failure allows retry', async () => {
  const pending = loadMfeScript('/inventory.js', elementName);
  const failed = expect(pending).rejects.toThrow('load');
  scriptElement()?.dispatchEvent(new Event('error'));
  await failed;
  expect(scriptElement()).toBeNull();
  const retry = loadMfeScript('/inventory.js', elementName);
  customElements.define(elementName, class extends HTMLElement {});
  scriptElement()?.dispatchEvent(new Event('load'));
  await expect(retry).resolves.toBeUndefined();
});

test('an already registered element requires no script', async () => {
  customElements.define(elementName, class extends HTMLElement {});
  await expect(
    loadMfeScript('/inventory.js', elementName),
  ).resolves.toBeUndefined();
  expect(scriptElement()).toBeNull();
});
