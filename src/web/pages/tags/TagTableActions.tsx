/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Tag from 'gmp/models/tag';
import {DisableIcon, EnableIcon} from 'web/components/icon';
import ExportIcon from 'web/components/icon/ExportIcon';
import IconDivider from 'web/components/layout/IconDivider';
import EntitiesActions, {
  type EntitiesActionsProps,
} from 'web/entities/EntitiesActions';
import CloneIcon from 'web/entity/icon/CloneIcon';
import EditIcon from 'web/entity/icon/EditIcon';
import TrashIcon from 'web/entity/icon/TrashIcon';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';

export interface TagTableActionsProps extends Omit<
  EntitiesActionsProps<Tag>,
  'children'
> {
  onTagCloneClick?: (entity: Tag) => void;
  onTagDeleteClick?: (entity: Tag) => void;
  onTagDownloadClick?: (entity: Tag) => void;
  onTagEditClick?: (entity: Tag) => void;
  onTagDisableClick?: (entity: Tag) => void;
  onTagEnableClick?: (entity: Tag) => void;
}

const TagTableActions = ({
  'data-testid': dataTestId,
  entity,
  selectionType,
  onEntityDeselected,
  onEntitySelected,
  onTagCloneClick,
  onTagDeleteClick,
  onTagDownloadClick,
  onTagEditClick,
  onTagDisableClick,
  onTagEnableClick,
}: TagTableActionsProps) => {
  const [_] = useTranslation();
  const capabilities = useCapabilities();
  const toggleIcon = capabilities.mayEdit('tag') ? (
    entity.isActive() ? (
      <DisableIcon
        title={_('Disable Tag')}
        value={entity}
        onClick={onTagDisableClick}
      />
    ) : (
      <EnableIcon
        title={_('Enable Tag')}
        value={entity}
        onClick={onTagEnableClick}
      />
    )
  ) : null;

  return (
    <EntitiesActions
      data-testid={dataTestId}
      entity={entity}
      selectionType={selectionType}
      onEntityDeselected={onEntityDeselected}
      onEntitySelected={onEntitySelected}
    >
      <IconDivider grow align={['center', 'center']}>
        {toggleIcon}
        <TrashIcon
          displayName={_('Tag')}
          entity={entity}
          name="tag"
          onClick={onTagDeleteClick}
        />
        <EditIcon
          displayName={_('Tag')}
          entity={entity}
          name="tag"
          onClick={onTagEditClick}
        />
        <CloneIcon
          displayName={_('Tag')}
          entity={entity}
          name="tag"
          title={_('Clone Tag')}
          onClick={onTagCloneClick}
        />
        <ExportIcon
          title={_('Export Tag')}
          value={entity}
          onClick={onTagDownloadClick}
        />
      </IconDivider>
    </EntitiesActions>
  );
};

export default TagTableActions;
