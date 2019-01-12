/* Copyright (C) 2018 Greenbone Networks GmbH
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

import {NO_VALUE} from 'gmp/parser';

import {isDefined} from 'gmp/utils/identity';
import PropTypes from 'web/utils/proptypes';
import {renderSelectItems, UNSET_VALUE} from 'web/utils/render';

import ComposerContent from 'web/components/dialog/composercontent';

import SaveDialog from 'web/components/dialog/savedialog';

import FormGroup from 'web/components/form/formgroup';
import Select from 'web/components/form/select';

import Layout from 'web/components/layout/layout';

const ContentComposerDialog = ({
  filterId,
  filters,
  filterString = '',
  includeNotes,
  includeOverrides,
  onClose,
  onFilterIdChange,
  onSave,
  onChange,
}) => {

  filterId = filterId === NO_VALUE || !isDefined(filterId) ?
    UNSET_VALUE : filterId;

  const controlledValues = {
    filterId,
    filterString,
    includeNotes,
    includeOverrides,
  };

  return (
    <SaveDialog
      buttonTitle={_('OK')}
      title={_('Compose Content for Scan Report')}
      values={controlledValues}
      onClose={onClose}
      onSave={onSave}
    >
      {({
        values,
      }) => (
        <Layout flex="column">
          <FormGroup title={_('Report Result Filter')} titleSize="3">
            <Select
              name="filterId"
              value={values.filterId}
              items={renderSelectItems(filters, UNSET_VALUE)}
              onChange={onFilterIdChange}
            />
          </FormGroup>
          <ComposerContent
            filterFieldTitle={_('To change the filter, please select a filter' +
              ' from the dropdown menu.')}
            filterString={values.filterString}
            includeNotes={values.includeNotes}
            includeOverrides={values.includeOverrides}
            onValueChange={onChange}
          />
        </Layout>
      )}
    </SaveDialog>
  );
};

ContentComposerDialog.propTypes = {
  defaultReportFormatId: PropTypes.id,
  filterId: PropTypes.toString,
  filterString: PropTypes.string,
  filters: PropTypes.array,
  includeNotes: PropTypes.number,
  includeOverrides: PropTypes.number,
  reportFormatId: PropTypes.id,
  reportFormats: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onFilterIdChange: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default ContentComposerDialog;

// vim: set ts=2 sw=2 tw=80:
