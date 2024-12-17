/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {render} from 'web/utils/testing';

import SolutionTypeIcon from '../solutiontypeicon';

describe('SolutionTypeIcon component tests', () => {
  test('should render correct image', () => {
    const {element: element1} = render(<SolutionTypeIcon type="Workaround" />);
    const {element: element2} = render(<SolutionTypeIcon type="Mitigate" />);
    const {element: element3} = render(
      <SolutionTypeIcon type="NoneAvailable" />,
    );
    const {element: element4} = render(<SolutionTypeIcon type="VendorFix" />);
    const {element: element5} = render(<SolutionTypeIcon type="WillNotFix" />);
    const {element: element6} = render(<SolutionTypeIcon type="Workaround" />);
    const {element: element7} = render(<SolutionTypeIcon type="" />);
    const {element: element8} = render(<SolutionTypeIcon />);

    expect(element1).toBeVisible();
    expect(element2).toBeVisible();
    expect(element3).toBeVisible();
    expect(element4).toBeVisible();
    expect(element5).toBeVisible();
    expect(element6).toBeVisible();
    expect(element7).toBeVisible();
    expect(element8).toBeVisible();
  });
});

// vim: set ts=2 sw=2 tw=80:
