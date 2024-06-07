/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import _ from 'gmp/locale';

import Layout from 'web/components/layout/layout';

import PropTypes from 'web/utils/proptypes';

import SaveDialog from 'web/components/dialog/savedialog';

import FormGroup from 'web/components/form/formgroup';
import TextField from 'web/components/form/textfield';
import Select from 'web/components/form/select';

const FilterDialog = ({
  comment = '',
  id,
  name = _('Unnamed'),
  term = '',
  title = _('New Filter'),
  type,
  types,
  onClose,
  onSave,
}) => {
  const filterOptions = types.map(option => ({
    value: option[0],
    label: option[1],
  }));

  return (
    <SaveDialog
      title={title}
      onClose={onClose}
      onSave={onSave}
      defaultValues={{
        comment,
        id,
        name,
        term,
        type,
      }}
    >
      {({values: state, onValueChange}) => {
        return (
          <Layout flex="column">
            <FormGroup title={_('Name')}>
              <TextField
                name="name"
                grow="1"
                value={state.name}
                size="30"
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup title={_('Comment')}>
              <TextField
                name="comment"
                grow="1"
                value={state.comment}
                size="30"
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup title={_('Term')}>
              <TextField
                name="term"
                grow="1"
                value={state.term}
                size="30"
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup title={_('Type')}>
              <Select
                name="type"
                items={filterOptions}
                onChange={onValueChange}
                value={state.type}
              />
            </FormGroup>
          </Layout>
        );
      }}
    </SaveDialog>
  );
};

FilterDialog.propTypes = {
  comment: PropTypes.string,
  filter: PropTypes.model,
  id: PropTypes.string,
  name: PropTypes.string,
  term: PropTypes.string,
  title: PropTypes.string,
  type: PropTypes.string,
  types: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default FilterDialog;

// vim: set ts=2 sw=2 tw=80:
