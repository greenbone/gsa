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

import _ from 'gmp/locale';

import SaveDialog from 'web/components/dialog/savedialog';

import FormGroup from 'web/components/form/formgroup';
import Select from 'web/components/form/select';
import TextArea from 'web/components/form/textarea';
import Layout from 'web/components/layout/layout';

import PropTypes from 'web/utils/proptypes';
import {renderSelectItems} from 'web/utils/render';

const CreateTicketDialog = ({
  resultId,
  title = _('Create new Ticket for Result'),
  userId,
  users,
  onClose,
  onSave,
  onUserIdChange,
}) => (
  <SaveDialog
    title={title}
    onClose={onClose}
    onSave={onSave}
    values={{
      resultId,
      userId,
    }}
  >
    {({values, onValueChange}) => (
      <Layout flex="column">
        <FormGroup title={_('Assign To User')}>
          <Select
            name="userId"
            grow="1"
            value={values.userId}
            items={renderSelectItems(users)}
            onChange={onUserIdChange}
          />
        </FormGroup>
        <FormGroup title={_('Note')}>
          <TextArea
            name="note"
            grow="1"
            rows="5"
            value={values.note}
            onChange={onValueChange}
          />
        </FormGroup>
      </Layout>
    )}
  </SaveDialog>
);

CreateTicketDialog.propTypes = {
  resultId: PropTypes.id,
  title: PropTypes.toString,
  userId: PropTypes.id,
  users: PropTypes.arrayOf(PropTypes.model),
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onUserIdChange: PropTypes.func.isRequired,
};

export default CreateTicketDialog;

// vim: set ts=2 sw=2 tw=80:
