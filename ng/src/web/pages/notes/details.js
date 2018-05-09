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

import {Col} from 'glamorous';

import _ from 'gmp/locale.js';
import {is_defined} from 'gmp/utils';

import PropTypes from '../../utils/proptypes.js';
import {
  translatedResultSeverityRiskFactor,
  LOG_VALUE,
} from '../../utils/severity';

import Divider from '../../components/layout/divider.js';
import Layout from '../../components/layout/layout.js';

import InfoTable from '../../components/table/infotable.js';
import TableBody from '../../components/table/body.js';
import TableData from '../../components/table/data.js';
import TableRow from '../../components/table/row.js';

import EntityLink from '../../entity/link.js';

import DetailsBlock from '../../entity/block.js';
import NoteBox from '../../entity/note.js';

const NoteDetails = ({
  entity,
}) => {
  const {
    hosts,
    port,
    result,
    severity,
    task,
  } = entity;
  return (
    <Layout
      grow="1"
      flex="column">
      <DetailsBlock
        title={_('Application')}>
        <InfoTable size="full">
          <colgroup>
            <Col width="20%"/>
            <Col width="80%"/>
          </colgroup>
          <TableBody>
            <TableRow>
              <TableData>
                {_('Hosts')}
              </TableData>
              <TableData>
                {hosts.length > 0 ?
                  <Divider>
                    {hosts.map(host => (
                      <span key={host}>{host}</span>
                    ))}
                  </Divider> :
                  _('Any')
                }
              </TableData>
            </TableRow>

            <TableRow>
              <TableData>
                {_('Port')}
              </TableData>
              <TableData>
                {is_defined(port) ?
                  port :
                  _('Any')
                }
              </TableData>
            </TableRow>

            <TableRow>
              <TableData>
                {_('Severity')}
              </TableData>
              <TableData>
                {is_defined(severity) ? (
                  severity > LOG_VALUE ?
                    _('> 0.0') :
                    translatedResultSeverityRiskFactor(severity)
                ) : _('Any')
                }
              </TableData>
            </TableRow>

            <TableRow>
              <TableData>
                {_('Task')}
              </TableData>
              <TableData>
                {entity.isOrphan() ?
                  <b>{_('Orphan')}</b> : (
                  is_defined(task) ?
                    <EntityLink
                      entity={task}
                    /> :
                    _('Any')
                  )
                }
              </TableData>
            </TableRow>

            <TableRow>
              <TableData>
                {_('Result')}
              </TableData>
              <TableData>
                {entity.isOrphan() ?
                  <b>{_('Orphan')}</b> : (
                  is_defined(result) ?
                    <EntityLink
                      entity={result}
                    /> :
                    _('Any')
                  )
                }
              </TableData>
            </TableRow>
          </TableBody>
        </InfoTable>
      </DetailsBlock>

      <DetailsBlock
        title={
          entity.isActive() ?
            _('Appearance') :
            _('Appearance when active')
        }>
        <NoteBox
          note={entity}
          detailsLink={false}
        />
      </DetailsBlock>
    </Layout>
  );
};

NoteDetails.propTypes = {
  entity: PropTypes.model.isRequired,
};

export default NoteDetails;

// vim: set ts=2 sw=2 tw=80:
