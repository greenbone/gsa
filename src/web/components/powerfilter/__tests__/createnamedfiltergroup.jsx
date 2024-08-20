/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import {render, fireEvent} from 'web/utils/testing';

import CreateNamedFilterGroup from '../createnamedfiltergroup';

describe('CreateNamedFilterGroup tests', () => {
  test('should render', () => {
    const handleChangeMock = testing.fn();
    const {element} = render(
      <CreateNamedFilterGroup onValueChange={handleChangeMock} />,
    );

    expect(element).toBeInTheDocument();
  });

  test('should check checkbox and enable textfield correctly', () => {
    const handleChangeMock = testing.fn();
    const {getByTestId} = render(
      <CreateNamedFilterGroup
        saveNamedFilter={true}
        onValueChange={handleChangeMock}
      />,
    );
    const checkbox = getByTestId('createnamedfiltergroup-checkbox');
    const textfield = getByTestId('createnamedfiltergroup-textfield');

    expect(checkbox.checked).toEqual(true);
    expect(textfield.disabled).toEqual(false);
  });

  test('should uncheck checkbox and disable textfield correctly', () => {
    const handleChangeMock = testing.fn();
    const {getByTestId} = render(
      <CreateNamedFilterGroup
        saveNamedFilter={false}
        onValueChange={handleChangeMock}
      />,
    );
    const checkbox = getByTestId('createnamedfiltergroup-checkbox');
    const textfield = getByTestId('createnamedfiltergroup-textfield');

    expect(checkbox.checked).toEqual(false);
    expect(textfield.disabled).toEqual(true);
  });

  test('should uncheck checkbox if saveNamedFilter is undefined', () => {
    const handleChangeMock = testing.fn();
    const {getByTestId} = render(
      <CreateNamedFilterGroup onValueChange={handleChangeMock} />,
    );
    const checkbox = getByTestId('createnamedfiltergroup-checkbox');
    expect(checkbox.checked).toEqual(false);
  });

  test('should call change handler of checkbox for "unchecking"', () => {
    const handleChangeMock = testing.fn();
    const {getByTestId} = render(
      <CreateNamedFilterGroup
        saveNamedFilter={true}
        onValueChange={handleChangeMock}
      />,
    );

    const checkbox = getByTestId('createnamedfiltergroup-checkbox');
    fireEvent.click(checkbox);

    expect(handleChangeMock).toHaveBeenCalledWith(false, 'saveNamedFilter');
  });

  test('should call change handler of checkbox for "checking"', () => {
    const handleChangeMock = testing.fn();
    const {getByTestId} = render(
      <CreateNamedFilterGroup
        saveNamedFilter={false}
        onValueChange={handleChangeMock}
      />,
    );

    const checkbox = getByTestId('createnamedfiltergroup-checkbox');
    fireEvent.click(checkbox);

    expect(handleChangeMock).toHaveBeenCalledWith(true, 'saveNamedFilter');
  });

  test('should call change handler of textfield with value and name', () => {
    const handleChangeMock = testing.fn();

    const {getByTestId} = render(
      <CreateNamedFilterGroup
        saveNamedFilter={true}
        filterName={'foo'}
        onValueChange={handleChangeMock}
      />,
    );

    const textField = getByTestId('createnamedfiltergroup-textfield');
    fireEvent.change(textField, {target: {value: 'bar'}});

    expect(handleChangeMock).toHaveBeenCalledWith('bar', 'filterName');
  });

  test('textfield should not change value when disabled', () => {
    const handleChangeMock = testing.fn();

    const {getByTestId} = render(
      <CreateNamedFilterGroup
        saveNamedFilter={false}
        filterName={'foo'}
        onValueChange={handleChangeMock}
      />,
    );

    const textField = getByTestId('createnamedfiltergroup-textfield');
    fireEvent.change(textField, {target: {value: 'bar'}});

    expect(handleChangeMock).not.toHaveBeenCalled();
  });
});

// vim: set ts=2 sw=2 tw=80:
