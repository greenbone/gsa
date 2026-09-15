/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import dayjs, {type Date} from 'gmp/models/date';
import {OPENVASD_SCANNER_TYPE, type ScannerType} from 'gmp/models/scanner';
import {isDefined} from 'gmp/utils/identity';
import HaloDot from 'web/components/status/HaloDot';
import useTranslation from 'web/hooks/useTranslation';

interface ReportScannerContactProps {
  isRunning?: boolean;
  modificationTime?: Date;
  scannerType?: ScannerType;
}

const ReportScannerContact = ({
  isRunning = false,
  modificationTime,
  scannerType,
}: ReportScannerContactProps) => {
  const [_] = useTranslation();

  if (
    !isRunning ||
    scannerType !== OPENVASD_SCANNER_TYPE ||
    !isDefined(modificationTime)
  ) {
    return null;
  }

  const seconds = Math.max(0, dayjs().diff(modificationTime, 'second'));
  const lastContact = _('Last contact {{seconds}} seconds ago', {seconds});

  return (
    <HaloDot
      aria-label={lastContact}
      data-testid="scanner-contact"
      title={lastContact}
    />
  );
};

export default ReportScannerContact;
