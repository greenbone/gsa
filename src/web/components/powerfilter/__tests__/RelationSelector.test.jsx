/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import RelationSelector from 'web/components/powerfilter/RelationSelector';
import {openSelectElement, screen} from 'web/testing';
import {render, fireEvent} from 'web/utils/Testing';

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

    let domItems = screen.getSelectItemElements();
    expect(screen.queryByRole('option')).not.toBeInTheDocument();

    await openSelectElement();

    domItems = screen.getSelectItemElements();

    expect(domItems.length).toEqual(4);
    expect(domItems[0]).toHaveTextContent('--');
    expect(domItems[1]).toHaveTextContent('is equal to');
    expect(domItems[2]).toHaveTextContent('is greater than');
    expect(domItems[3]).toHaveTextContent('is less than');
  });

  test('should call onChange handler', async () => {
    const onChange = testing.fn();

    render(<RelationSelector relation="<" onChange={onChange} />);

    await openSelectElement();

    const domItems = screen.getSelectItemElements();

    fireEvent.click(domItems[1]);

    expect(onChange).toBeCalled();
    expect(onChange).toBeCalledWith('=', undefined);
  });

  test('should change value', async () => {
    const onChange = testing.fn();

    render(<RelationSelector relation="=" onChange={onChange} />);

    const displayedValue = screen.getSelectElement();
    expect(displayedValue).toHaveValue('is equal to');

    await openSelectElement();

    const domItems = screen.getSelectItemElements();

    fireEvent.click(domItems[3]);

    expect(onChange).toBeCalled();
    expect(onChange).toBeCalledWith('<', undefined);
  });

  test('should filter items', async () => {
    const onChange = testing.fn();
    render(<RelationSelector relation="=" onChange={onChange} />);

    fireEvent.click(screen.getByRole('textbox'));

    let domItems = screen.getAllByRole('option');
    expect(domItems.length).toEqual(4);

    fireEvent.change(screen.getByRole('textbox'), {target: {value: 'than'}});
    domItems = screen.getAllByRole('option');
    expect(domItems.length).toEqual(2);

    fireEvent.change(screen.getByRole('textbox'), {target: {value: 'to'}});
    domItems = screen.getAllByRole('option');
    expect(domItems.length).toEqual(1);
  });
});
