/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Override from 'gmp/models/override';
import ExportIcon from 'web/components/icon/ExportIcon';
import IconDivider from 'web/components/layout/IconDivider';
import EntitiesActions, {
  type EntitiesActionsProps,
} from 'web/entities/EntitiesActions';
import CloneIcon from 'web/entity/icon/CloneIcon';
import EditIcon from 'web/entity/icon/EditIcon';
import TrashIcon from 'web/entity/icon/TrashIcon';
import useTranslation from 'web/hooks/useTranslation';

export interface OverrideTableActionsProps extends Omit<
  EntitiesActionsProps<Override>,
  'children'
> {
  entity: Override;
  onOverrideDeleteClick: (entity: Override) => void | Promise<void>;
  onOverrideDownloadClick: (entity: Override) => void | Promise<void>;
  onOverrideCloneClick: (entity: Override) => void | Promise<void>;
  onOverrideEditClick: (entity: Override) => void | Promise<void>;
}

const OverrideTableActions = ({
  'data-testid': dataTestId,
  entity,
  selectionType,
  onEntityDeselected,
  onEntitySelected,
  onOverrideDeleteClick,
  onOverrideDownloadClick,
  onOverrideCloneClick,
  onOverrideEditClick,
}: OverrideTableActionsProps) => {
  const [_] = useTranslation();
  return (
    <EntitiesActions<Override>
      data-testid={dataTestId}
      entity={entity}
      selectionType={selectionType}
      onEntityDeselected={onEntityDeselected}
      onEntitySelected={onEntitySelected}
    >
      <IconDivider grow align={['center', 'center']}>
        <TrashIcon<Override>
          entity={entity}
          name="override"
          onClick={onOverrideDeleteClick}
        />
        <EditIcon
          entity={entity}
          name="override"
          onClick={onOverrideEditClick}
        />
        <CloneIcon<Override>
          entity={entity}
          name="override"
          onClick={onOverrideCloneClick}
        />
        <ExportIcon<Override>
          title={_('Export Override')}
          value={entity}
          onClick={onOverrideDownloadClick}
        />
      </IconDivider>
    </EntitiesActions>
  );
};

export default OverrideTableActions;
