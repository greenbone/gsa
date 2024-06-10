/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import styled from 'styled-components';

import _ from 'gmp/locale';

import {NO_VALUE, YES_VALUE} from 'gmp/parser';

import {selectSaveId} from 'gmp/utils/id';
import {isDefined, isString} from 'gmp/utils/identity';
import PropTypes from 'web/utils/proptypes';
import {renderSelectItems} from 'web/utils/render';

import ComposerContent, {
  COMPOSER_CONTENT_DEFAULTS,
} from 'web/components/dialog/composercontent'; /* eslint-disable-line max-len */
import SaveDialog from 'web/components/dialog/savedialog';
import ThresholdMessage from 'web/pages/reports/thresholdmessage';

import CheckBox from 'web/components/form/checkbox';
import FormGroup from 'web/components/form/formgroup';
import Select from 'web/components/form/select';

import NewIcon from 'web/components/icon/newicon';

import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';

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
