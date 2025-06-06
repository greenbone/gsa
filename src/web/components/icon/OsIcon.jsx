/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {isDefined, isString} from 'gmp/utils/identity';
import Img from 'web/components/img/Img';
import Divider from 'web/components/layout/Divider';
import Layout from 'web/components/layout/Layout';
import useTranslation from 'web/hooks/useTranslation';
import OperatingSystems from 'web/utils/Os';
import PropTypes from 'web/utils/PropTypes';

const OsIcon = ({
  displayOsCpe = true,
  displayOsName = false,
  osTxt,
  osCpe,
  ...props
}) => {
  const [_] = useTranslation();
  const os = isString(osCpe) ? OperatingSystems.find(osCpe) : undefined;

  let title;
  let os_icon;

  if (isString(osTxt) && osTxt.includes('[possible conflict]')) {
    os_icon = 'os_conflict.svg';
    if (displayOsCpe) {
      title = _('OS Conflict: {{best_os_txt}} ({{best_os_cpe}})', {
        best_os_txt: osTxt,
        best_os_cpe: osCpe,
      });
    } else {
      title = _('OS Conflict: {{best_os_txt}}', {
        best_os_txt: osTxt,
      });
    }
  } else if (isDefined(os)) {
    os_icon = os.icon;
    title = os.title;
    if (displayOsCpe) {
      title += ' (' + osCpe + ')';
    }
  }

  if (!isDefined(os_icon)) {
    os_icon = 'os_unknown.svg';
    if (osTxt) {
      title = osTxt;
    } else {
      title = _('No information about the Operation System');
    }
  }

  return (
    <Layout>
      <Divider title={title}>
        <Img {...props} src={os_icon} width="16px" />
        {displayOsName && isDefined(os) && <span>{os.title}</span>}
      </Divider>
    </Layout>
  );
};

OsIcon.propTypes = {
  displayOsCpe: PropTypes.bool,
  displayOsName: PropTypes.bool,
  osCpe: PropTypes.string,
  osTxt: PropTypes.string,
};

export default OsIcon;
