/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {
  openSelectElement,
  screen,
  render,
  fireEvent,
  changeInputValue,
} from 'web/testing';
import RelationSelector from 'web/components/powerfilter/RelationSelector';

describe('Relation Selector Tests', () => {
  test('should render', () => {
    const onChange = testing.fn();
    const {container} = render(
      <RelationSelector relation="<" onChange={onChange} />,
    );

    expect(container).toBeVisible();
  });

  test('should return items', async () => {
    const onChange = testing.fn();
    render(<RelationSelector relation="<" onChange={onChange} />);

    expect(screen.getSelectItemElements().length).toEqual(4);
    const select = screen.getByTestId<HTMLSelectElement>('relation-selector');
    await openSelectElement(select);

    const domItems = screen.getSelectItemElements();
    expect(domItems.length).toEqual(4);
    expect(domItems[0]).toHaveTextContent('--');
    expect(domItems[1]).toHaveTextContent('is equal to');
    expect(domItems[2]).toHaveTextContent('is greater than');
    expect(domItems[3]).toHaveTextContent('is less than');
  });

  test('should call onChange handler', async () => {
    const onChange = testing.fn();

    render(<RelationSelector relation="<" onChange={onChange} />);

    const select = screen.getByTestId<HTMLSelectElement>('relation-selector');
    await openSelectElement(select);

    const domItems = screen.getSelectItemElements();
    fireEvent.click(domItems[1]);
    expect(onChange).toBeCalled();
    expect(onChange).toBeCalledWith('=', undefined);
  });

  test('should change value', async () => {
    const onChange = testing.fn();

    render(<RelationSelector relation="=" onChange={onChange} />);

    const select = screen.getByTestId<HTMLSelectElement>('relation-selector');
    expect(select).toHaveValue('is equal to');

    await openSelectElement(select);

    const domItems = screen.getSelectItemElements();
    fireEvent.click(domItems[3]);
    expect(onChange).toBeCalled();
    expect(onChange).toBeCalledWith('<', undefined);
  });

  test('should filter items', async () => {
    const onChange = testing.fn();
    render(<RelationSelector relation="=" onChange={onChange} />);

    fireEvent.click(screen.getByRole('textbox'));

    expect(screen.getAllByRole('option').length).toEqual(4);

    changeInputValue(screen.getByRole('textbox'), 'than');
    expect(screen.getAllByRole('option').length).toEqual(2);

    changeInputValue(screen.getByRole('textbox'), 'to');
    expect(screen.getAllByRole('option').length).toEqual(1);
  });
});
