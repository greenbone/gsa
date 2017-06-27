/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
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

import  _ from '../../locale.js';
import {is_defined} from '../../utils.js';

import Layout from '../components/layout/layout.js';

import PropTypes from '../proptypes.js';

import {withDialog} from '../components/dialog/dialog.js';

import FileField from '../components/form/filefield.js';
import FormGroup from '../components/form/formgroup.js';
import Radio from '../components/form/radio.js';
import TextField from '../components/form/textfield.js';

import DeleteIcon from '../components/icon/deleteicon.js';
import NewIcon from '../components/icon/newicon.js';

import Section from '../components/section/section.js';

import Table from '../table/table.js';
import TableBody from '../table/body.js';
import TableData from '../table/data.js';
import TableHead from '../table/head.js';
import TableHeader from '../table/header.js';
import TableRow from '../table/row.js';

const PortRangeTable = ({
    port_ranges,
    onDeleteClick,
  }) => {
  if (!is_defined(port_ranges) ||  port_ranges.lenth === 0) {
    return null;
  }
  let header = (
    <TableHeader>
      <TableRow>
        <TableHead>
          {_('Start')}
        </TableHead>
        <TableHead>
          {_('End')}
        </TableHead>
        <TableHead>
          {_('Protocol')}
        </TableHead>
        <TableHead
          width="3em">
          {_('Actions')}
        </TableHead>
      </TableRow>
    </TableHeader>
  );
  return (
    <Table header={header}>
      <TableBody>
        {port_ranges.map(range => (
          <TableRow key={range.id}>
            <TableData>
              {range.start}
            </TableData>
            <TableData>
              {range.end}
            </TableData>
            <TableData>
              {range.type}
            </TableData>
            <TableData flex align="center">
              <DeleteIcon
                title={_('Delete Port Range')}
                value={range}
                onClick={onDeleteClick}/>
            </TableData>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

PortRangeTable.propTypes = {
  port_ranges: PropTypes.arrayLike,
  onDeleteClick: PropTypes.func,
};

const PortListsDialog = ({
    name,
    comment,
    from_file,
    port_range,
    port_list,
    onDeletePortRangeClick,
    onNewPortRangeClick,
    onValueChange,
  }) => {
  let is_edit = is_defined(port_list);

  let newrangeicon = (
    <div>
      <NewIcon
        value={port_list}
        title={_('Add Port Range')}
        onClick={onNewPortRangeClick}/>
    </div>
  );
  return (
    <Layout flex="column">

      <FormGroup title={_('Name')}>
        <TextField
          name="name"
          value={name}
          grow="1"
          size="30"
          onChange={onValueChange}
          maxLength="80"/>
      </FormGroup>

      <FormGroup title={_('Comment')}>
        <TextField
          name="comment"
          value={comment}
          grow="1"
          size="30"
          maxLength="400"
          onChange={onValueChange}/>
      </FormGroup>

      {!is_edit &&
        <FormGroup title={_('Port Ranges')} flex="column">
          <Layout flex box>
            <Radio
              title={_('Manual')}
              name="from_file"
              value="0"
              onChange={onValueChange}
              checked={from_file !== '1'}/>
            <TextField
              grow="1"
              name="port_range"
              value={port_range}
              disabled={from_file === '1'}
              onChange={onValueChange}
              size="30" maxLength="400"/>
          </Layout>

          <Layout flex box>
            <Radio title={_('From file')}
              name="from_file"
              value="1"
              onChange={onValueChange}
              checked={from_file === '1'}/>
            <FileField
              name="file"
              onChange={onValueChange}/>
          </Layout>
        </FormGroup>
      }
      {is_edit &&
        <Section title={_('Port Ranges')} extra={newrangeicon}>
          {is_defined(port_list) &&
            <PortRangeTable
              port_ranges={port_list.port_ranges}
              onDeleteClick={onDeletePortRangeClick}/>
          }
        </Section>
      }
    </Layout>
  );
};

PortListsDialog.propTypes = {
  name: PropTypes.string,
  comment: PropTypes.string,
  from_file: PropTypes.yesno,
  port_list: PropTypes.model,
  port_range: PropTypes.string,
  onDeletePortRangeClick: PropTypes.func,
  onNewPortRangeClick: PropTypes.func,
  onValueChange: PropTypes.func,
};


export default withDialog(PortListsDialog, {
  title: _('New Port List'),
  footer: _('Save'),
  defaultState: {
    name: _('Unnamed'),
    comment: '',
    from_file: 0,
    port_range: 'T:1-5,7,9,U:1-3,5,7,9',
  },
});

// vim: set ts=2 sw=2 tw=80:
