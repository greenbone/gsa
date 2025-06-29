/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {screen, fireEvent, rendererWith} from 'web/testing';
import GmpSettings from 'gmp/gmpsettings';
import AboutPage from 'web/pages/help/About';

describe('AboutPage tests', () => {
  test('should render about page', async () => {
    const gmp = {
      settings: {
        vendorVersion: '1337.42',
      },
    };

    const {render} = rendererWith({gmp});

    const {baseElement} = render(<AboutPage />);

    const links = baseElement.querySelectorAll('a');
    const heading = baseElement.querySelector('h1');
    const version = baseElement.querySelector('h3');
    const image = baseElement.querySelector('img');

    expect(links.length).toEqual(3);
    expect(links[0]).toHaveTextContent('Greenbone AG');
    expect(links[1]).toHaveTextContent('(full license text)');
    expect(links[2]).toHaveTextContent('here');

    expect(heading).toHaveTextContent('Greenbone Security Assistant');

    expect(version).toHaveTextContent('1337.42');

    expect(image).toHaveAttribute('src', '/img/greenbone_banner.png');
  });

  test('should open external link dialog on click', async () => {
    const gmp = {
      settings: {
        vendorVersion: '1337.42',
      },
    };
    const {render} = rendererWith({gmp});

    const {element} = render(<AboutPage />);

    const links = element.querySelectorAll('a');

    fireEvent.click(links[1]);

    expect(screen.getDialogTitle()).toHaveTextContent('You are leaving GSA');
  });

  test('should have protocol documentation link', async () => {
    const gmp = {
      settings: new GmpSettings(),
    };
    const {render} = rendererWith({gmp});

    render(<AboutPage />);

    const link = screen.getByText('here');
    expect(link).toHaveAttribute(
      'href',
      'https://docs.greenbone.net/API/GMP/gmp-22.5.html',
    );
  });
});
