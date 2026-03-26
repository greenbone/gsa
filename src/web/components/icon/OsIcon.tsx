/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined, isString} from 'gmp/utils/identity';
import Img from 'web/components/img/Img';
import Divider from 'web/components/layout/Divider';
import Layout from 'web/components/layout/Layout';
import useTranslation from 'web/hooks/useTranslation';
import OperatingSystems from 'web/utils/Os';

interface OsIconProps {
  displayOsCpe?: boolean;
  displayOsName?: boolean;
  osTxt?: string;
  osCpe?: string;
}

const OsIcon = ({
  displayOsCpe = true,
  displayOsName = false,
  osTxt,
  osCpe,
}: OsIconProps) => {
  const [_] = useTranslation();
  const os = isString(osCpe) ? OperatingSystems.find(osCpe) : undefined;

  let title: string | undefined;
  let osIcon: string | undefined;

  if (isString(osTxt) && osTxt.includes('[possible conflict]')) {
    osIcon = 'os_conflict.svg';
    if (displayOsCpe) {
      title = _('OS Conflict: {{best_os_txt}} ({{best_os_cpe}})', {
        best_os_txt: osTxt,
        best_os_cpe: osCpe ?? '',
      });
    } else {
      title = _('OS Conflict: {{best_os_txt}}', {
        best_os_txt: osTxt,
      });
    }
  } else if (isDefined(os)) {
    osIcon = os.icon;
    title = os.title;
    if (displayOsCpe) {
      title += ' (' + osCpe + ')';
    }
  }

  if (!isDefined(osIcon)) {
    osIcon = 'os_unknown.svg';
    if (osTxt) {
      title = osTxt;
    } else {
      title = _('No information about the Operation System');
    }
  }

  return (
    <Layout>
      <Divider title={title}>
        <Img src={osIcon} width="16px" />
        {displayOsName && isDefined(os) && <span>{os.title}</span>}
      </Divider>
    </Layout>
  );
};

export default OsIcon;
