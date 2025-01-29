/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import React from 'react';
import ExportIcon from 'web/components/icon/exporticon';
import IconDivider from 'web/components/layout/icondivider';
import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';
import EntityNameTableData from 'web/entities/entitynametabledata';
import withEntitiesActions from 'web/entities/withEntitiesActions';
import CloneIcon from 'web/entity/icon/cloneicon';
import EditIcon from 'web/entity/icon/editicon';
import TrashIcon from 'web/entity/icon/trashicon';
import Settings from 'web/pages/scanconfigs/settings';
import PropTypes from 'web/utils/proptypes';
import {na} from 'web/utils/render';

import Trend from './trend';

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
