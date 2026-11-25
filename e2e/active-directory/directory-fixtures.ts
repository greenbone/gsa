/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {expect, test as base, type Page} from '@playwright/test';
import {login} from 'e2e/credentials';
import {activeDirectoryMockResponse} from '../../src/gmp/commands/fixtures/active-directory';

const capabilities = [
  'get_active_directory_objects',
  'get_credentials',
  'get_filters',
  'get_settings',
  'get_targets',
  'create_target',
  'get_port_lists',
  'get_tasks',
];

const emptyCollection = (command: string, collection: string, item: string) =>
  `<${command}><${command}_response status="200" status_text="OK"><${collection} start="1" max="-1"/><${item}_count>0<filtered>0</filtered><page>0</page></${item}_count></${command}_response></${command}>`;

const responses: Record<string, string> = {
  get_aggregate:
    '<get_aggregate><get_aggregates_response status="200" status_text="OK"><aggregate/></get_aggregates_response></get_aggregate>',
  get_capabilities: `<get_capabilities><help_response status="200" status_text="OK"><schema>${capabilities.map(name => `<command><name>${name}</name></command>`).join('')}</schema></help_response></get_capabilities>`,
  get_features:
    '<get_features><get_features_response status="200" status_text="OK"><feature enabled="1"><name>ENABLE_AD_INTEGRATION</name></feature></get_features_response></get_features>',
  get_settings:
    '<get_settings><get_settings_response status="200" status_text="OK"/></get_settings>',
  get_setting:
    '<get_settings><get_settings_response status="200" status_text="OK"/></get_settings>',
  get_tasks: emptyCollection('get_tasks', 'tasks', 'task'),
  get_feeds:
    '<get_feeds><get_feeds_response status="200" status_text="OK"/></get_feeds>',
  get_filters: emptyCollection('get_filters', 'filters', 'filter'),
  get_credentials: emptyCollection(
    'get_credentials',
    'credentials',
    'credential',
  ),
  get_port_lists: emptyCollection('get_port_lists', 'port_lists', 'port_list'),
};

export const test = base.extend<{directoryBackend: void}>({
  directoryBackend: [
    async ({page}, use) => {
      const unexpected: string[] = [];
      await page.route('**/config.js', route =>
        route.fulfill({
          contentType: 'text/javascript',
          body: "config = {apiServer: location.host + '/e2e-api'};",
        }),
      );
      await page.route('**/e2e-api/**', async route => {
        const request = route.request();
        const {pathname, searchParams} = new URL(request.url());
        const method = request.method();
        const command =
          searchParams.get('cmd') ??
          request.postData()?.match(/name="cmd"\r\n\r\n(\w+)/)?.[1] ??
          '';
        let xml: string | undefined;
        if (method === 'POST' && pathname === '/e2e-api/login') {
          xml =
            '<envelope><token>directory-fixture-token</token><timezone>UTC</timezone><i18n>en</i18n><duration>3600</duration></envelope>';
        } else if (method === 'GET' && pathname === '/e2e-api/gmp') {
          xml = activeDirectoryMockResponse(searchParams);
          if (xml === undefined && Object.hasOwn(responses, command)) {
            xml = `<envelope>${responses[command]}</envelope>`;
          }
        } else if (method === 'POST' && pathname === '/e2e-api/gmp') {
          if (command === 'renew_session') {
            xml =
              '<envelope><action_result><action>renew_session</action><message>3600</message></action_result></envelope>';
          } else if (command === 'save_setting') {
            xml =
              '<envelope><action_result><action>save_setting</action><message>OK</message></action_result></envelope>';
          }
        }
        if (xml === undefined) {
          unexpected.push(`${method} ${command || pathname}`);
          await route.abort();
          return;
        }
        await route.fulfill({contentType: 'application/xml', body: xml});
      });
      await use();
      expect(unexpected, 'Unexpected fixture backend requests').toEqual([]);
    },
    {auto: true},
  ],
});

export const loginWithDirectoryFixtures = (page: Page) =>
  login(page, {username: 'directory-test', password: 'directory-test'});

export {expect, type Page};
