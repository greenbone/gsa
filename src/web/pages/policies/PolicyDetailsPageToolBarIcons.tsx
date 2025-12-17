/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Policy from 'gmp/models/policy';
import ExportIcon from 'web/components/icon/ExportIcon';
import ListIcon from 'web/components/icon/ListIcon';
import ManualIcon from 'web/components/icon/ManualIcon';
import Divider from 'web/components/layout/Divider';
import IconDivider from 'web/components/layout/IconDivider';
import CloneIcon from 'web/entity/icon/CloneIcon';
import EditIcon from 'web/entity/icon/EditIcon';
import TrashIcon from 'web/entity/icon/TrashIcon';
import useTranslation from 'web/hooks/useTranslation';

interface AuditDetailsPageToolBarIconsProps {
  entity: Policy;
  onPolicyCloneClick: (entity: Policy) => void;
  onPolicyDeleteClick: (entity: Policy) => void;
  onPolicyDownloadClick: () => void;
  onPolicyEditClick: () => void;
}

const PolicyDetailsPageToolBarIcons = ({
  entity,
  onPolicyCloneClick,
  onPolicyDeleteClick,
  onPolicyDownloadClick,
  onPolicyEditClick,
}: AuditDetailsPageToolBarIconsProps) => {
  const [_] = useTranslation();
  return (
    <Divider margin="10px">
      <IconDivider>
        <ManualIcon
          anchor="configuring-and-managing-policies"
          page="compliance-and-special-scans"
          title={_('Help: Policies')}
        />
        <ListIcon page="policies" title={_('Policies List')} />
      </IconDivider>
      <IconDivider>
        <CloneIcon
          displayName={_('Policy')}
          entity={entity}
          onClick={onPolicyCloneClick}
        />
        <EditIcon
          disabled={entity.predefined}
          displayName={_('Policy')}
          entity={entity}
          onClick={onPolicyEditClick}
        />
        <TrashIcon
          displayName={_('Policy')}
          entity={entity}
          onClick={onPolicyDeleteClick}
        />
        <ExportIcon
          title={_('Export Policy as XML')}
          value={entity}
          onClick={onPolicyDownloadClick}
        />
      </IconDivider>
    </Divider>
  );
};

export default PolicyDetailsPageToolBarIcons;
