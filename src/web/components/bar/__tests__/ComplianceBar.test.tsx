/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {render, screen} from 'web/testing';
import {COMPLIANCE} from 'gmp/models/compliance';
import ComplianceBar from 'web/components/bar/ComplianceBar';
import {cssColorToRgb} from 'web/testing/custom-matchers';
import Theme from 'web/utils/theme';

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

  test.each([
    [COMPLIANCE.NO, Theme.complianceNo],
    [COMPLIANCE.INCOMPLETE, Theme.complianceIncomplete],
    [COMPLIANCE.YES, Theme.complianceYes],
    [COMPLIANCE.UNDEFINED, Theme.complianceUndefined],
  ])(
    'should set the correct background color for %s compliance',
    (compliance, color) => {
      render(<ComplianceBar compliance={compliance} />);
      const progress = screen.getByTestId('progress');
      const rgb = cssColorToRgb(color);
      expect(progress).toHaveStyle(
        `background-image: linear-gradient(90deg, ${rgb} 0%, ${rgb} 100%)`,
      );
    },
  );
});
