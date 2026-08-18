/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import {render, screen} from 'web/testing';
import {
  getAuthorizationLabel,
  getConnectionStatusLabel,
} from 'web/components/label/AgentsStateLabel';
import Theme from 'web/utils/theme';

describe('AgentsStateLabel tests', () => {
  describe('getConnectionStatusLabel', () => {
    test.each([
      ['active', 'Active', Theme.green],
      ['INACTIVE', 'Inactive', Theme.errorRed],
      ['not authorized', 'Notauthorized', Theme.severityWarnYellow],
      ['unknown', 'Unknown', Theme.green],
      [undefined, 'Unknown', Theme.green],
    ])(
      'should render the %s connection status label',
      (status, text, color) => {
        render(getConnectionStatusLabel(status));

        const label = screen.getByTestId('connection-status-label');

        expect(label).toBeVisible();
        expect(label).toHaveTextContent(text);
        expect(label).toHaveBackgroundColor(color);
        expect(label).toHaveBorderColor(color);
        expect(label).toHaveColor(Theme.white);
      },
    );
  });

  describe('getAuthorizationLabel', () => {
    test.each([
      [true, 'Yes', Theme.green],
      [false, 'No', Theme.errorRed],
      [undefined, 'No', Theme.errorRed],
    ])(
      'should render the %s authorization label',
      (authorized, text, color) => {
        render(getAuthorizationLabel(authorized));

        const label = screen.getByTestId('authorization-status-label');

        expect(label).toBeVisible();
        expect(label).toHaveTextContent(text);
        expect(label).toHaveBackgroundColor(color);
        expect(label).toHaveBorderColor(color);
        expect(label).toHaveColor(Theme.white);
      },
    );
  });
});
