/* Copyright (C) 2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import React from 'react';

import styled from 'styled-components';

import _ from 'gmp/locale';

import DateTime from 'web/components/date/datetime';

import DeleteIcon from 'web/components/icon/deleteicon';
import DownloadIcon from 'web/components/icon/downloadicon';

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
  ({entity, onTlsCertificateDeleteClick, onTlsCertificateDownloadClick}) => (
    <IconDivider align={['center', 'center']} grow>
      <DeleteIcon
        disabled={true} // TODO remove this once function is implemented
        entity={entity}
        name="tlscertificate"
        displayName={_('TLS Certificate')}
        title={'Delete TLS Certificate'}
        onClick={onTlsCertificateDeleteClick}
      />
      <DownloadIcon
        disabled={true} // TODO remove this once function is implemented
        value={entity}
        onClick={onTlsCertificateDownloadClick}
        title={_('Export TLS Certificate')}
      />
    </IconDivider>
  ),
);

Actions.propTypes = {
  entity: PropTypes.model.isRequired,
  onOsDeleteClick: PropTypes.func.isRequired,
  onOsDownloadClick: PropTypes.func.isRequired,
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
            <Div>{entity.issuerDn}</Div>
          </RowDetailsToggle>
        </span>
      </TableData>
      <TableData>{entity.name}</TableData>
      <TableData>
        <DateTime date={entity.activationTime} />
      </TableData>
      <TableData>
        <DateTime date={entity.expirationTime} />
      </TableData>
      <TableData>
        <DateTime date={entity.lastCollected} />
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
