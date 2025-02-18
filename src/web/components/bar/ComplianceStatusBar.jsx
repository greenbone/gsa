/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import ProgressBar from 'web/components/bar/ProgressBar';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';
import Theme from 'web/utils/Theme';

const ComplianceStatusBar = ({complianceStatus}) => {
  let text;
  let boxBackground;
  const [_] = useTranslation();
  if (complianceStatus < 0 || complianceStatus > 100) {
    text = _('N/A');
    boxBackground = Theme.darkGrey;
  } else {
    text = complianceStatus + '%';
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

ComplianceStatusBar.propTypes = {
  complianceStatus: PropTypes.numberOrNumberString,
};

export default ComplianceStatusBar;
