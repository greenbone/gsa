/* Copyright (C) 2019-2022 Greenbone AG
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
import {describe, test, expect, testing} from '@gsa/testing';

import Filter from 'gmp/models/filter';

import {render} from 'web/utils/testing';

import {
  clickItem,
  getElementOrDocument,
  getSelectElement,
  getSelectItemElements,
  openSelectElement,
} from 'web/components/testing';

import TicketStatusGroup from '../ticketstatusgroup';

const getTitle = element => {
  element = getElementOrDocument(element);
  return element.querySelector('.mantine-Text-root');
};

describe('TicketStatusGroup tests', () => {
  test('should render', () => {
    const filter = Filter.fromString('status=Closed');
    const handleChange = testing.fn();

    const {element} = render(
      <TicketStatusGroup
        filter={filter}
        name="status"
        onChange={handleChange}
      />,
    );

    expect(element).toBeInTheDocument();
  });

  test('should render value from filter and change it', async () => {
    const filter = Filter.fromString('status=Closed');
    const handleChange = testing.fn();

    render(
      <TicketStatusGroup
        filter={filter}
        name="status"
        onChange={handleChange}
      />,
    );

    const select = getSelectElement();
    expect(select).toHaveValue('Closed');

    await openSelectElement();

    const domItems = getSelectItemElements();
    await clickItem(domItems[2]);

    expect(handleChange).toBeCalled();
    expect(handleChange).toBeCalledWith('"Fix Verified"', 'status');
  });

  test('should process title', () => {
    const filter = Filter.fromString('status=Open');
    const handleChange = testing.fn();

    render(
      <TicketStatusGroup
        filter={filter}
        name="status"
        onChange={handleChange}
      />,
    );

    expect(getTitle()).toHaveTextContent('Ticket Status');
  });
});
