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

import _ from 'gmp/locale.js';

import PropTypes from '../../utils/proptypes.js';

import EntityPage from '../../entity/page.js';
import {withEntityContainer} from '../../entity/container.js';
import withEntityComponent, {
  goto_list,
} from '../../entity/withEntityComponent.js';

import Badge from '../../components/badge/badge.js';

import SeverityBar from '../../components/bar/severitybar.js';

import CpeIcon from '../../components/icon/cpeicon.js';
import DeleteIcon from '../../components/icon/deleteicon.js';
import ExportIcon from '../../components/icon/exporticon.js';
import HelpIcon from '../../components/icon/helpicon.js';
import Icon from '../../components/icon/icon.js';
import ListIcon from '../../components/icon/listicon.js';

import Divider from '../../components/layout/divider.js';
import IconDivider from '../../components/layout/icondivider.js';
import Layout from '../../components/layout/layout.js';

import Link from '../../components/link/link.js';

import InfoTable from '../../components/table/infotable.js';
import TableBody from '../../components/table/body.js';
import TableData from '../../components/table/data.js';
import TableRow from '../../components/table/row.js';

const ToolBarIcons = ({
  entity,
  links = true,
  onOperatingSystemDeleteClick,
  onOperatingSystemDownloadClick,
}, {capabilities}) => {
  const {hosts} = entity;
  return (
    <Divider margin="10px">
      <IconDivider>
        <HelpIcon
          page="os_details"
          title={_('Help: Operating System Details')}
        />
        <ListIcon
          title={_('Operating System List')}
          page="operatingsystems"
        />
      </IconDivider>
      <IconDivider>
        {capabilities.mayDelete('os') && (
          entity.isInUse() ?
            <DeleteIcon
              active={false}
              title={_('Operating System is in use')}/> :
            <DeleteIcon
              value={entity}
              title={_('Delete')}
              onClick={onOperatingSystemDeleteClick}/>
        )}
        <ExportIcon
          value={entity}
          onClick={onOperatingSystemDownloadClick}
          title={_('Export Operating System')}/>
      </IconDivider>
      <IconDivider>
        <Badge
          content={hosts.length}>
          <Link
            to="hosts"
            filter={'os~"' + entity.name + '"'}
            textOnly={!links}
            title={_('Hosts with Operating System {{- name}}', entity)}
          >
            <Icon
              img="host.svg"
            />
          </Link>
        </Badge>
      </IconDivider>
    </Divider>
  );
};

ToolBarIcons.propTypes = {
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
  onOperatingSystemDeleteClick: PropTypes.func.isRequired,
  onOperatingSystemDownloadClick: PropTypes.func.isRequired,
};

ToolBarIcons.contextTypes = {
  capabilities: PropTypes.capabilities.isRequired,
};

const Details = ({entity}) => {
  const {
    average_severity,
    highest_severity,
    latest_severity,
    name,
  } = entity;
  return (
    <Layout flex="column">
      <InfoTable>
        <TableBody>
          <TableRow>
            <TableData>
              {_('Name')}
            </TableData>
            <TableData>
              <IconDivider flex align={['start', 'center']}>
                <CpeIcon name={name}/>
                <span>{name}</span>
              </IconDivider>
            </TableData>
          </TableRow>

          <TableRow>
            <TableData>
              {_('Latest Severity')}
            </TableData>
            <TableData>
              <SeverityBar severity={latest_severity}/>
            </TableData>
          </TableRow>

          <TableRow>
            <TableData>
              {_('Highest Severity')}
            </TableData>
            <TableData>
              <SeverityBar severity={highest_severity}/>
            </TableData>
          </TableRow>

          <TableRow>
            <TableData>
              {_('Average Severity')}
            </TableData>
            <TableData>
              <SeverityBar severity={average_severity}/>
            </TableData>
          </TableRow>
        </TableBody>
      </InfoTable>
    </Layout>
  );
};

Details.propTypes = {
  entity: PropTypes.model.isRequired,
};

const Page = withEntityComponent('operatingsystem', {
  delete: 'onOperatingSystemDeleteClick',
  onDeleted: goto_list('operatingsystems'),
  download: 'onOperatingSystemDownloadClick',
})(EntityPage);

export default withEntityContainer('operatingsystem', {
  detailsComponent: Details,
  sectionIcon: 'os.svg',
  title: _('Operating System'),
  toolBarIcons: ToolBarIcons,
})(Page);

// vim: set ts=2 sw=2 tw=80:
