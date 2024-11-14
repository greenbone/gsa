/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import useTranslation from 'web/hooks/useTranslation';

import PropTypes from 'web/utils/proptypes';
import Theme from 'web/utils/theme';

import ProgressBar from 'web/components/bar/progressbar';

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
      title={text}
      progress={complianceStatus}
      background={Theme.statusRunGreen}
      boxBackground={boxBackground}
      data-testid="progress-bar"
    >
      {text}
    </ProgressBar>
  );
};

ComplianceStatusBar.propTypes = {
  complianceStatus: PropTypes.numberOrNumberString,
};

export default ComplianceStatusBar;

// vim: set ts=2 sw=2 tw=80:
