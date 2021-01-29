/* Copyright (C) 2017-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react';

import _ from 'gmp/locale';

import {getTranslatedType} from 'gmp/models/scanconfig';

import IconDivider from 'web/components/layout/icondivider';

import ExportIcon from 'web/components/icon/exporticon';

import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';

import EntityNameTableData from 'web/entities/entitynametabledata';
import withEntitiesActions from 'web/entities/withEntitiesActions';

import CloneIcon from 'web/entity/icon/cloneicon';
import EditIcon from 'web/entity/icon/editicon';
import TrashIcon from 'web/entity/icon/trashicon';

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
  }) => (
    <IconDivider grow align={['center', 'center']}>
      <TrashIcon
        displayName={_('Scan Config')}
        name="config"
        entity={entity}
        onClick={onScanConfigDeleteClick}
      />
      <EditIcon
        displayName={_('Scan Config')}
        disabled={entity.predefined}
        name="config"
        entity={entity}
        onClick={onScanConfigEditClick}
      />
      <CloneIcon
        displayName={_('Scan Config')}
        name="config"
        entity={entity}
        value={entity}
        onClick={onScanConfigCloneClick}
      />
      <ExportIcon
        value={entity}
        title={_('Export Scan Config')}
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
};

const ScanConfigRow = ({
  actionsComponent: ActionsComponent = ScanConfigActions,
  entity,
  links = true,
  onToggleDetailsClick,
  ...props
}) => (
  <TableRow>
    <EntityNameTableData
      entity={entity}
      link={links}
      type="scanconfig"
      displayName={_('Scan Config')}
      onToggleDetailsClick={onToggleDetailsClick}
    />
    <TableData>{getTranslatedType(entity.scanConfigType)}</TableData>
    <TableData>{na(entity.families.count)}</TableData>
    <TableData>
      <Trend
        trend={entity.families.trend}
        titleDynamic={_(
          'The family selection is DYNAMIC. New families ' +
            'will automatically be added and considered.',
        )}
        titleStatic={_(
          'The family selection is STATIC. New families ' +
            'will NOT automatically be added and considered.',
        )}
      />
    </TableData>
    <TableData>{na(entity.nvts.count)}</TableData>
    <TableData>
      <Trend
        trend={entity.nvts.trend}
        titleDynamic={_(
          'The NVT selection is DYNAMIC. New NVTs of ' +
            'selected families will automatically be added and considered.',
        )}
        titleStatic={_(
          'The NVT selection is STATIC. New NVTs of ' +
            'selected families will NOT automatically be added and ' +
            'considered.',
        )}
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
};

export default ScanConfigRow;

// vim: set ts=2 sw=2 tw=80:
