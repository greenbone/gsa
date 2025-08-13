/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import PortList from 'gmp/models/portlist';
import ExportIcon from 'web/components/icon/ExportIcon';
import IconDivider from 'web/components/layout/IconDivider';
import EntitiesActions, {
  EntitiesActionsProps,
} from 'web/entities/EntitiesActions';
import CloneIcon from 'web/entity/icon/CloneIcon';
import EditIcon from 'web/entity/icon/EditIcon';
import TrashIcon from 'web/entity/icon/TrashIcon';
import useTranslation from 'web/hooks/useTranslation';

export interface PortListActionsProps
  extends Omit<EntitiesActionsProps<PortList>, 'children'> {
  onPortListDeleteClick?: (entity: PortList) => void;
  onPortListDownloadClick?: (entity: PortList) => void;
  onPortListCloneClick?: (entity: PortList) => void;
  onPortListEditClick?: (entity: PortList) => void;
}

const PortListActions = ({
  'data-testid': dataTestId,
  entity,
  selectionType,
  onEntityDeselected,
  onEntitySelected,
  onPortListDeleteClick,
  onPortListDownloadClick,
  onPortListCloneClick,
  onPortListEditClick,
}: PortListActionsProps) => {
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
        <TrashIcon
          displayName={_('Port List')}
          entity={entity}
          name="port_list"
          onClick={onPortListDeleteClick}
        />
        <EditIcon
          disabled={entity.predefined}
          displayName={_('Port List')}
          entity={entity}
          name="port_list"
          onClick={onPortListEditClick}
        />
        <CloneIcon
          displayName={_('Port List')}
          entity={entity}
          name="port_list"
          onClick={onPortListCloneClick}
        />
        <ExportIcon
          title={_('Export Port List')}
          value={entity}
          onClick={onPortListDownloadClick}
        />
      </IconDivider>
    </EntitiesActions>
  );
};

export default PortListActions;
