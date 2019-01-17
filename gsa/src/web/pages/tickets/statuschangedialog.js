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

import Layout from 'web/components/layout/layout';

import FormGroup from 'web/components/form/formgroup';
import TextArea from 'web/components/form/textarea';

import PropTypes from 'web/utils/proptypes';

const StatusChangeTicketDialog = ({
  ticketId,
  title,
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
  >
    {({
      values,
      onValueChange,
    }) => (
      <Layout flex="column">
        <FormGroup title={_('Comment')}>
          <TextArea
            name="comment"
            grow="1"
            rows="5"
            value={values.comment}
            onChange={onValueChange}
          />
        </FormGroup>
      </Layout>
    )}
  </SaveDialog>
);

StatusChangeTicketDialog.propTypes = {
  ticketId: PropTypes.id.isRequired,
  title: PropTypes.toString,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default StatusChangeTicketDialog;
