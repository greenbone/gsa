/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {NO_VALUE, YES_VALUE} from 'gmp/parser';
import {selectSaveId} from 'gmp/utils/id';
import {isDefined, isString} from 'gmp/utils/identity';
import ComposerContent, {
  COMPOSER_CONTENT_DEFAULTS,
} from 'web/components/dialog/ComposerContent';
import SaveDialog from 'web/components/dialog/SaveDialog';
import CheckBox from 'web/components/form/Checkbox';
import FormGroup from 'web/components/form/FormGroup';
import Select from 'web/components/form/Select';
import {NewIcon} from 'web/components/icon';
import useTranslation from 'web/hooks/useTranslation';
import ThresholdMessage from 'web/pages/reports/ThresholdMessage';
import PropTypes from 'web/utils/PropTypes';
import {renderSelectItems} from 'web/utils/Render';
const TriggerAlertDialog = ({
  alertId,
  alerts = [],
  audit = false,
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
  const [_] = useTranslation();
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
      defaultValues={unControlledValues}
      title={
        audit
          ? _('Trigger Alert for Compliance Report')
          : _('Trigger Alert for Scan Report')
      }
      values={controlledValues}
      onClose={onClose}
      onSave={onSave}
    >
      {({values, onValueChange}) => (
        <>
          <ComposerContent
            applyOverrides={values.applyOverrides}
            audit={audit}
            filterString={filterString}
            includeNotes={values.includeNotes}
            includeOverrides={values.includeOverrides}
            onValueChange={onValueChange}
          />
          <FormGroup direction="row" title={_('Alert')}>
            <Select
              grow="1"
              items={renderSelectItems(alerts)}
              name="alertId"
              value={values.alertId}
              onChange={onAlertChange}
            />
            <NewIcon onClick={onNewAlertClick} />
          </FormGroup>
          <CheckBox
            checked={storeAsDefault}
            checkedValue={YES_VALUE}
            name="storeAsDefault"
            title={_('Store as default')}
            toolTipTitle={_(
              'Store indicated settings (without filter) as default',
            )}
            unCheckedValue={NO_VALUE}
            onChange={onValueChange}
          />
          {showThresholdMessage && <ThresholdMessage threshold={threshold} />}
        </>
      )}
    </SaveDialog>
  );
};

TriggerAlertDialog.propTypes = {
  alertId: PropTypes.id,
  alerts: PropTypes.array,
  audit: PropTypes.bool,
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
