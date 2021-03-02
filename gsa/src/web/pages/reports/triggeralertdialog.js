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

import {selectSaveId} from 'gmp/utils/id';
import {isDefined, isString} from 'gmp/utils/identity';

import ComposerContent, {
  COMPOSER_CONTENT_DEFAULTS,
} from 'web/components/dialog/composercontent'; /* eslint-disable-line max-len */
import SaveDialog from 'web/components/dialog/savedialog';

import CheckBox from 'web/components/form/checkbox';
import FormGroup from 'web/components/form/formgroup';
import Select from 'web/components/form/select';

import NewIcon from 'web/components/icon/newicon';

import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';

import ThresholdMessage from 'web/pages/reports/thresholdmessage';

import PropTypes from 'web/utils/proptypes';
import {renderSelectItems} from 'web/utils/render';

const StyledDiv = styled.div`
  text-align: end;
`;

const TriggerAlertDialog = ({
  alertId,
  alerts = [],
  applyOverrides = COMPOSER_CONTENT_DEFAULTS.applyOverrides,
  defaultAlertId,
  filter = {},
  includeNotes = COMPOSER_CONTENT_DEFAULTS.includeNotes,
  includeOverrides = COMPOSER_CONTENT_DEFAULTS.includeOverrides,
  showThresholdMessage = false,
  storeAsDefault,
  threshold,
  onAlertChange,
  onClose,
  onNewAlertClick,
  onSave,
}) => {
  const filterString = isString(filter)
    ? filter
    : filter.simple().toFilterString();

  if (!isDefined(alertId)) {
    alertId = selectSaveId(alerts, defaultAlertId);
  }

  const unControlledValues = {
    applyOverrides,
    includeNotes,
    includeOverrides,
    storeAsDefault,
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
      {({values, onValueChange}) => (
        <Layout flex="column">
          <ComposerContent
            applyOverrides={values.applyOverrides}
            filterString={filterString}
            includeNotes={values.includeNotes}
            includeOverrides={values.includeOverrides}
            onValueChange={onValueChange}
          />
          <FormGroup title={_('Alert')} titleSize="3">
            <Divider>
              <Select
                name="alertId"
                value={values.alertId}
                items={renderSelectItems(alerts)}
                onChange={onAlertChange}
              />
              <NewIcon onClick={onNewAlertClick} />
            </Divider>
          </FormGroup>
          <StyledDiv>
            <CheckBox
              name="storeAsDefault"
              checked={storeAsDefault}
              checkedValue={YES_VALUE}
              unCheckedValue={NO_VALUE}
              toolTipTitle={_(
                'Store indicated settings (without filter) as default',
              )}
              title={_('Store as default')}
              onChange={onValueChange}
            />
          </StyledDiv>
          {showThresholdMessage && <ThresholdMessage threshold={threshold} />}
        </Layout>
      )}
    </SaveDialog>
  );
};

TriggerAlertDialog.propTypes = {
  alertId: PropTypes.id,
  alerts: PropTypes.array,
  applyOverrides: PropTypes.numberOrNumberString,
  defaultAlertId: PropTypes.id,
  filter: PropTypes.filter.isRequired,
  includeNotes: PropTypes.number,
  includeOverrides: PropTypes.number,
  showThresholdMessage: PropTypes.bool,
  storeAsDefault: PropTypes.bool,
  threshold: PropTypes.number,
  onAlertChange: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onNewAlertClick: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default TriggerAlertDialog;

// vim: set ts=2 sw=2 tw=80:
