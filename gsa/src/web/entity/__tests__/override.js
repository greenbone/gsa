/* Copyright (C) 2020-2021 Greenbone Networks GmbH
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
import {setLocale} from 'gmp/models/date';
import Override from 'gmp/models/override';

import {rendererWith} from 'web/utils/testing';

import OverrideBox from '../override';

setLocale('en');

const caps = new Capabilities(['everything']);

const override = Override.fromElement({
  _id: '123',
  severity: '5.0',
  new_severity: '10',
  text: 'foo',
  end_time: '2019-01-01T12:00:00Z',
  modification_time: '2019-02-02T12:00:00Z',
});

describe('OverrideBox component tests', () => {
  test('should render with DetailsLink', () => {
    const {render} = rendererWith({
      capabilities: caps,
      router: true,
    });

    const {element, getByTestId} = render(
      <OverrideBox detailsLink={true} override={override} />,
    );

    const link = getByTestId('details-link');
    const header = element.querySelector('h3');

    expect(header).toHaveTextContent(
      'Override from Severity > 0.0 to 10: High',
    );
    expect(link).toBeDefined();
    expect(link.getAttribute('href')).toEqual('/override/123');
    expect(element).toHaveTextContent('details.svg');
    expect(element).toHaveTextContent('ModifiedSat, Feb 2, 2019');
    expect(element).toHaveTextContent('Active untilTue, Jan 1, 2019');
    expect(element).toHaveTextContent('foo');
  });

  test('should render without DetailsLink', () => {
    const {render} = rendererWith({
      capabilities: caps,
      router: true,
    });

    const {element} = render(
      <OverrideBox detailsLink={false} override={override} />,
    );

    const link = element.querySelector('a');

    expect(link).toEqual(null);
    expect(element).toHaveTextContent('foo');
    expect(element).not.toHaveTextContent('details.svg');
    expect(element).toHaveTextContent('ModifiedSat, Feb 2, 2019');
    expect(element).toHaveTextContent('Active untilTue, Jan 1, 2019');
  });
});

// vim: set ts=2 sw=2 tw=80:
