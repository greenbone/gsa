/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, render, screen, userEvent} from 'web/testing';
import MultiValueTextField from 'web/components/form/MultiValueTextField';

describe('MultiValueTextField tests', () => {
  test('should render input and pills', () => {
    render(
      <MultiValueTextField
        name="kdcs"
        title="KDCs"
        value={['example.com', '192.168.1.1']}
        onChange={testing.fn()}
      />,
    );

    const input = screen.getByTestId('form-multi-input');
    expect(input).toBeInTheDocument();

    expect(screen.getByText('example.com')).toBeVisible();
    expect(screen.getByText('192.168.1.1')).toBeVisible();
  });

  test('should call onChange when a value is added', async () => {
    const onChange = testing.fn();

    render(
      <MultiValueTextField
        name="kdcs"
        title="KDCs"
        value={[]}
        onChange={onChange}
      />,
    );

    const input = screen.getByTestId('form-multi-input');
    await userEvent.type(input, 'myhost.com{enter}');

    expect(onChange).toHaveBeenCalledWith(['myhost.com'], 'kdcs');
  });

  test('should not add duplicate value', async () => {
    const onChange = testing.fn();

    render(
      <MultiValueTextField
        name="kdcs"
        title="KDCs"
        value={['duplicate']}
        onChange={onChange}
      />,
    );

    const input = screen.getByTestId('form-multi-input');
    await userEvent.type(input, 'duplicate{enter}');

    expect(onChange).not.toHaveBeenCalled();
  });

  test('should not add invalid value (space check)', async () => {
    const onChange = testing.fn();
    const validate = (val: string) => !val.includes(' ');

    render(
      <MultiValueTextField
        name="kdcs"
        title="KDCs"
        validate={validate}
        value={[]}
        onChange={onChange}
      />,
    );

    const input = screen.getByTestId('form-multi-input');
    await userEvent.type(input, 'bad host{enter}');

    expect(onChange).not.toHaveBeenCalled();
  });

  test('should remove a pill when close button is clicked', async () => {
    const onChange = testing.fn();

    render(
      <MultiValueTextField
        name="kdcs"
        title="KDCs"
        value={['one', 'two']}
        onChange={onChange}
      />,
    );

    const pill = screen.getByTestId('pill-two');
    const closeButton = pill.querySelector('button');
    expect(closeButton).not.toBeNull();
    if (!closeButton) {
      throw new Error('Close button not found');
    }

    fireEvent.click(closeButton);

    expect(onChange).toHaveBeenCalledWith(['one'], 'kdcs');
  });
});
