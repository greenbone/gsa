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

import _ from 'gmp/locale.js';

import Divider from '../components/layout/divider.js';
import IconDivider from '../components/layout/icondivider.js';
import Layout from '../components/layout/layout.js';

import PropTypes from '../utils/proptypes.js';
import SelectionType from '../utils/selectiontype.js';

import DeleteIcon from '../components/icon/deleteicon.js';
import ExportIcon from '../components/icon/exporticon.js';
import TrashIcon from '../components/icon/trashicon.js';

import Select from '../components/form/select.js';

import TableFooter from '../components/table/footer.js';
import TableRow from '../components/table/row.js';

export const EntitiesFooter = ({
    actions = true,
    children,
    download,
    selection = true,
    selectionType,
    span,
    trash,
    onDeleteClick,
    onDownloadClick,
    onSelectionTypeChange,
    onTrashClick,
    ...props
  }) => {
  const deleteEntities = props.delete;
  return (
    <TableFooter>
      <TableRow>
        <td colSpan={span}>
          {actions ?
            <Layout flex align={['end', 'center']}>
              <Divider>
                {selection &&
                  <Select
                    value={selectionType}
                    onChange={onSelectionTypeChange}>
                    <option value={SelectionType.SELECTION_PAGE_CONTENTS}>
                      {_('Apply to page contents')}
                    </option>
                    <option value={SelectionType.SELECTION_USER}>
                      {_('Apply to selection')}
                    </option>
                    <option value={SelectionType.SELECTION_FILTER}>
                      {_('Apply to all filtered')}
                    </option>
                  </Select>
                }
                <IconDivider>
                  {trash &&
                    <TrashIcon
                      onClick={onTrashClick}
                      selectionType={selectionType}/>
                  }
                  {deleteEntities &&
                    <DeleteIcon
                      onClick={onDeleteClick}
                      selectionType={selectionType}/>
                  }
                  {download &&
                    <ExportIcon
                      onClick={onDownloadClick}
                      selectionType={selectionType}
                      value={download}/>
                  }
                  {children}
                </IconDivider>
              </Divider>
            </Layout> : children
          }
        </td>
      </TableRow>
    </TableFooter>
  );
};

EntitiesFooter.propTypes = {
  actions: PropTypes.bool,
  delete: PropTypes.bool,
  download: PropTypes.stringOrFalse,
  selection: PropTypes.bool,
  selectionType: PropTypes.string,
  span: PropTypes.number.isRequired,
  trash: PropTypes.bool,
  onDeleteClick: PropTypes.func,
  onDownloadClick: PropTypes.func,
  onSelectionTypeChange: PropTypes.func,
  onTrashClick: PropTypes.func,
};

export const withEntitiesFooter = (options = {}) => Component => {

  const EntitiesFooterWrapper = ({onDownloadBulk, onDeleteBulk, ...props}) => {
    return (
      <Component
        {...options}
        {...props}
        onDownloadClick={onDownloadBulk}
        onDeleteClick={onDeleteBulk}
        onTrashClick={onDeleteBulk}
      />
    );
  };

  EntitiesFooterWrapper.propTypes = {
    onDeleteBulk: PropTypes.func,
    onDownloadBulk: PropTypes.func,
  };

  return EntitiesFooterWrapper;
};

export const createEntitiesFooter = options =>
  withEntitiesFooter(options)(EntitiesFooter);

export default EntitiesFooter;

// vim: set ts=2 sw=2 tw=80:
