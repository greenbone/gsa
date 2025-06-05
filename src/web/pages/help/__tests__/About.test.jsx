/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import AboutPage from 'web/pages/help/About';
import {screen} from 'web/testing';
import {fireEvent, rendererWith} from 'web/utils/Testing';

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

    expect(screen.queryDialogTitle()).toHaveTextContent('You are leaving GSA');
  });
});
