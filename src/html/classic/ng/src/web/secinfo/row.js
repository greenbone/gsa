/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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

import _, {datetime} from '../../locale.js';

import {shorten, is_defined} from '../../utils.js';

import Comment from '../comment.js';
import LegacyLink from '../legacylink.js';
import PropTypes from '../proptypes.js';
import SeverityBar from '../severitybar.js';
import {render_component} from '../render.js';

import {withEntityRow} from '../entities/row.js';

import TableBody from '../table/body.js';
import TableRow from '../table/row.js';
import TableData from '../table/data.js';

const secinfo_type = type => {
  if (!is_defined(type)) {
    return _('N/A');
  }
  switch (type) {
    case 'cve':
      return _('CVE');
    case 'cpe':
      return _('CPE');
    case 'nvt':
      return _('NVT');
    case 'ovaldef':
      return _('OVAL Definition');
    case 'cert_bund_adv':
      return _('CERT-Bund Advisory');
    case 'dfn_cert_adv':
      return _('DFN-CERT Advisory');
    default:
      return type;
  }
};

const Row = ({entity, links = true, actions, ...other}) => {
  return (
    <TableBody>
      <TableRow>
        <TableData
          rowSpan="2">
          {links ?
            <LegacyLink
              cmd="get_info"
              details="1"
              info_type={entity.type}
              info_id={entity.id}>
              {entity.name}
            </LegacyLink> :
              entity.name
          }
          <Comment text={entity.comment}/>
        </TableData>
        <TableData>
          {secinfo_type(entity.type)}
        </TableData>
        <TableData>
          {datetime(entity.creation_time)}
        </TableData>
        <TableData>
          {datetime(entity.modification_time)}
        </TableData>
        <TableData flex align="center">
          <SeverityBar severity={entity.severity}/>
        </TableData>
        {render_component(actions, {...other, entity})}
      </TableRow>
      <TableRow>
        <TableData colSpan="5">
          <span title={entity.extra}>
            {shorten(entity.extra, 150)}
          </span>
        </TableData>
      </TableRow>
    </TableBody>
  );
};

Row.propTypes = {
  actions: PropTypes.componentOrFalse,
  entity: React.PropTypes.object,
  links: React.PropTypes.bool,
};

export default withEntityRow(Row);

// vim: set ts=2 sw=2 tw=80:
