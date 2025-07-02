/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import ProgressBar from 'web/components/bar/ProgressBar';
import useTranslation from 'web/hooks/useTranslation';
import Theme from 'web/utils/Theme';

interface ComplianceStatusBarProps {
  complianceStatus?: string | number;
}

const ComplianceStatusBar = ({
  complianceStatus = 0,
}: ComplianceStatusBarProps) => {
  let text: string;
  let boxBackground: string;
  const [_] = useTranslation();

  // Convert to number for comparison
  const numValue = Number(complianceStatus);

  if (isNaN(numValue) || numValue < 0 || numValue > 100) {
    text = _('N/A');
    boxBackground = Theme.darkGray;
  } else {
    text = numValue + '%';
    boxBackground = Theme.errorRed;
  }

  return (
    <ProgressBar
      background={Theme.statusRunGreen}
      boxBackground={boxBackground}
      data-testid="compliance-status-bar"
      progress={complianceStatus}
      title={text}
    >
      {text}
    </ProgressBar>
  );
};

export default ComplianceStatusBar;
