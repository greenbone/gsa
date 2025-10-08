/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import ManualIcon from 'web/components/icon/ManualIcon';
import IconDivider from 'web/components/layout/IconDivider';

import useTranslation from 'web/hooks/useTranslation';

const AgentsListPageToolBarIcons = () => {
  const [_] = useTranslation();
  return (
    <IconDivider>
      <ManualIcon
        /* TODO add correct link */
        anchor="creating-and-managing-agents"
        page="scanning"
        title={_('Help: Agents')}
      />
    </IconDivider>
  );
};

export default AgentsListPageToolBarIcons;
