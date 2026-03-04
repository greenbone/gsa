/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type Date as GmpDate} from 'gmp/models/date';
import {isDefined} from 'gmp/utils/identity';
import DateTime from 'web/components/date/DateTime';
import {RefreshIcon} from 'web/components/icon';
import ManualIcon from 'web/components/icon/ManualIcon';
import IconDivider from 'web/components/layout/IconDivider';
import useTranslation from 'web/hooks/useTranslation';

interface AgentsListPageToolBarIconsProps {
  lastUpdatedAt?: GmpDate;
  onSyncClick: () => void;
}

const AgentsListPageToolBarIcons = ({
  lastUpdatedAt,
  onSyncClick,
}: AgentsListPageToolBarIconsProps) => {
  const [_] = useTranslation();
  return (
    <IconDivider>
      <ManualIcon
        /* TODO add correct link */
        anchor="creating-and-managing-agents"
        page="scanning"
        title={_('Help: Agents')}
      />
      <RefreshIcon title={_('Sync Agents')} onClick={onSyncClick} />
      {isDefined(lastUpdatedAt) && (
        <span>
          {_('Last updated:')} <DateTime date={lastUpdatedAt} />
        </span>
      )}
    </IconDivider>
  );
};

export default AgentsListPageToolBarIcons;
