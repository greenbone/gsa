/* Copyright (C) 2018-2021 Greenbone Networks GmbH
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

import styled from 'styled-components';

import _ from 'gmp/locale';

import {NO_VALUE, YES_VALUE} from 'gmp/parser';

import {isDefined} from 'gmp/utils/identity';

import ComposerContent, {
  COMPOSER_CONTENT_DEFAULTS,
} from 'web/components/dialog/composercontent'; /* eslint-disable-line max-len*/

import SaveDialog from 'web/components/dialog/savedialog';

import CheckBox from 'web/components/form/checkbox';
import FormGroup from 'web/components/form/formgroup';
import Select from 'web/components/form/select';

import Layout from 'web/components/layout/layout';

import PropTypes from 'web/utils/proptypes';
import {renderSelectItems, UNSET_VALUE} from 'web/utils/render';

const StyledDiv = styled.div`
  text-align: end;
`;

const ContentComposerDialog = ({
  filterId = UNSET_VALUE,
  filters = [],
  includeNotes = COMPOSER_CONTENT_DEFAULTS.includeNotes,
  includeOverrides = COMPOSER_CONTENT_DEFAULTS.includeOverrides,
  storeAsDefault,
  onClose,
  onFilterIdChange,
  onSave,
  onChange,
}) => {
  const filter =
    filterId === UNSET_VALUE ? undefined : filters.find(f => f.id === filterId);

  const controlledValues = {
    filterId,
    includeNotes,
    includeOverrides,
    storeAsDefault,
  };

  return (
    <SaveDialog
      buttonTitle={_('OK')}
      title={_('Compose Content for Scan Report')}
      values={controlledValues}
      onClose={onClose}
      onSave={onSave}
    >
      {({values, onValueChange}) => (
        <Layout flex="column">
          <FormGroup title={_('Report Result Filter')} titleSize="3">
            <Select
              name="filterId"
              value={filterId}
              items={renderSelectItems(filters, UNSET_VALUE)}
              onChange={onFilterIdChange}
            />
          </FormGroup>
          <ComposerContent
            filterFieldTitle={_(
              'To change the filter, please select a filter' +
                ' from the dropdown menu.',
            )}
            filterString={isDefined(filter) ? filter.toFilterString() : ''}
            includeNotes={values.includeNotes}
            includeOverrides={values.includeOverrides}
            onValueChange={onChange}
          />
          <StyledDiv>
            <CheckBox
              name="storeAsDefault"
              checked={values.storeAsDefault}
              checkedValue={YES_VALUE}
              unCheckedValue={NO_VALUE}
              toolTipTitle={_(
                'Store indicated settings (without filter) as default',
              )}
              title={_('Store as default')}
              onChange={onChange}
            />
          </StyledDiv>
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
  storeAsDefault: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onFilterIdChange: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default ContentComposerDialog;

// vim: set ts=2 sw=2 tw=80:
