/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {openSelectElement, screen, fireEvent, render} from 'web/testing';
import Filter from 'gmp/models/filter';
import TicketStatusGroup from 'web/components/powerfilter/TicketStatusGroup';

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
    expect(element).toBeVisible();
  });

  test('should allow to change value', async () => {
    const filter = Filter.fromString('status=Closed');
    const handleChange = testing.fn();

    render(
      <TicketStatusGroup
        filter={filter}
        name="status"
        onChange={handleChange}
      />,
    );

    const select = screen.getByName('status') as HTMLSelectElement;
    expect(select).toHaveValue('Closed');

    await openSelectElement(select);

    const domItems = screen.getSelectItemElements();
    fireEvent.click(domItems[2]);

    expect(handleChange).toBeCalledWith('"Fix Verified"', 'status');
  });

  test('should render title', () => {
    const filter = Filter.fromString('status=Open');
    const handleChange = testing.fn();

    render(
      <TicketStatusGroup
        filter={filter}
        name="status"
        onChange={handleChange}
      />,
    );

    expect(screen.getByText('Ticket Status')).toBeVisible();
  });
});
