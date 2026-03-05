/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Rejection from 'gmp/http/rejection';
import type Agent from 'gmp/models/agent';
import {isDefined} from 'gmp/utils/identity';
import DateTime from 'web/components/date/DateTime';
import {RefreshIcon} from 'web/components/icon';
import ManualIcon from 'web/components/icon/ManualIcon';
import IconDivider from 'web/components/layout/IconDivider';
import {useSyncAgents} from 'web/hooks/use-query/agents';
import useTranslation from 'web/hooks/useTranslation';

interface AgentsListPageToolBarIconsProps {
  agents?: Agent[];
  onError: (error: Rejection) => void;
}

const AgentsListPageToolBarIcons = ({
  agents,
  onError,
}: AgentsListPageToolBarIconsProps) => {
  const [_] = useTranslation();
  const {mutate: syncAgents} = useSyncAgents({onError});

  const lastUpdatedAt = agents
    ?.map(a => a.modificationTime)
    .filter(isDefined)
    .sort((a, b) => b.valueOf() - a.valueOf())
    .at(0);

  return (
    <IconDivider>
      <ManualIcon
        /* TODO add correct link */
        anchor="creating-and-managing-agents"
        page="scanning"
        title={_('Help: Agents')}
      />
      <RefreshIcon title={_('Sync Agents')} onClick={syncAgents} />
      {isDefined(lastUpdatedAt) && (
        <span>
          {_('Last updated:')} <DateTime date={lastUpdatedAt} />
        </span>
      )}
    </IconDivider>
  );
};

export default AgentsListPageToolBarIcons;
