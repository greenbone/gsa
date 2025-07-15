/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback} from 'react';
import {useDispatch} from 'react-redux';
import {ALL_FILTER} from 'gmp/models/filter';

import useGmp from 'web/hooks/useGmp';

import {
  loadEntity as loadAlertAction,
  loadEntities as loadAlertsAction,
} from 'web/store/entities/alerts';
import {loadEntities as loadCredentialsAction} from 'web/store/entities/credentials';
import {loadEntities as loadFiltersAction} from 'web/store/entities/filters';
import {loadEntities as loadPortListsAction} from 'web/store/entities/portlists';
import {loadEntities as loadScanConfigsAction} from 'web/store/entities/scanconfigs';
import {loadEntities as loadScannersAction} from 'web/store/entities/scanners';
import {loadEntities as loadSchedulesAction} from 'web/store/entities/schedules';
import {loadEntities as loadTargetsAction} from 'web/store/entities/targets';
import {
  renewSessionTimeout,
  updateTimezone,
} from 'web/store/usersettings/actions';
import {loadUserSettingsDefaultFilter} from 'web/store/usersettings/defaultfilters/actions';
import {loadUserSettingDefaults} from 'web/store/usersettings/defaults/actions';

const useUserSettingsActions = () => {
  const dispatch = useDispatch();
  const gmp = useGmp();

  const loadAlerts = useCallback(
    // @ts-expect-error
    () => dispatch(loadAlertsAction(gmp)(ALL_FILTER)),
    [dispatch, gmp],
  );
  const loadCredentials = useCallback(
    // @ts-expect-error
    () => dispatch(loadCredentialsAction(gmp)(ALL_FILTER)),
    [dispatch, gmp],
  );
  const loadFilters = useCallback(
    // @ts-expect-error
    () => dispatch(loadFiltersAction(gmp)(ALL_FILTER)),
    [dispatch, gmp],
  );
  const loadPortLists = useCallback(
    // @ts-expect-error
    () => dispatch(loadPortListsAction(gmp)(ALL_FILTER)),
    [dispatch, gmp],
  );
  const loadScanConfigs = useCallback(
    // @ts-expect-error
    () => dispatch(loadScanConfigsAction(gmp)(ALL_FILTER)),
    [dispatch, gmp],
  );
  const loadScanners = useCallback(
    // @ts-expect-error
    () => dispatch(loadScannersAction(gmp)(ALL_FILTER)),
    [dispatch, gmp],
  );
  const loadSchedules = useCallback(
    // @ts-expect-error
    () => dispatch(loadSchedulesAction(gmp)(ALL_FILTER)),
    [dispatch, gmp],
  );
  const loadTargets = useCallback(
    // @ts-expect-error
    () => dispatch(loadTargetsAction(gmp)(ALL_FILTER)),
    [dispatch, gmp],
  );
  const loadUserSettings = useCallback(
    // @ts-expect-error
    () => dispatch(loadUserSettingDefaults(gmp)()),
    [dispatch, gmp],
  );
  const loadAlert = useCallback(
    // @ts-expect-error
    id => dispatch(loadAlertAction(gmp)(id)),
    [dispatch, gmp],
  );
  const onInteraction = useCallback(
    // @ts-expect-error
    () => dispatch(renewSessionTimeout(gmp)()),
    [dispatch, gmp],
  );
  const setTimezone = useCallback(
    // @ts-expect-error
    timezone => dispatch(updateTimezone(gmp)(timezone)),
    [dispatch, gmp],
  );

  const loadFilterDefaults = useCallback(() => {
    return Promise.all([
      // @ts-expect-error
      dispatch(loadUserSettingsDefaultFilter(gmp)('alert')),
      // @ts-expect-error
      dispatch(loadUserSettingsDefaultFilter(gmp)('auditreport')),
      // @ts-expect-error
      dispatch(loadUserSettingsDefaultFilter(gmp)('scanconfig')),
      // @ts-expect-error
      dispatch(loadUserSettingsDefaultFilter(gmp)('credential')),
      // @ts-expect-error
      dispatch(loadUserSettingsDefaultFilter(gmp)('filter')),
      // @ts-expect-error
      dispatch(loadUserSettingsDefaultFilter(gmp)('group')),
      // @ts-expect-error
      dispatch(loadUserSettingsDefaultFilter(gmp)('host')),
      // @ts-expect-error
      dispatch(loadUserSettingsDefaultFilter(gmp)('note')),
      // @ts-expect-error
      dispatch(loadUserSettingsDefaultFilter(gmp)('operatingsystem')),
      // @ts-expect-error
      dispatch(loadUserSettingsDefaultFilter(gmp)('override')),
      // @ts-expect-error
      dispatch(loadUserSettingsDefaultFilter(gmp)('permission')),
      // @ts-expect-error
      dispatch(loadUserSettingsDefaultFilter(gmp)('portlist')),
      // @ts-expect-error
      dispatch(loadUserSettingsDefaultFilter(gmp)('report')),
      // @ts-expect-error
      dispatch(loadUserSettingsDefaultFilter(gmp)('reportformat')),
      // @ts-expect-error
      dispatch(loadUserSettingsDefaultFilter(gmp)('result')),
      // @ts-expect-error
      dispatch(loadUserSettingsDefaultFilter(gmp)('role')),
      // @ts-expect-error
      dispatch(loadUserSettingsDefaultFilter(gmp)('scanner')),
      // @ts-expect-error
      dispatch(loadUserSettingsDefaultFilter(gmp)('schedule')),
      // @ts-expect-error
      dispatch(loadUserSettingsDefaultFilter(gmp)('tag')),
      // @ts-expect-error
      dispatch(loadUserSettingsDefaultFilter(gmp)('target')),
      // @ts-expect-error
      dispatch(loadUserSettingsDefaultFilter(gmp)('task')),
      // @ts-expect-error
      dispatch(loadUserSettingsDefaultFilter(gmp)('ticket')),
      // @ts-expect-error
      dispatch(loadUserSettingsDefaultFilter(gmp)('tlscertificate')),
      // @ts-expect-error
      dispatch(loadUserSettingsDefaultFilter(gmp)('user')),
      // @ts-expect-error
      dispatch(loadUserSettingsDefaultFilter(gmp)('vulnerability')),
      // @ts-expect-error
      dispatch(loadUserSettingsDefaultFilter(gmp)('cpe')),
      // @ts-expect-error
      dispatch(loadUserSettingsDefaultFilter(gmp)('cve')),
      // @ts-expect-error
      dispatch(loadUserSettingsDefaultFilter(gmp)('certbund')),
      // @ts-expect-error
      dispatch(loadUserSettingsDefaultFilter(gmp)('dfncert')),
      // @ts-expect-error
      dispatch(loadUserSettingsDefaultFilter(gmp)('nvt')),
    ]);
  }, [dispatch, gmp]);

  return {
    loadAlerts,
    loadCredentials,
    loadFilters,
    loadPortLists,
    loadScanConfigs,
    loadScanners,
    loadSchedules,
    loadTargets,
    loadUserSettings,
    loadAlert,
    loadFilterDefaults,
    onInteraction,
    setTimezone,
  };
};

export default useUserSettingsActions;
