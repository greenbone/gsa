/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';

import {rendererWith, waitFor, fireEvent} from 'web/utils/testing';

import AboutPage from '../about';

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

    const {baseElement, getByTestId} = render(<AboutPage />);

    const links = baseElement.querySelectorAll('a');

    fireEvent.click(links[1]);

    await waitFor(() => baseElement.querySelectorAll('dialog'));

    const dialogTitleBar = getByTestId('dialog-title-bar');
    const dialogButtons = baseElement.querySelectorAll('button');
    expect(dialogTitleBar).toHaveTextContent('You are leaving GSA');
    expect(dialogButtons.length).toEqual(2);
  });
});
