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

import styled from 'styled-components';

import _ from 'gmp/locale';

import {NO_VALUE, YES_VALUE} from 'gmp/parser';

import {selectSaveId} from 'gmp/utils/id';
import {isString} from 'gmp/utils/identity';
import PropTypes from 'web/utils/proptypes';
import {renderSelectItems} from 'web/utils/render';

import ComposerContent, {
  COMPOSER_CONTENT_DEFAULTS,
} from 'web/components/dialog/composercontent'; /* eslint-disable-line max-len */

import SaveDialog from 'web/components/dialog/savedialog';

import CheckBox from 'web/components/form/checkbox';
import FormGroup from 'web/components/form/formgroup';
import Select from 'web/components/form/select';

import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';

const StyledDiv = styled.div`
  text-align: end;
`;

const DownloadReportDialog = ({
  defaultReportFormatId,
  filter = {},
  includeNotes = COMPOSER_CONTENT_DEFAULTS.includeNotes,
  includeOverrides = COMPOSER_CONTENT_DEFAULTS.includeOverrides,
  reportFormatId,
  reportFormats,
  storeAsDefault,
  onClose,
  onSave,
}) => {
  const filterString = isString(filter)
    ? filter
    : filter.simple().toFilterString();

  reportFormatId = selectSaveId(reportFormats, defaultReportFormatId);

  const unControlledValues = {
    includeNotes,
    includeOverrides,
    reportFormatId,
    storeAsDefault,
  };

  return (
    <SaveDialog
      buttonTitle={_('OK')}
      title={_('Compose Content for Scan Report')}
      defaultValues={unControlledValues}
      onClose={onClose}
      onSave={onSave}
    >
      {({values, onValueChange}) => (
        <Layout flex="column">
          <ComposerContent
            filterString={filterString}
            includeNotes={values.includeNotes}
            includeOverrides={values.includeOverrides}
            onValueChange={onValueChange}
          />
          <FormGroup title={_('Report Format')} titleSize="3">
            <Divider flex="column">
              <Select
                name="reportFormatId"
                value={values.reportFormatId}
                items={renderSelectItems(reportFormats)}
                width="auto"
                onChange={onValueChange}
              />
            </Divider>
          </FormGroup>
          <StyledDiv>
            <CheckBox
              name="storeAsDefault"
              checked={storeAsDefault}
              checkedValue={YES_VALUE}
              unCheckedValue={NO_VALUE}
              title={_('Store as default')}
              toolTipTitle={_(
                'Store indicated settings (without filter) as default',
              )}
              onChange={onValueChange}
            />
          </StyledDiv>
        </Layout>
      )}
    </SaveDialog>
  );
};

DownloadReportDialog.propTypes = {
  defaultReportFormatId: PropTypes.id,
  filter: PropTypes.filter.isRequired,
  includeNotes: PropTypes.number,
  includeOverrides: PropTypes.number,
  reportFormatId: PropTypes.id,
  reportFormats: PropTypes.array,
  storeAsDefault: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default DownloadReportDialog;

// vim: set ts=2 sw=2 tw=80:
