/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {afterEach, describe, test, expect, testing} from '@gsa/testing';
import {render, screen} from 'web/testing';
import dayjs from 'gmp/models/date';
import {OPENVASD_SCANNER_TYPE, OPENVAS_SCANNER_TYPE} from 'gmp/models/scanner';
import ReportScannerContact from 'web/pages/reports/ReportScannerContact';

describe('ReportScannerContact tests', () => {
  afterEach(() => {
    testing.useRealTimers();
  });

  test('should show the last contact in the native tooltip', () => {
    testing.useFakeTimers();
    testing.setSystemTime(new Date('2026-09-14T12:00:10Z'));

    render(
      <ReportScannerContact
        isRunning
        modificationTime={dayjs('2026-09-14T12:00:00Z')}
        scannerType={OPENVASD_SCANNER_TYPE}
      />,
    );

    expect(screen.getByTestId('scanner-contact')).toHaveAttribute(
      'title',
      'Last contact 10 seconds ago',
    );
    expect(screen.getByTestId('scanner-contact')).toHaveAttribute(
      'aria-label',
      'Last contact 10 seconds ago',
    );
  });

  test.each([
    ['when the task is not running', {isRunning: false}],
    ['when the scanner is not OpenVASD', {scannerType: OPENVAS_SCANNER_TYPE}],
    ['when modification time is missing', {modificationTime: undefined}],
  ])('should not render %s', (_reason, props) => {
    const {container} = render(
      <ReportScannerContact
        isRunning
        modificationTime={dayjs('2026-09-14T12:00:00Z')}
        scannerType={OPENVASD_SCANNER_TYPE}
        {...props}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
