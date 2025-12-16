/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Override from 'gmp/models/override';
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

interface OverrideDetailsPageToolBarIconsProps {
  entity: Override;
  onOverrideCloneClick: (entity: Override) => void;
  onOverrideCreateClick: (entity: Override) => void;
  onOverrideDeleteClick: (entity: Override) => void;
  onOverrideDownloadClick: (entity: Override) => void;
  onOverrideEditClick: (entity: Override) => void;
}

const OverrideDetailsPageToolBarIcons = ({
  entity,
  onOverrideCloneClick,
  onOverrideCreateClick,
  onOverrideDeleteClick,
  onOverrideDownloadClick,
  onOverrideEditClick,
}: OverrideDetailsPageToolBarIconsProps) => {
  const [_] = useTranslation();
  return (
    <Divider margin="10px">
      <IconDivider>
        <ManualIcon
          anchor="managing-overrides"
          page="reports"
          title={_('Help: Overrides')}
        />
        <ListIcon page="overrides" title={_('Override List')} />
      </IconDivider>
      <IconDivider>
        <CreateIcon entity={entity} onClick={onOverrideCreateClick} />
        <CloneIcon entity={entity} onClick={onOverrideCloneClick} />
        <EditIcon entity={entity} onClick={onOverrideEditClick} />
        <TrashIcon entity={entity} onClick={onOverrideDeleteClick} />
        <ExportIcon
          title={_('Export Override as XML')}
          value={entity}
          onClick={onOverrideDownloadClick}
        />
      </IconDivider>
    </Divider>
  );
};

export default OverrideDetailsPageToolBarIcons;
