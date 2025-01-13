/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import NvtPreference from 'web/pages/nvts/nvtpreference';
import {render, fireEvent, screen, wait} from 'web/utils/testing';

describe('NvtPreference', () => {
  const mockOnChange = testing.fn();

  const renderComponent = (preference, value) => {
    render(
      <NvtPreference
        preference={preference}
        title="Edit NVT Details"
        value={value}
        onChange={mockOnChange}
      />,
    );
  };

  test('renders checkbox input', () => {
    const preference = {
      type: 'checkbox',
      hr_name: 'Checkbox Preference',
      name: 'checkbox_preference',
    };
    renderComponent(preference, 'yes');

    expect(screen.getByText('Checkbox Preference')).toBeInTheDocument();
    expect(screen.getByRole('radio', {name: /yes/i})).toBeInTheDocument();
    expect(screen.getByRole('radio', {name: /no/i})).toBeInTheDocument();
  });

  test('renders password input', () => {
    const preference = {
      type: 'password',
      hr_name: 'Password Preference',
      name: 'password_preference',
    };
    renderComponent(preference, '');

    expect(screen.getByText('Password Preference')).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', {name: /Replace existing password with/i}),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeDisabled();
  });

  test('renders file input', () => {
    const preference = {
      type: 'file',
      hr_name: 'File Preference',
      name: 'file_preference',
      value: '',
    };
    renderComponent(preference, '');

    expect(screen.getByText('File Preference')).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', {name: /Upload file/i}),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('File')).toBeDisabled();
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

    expect(screen.getByText('Radio Preference')).toBeInTheDocument();
    expect(screen.getByRole('radio', {name: /option1/i})).toBeChecked();
    expect(screen.getByRole('radio', {name: /option2/i})).toBeInTheDocument();
    expect(screen.getByRole('radio', {name: /option3/i})).toBeInTheDocument();
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
      newState: {name: 'radio_preference', value: '0'},
    });
  });

  test('renders text input', () => {
    const preference = {
      type: 'text',
      hr_name: 'Text Preference',
      name: 'text_preference',
    };
    renderComponent(preference, 'some text');

    expect(screen.getByText('Text Preference')).toBeInTheDocument();
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
