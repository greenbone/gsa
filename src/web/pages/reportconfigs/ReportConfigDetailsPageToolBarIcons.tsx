/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import ListIcon from 'web/components/icon/ListIcon';
import ManualIcon from 'web/components/icon/ManualIcon';
import Divider from 'web/components/layout/Divider';
import IconDivider from 'web/components/layout/IconDivider';
import CloneIcon from 'web/entity/icon/CloneIcon';
import CreateIcon from 'web/entity/icon/CreateIcon';
import EditIcon from 'web/entity/icon/EditIcon';
import TrashIcon from 'web/entity/icon/TrashIcon';
import useTranslation from 'web/hooks/useTranslation';

const ReportConfigDetailsPageToolBarIcons = ({
  entity,
  onReportConfigCloneClick,
  onReportConfigCreateClick,
  onReportConfigDeleteClick,
  onReportConfigEditClick,
}) => {
  const [_] = useTranslation();
  return (
    <Divider margin="10px">
      <IconDivider>
        <ManualIcon
          anchor="customizing-report-formats-with-report-configurations"
          page="reports"
          title={_('Help: Report Configs')}
        />
        <ListIcon page="reportconfigs" title={_('Report Configs List')} />
      </IconDivider>
      <IconDivider>
        <CreateIcon
          displayName={_('Report Config')}
          entity={entity}
          onClick={onReportConfigCreateClick}
        />
        <CloneIcon entity={entity} onClick={onReportConfigCloneClick} />
        <EditIcon
          disabled={entity.predefined}
          displayName={_('Report Config')}
          entity={entity}
          onClick={onReportConfigEditClick}
        />
        <TrashIcon
          displayName={_('Report Config')}
          entity={entity}
          onClick={onReportConfigDeleteClick}
        />
      </IconDivider>
    </Divider>
  );
};

export default ReportConfigDetailsPageToolBarIcons;
