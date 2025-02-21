/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import {License} from 'gmp/models/license';
import {rendererWith, wait} from 'web/utils/Testing';
import Theme from 'web/utils/Theme';

import LicenseNotification from '../LicenseNotification';

const dataNoLicense = License.fromElement({
  status: 'no_license',
});

const dataLessThan30days = License.fromElement({
  status: 'active',
  content: {
    meta: {
      id: '12345',
      version: '1.0.0',
      title: 'Test License',
      type: 'commercial',
      customer_name: 'Monsters Inc.',
      created: '2021-08-08T06:05:21Z',
      begins: '2021-08-08T07:05:21Z',
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

const dataLessThan30daysTrial = License.fromElement({
  status: 'active',
  content: {
    meta: {
      id: '12345',
      version: '1.0.0',
      title: 'Test License',
      type: 'trial',
      customer_name: 'Monsters Inc.',
      created: '2021-08-08T06:05:21Z',
      begins: '2021-08-08T07:05:21Z',
      expires: '2021-08-22T07:05:21Z',
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
      created: '2021-08-08T06:05:21Z',
      begins: '2021-08-08T07:05:21Z',
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
  testing.spyOn(global.Date, 'now').mockImplementation(() => mockDate);
});

describe('LicenseNotification tests', () => {
  test('should render if <=30 days active for Admin user', async () => {
    const handler = testing.fn();
    const gmp = {
      license: {
        getLicenseInformation: testing.fn().mockReturnValue(
          Promise.resolve({
            data: dataLessThan30days,
          }),
        ),
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
      'The Greenbone Enterprise License for this system will expire in 26 days',
    );
    expect(heading).toHaveStyleRule('background-color', Theme.lightBlue);
  });

  test('should render if <=30 days active for User user', async () => {
    const handler = testing.fn();
    const gmp = {
      license: {
        getLicenseInformation: testing.fn().mockReturnValue(
          Promise.resolve({
            data: dataLessThan30days,
          }),
        ),
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
      'The Greenbone Enterprise License for this system will expire in 26 days',
    );
    expect(heading).toHaveStyleRule('background-color', Theme.lightBlue);
  });

  test('should render if <=30 days active for Admin user Trial', async () => {
    const handler = testing.fn();
    const gmp = {
      license: {
        getLicenseInformation: testing.fn().mockReturnValue(
          Promise.resolve({
            data: dataLessThan30daysTrial,
          }),
        ),
      },
    };
    const {render} = rendererWith({
      license: dataLessThan30daysTrial,
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
      'The trial period for this system will end in 13 days',
    );
    expect(heading).toHaveStyleRule('background-color', Theme.lightBlue);
  });

  test('should render if <=30 days active for User user Trial', async () => {
    const handler = testing.fn();
    const gmp = {
      license: {
        getLicenseInformation: testing.fn().mockReturnValue(
          Promise.resolve({
            data: dataLessThan30daysTrial,
          }),
        ),
      },
    };
    const {render} = rendererWith({
      license: dataLessThan30daysTrial,
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
      'The trial period for this system will end in 13 days',
    );
    expect(heading).toHaveStyleRule('background-color', Theme.lightBlue);
  });

  test('should not render if >30 days and active for Admin user', async () => {
    const handler = testing.fn();

    const gmp = {
      license: {
        getLicenseInformation: testing.fn().mockReturnValue(
          Promise.resolve({
            data: dataMoreThan30days,
          }),
        ),
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
    const handler = testing.fn();

    const gmp = {
      license: {
        getLicenseInformation: testing.fn().mockReturnValue(
          Promise.resolve({
            data: dataMoreThan30days,
          }),
        ),
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
    const handler = testing.fn();

    const gmp = {
      license: {
        getLicenseInformation: testing.fn().mockReturnValue(
          Promise.resolve({
            data: dataExpired,
          }),
        ),
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
    const handler = testing.fn();

    const gmp = {
      license: {
        getLicenseInformation: testing.fn().mockReturnValue(
          Promise.resolve({
            data: dataExpired,
          }),
        ),
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
    const handler = testing.fn();

    const gmp = {
      license: {
        getLicenseInformation: testing.fn().mockReturnValue(
          Promise.resolve({
            data: dataCorrupt,
          }),
        ),
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
    const handler = testing.fn();

    const gmp = {
      license: {
        getLicenseInformation: testing.fn().mockReturnValue(
          Promise.resolve({
            data: dataCorrupt,
          }),
        ),
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

  test('should not render if status is no_license for Admin user', async () => {
    const handler = testing.fn();

    const gmp = {
      license: {
        getLicenseInformation: testing.fn().mockReturnValue(
          Promise.resolve({
            data: dataNoLicense,
          }),
        ),
      },
    };

    const {render} = rendererWith({
      license: dataNoLicense,
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

  test('should not render if status is no_license for User user', async () => {
    const handler = testing.fn();

    const gmp = {
      license: {
        getLicenseInformation: testing.fn().mockReturnValue(
          Promise.resolve({
            data: dataNoLicense,
          }),
        ),
      },
    };

    const {render} = rendererWith({
      license: dataNoLicense,
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
});
