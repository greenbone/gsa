/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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
import {is_empty} from 'gmp/utils';

import PropTypes from '../../utils/proptypes.js';
import {render_select_items} from '../../utils/render.js';

import SaveDialog from '../../components/dialog/savedialog.js';

import FormGroup from '../../components/form/formgroup.js';
import Radio from '../../components/form/radio.js';
import Select from '../../components/form/select.js';
import TextField from '../../components/form/textfield.js';

import Divider from '../../components/layout/divider.js';
import Layout from '../../components/layout/layout.js';

import {
  FULL_AND_FAST_SCAN_CONFIG_ID,
  EMPTY_SCAN_CONFIG_ID,
} from 'gmp/models/scanconfig.js';

const Dialog = ({
    base = EMPTY_SCAN_CONFIG_ID,
    comment = '',
    name = _('Unnamed'),
    scanner_id,
    scanners,
    title = _('New Scan Config'),
    visible = true,
    onClose,
    onSave,
  }) => {

  const data = {
    base,
    comment,
    name,
    scanner_id,
  };

  return (
    <SaveDialog
      visible={visible}
      title={title}
      onClose={onClose}
      onSave={onSave}
      defaultValues={data}
    >
      {({
        values: state,
        onValueChange,
      }) => {
        return (
          <Layout flex="column">

            <FormGroup title={_('Name')}>
              <TextField
                name="name"
                grow="1"
                value={state.name}
                size="30"
                onChange={onValueChange}
                maxLength="80"
              />
            </FormGroup>

            <FormGroup title={_('Comment')}>
              <TextField
                name="comment"
                value={state.comment}
                grow="1"
                size="30"
                maxLength="400"
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup title={_('Base')} flex="column">
              <Divider flex="column">
                <Radio
                  name="base"
                  value={EMPTY_SCAN_CONFIG_ID}
                  checked={state.base === EMPTY_SCAN_CONFIG_ID}
                  title={_('Empty, static and fast')}
                  onChange={onValueChange}
                />
                <Radio
                  name="base"
                  value={FULL_AND_FAST_SCAN_CONFIG_ID}
                  checked={state.base === FULL_AND_FAST_SCAN_CONFIG_ID}
                  title={_('Full and fast')}
                  onChange={onValueChange}
                />
                {!is_empty(scanners) &&
                  <Divider>
                    <Radio
                      name="base"
                      value="0"
                      checked={state.base === '0'}
                      onChange={onValueChange}
                    />
                    <Select
                      value={state.scanner_id}
                      name="scanner_id"
                      items={render_select_items(scanners)}
                      onChange={onValueChange}
                    />
                  </Divider>
                }
              </Divider>
            </FormGroup>
          </Layout>
        );
      }}
    </SaveDialog>
  );
};

Dialog.propTypes = {
  base: PropTypes.oneOf([
    FULL_AND_FAST_SCAN_CONFIG_ID, EMPTY_SCAN_CONFIG_ID, '0',
  ]),
  comment: PropTypes.string,
  name: PropTypes.string,
  scanner_id: PropTypes.id,
  scanners: PropTypes.array,
  title: PropTypes.string,
  visible: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default Dialog;

// vim: set ts=2 sw=2 tw=80:
