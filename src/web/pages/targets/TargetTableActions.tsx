/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useTranslation} from 'react-i18next';
import type Target from 'gmp/models/target';
import ExportIcon from 'web/components/icon/ExportIcon';
import IconDivider from 'web/components/layout/IconDivider';
import EntitiesActions, {
  type EntitiesActionsProps,
} from 'web/entities/EntitiesActions';
import CloneIcon from 'web/entity/icon/CloneIcon';
import EditIcon from 'web/entity/icon/EditIcon';
import TrashIcon from 'web/entity/icon/TrashIcon';

export interface TargetTableActionsProps
  extends Omit<EntitiesActionsProps<Target>, 'children'> {
  onTargetEditClick?: (target: Target) => void;
  onTargetCloneClick?: (target: Target) => void;
  onTargetDownloadClick?: (target: Target) => void;
  onTargetDeleteClick?: (target: Target) => void;
}

const TargetTableActions = ({
  'data-testid': dataTestId,
  entity,
  selectionType,
  onEntityDeselected,
  onEntitySelected,
  onTargetEditClick,
  onTargetCloneClick,
  onTargetDownloadClick,
  onTargetDeleteClick,
}: TargetTableActionsProps) => {
  const [_] = useTranslation();
  return (
    <EntitiesActions
      data-testid={dataTestId}
      entity={entity}
      selectionType={selectionType}
      onEntityDeselected={onEntityDeselected}
      onEntitySelected={onEntitySelected}
    >
      <IconDivider grow align={['center', 'center']}>
        <TrashIcon<Target>
          displayName={_('Target')}
          entity={entity}
          name="target"
          onClick={onTargetDeleteClick}
        />
        <EditIcon<Target>
          displayName={_('Target')}
          entity={entity}
          name="target"
          onClick={onTargetEditClick}
        />
        <CloneIcon<Target>
          displayName={_('Target')}
          entity={entity}
          name="target"
          title={_('Clone Target')}
          onClick={onTargetCloneClick}
        />
        <ExportIcon<Target>
          title={_('Export Target')}
          value={entity}
          onClick={onTargetDownloadClick}
        />
      </IconDivider>
    </EntitiesActions>
  );
};

export default TargetTableActions;
