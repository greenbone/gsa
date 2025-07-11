/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {render, screen} from 'web/testing';
import {COMPLIANCE} from 'gmp/models/compliance';
import ComplianceBar from 'web/components/bar/ComplianceBar';

describe('ComplianceBar tests', () => {
  test.each([
    [COMPLIANCE.NO, 'No'],
    [COMPLIANCE.INCOMPLETE, 'Incomplete'],
    [COMPLIANCE.YES, 'Yes'],
    [COMPLIANCE.UNDEFINED, 'Undefined'],
  ])(
    'should render %s compliance state with text %s',
    (compliance, expectedText) => {
      render(<ComplianceBar compliance={compliance} />);
      const progressBar = screen.getByTestId('progressbar-box');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar.textContent).toBe(expectedText);
    },
  );

  test('should use default title when toolTip is not defined', () => {
    render(<ComplianceBar compliance="yes" />);
    const progressBarBox = screen.getByTestId('progressbar-box');
    expect(progressBarBox).toHaveAttribute('title', 'Yes');
  });

  test('should use custom toolTip when provided', () => {
    render(<ComplianceBar compliance="yes" toolTip="Custom tooltip" />);
    const progressBarBox = screen.getByTestId('progressbar-box');
    expect(progressBarBox).toHaveAttribute('title', 'Custom tooltip');
  });

  test('should set correct background color for no compliance', () => {
    render(<ComplianceBar compliance="no" />);
    const progress = screen.getByTestId('progress');
    expect(progress).toHaveStyle(
      'background: linear-gradient(90deg, pink 0%, pink 100%)',
    );
  });

  test('should set correct background color for incomplete compliance', () => {
    render(<ComplianceBar compliance="incomplete" />);
    const progress = screen.getByTestId('progress');
    expect(progress).toHaveStyle(
      'background: linear-gradient(90deg, yellow 0%, yellow 100%)',
    );
  });

  test('should set correct background color for yes compliance', () => {
    render(<ComplianceBar compliance="yes" />);
    const progress = screen.getByTestId('progress');
    expect(progress).toHaveStyle(
      'background: linear-gradient(90deg, lightgreen 0%, lightgreen 100%)',
    );
  });

  test('should set correct background color for undefined compliance', () => {
    render(<ComplianceBar compliance="undefined" />);
    const progress = screen.getByTestId('progress');
    expect(progress).toHaveStyle(
      'background: linear-gradient(90deg, gray 0%, gray 100%)',
    );
  });
});
