/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import Settings from 'gmp/models/settings';
import RadiusAuthentication from 'web/pages/radius/RadiusPage';
import {screen} from 'web/testing';
import {fireEvent, rendererWith, wait} from 'web/utils/Testing';

describe('RADIUS page renders', () => {
  test('should render page with no radius key', async () => {
    const settings = new Settings();
    settings.set('method:radius_connect', {
      enabled: true,
      radiushost: 'foo',
    });
    const gmp = {
      user: {
        currentAuthSettings: testing.fn().mockResolvedValue({
          data: settings,
        }),
        renewSession: testing.fn(),
      },
      settings: {
        manualUrl: 'http://docs.greenbone.net/GSM-Manual/gos-5/',
      },
    };

    const {render} = rendererWith({gmp, store: true});

    render(<RadiusAuthentication />);

    await wait();

    expect(screen.queryByText('********')).not.toBeInTheDocument();
  });

  test('should show ******** instead of a key', async () => {
    const settings = new Settings();
    settings.set('method:radius_connect', {
      enabled: true,
      radiushost: 'foo',
      radiuskey: '********',
    });
    const gmp = {
      user: {
        currentAuthSettings: testing.fn().mockResolvedValue({data: settings}),
        renewSession: testing.fn(),
      },
      settings: {
        manualUrl: 'http://docs.greenbone.net/GSM-Manual/gos-5/',
      },
    };

    const {render} = rendererWith({gmp, store: true});

    render(<RadiusAuthentication />);

    await wait();

    expect(
      screen.queryByText('Support for RADIUS is not available'),
    ).not.toBeInTheDocument();
    expect(screen.getByText('********')).toBeInTheDocument();
  });

  test('should not render radius content if radius is disabled', async () => {
    const settings = new Settings();
    const gmp = {
      user: {
        currentAuthSettings: testing.fn().mockResolvedValue({data: settings}),
        renewSession: testing.fn(),
      },
      settings: {
        manualUrl: 'http://docs.greenbone.net/GSM-Manual/gos-5/',
      },
    };

    const {render} = rendererWith({gmp, store: true});

    render(<RadiusAuthentication />);

    await wait();

    expect(
      screen.getByText('Support for RADIUS is not available.'),
    ).toBeInTheDocument();
    expect(screen.queryByText('********')).not.toBeInTheDocument();
  });

  test('should allow to edit the radius settings', async () => {
    const settings = new Settings();
    settings.set('method:radius_connect', {
      enabled: true,
      radiushost: 'foo',
      radiuskey: '********',
    });
    const gmp = {
      user: {
        currentAuthSettings: testing.fn().mockResolvedValue({data: settings}),
        renewSession: testing.fn().mockResolvedValue({}),
      },
      settings: {
        manualUrl: 'http://docs.greenbone.net/GSM-Manual/gos-5/',
      },
    };

    const {render} = rendererWith({gmp, store: true});

    render(<RadiusAuthentication />);

    await wait();

    fireEvent.click(screen.getByTitle('Edit RADIUS Authentication'));

    expect(screen.getByText('Edit RADIUS Authentication')).toBeInTheDocument();
  });
});
