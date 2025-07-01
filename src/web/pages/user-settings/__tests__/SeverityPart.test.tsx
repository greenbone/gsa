/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {render, screen, fireEvent} from 'web/testing';
import {YES_VALUE, NO_VALUE} from 'gmp/parser';
import SeverityPart from 'web/pages/user-settings/SeverityPart';

describe('SeverityPart', () => {
  describe('Checkbox Dynamic Severity', () => {
    test('renders correctly with default props', () => {
      const handleChange = testing.fn();

      render(
        <SeverityPart
          defaultSeverity={5.0}
          dynamicSeverity={NO_VALUE}
          onChange={handleChange}
        />,
      );

      const checkbox = screen.getByText('Dynamic Severity');
      expect(checkbox).toBeInTheDocument();
      const input = screen.getByTestId('opensight-checkbox');
      expect(input).not.toBeChecked();

      const spinner = screen.getByTestId('number-input');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveValue('5.0');
    });

    test('renders correctly when dynamic severity is enabled', () => {
      const handleChange = testing.fn();

      render(
        <SeverityPart
          defaultSeverity={5.0}
          dynamicSeverity={YES_VALUE}
          onChange={handleChange}
        />,
      );

      const input = screen.getByTestId('opensight-checkbox');
      expect(input).toBeChecked();
    });

    test('calls onChange when checkbox is toggled', () => {
      const handleChange = testing.fn();

      render(
        <SeverityPart
          defaultSeverity={5.0}
          dynamicSeverity={NO_VALUE}
          onChange={handleChange}
        />,
      );

      const checkbox = screen.getByTestId('opensight-checkbox');
      fireEvent.click(checkbox);

      expect(handleChange).toHaveBeenCalledWith(YES_VALUE, 'dynamicSeverity');
    });
  });

  describe('Spinner Default Severity', () => {
    test('calls onChange when spinner value changes', () => {
      const handleChange = testing.fn();

      render(
        <SeverityPart
          defaultSeverity={5.0}
          dynamicSeverity={NO_VALUE}
          onChange={handleChange}
        />,
      );

      const spinner = screen.getByTestId('number-input');

      fireEvent.change(spinner, {target: {value: '7.5'}});

      expect(handleChange).toHaveBeenCalled();
    });

    test('handles minimum boundary value for default severity', () => {
      const handleChange = testing.fn();

      render(
        <SeverityPart
          defaultSeverity={0}
          dynamicSeverity={NO_VALUE}
          onChange={handleChange}
        />,
      );

      const spinner = screen.getByTestId('number-input');
      expect(spinner).toHaveValue('0.0');
    });

    test('handles maximum boundary value for default severity', () => {
      const handleChange = testing.fn();

      render(
        <SeverityPart
          defaultSeverity={10}
          dynamicSeverity={NO_VALUE}
          onChange={handleChange}
        />,
      );

      const spinner = screen.getByTestId('number-input');
      expect(spinner).toHaveValue('10.0');
    });
  });
});
