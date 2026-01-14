/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Schedule from 'gmp/models/schedule';
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

interface ScheduleDetailsPageToolBarIconsProps {
  entity: Schedule;
  onScheduleCloneClick: () => void;
  onScheduleCreateClick: () => void;
  onScheduleDeleteClick: () => void;
  onScheduleDownloadClick: () => void;
  onScheduleEditClick: () => void;
}

const ScheduleDetailsPageToolBarIcons = ({
  entity,
  onScheduleCloneClick,
  onScheduleCreateClick,
  onScheduleDeleteClick,
  onScheduleDownloadClick,
  onScheduleEditClick,
}: ScheduleDetailsPageToolBarIconsProps) => {
  const [_] = useTranslation();

  return (
    <Divider margin="10px">
      <IconDivider>
        <ManualIcon
          anchor="managing-schedules"
          page="scanning"
          title={_('Help: Schedules')}
        />
        <ListIcon page="schedules" title={_('Schedules List')} />
      </IconDivider>
      <IconDivider>
        <CreateIcon entity={entity} onClick={onScheduleCreateClick} />
        <CloneIcon entity={entity} onClick={onScheduleCloneClick} />
        <EditIcon entity={entity} onClick={onScheduleEditClick} />
        <TrashIcon entity={entity} onClick={onScheduleDeleteClick} />
        <ExportIcon
          title={_('Export Schedule as XML')}
          value={entity}
          onClick={onScheduleDownloadClick}
        />
      </IconDivider>
    </Divider>
  );
};

export default ScheduleDetailsPageToolBarIcons;
