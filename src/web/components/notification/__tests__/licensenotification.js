/* Copyright (C) 2022 Greenbone Networks GmbH
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

import Capabilities from 'gmp/capabilities/capabilities';

import {License} from 'gmp/models/license';

import {rendererWith, wait} from 'web/utils/testing';
import Theme from 'web/utils/theme';

import LicenseNotification from '../licensenotification';

const dataLessThan30days = License.fromElement({
  status: 'active',
  content: {
    meta: {
      id: '12345',
      version: '1.0.0',
      title: 'Test License',
      type: 'trial',
      customer_name: 'Monsters Inc.',
      created: '2021-08-27T06:05:21Z',
      begins: '2021-08-27T07:05:21Z',
      expires: '2021-09-04T07:05:21Z',
      comment: 'Han shot first',
    },
    appliance: {
      model: '450',
      model_type: 'hardware',
      sensor: false,
    },
  },
});

const dataMoreThan30days = License.fromElement({
  status: 'active',
  content: {
    meta: {
      id: '12345',
      version: '1.0.0',
      title: 'Test License',
      type: 'trial',
      customer_name: 'Monsters Inc.',
      created: '2021-08-27T06:05:21Z',
      begins: '2021-08-27T07:05:21Z',
      expires: '2022-09-04T07:05:21Z',
      comment: 'Han shot first',
    },
    appliance: {
      model: '450',
      model_type: 'hardware',
      sensor: false,
    },
  },
});

const dataExpired = License.fromElement({
  status: 'expired',
  content: {
    meta: {
      id: '12345',
      version: '1.0.0',
      title: 'Test License',
      type: 'trial',
      customer_name: 'Monsters Inc.',
      created: '2021-08-05T06:05:21Z',
      begins: '2021-08-06T07:05:21Z',
      expires: '2021-08-08T07:05:21Z',
      comment: 'Han shot first',
    },
    appliance: {
      model: '450',
      model_type: 'hardware',
      sensor: false,
    },
  },
});

const dataCorrupt = License.fromElement({
  status: 'corrupt',
});

const mockDate = new Date('2021-08-09T07:05:21Z');

const capsAdmin = new Capabilities(['everything']);
const capsUser = new Capabilities(['get_license']);

beforeEach(() => {
  jest.spyOn(global.Date, 'now').mockImplementation(() => mockDate);
});

describe('LicenseNotification tests', () => {
  test('should render if <=30 days active for Admin user', async () => {
    const handler = jest.fn();
    const gmp = {
      license: {
        getLicenseInformation: jest.fn().mockReturnValue(
          Promise.resolve({
            data: dataLessThan30days,
          }),
        ),
      },
      settings: {
        manualUrl: 'http://foo.bar',
      },
    };
    const {render} = rendererWith({
      license: dataLessThan30days,
      gmp,
      router: true,
      store: true,
    });
    const {baseElement, getByTestId} = render(
      <LicenseNotification capabilities={capsAdmin} onCloseClick={handler} />,
    );

    await wait();

    const heading = getByTestId('infopanel-heading');
    const links = baseElement.querySelectorAll('a');

    expect(links.length).toEqual(1);

    expect(links[0]).toHaveAttribute('href', '/license');
    expect(links[0]).toHaveTextContent('License Management page');

    expect(baseElement).toHaveTextContent(
      'Your Greenbone Enterprise License ends in 26 days',
    );
    expect(heading).toHaveStyleRule('background-color', Theme.lightBlue);
  });
  test('should render if <=30 days active for User user', async () => {
    const handler = jest.fn();
    const gmp = {
      license: {
        getLicenseInformation: jest.fn().mockReturnValue(
          Promise.resolve({
            data: dataLessThan30days,
          }),
        ),
      },
      settings: {
        manualUrl: 'http://foo.bar',
      },
    };
    const {render} = rendererWith({
      license: dataLessThan30days,
      gmp,
      router: true,
      store: true,
    });
    const {baseElement, getByTestId} = render(
      <LicenseNotification capabilities={capsUser} onCloseClick={handler} />,
    );

    await wait();

    const heading = getByTestId('infopanel-heading');
    const links = baseElement.querySelectorAll('a');

    expect(links.length).toEqual(0);

    expect(baseElement).toHaveTextContent(
      'Your Greenbone Enterprise License ends in 26 days',
    );
    expect(heading).toHaveStyleRule('background-color', Theme.lightBlue);
  });

  test('should not render if >30 days and active for Admin user', async () => {
    const handler = jest.fn();

    const gmp = {
      license: {
        getLicenseInformation: jest.fn().mockReturnValue(
          Promise.resolve({
            data: dataMoreThan30days,
          }),
        ),
      },
      settings: {
        manualUrl: 'http://foo.bar',
      },
    };

    const {render} = rendererWith({
      license: dataMoreThan30days,
      gmp,
      router: true,
      store: true,
    });
    const {baseElement} = render(
      <LicenseNotification capabilities={capsAdmin} onCloseClick={handler} />,
    );

    await wait();

    expect(baseElement).not.toHaveTextContent();
  });

  test('should not render if >30 days and active for User user', async () => {
    const handler = jest.fn();

    const gmp = {
      license: {
        getLicenseInformation: jest.fn().mockReturnValue(
          Promise.resolve({
            data: dataMoreThan30days,
          }),
        ),
      },
      settings: {
        manualUrl: 'http://foo.bar',
      },
    };

    const {render} = rendererWith({
      license: dataMoreThan30days,
      gmp,
      router: true,
      store: true,
    });
    const {baseElement} = render(
      <LicenseNotification capabilities={capsUser} onCloseClick={handler} />,
    );

    await wait();

    expect(baseElement).not.toHaveTextContent();
  });

  test('should render warning if expired for Admin user', async () => {
    const handler = jest.fn();

    const gmp = {
      license: {
        getLicenseInformation: jest.fn().mockReturnValue(
          Promise.resolve({
            data: dataExpired,
          }),
        ),
      },
      settings: {
        manualUrl: 'http://foo.bar',
      },
    };

    const {render} = rendererWith({
      license: dataExpired,
      gmp,
      router: true,
      store: true,
    });
    const {baseElement, getByTestId} = render(
      <LicenseNotification capabilities={capsAdmin} onCloseClick={handler} />,
    );

    await wait();

    const heading = getByTestId('infopanel-heading');

    const links = baseElement.querySelectorAll('a');

    expect(links.length).toEqual(1);

    expect(links[0]).toHaveAttribute('href', '/license');
    expect(links[0]).toHaveTextContent('License Management page');

    expect(baseElement).toHaveTextContent(
      'Your Greenbone Enterprise License has expired 1 days ago!',
    );
    expect(heading).toHaveStyleRule('background-color', Theme.mediumLightRed);
  });

  test('should render warning if expired for User user', async () => {
    const handler = jest.fn();

    const gmp = {
      license: {
        getLicenseInformation: jest.fn().mockReturnValue(
          Promise.resolve({
            data: dataExpired,
          }),
        ),
      },
      settings: {
        manualUrl: 'http://foo.bar',
      },
    };

    const {render} = rendererWith({
      license: dataExpired,
      gmp,
      router: true,
      store: true,
    });
    const {baseElement, getByTestId} = render(
      <LicenseNotification capabilities={capsUser} onCloseClick={handler} />,
    );

    await wait();

    const heading = getByTestId('infopanel-heading');
    const links = baseElement.querySelectorAll('a');

    expect(links.length).toEqual(0);

    expect(baseElement).toHaveTextContent(
      'Your Greenbone Enterprise License has expired 1 days ago!',
    );
    expect(heading).toHaveStyleRule('background-color', Theme.mediumLightRed);
  });

  test('should render warning if corrupt for Admin user', async () => {
    const handler = jest.fn();

    const gmp = {
      license: {
        getLicenseInformation: jest.fn().mockReturnValue(
          Promise.resolve({
            data: dataCorrupt,
          }),
        ),
      },
      settings: {
        manualUrl: 'http://foo.bar',
      },
    };

    const {render} = rendererWith({
      license: dataCorrupt,
      gmp,
      router: true,
      store: true,
    });
    const {baseElement, getByTestId} = render(
      <LicenseNotification capabilities={capsAdmin} onCloseClick={handler} />,
    );

    await wait();

    const heading = getByTestId('infopanel-heading');

    const links = baseElement.querySelectorAll('a');

    expect(links.length).toEqual(2);

    expect(links[0]).toHaveAttribute('href', 'https://service.greenbone.net');
    expect(links[0]).toHaveTextContent('https://service.greenbone.net');

    expect(links[1]).toHaveAttribute('href', 'mailto:support@greenbone.net');
    expect(links[1]).toHaveTextContent('support@greenbone.net');

    expect(baseElement).toHaveTextContent(
      'Your Greenbone Enterprise License is invalid!',
    );
    expect(heading).toHaveStyleRule('background-color', Theme.mediumLightRed);
  });

  test('should render warning if corrupt for User user', async () => {
    const handler = jest.fn();

    const gmp = {
      license: {
        getLicenseInformation: jest.fn().mockReturnValue(
          Promise.resolve({
            data: dataCorrupt,
          }),
        ),
      },
      settings: {
        manualUrl: 'http://foo.bar',
      },
    };

    const {render} = rendererWith({
      license: dataCorrupt,
      gmp,
      router: true,
      store: true,
    });
    const {baseElement, getByTestId} = render(
      <LicenseNotification capabilities={capsUser} onCloseClick={handler} />,
    );

    await wait();

    const heading = getByTestId('infopanel-heading');

    const links = baseElement.querySelectorAll('a');

    expect(links.length).toEqual(0);

    expect(baseElement).toHaveTextContent(
      'Your Greenbone Enterprise License is invalid!',
    );
    expect(heading).toHaveStyleRule('background-color', Theme.mediumLightRed);
  });
});

// vim: set ts=2 sw=2 tw=80:
