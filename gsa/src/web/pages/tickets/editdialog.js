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

import {TICKET_STATUS, TICKET_STATUS_TRANSLATIONS} from 'gmp/models/ticket';

import SaveDialog from 'web/components/dialog/savedialog';

import Layout from 'web/components/layout/layout';

import FormGroup from 'web/components/form/formgroup';
import Select from 'web/components/form/select';
import TextArea from 'web/components/form/textarea';

import PropTypes from 'web/utils/proptypes';
import {renderSelectItems} from 'web/utils/render';

const STATUS = [TICKET_STATUS.open, TICKET_STATUS.fixed, TICKET_STATUS.closed];

const STATUS_ITEMS = STATUS.map(status => ({
  value: status,
  label: TICKET_STATUS_TRANSLATIONS[status],
}));

const EditTicketDialog = ({
  closedNote = '',
  fixedNote = '',
  openNote = '',
  ticketId,
  title = _('Edit Ticket'),
  status,
  userId,
  users,
  onClose,
  onSave,
}) => (
  <SaveDialog
    title={title}
    onClose={onClose}
    onSave={onSave}
    values={{
      ticketId,
    }}
    defaultValues={{
      closedNote,
      fixedNote,
      openNote,
      status,
      userId,
    }}
  >
    {({values, onValueChange}) => (
      <Layout flex="column">
        <FormGroup title={_('Status')}>
          <Select
            name="status"
            items={STATUS_ITEMS}
            value={values.status}
            onChange={onValueChange}
          />
        </FormGroup>
        <FormGroup title={_('Assigned User')}>
          <Select
            name="userId"
            items={renderSelectItems(users)}
            value={values.userId}
            onChange={onValueChange}
          />
        </FormGroup>
        <FormGroup title={_('Note for Open')}>
          <TextArea
            name="openNote"
            grow="1"
            rows="5"
            value={values.openNote}
            onChange={onValueChange}
          />
        </FormGroup>
        <FormGroup title={_('Note for Fixed')}>
          <TextArea
            name="fixedNote"
            grow="1"
            rows="5"
            value={values.fixedNote}
            onChange={onValueChange}
          />
        </FormGroup>
        <FormGroup title={_('Note for Closed')}>
          <TextArea
            name="closedNote"
            grow="1"
            rows="5"
            value={values.closedNote}
            onChange={onValueChange}
          />
        </FormGroup>
      </Layout>
    )}
  </SaveDialog>
);

EditTicketDialog.propTypes = {
  closedNote: PropTypes.string,
  fixedNote: PropTypes.string,
  openNote: PropTypes.string,
  status: PropTypes.oneOf(STATUS),
  ticketId: PropTypes.id.isRequired,
  title: PropTypes.toString,
  userId: PropTypes.id.isRequired,
  users: PropTypes.arrayOf(PropTypes.model),
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default EditTicketDialog;

// vim: set ts=2 sw=2 tw=80:
