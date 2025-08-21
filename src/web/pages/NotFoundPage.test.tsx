/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {rendererWith, screen} from 'web/testing';
import PageNotFound from 'web/pages/NotFoundPage';

const gmp = {
  settings: {vendorTitle: 'Greenbone'},
};

describe('PageNotFound tests', () => {
  test('renders the page title', () => {
    const {render} = rendererWith({gmp});
    render(<PageNotFound />);
    expect(document.title).toEqual('Greenbone - Page Not Found');
  });

  test('renders the main heading', () => {
    const {render} = rendererWith({gmp});
    render(<PageNotFound />);
    expect(screen.getByRole('heading', {level: 1})).toHaveTextContent(
      'Page Not Found.',
    );
  });

  test('renders the Greenbone logo', () => {
    const {render} = rendererWith({gmp});
    render(<PageNotFound />);
    expect(screen.getByTestId('greenbone-logo')).toBeInTheDocument();
  });

  test('renders the error message', () => {
    const {render} = rendererWith({gmp});
    render(<PageNotFound />);
    expect(
      screen.getByText(
        'We are sorry. The page you have requested could not be found.',
      ),
    ).toBeInTheDocument();
  });
});
