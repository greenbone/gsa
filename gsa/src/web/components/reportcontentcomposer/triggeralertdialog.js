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

// import styled from 'styled-components';

import _ from 'gmp/locale';

import {NO_VALUE, YES_VALUE} from 'gmp/parser';

import {isString} from 'gmp/utils/identity';
import PropTypes from 'web/utils/proptypes';
import {renderSelectItems} from 'web/utils/render';

import ComposerContent from 'web/components/dialog/composercontent';
import SaveDialog from 'web/components/dialog/savedialog';

// import CheckBox from 'web/components/form/checkbox';
import FormGroup from 'web/components/form/formgroup';
import Select from 'web/components/form/select';

import NewIcon from 'web/components/icon/newicon';

import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';

// const StyledDiv = styled.div`
//   text-align: end;
// `;

const TriggerAlertDialog = ({
  alerts,
  alertId,
  applyOverrides = NO_VALUE,
  filter = {},
  includeNotes = YES_VALUE,
  includeOverrides = YES_VALUE,
  // storeAsDefault,
  onAlertChange,
  onClose,
  onNewAlertClick,
  onSave,
}) => {
  const filterString = isString(filter) ?
    filter : filter.toFilterCriteriaString();

  const unControlledValues = {
    alertId,
    applyOverrides,
    includeNotes,
    includeOverrides,
    // storeAsDefault,
  };

  const controlledValues = {
    alertId,
  };

  return (
    <SaveDialog
      buttonTitle={_('OK')}
      title={_('Trigger Alert for Scan Report')}
      defaultValues={unControlledValues}
      values={controlledValues}
      onClose={onClose}
      onSave={onSave}
    >
      {({
        values,
        onValueChange,
      }) => (
        <Layout flex="column">
          <ComposerContent
            applyOverrides={values.applyOverrides}
            filterString={filterString}
            includeNotes={values.includeNotes}
            includeOverrides={values.includeOverrides}
            onValueChange={onValueChange}
          />
          <FormGroup title={_('Select Alert')} titleSize="3">
            <Divider>
              <Select
                name="alertId"
                value={values.alertId}
                items={renderSelectItems(alerts)}
                onChange={onAlertChange}
              />
              <NewIcon
                onClick={onNewAlertClick}
              />
            </Divider>
          </FormGroup>
          {/* <StyledDiv>
            <CheckBox
              name="storeAsDefault"
              checked={storeAsDefault}
              checkedValue={YES_VALUE}
              unCheckedValue={NO_VALUE}
              title={_('Store as default')}
              onChange={onValueChange}
            />
          </StyledDiv> */}
        </Layout>
      )}
    </SaveDialog>
  );
};

TriggerAlertDialog.propTypes = {
  alertId: PropTypes.id,
  alerts: PropTypes.array,
  applyOverrides: PropTypes.number,
  filter: PropTypes.filter.isRequired,
  includeNotes: PropTypes.number,
  includeOverrides: PropTypes.number,
  storeAsDefault: PropTypes.bool,
  onAlertChange: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onNewAlertClick: PropTypes.func,
  onSave: PropTypes.func.isRequired,
  onValueChange: PropTypes.func.isRequired,
};

export default TriggerAlertDialog;

// vim: set ts=2 sw=2 tw=80:
