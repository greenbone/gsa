/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import {render, screen} from 'web/testing';
import ComplianceStateLabel from 'web/components/label/ComplianceStateLabel';
import Theme from 'web/utils/theme';

describe('ComplianceStateLabel tests', () => {
  test.each([
    [
      'Yes',
      'compliance-state-yes',
      ComplianceStateLabel.Yes,
      Theme.complianceYes,
    ],
    ['No', 'compliance-state-no', ComplianceStateLabel.No, Theme.complianceNo],
    [
      'Incomplete',
      'compliance-state-incomplete',
      ComplianceStateLabel.Incomplete,
      Theme.complianceIncomplete,
    ],
    [
      'Undefined',
      'compliance-state-undefined',
      ComplianceStateLabel.Undefined,
      Theme.complianceUndefined,
    ],
  ])(
    'should render the %s label with the correct styles',
    (text, testId, Label, color) => {
      render(<Label />);

      const label = screen.getByTestId(testId);

      expect(label).toBeVisible();
      expect(label).toHaveTextContent(text);
      expect(label).toHaveBackgroundColor(color);
      expect(label).toHaveBorderColor(color);
      expect(label).toHaveColor(Theme.white);
    },
  );
});
