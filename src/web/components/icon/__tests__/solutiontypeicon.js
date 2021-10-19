/* Copyright (C) 2019-2021 Greenbone Networks GmbH
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

    expect(element1).toMatchSnapshot();
    expect(element2).toMatchSnapshot();
    expect(element3).toMatchSnapshot();
    expect(element4).toMatchSnapshot();
    expect(element5).toMatchSnapshot();
    expect(element6).toMatchSnapshot();
    expect(element7).toMatchSnapshot();
    expect(element8).toMatchSnapshot();
  });
});

// vim: set ts=2 sw=2 tw=80:
