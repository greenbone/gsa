/* Copyright (C) 2019-2021 Greenbone Networks GmbH
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

import styled from 'styled-components';

import _ from 'gmp/locale';

import DateTime from 'web/components/date/datetime';

import DeleteIcon from 'web/components/icon/deleteicon';
import DownloadIcon from 'web/components/icon/downloadicon';
import ExportIcon from 'web/components/icon/exporticon';

import IconDivider from 'web/components/layout/icondivider';

import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';

import {RowDetailsToggle} from 'web/entities/row';

import withEntitiesActions from 'web/entities/withEntitiesActions';

import PropTypes from 'web/utils/proptypes';

const Div = styled.div`
  word-break: break-all;
`;

const Actions = withEntitiesActions(
  ({
    entity,
    onTlsCertificateDeleteClick,
    onTlsCertificateDownloadClick,
    onTlsCertificateExportClick,
  }) => (
    <IconDivider align={['center', 'center']} grow>
      {entity.isInUse() ? (
        <DeleteIcon disabled={true} title={_('TLS Certificate is in use')} />
      ) : (
        <DeleteIcon
          value={entity}
          title={_('Delete TLS Certificate')}
          onClick={onTlsCertificateDeleteClick}
        />
      )}
      <DownloadIcon
        value={entity}
        title={_('Download TLS Certificate')}
        onClick={onTlsCertificateDownloadClick}
      />
      <ExportIcon
        value={entity}
        title={_('Export TLS Certificate as XML')}
        onClick={onTlsCertificateExportClick}
      />
    </IconDivider>
  ),
);

Actions.propTypes = {
  entity: PropTypes.model.isRequired,
  onTlsCertificateDeleteClick: PropTypes.func.isRequired,
  onTlsCertificateDownloadClick: PropTypes.func.isRequired,
  onTlsCertificateExportClick: PropTypes.func.isRequired,
};

const Row = ({
  actionsComponent: ActionsComponent = Actions,
  entity,
  links = true,
  onToggleDetailsClick,
  ...props
}) => {
  return (
    <TableRow>
      <TableData>
        <span>
          <RowDetailsToggle name={entity.id} onClick={onToggleDetailsClick}>
            <Div>{entity.name}</Div>
          </RowDetailsToggle>
        </span>
      </TableData>
      <TableData>{entity.serial}</TableData>
      <TableData>
        <DateTime date={entity.activationTime} />
      </TableData>
      <TableData>
        <DateTime date={entity.expirationTime} />
      </TableData>
      <TableData>
        <DateTime date={entity.lastSeen} />
      </TableData>
      <ActionsComponent {...props} entity={entity} />
    </TableRow>
  );
};

Row.propTypes = {
  actionsComponent: PropTypes.component,
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
  onToggleDetailsClick: PropTypes.func.isRequired,
};

export default Row;

// vim: set ts=2 sw=2 tw=80:
