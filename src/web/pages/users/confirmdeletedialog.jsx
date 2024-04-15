/* Copyright (C) 2020-2022 Greenbone AG
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

import PropTypes from 'web/utils/proptypes';
import {renderSelectItems} from 'web/utils/render';

import SaveDialog from 'web/components/dialog/savedialog';

import FormGroup from 'web/components/form/formgroup';
import Select from 'web/components/form/select';

import Layout from 'web/components/layout/layout';

const ConfirmDeleteDialog = ({
  deleteUsers = [],
  inheritorId = '--',
  title,
  inheritorUsers,
  onClose,
  onSave,
}) => {
  let headline;
  if (deleteUsers.length === 1) {
    headline = _('User {{name}} will be deleted.', {name: deleteUsers[0].name});
  } else if (deleteUsers.length > 1) {
    headline = _('{{count}} users will be deleted', {
      count: deleteUsers.length,
    });
  } else {
    headline = _('1 user will be deleted');
  }

  const data = {
    deleteUsers,
    inheritorId,
  };

  const inheritingUserItems = [
    {
      label: '--',
      value: '--',
    },
    {
      label: _('Current User'),
      value: 'self',
    },
    ...renderSelectItems(inheritorUsers),
  ];

  return (
    <SaveDialog
      buttonTitle={_('Delete')}
      title={title}
      onClose={onClose}
      onSave={onSave}
      defaultValues={data}
    >
      {({values: state, onValueChange}) => {
        return (
          <Layout flex="column">
            <h2>{headline}</h2>
            <p>
              {_(
                'If no inheriting user is selected, all owned resources will' +
                  ' be deleted as well.',
              )}
            </p>
            <FormGroup title={_('Inheriting user')}>
              <Select
                name="inheritorId"
                items={inheritingUserItems}
                value={state.inheritorId}
                onChange={onValueChange}
              />
            </FormGroup>
          </Layout>
        );
      }}
    </SaveDialog>
  );
};

ConfirmDeleteDialog.propTypes = {
  deleteUsers: PropTypes.array.isRequired,
  inheritorId: PropTypes.id,
  inheritorUsers: PropTypes.array,
  title: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default ConfirmDeleteDialog;

// vim: set ts=2 sw=2 tw=80:

