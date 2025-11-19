/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import ExportIcon from 'web/components/icon/ExportIcon';
import ListIcon from 'web/components/icon/ListIcon';
import ManualIcon from 'web/components/icon/ManualIcon';
import Divider from 'web/components/layout/Divider';
import IconDivider from 'web/components/layout/IconDivider';
import CloneIcon from 'web/entity/icon/CloneIcon';
import CreateIcon from 'web/entity/icon/CreateIcon';
import EditIcon from 'web/entity/icon/EditIcon';
import TrashIcon from 'web/entity/icon/TrashIcon';
import useTranslation from 'web/hooks/useTranslation';

const TargetDetailsToolBarIcons = ({
  entity,
  onTargetCloneClick,
  onTargetCreateClick,
  onTargetDeleteClick,
  onTargetDownloadClick,
  onTargetEditClick,
}) => {
  const [_] = useTranslation();
  return (
    <Divider margin="10px">
      <IconDivider>
        <ManualIcon
          anchor="managing-targets"
          page="scanning"
          title={_('Help: Targets')}
        />
        <ListIcon page="targets" title={_('Target List')} />
      </IconDivider>
      <IconDivider>
        <CreateIcon entity={entity} onClick={onTargetCreateClick} />
        <CloneIcon entity={entity} onClick={onTargetCloneClick} />
        <EditIcon entity={entity} onClick={onTargetEditClick} />
        <TrashIcon entity={entity} onClick={onTargetDeleteClick} />
        <ExportIcon
          title={_('Export Target as XML')}
          value={entity}
          onClick={onTargetDownloadClick}
        />
      </IconDivider>
    </Divider>
  );
};

export default TargetDetailsToolBarIcons;
