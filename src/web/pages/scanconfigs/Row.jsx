/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import React from 'react';
import ExportIcon from 'web/components/icon/ExportIcon';
import IconDivider from 'web/components/layout/IconDivider';
import TableData from 'web/components/table/Data';
import TableRow from 'web/components/table/Row';
import EntityNameTableData from 'web/entities/EntityNameTableData';
import withEntitiesActions from 'web/entities/withEntitiesActions';
import CloneIcon from 'web/entity/icon/CloneIcon';
import EditIcon from 'web/entity/icon/EditIcon';
import TrashIcon from 'web/entity/icon/TrashIcon';
import Settings from 'web/pages/scanconfigs/Settings';
import PropTypes from 'web/utils/PropTypes';
import {na} from 'web/utils/Render';

import Trend from './Trend';

const ScanConfigActions = withEntitiesActions(
  ({
    entity,
    onScanConfigDeleteClick,
    onScanConfigDownloadClick,
    onScanConfigCloneClick,
    onScanConfigEditClick,
    onScanConfigSettingsClick,
  }) => (
    <IconDivider grow align={['center', 'center']}>
      <Settings
        disabled={entity.predefined}
        displayName={_('Scan Config')}
        entity={entity}
        name="config"
        onClick={onScanConfigSettingsClick}
      />
      <TrashIcon
        displayName={_('Scan Config')}
        entity={entity}
        name="config"
        onClick={onScanConfigDeleteClick}
      />
      <EditIcon
        disabled={entity.predefined}
        displayName={_('Scan Config')}
        entity={entity}
        name="config"
        onClick={onScanConfigEditClick}
      />
      <CloneIcon
        displayName={_('Scan Config')}
        entity={entity}
        name="config"
        value={entity}
        onClick={onScanConfigCloneClick}
      />
      <ExportIcon
        title={_('Export Scan Config')}
        value={entity}
        onClick={onScanConfigDownloadClick}
      />
    </IconDivider>
  ),
);

ScanConfigActions.propTypes = {
  entity: PropTypes.model.isRequired,
  onScanConfigCloneClick: PropTypes.func.isRequired,
  onScanConfigDeleteClick: PropTypes.func.isRequired,
  onScanConfigDownloadClick: PropTypes.func.isRequired,
  onScanConfigEditClick: PropTypes.func.isRequired,
  openEditNvtDetailsDialog: PropTypes.func.isRequired,
};

const ScanConfigRow = ({
  actionsComponent: ActionsComponent = ScanConfigActions,
  entity,
  links = true,
  onToggleDetailsClick,
  openEditNvtDetailsDialog,
  ...props
}) => (
  <TableRow>
    <EntityNameTableData
      displayName={_('Scan Config')}
      entity={entity}
      link={links}
      type="scanconfig"
      onToggleDetailsClick={onToggleDetailsClick}
    />
    <TableData>{na(entity.families.count)}</TableData>
    <TableData>
      <Trend
        titleDynamic={_(
          'The family selection is DYNAMIC. New families ' +
            'will automatically be added and considered.',
        )}
        titleStatic={_(
          'The family selection is STATIC. New families ' +
            'will NOT automatically be added and considered.',
        )}
        trend={entity.families.trend}
      />
    </TableData>
    <TableData>{na(entity.nvts.count)}</TableData>
    <TableData>
      <Trend
        titleDynamic={_(
          'The NVT selection is DYNAMIC. New NVTs of ' +
            'selected families will automatically be added and considered.',
        )}
        titleStatic={_(
          'The NVT selection is STATIC. New NVTs of ' +
            'selected families will NOT automatically be added and ' +
            'considered.',
        )}
        trend={entity.nvts.trend}
      />
    </TableData>
    <ActionsComponent {...props} entity={entity} />
  </TableRow>
);

ScanConfigRow.propTypes = {
  actionsComponent: PropTypes.component,
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
  onToggleDetailsClick: PropTypes.func.isRequired,
  openEditNvtDetailsDialog: PropTypes.func.isRequired,
};

export default ScanConfigRow;
