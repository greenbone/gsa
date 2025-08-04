/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {screen, rendererWith} from 'web/testing';
import TrashCanPageToolBarIcons from 'web/pages/trashcan/TrashCanPageToolBarIcons';

describe('TrashCanPageToolBarIcons tests', () => {
  test('should render the ManualIcon with correct props', () => {
    const gmp = {
      settings: {
        manualUrl: 'http://docs.greenbone.net/manual',
      },
    };
    const {render} = rendererWith({gmp});
    render(<TrashCanPageToolBarIcons />);

    const manualLink = screen.getByTestId('manual-link');
    const helpIcon = screen.getByTestId('help-icon');
    expect(manualLink).toHaveAttribute(
      'href',
      'http://docs.greenbone.net/manual/en/web-interface.html#using-the-trashcan',
    );
    expect(helpIcon).toHaveAttribute('title', 'Help: Trashcan');
  });
});
