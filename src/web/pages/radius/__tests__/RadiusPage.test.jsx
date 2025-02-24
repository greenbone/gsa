/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import Settings from 'gmp/models/settings';
import RadiusAuthentication from 'web/pages/radius/RadiusPage';
import {rendererWith, wait} from 'web/utils/Testing';


describe('RADIUS page renders', () => {
  test('should render page with no radius key', async () => {
    const settings = new Settings();
    settings.set('method:radius_connect', {
      enabled: 'true',
      radiushost: 'foo',
    });
    const gmp = {
      user: {
        currentAuthSettings: testing.fn().mockReturnValue(
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
        currentAuthSettings: testing.fn().mockReturnValue(
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
