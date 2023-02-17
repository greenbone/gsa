/* Copyright (C) 2023 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';
import Settings from 'gmp/models/settings';
import {rendererWith, wait} from 'web/utils/testing';

import RadiusAuthentication from '../radiuspage';

describe('RADIUS page renders', () => {
  test('should render page with no radius key', async () => {
    const settings = new Settings();
    settings.set('method:radius_connect', {
      enabled: 'true',
      radiushost: 'foo',
    });
    const gmp = {
      user: {
        currentAuthSettings: jest.fn().mockReturnValue(
          Promise.resolve({
            data: settings,
          }),
        ),
      },
      settings: {
        manualUrl: 'http://docs.greenbone.net/GSM-Manual/gos-5/',
      },
    };

    const {render} = rendererWith({gmp, store: true});

    const {queryByText} = render(<RadiusAuthentication />);

    await wait();

    expect(queryByText('********')).not.toBeInTheDocument();
  });
  test('should show ******** instead of a key', async () => {
    const settings = new Settings();
    settings.set('method:radius_connect', {
      enabled: 'true',
      radiushost: 'foo',
      radiuskey: '********',
    });
    const gmp = {
      user: {
        currentAuthSettings: jest.fn().mockReturnValue(
          Promise.resolve({
            data: settings,
          }),
        ),
      },
      settings: {
        manualUrl: 'http://docs.greenbone.net/GSM-Manual/gos-5/',
      },
    };

    const {render} = rendererWith({gmp, store: true});

    const {getByText} = render(<RadiusAuthentication />);

    await wait();

    expect(getByText('********')).toBeInTheDocument();
  });
});
