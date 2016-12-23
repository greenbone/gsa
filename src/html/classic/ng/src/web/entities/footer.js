/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 Greenbone Networks GmbH
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

import _ from '../../locale.js';

import {TableRow} from '../table.js';
import Layout from '../layout.js';
import SelectionType from '../selectiontype.js';

import ExportIcon from '../icons/exporticon.js';
import TrashIcon from '../icons/trashicon.js';

import Select2 from '../form/select2.js';

export const EntitiesFooter = props => {
  let {span, selectionType, download, trash} = props;
  return (
    <TableRow>
      <td colSpan={span}>
        <Layout flex align={['end', 'center']}>
          <Select2
            value={selectionType}
            onChange={props.onSelectionTypeChange}>
            <option value={SelectionType.SELECTION_PAGE_CONTENTS}>
              {_('Apply to page contents')}
            </option>
            <option value={SelectionType.SELECTION_USER}>
              {_('Apply to selection')}
            </option>
            <option value={SelectionType.SELECTION_FILTER}>
              {_('Apply to all filtered')}
            </option>
          </Select2>
          {trash &&
            <TrashIcon onClick={props.onTrashClick}
              selectionType={selectionType}/>
          }
          {download &&
            <ExportIcon onClick={props.onDownloadClick}
              selectionType={selectionType}/>
          }
          {props.children}
        </Layout>
      </td>
    </TableRow>
  );
};

EntitiesFooter.propTypes = {
  span: React.PropTypes.oneOfType([
    React.PropTypes.number,
    React.PropTypes.string,
  ]),
  selectionType: React.PropTypes.string.isRequired,
  download: React.PropTypes.bool,
  trash: React.PropTypes.bool,
  onSelectionTypeChange: React.PropTypes.func,
  onDownloadClick: React.PropTypes.func,
  onTrashClick: React.PropTypes.func,
};


export default EntitiesFooter;

// vim: set ts=2 sw=2 tw=80:
