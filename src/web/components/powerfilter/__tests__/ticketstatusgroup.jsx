/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import {render, fireEvent} from 'web/utils/testing';

import {
  openSelectElement,
  getItemElements,
} from 'web/components/form/__tests__/select';

import TicketStatusGroup from 'web/components/powerfilter/ticketstatusgroup';

import Filter from 'gmp/models/filter';

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

  test('should render value from filter and change it', () => {
    const filter = Filter.fromString('status=Closed');
    const handleChange = testing.fn();

    // eslint-disable-next-line no-shadow
    const {baseElement, element, getByTestId} = render(
      <TicketStatusGroup
        filter={filter}
        name="status"
        onChange={handleChange}
      />,
    );

    const displayedValue = getByTestId('select-selected-value');
    expect(displayedValue).toHaveTextContent('Closed');

    openSelectElement(element);

    const domItems = getItemElements(baseElement);

    fireEvent.click(domItems[2]);

    expect(handleChange).toBeCalled();
    expect(handleChange).toBeCalledWith('"Fix Verified"', 'status');
  });
  test('should process title', () => {
    const filter = Filter.fromString('status=Open');
    const handleChange = testing.fn();
    const {element} = render(
      <TicketStatusGroup
        filter={filter}
        name="status"
        onChange={handleChange}
      />,
    );

    const input = element.querySelectorAll('label');

    expect(input[0]).toHaveTextContent('Ticket Status');
  });
});
