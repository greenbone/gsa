/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import NvtPreference from 'web/pages/nvts/NvtPreference';
import {render, fireEvent, screen} from 'web/testing';

describe('NvtPreference', () => {
  const mockOnChange = testing.fn();

  const renderComponent = (preference, value) => {
    render(
      <table>
        <tbody>
          <NvtPreference
            preference={preference}
            title="Edit NVT Details"
            value={value}
            onChange={mockOnChange}
          />
        </tbody>
      </table>,
    );
  };

  test('renders checkbox input', () => {
    const preference = {
      type: 'checkbox',
      hr_name: 'Checkbox Preference',
      name: 'checkbox_preference',
    };
    renderComponent(preference, 'yes');

    expect(screen.getByText('Checkbox Preference')).toBeVisible();
    expect(screen.getByRole('radio', {name: /yes/i})).toBeVisible();
    expect(screen.getByRole('radio', {name: /no/i})).toBeVisible();
  });

  test('renders password input', () => {
    const preference = {
      type: 'password',
      hr_name: 'Password Preference',
      name: 'password_preference',
    };
    renderComponent(preference, '');

    expect(screen.getByText('Password Preference')).toBeVisible();
    expect(
      screen.getByRole('checkbox', {name: /Replace existing password with/i}),
    ).toBeVisible();
    expect(screen.getByTestId('password-input')).toBeDisabled();
  });

  test('renders file input', () => {
    const preference = {
      type: 'file',
      hr_name: 'File Preference',
      name: 'file_preference',
      value: '',
    };
    renderComponent(preference, '');

    expect(screen.getByText('File Preference')).toBeVisible();
    expect(screen.getByRole('checkbox', {name: /Upload file/i})).toBeVisible();
    expect(screen.getByTestId('file-input')).toBeDisabled();
  });

  test('renders radio input', () => {
    const preference = {
      type: 'radio',
      hr_name: 'Radio Preference',
      name: 'radio_preference',
      value: 'option1',
      alt: ['option2', 'option3'],
    };
    renderComponent(preference, 'option1');

    expect(screen.getByText('Radio Preference')).toBeVisible();
    expect(screen.getByRole('radio', {name: /option1/i})).toBeChecked();
    expect(screen.getByRole('radio', {name: /option2/i})).toBeVisible();
    expect(screen.getByRole('radio', {name: /option3/i})).toBeVisible();
  });

  test('renders radio input with numeric value 0', () => {
    const preference = {
      type: 'radio',
      hr_name: 'Radio Preference',
      name: 'radio_preference',
      value: 1,
      alt: [0, 2],
    };
    renderComponent(preference, 2);

    expect(screen.getByText('Radio Preference')).toBeVisible();
    expect(screen.getByRole('radio', {name: '0'})).toBeVisible();
    expect(screen.getByRole('radio', {name: '1'})).toBeVisible();
    expect(screen.getByRole('radio', {name: '2'})).toBeChecked();

    fireEvent.click(screen.getByRole('radio', {name: '0'}));
    expect(mockOnChange).toHaveBeenCalledWith({
      type: 'setValue',
      newState: {name: 'radio_preference', value: 0},
    });
  });

  test('renders text input', () => {
    const preference = {
      type: 'text',
      hr_name: 'Text Preference',
      name: 'text_preference',
    };
    renderComponent(preference, 'some text');

    expect(screen.getByText('Text Preference')).toBeVisible();
    expect(screen.getByRole('textbox')).toHaveValue('some text');
  });

  test('calls onChange when checkbox is toggled', () => {
    const preference = {
      type: 'checkbox',
      hr_name: 'Checkbox Preference',
      name: 'checkbox_preference',
    };
    renderComponent(preference, 'yes');

    fireEvent.click(screen.getByRole('radio', {name: /no/i}));
    expect(mockOnChange).toHaveBeenCalledWith({
      type: 'setValue',
      newState: {name: 'checkbox_preference', value: 'no'},
    });
  });

  test('calls onChange when password checkbox is toggled', () => {
    const preference = {
      type: 'password',
      hr_name: 'Password Preference',
      name: 'password_preference',
    };
    renderComponent(preference, '');

    fireEvent.click(
      screen.getByRole('checkbox', {name: /Replace existing password with/i}),
    );

    expect(screen.getByTestId('password-input')).not.toBeDisabled();
    expect(mockOnChange).toHaveBeenCalledWith({
      type: 'setValue',
      newState: {name: 'password_preference', value: ''},
    });
  });

  test('calls onChange when file checkbox is toggled', () => {
    const preference = {
      type: 'file',
      hr_name: 'File Preference',
      name: 'file_preference',
      value: '',
    };
    renderComponent(preference, '');

    fireEvent.click(screen.getByRole('checkbox', {name: /Upload file/i}));
    expect(mockOnChange).toHaveBeenCalledWith({
      type: 'setValue',
      newState: {name: 'file_preference', value: ''},
    });
  });

  test('calls onChange when radio is selected', () => {
    const preference = {
      type: 'radio',
      hr_name: 'Radio Preference',
      name: 'radio_preference',
      value: 'option1',
      alt: ['option2', 'option3'],
    };
    renderComponent(preference, 'option1');

    fireEvent.click(screen.getByRole('radio', {name: /option2/i}));
    expect(mockOnChange).toHaveBeenCalledWith({
      type: 'setValue',
      newState: {name: 'radio_preference', value: 'option2'},
    });
  });

  test('calls onChange when text input is changed', () => {
    const preference = {
      type: 'text',
      hr_name: 'Text Preference',
      name: 'text_preference',
    };
    renderComponent(preference, 'some text');

    fireEvent.change(screen.getByRole('textbox'), {
      target: {value: 'new text'},
    });
    expect(mockOnChange).toHaveBeenCalledWith({
      type: 'setValue',
      newState: {name: 'text_preference', value: 'new text'},
    });
  });
});
