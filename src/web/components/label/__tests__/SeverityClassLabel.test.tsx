/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {render, screen} from 'web/testing';
import SeverityClassLabel from 'web/components/label/SeverityClassLabel';
import Theme from 'web/utils/theme';

const getLabel = (testId: string) => screen.getByTestId(testId);

describe('SeverityClassLabel tests', () => {
  test('should render', () => {
    render(<SeverityClassLabel.High />);

    expect(getLabel('severity-class-High')).toBeVisible();
  });

  test.each([
    [
      'High',
      'severity-class-High',
      SeverityClassLabel.High,
      Theme.severityClassHigh,
      Theme.white,
    ],
    [
      'Medium',
      'severity-class-Medium',
      SeverityClassLabel.Medium,
      Theme.severityClassMedium,
      Theme.black,
    ],
    [
      'Low',
      'severity-class-Low',
      SeverityClassLabel.Low,
      Theme.severityClassLow,
      Theme.white,
    ],
    [
      'Log',
      'severity-class-Log',
      SeverityClassLabel.Log,
      Theme.severityClassLog,
      Theme.white,
    ],
    [
      'False Pos.',
      'severity-class-False-Positive',
      SeverityClassLabel.FalsePositive,
      Theme.mediumGray,
      Theme.white,
    ],
    [
      'Critical',
      'severity-class-Critical',
      SeverityClassLabel.Critical,
      Theme.severityClassCritical,
      Theme.white,
    ],
  ])(
    'should render the %s label with the correct styles',
    (text, testId, Label, color, textColor) => {
      render(<Label />);

      const label = getLabel(testId);

      expect(label).toHaveBackgroundColor(color);
      expect(label).toHaveBorderColor(color);
      expect(label).toHaveColor(textColor);
      expect(label).toHaveTextContent(text);
    },
  );
});
