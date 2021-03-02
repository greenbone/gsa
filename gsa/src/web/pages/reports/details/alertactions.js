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

import React, {useState, useEffect, useCallback} from 'react';

import {useSelector, useDispatch} from 'react-redux';

import _ from 'gmp/locale';

import logger from 'gmp/log';

import {ALL_FILTER} from 'gmp/models/filter';

import StartIcon from 'web/components/icon/starticon';

import IconDivider from 'web/components/layout/icondivider';

import TriggerAlertDialog from 'web/pages/reports/triggeralertdialog';

import AlertComponent from 'web/pages/alerts/component';

import {
  loadEntities as loadAlertsAction,
  selector,
} from 'web/store/entities/alerts';

import {
  loadReportComposerDefaults as loadReportComposerDefaultsAction,
  saveReportComposerDefaults as saveReportComposerDefaultsAction,
} from 'web/store/usersettings/actions';

import {getReportComposerDefaults} from 'web/store/usersettings/selectors';

import PropTypes from 'web/utils/proptypes';
import useGmp from 'web/utils/useGmp';
import useCapabilities from 'web/utils/useCapabilities';
import useUserSessionTimeout from 'web/utils/useUserSessionTimeout';

const log = logger.getLogger('web.report.alertactions');

const AlertActions = ({
  filter,
  reportId,
  showError,
  showErrorMessage,
  showSuccessMessage,
  showThresholdMessage,
  threshold,
}) => {
  const gmp = useGmp();
  const dispatch = useDispatch();
  const [, renewSession] = useUserSessionTimeout();

  const [showTriggerAlertDialog, setShowTriggerAlertDialog] = useState(false);
  const [storeAsDefault, setStoreAsDefault] = useState();
  const [alertId, setAlertId] = useState();

  const capabilities = useCapabilities();

  // States
  const alertsSelector = useSelector(selector);
  const alerts = alertsSelector.getEntities(ALL_FILTER);
  const reportComposerDefaults = useSelector(getReportComposerDefaults);

  // Dispatches
  const loadAlerts = useCallback(
    () => dispatch(loadAlertsAction(gmp)(ALL_FILTER)),
    [gmp, dispatch],
  );
  const loadReportComposerDefaults = useCallback(
    () => dispatch(loadReportComposerDefaultsAction(gmp)()),
    [gmp, dispatch],
  );
  const saveReportComposerDefaults = useCallback(
    defaults => dispatch(saveReportComposerDefaultsAction(gmp)(defaults)),
    [gmp, dispatch],
  );

  useEffect(() => {
    loadReportComposerDefaults();
  }, [loadReportComposerDefaults]); // componentDidMount

  const handleAlertChange = alert_id => {
    setAlertId(alert_id);
  };

  const handleTriggerAlert = state => {
    const {
      alertId: stateAlertId,
      includeNotes,
      includeOverrides,
      storeAsDefault: stateDefault,
    } = state;
    setStoreAsDefault(stateDefault); // not sure where this was set in the original
    setAlertId(stateAlertId); // Should this be set here?

    const newFilter = filter.copy();
    newFilter.set('notes', includeNotes);
    newFilter.set('overrides', includeOverrides);

    renewSession();

    if (stateDefault) {
      saveReportComposerDefaults({
        ...reportComposerDefaults,
        defaultAlertId: stateAlertId,
        includeNotes,
        includeOverrides,
      });
    }

    return gmp.report
      .alert({
        report_id: reportId,
        alert_id: stateAlertId,
        filter: newFilter.simple(),
      })
      .then(
        response => {
          showSuccessMessage(_('Running the alert was successful'));
          setAlertId();
          setShowTriggerAlertDialog(false);
        },
        error => {
          log.error('Failed running alert', error);
          showErrorMessage(_('Failed to run alert.'));
          setShowTriggerAlertDialog(false);
        },
      );
  };

  const handleOpenTriggerAlertDialog = () => {
    loadAlerts();
    setShowTriggerAlertDialog(true);
  };

  const handleCloseTriggerAlertDialog = () => {
    setShowTriggerAlertDialog(false);
  };

  const onAlertCreated = createdId => {
    loadAlerts();
    setAlertId(createdId);
  };

  const mayAccessAlerts = capabilities.mayOp('get_alerts');
  return (
    <AlertComponent
      onCreated={onAlertCreated}
      onError={showError}
      onInteraction={renewSession}
    >
      {({create}) => (
        <React.Fragment>
          {mayAccessAlerts && (
            <IconDivider>
              <StartIcon
                title={_('Trigger Alert')}
                onClick={handleOpenTriggerAlertDialog}
              />
            </IconDivider>
          )}
          {showTriggerAlertDialog && (
            <TriggerAlertDialog
              alertId={alertId}
              alerts={alerts}
              defaultAlertId={reportComposerDefaults.defaultAlertId}
              filter={filter}
              includeNotes={reportComposerDefaults.includeNotes}
              includeOverrides={reportComposerDefaults.includeOverrides}
              showThresholdMessage={showThresholdMessage}
              storeAsDefault={storeAsDefault}
              threshold={threshold}
              onAlertChange={handleAlertChange}
              onClose={handleCloseTriggerAlertDialog}
              onNewAlertClick={create}
              onSave={handleTriggerAlert}
            />
          )}
        </React.Fragment>
      )}
    </AlertComponent>
  );
};

AlertActions.propTypes = {
  filter: PropTypes.filter,
  reportId: PropTypes.id.isRequired,
  showError: PropTypes.func.isRequired,
  showErrorMessage: PropTypes.func.isRequired,
  showSuccessMessage: PropTypes.func.isRequired,
  showThresholdMessage: PropTypes.bool,
  threshold: PropTypes.number,
};

export default AlertActions;

// vim: set ts=2 sw=2 tw=80:
