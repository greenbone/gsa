/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useState, useRef, useCallback} from 'react';
import {useDispatch} from 'react-redux';
import {
  email_credential_filter,
  password_only_credential_filter,
  smb_credential_filter,
  vFire_credential_filter,
} from 'gmp/models/credential';
import {parseInt, parseSeverity, parseYesNo, NO_VALUE} from 'gmp/parser';
import {first} from 'gmp/utils/array';
import {selectSaveId} from 'gmp/utils/id';
import {isDefined} from 'gmp/utils/identity';
import {capitalizeFirstLetter, shorten} from 'gmp/utils/string';
import FootNote from 'web/components/footnote/Footnote';
import Layout from 'web/components/layout/Layout';
import EntityComponent from 'web/entity/EntityComponent';
import useGmp from 'web/hooks/useGmp';
import useShallowEqualSelector from 'web/hooks/useShallowEqualSelector';
import useTranslation from 'web/hooks/useTranslation';
import ContentComposerDialog from 'web/pages/alerts/ContentComposerDialog';
import AlertDialog, {
  ATTACH_MESSAGE_DEFAULT,
  ATTACH_MESSAGE_SECINFO,
  DEFAULT_DEFENSE_CENTER_PORT,
  DEFAULT_DETAILS_URL,
  DEFAULT_DIRECTION,
  DEFAULT_EVENT_STATUS,
  DEFAULT_NOTICE,
  DEFAULT_NOTICE_ATTACH_FORMAT,
  DEFAULT_NOTICE_REPORT_FORMAT,
  DEFAULT_SCP_PATH,
  DEFAULT_SECINFO_TYPE,
  DEFAULT_SEVERITY,
  INCLUDE_MESSAGE_DEFAULT,
  INCLUDE_MESSAGE_SECINFO,
  NOTICE_ATTACH,
  SECINFO_SUBJECT,
  TASK_SUBJECT,
} from 'web/pages/alerts/Dialog';
import CredentialsDialog from 'web/pages/credentials/Dialog';
import {
  loadReportComposerDefaults,
  saveReportComposerDefaults,
} from 'web/store/usersettings/actions';
import {getReportComposerDefaults} from 'web/store/usersettings/selectors';
import PropTypes from 'web/utils/PropTypes';
import {UNSET_VALUE} from 'web/utils/Render';

const selectVeriniceReportId = (reportFormats, reportId) => {
  if (isDefined(reportId)) {
    for (const format of reportFormats) {
      if (format.id === reportId) {
        return format.id;
      }
    }
  } else {
    for (const format of reportFormats) {
      if (format.name === 'Verinice ISM') {
        return format.id;
      }
    }
  }
  return first(reportFormats).id;
};

const getValue = (data = {}, def = undefined) => {
  const {value: val = def} = data;
  return val;
};

const filterResultsFilter = filter => filter.filter_type === 'result';
const filterSecinfoFilter = filter => filter.filter_type === 'info';

const AlertComponent = ({
  children,
  onError,
  onCloned,
  onCloneError = onError,
  onCreated,
  onCreateError = onError,
  onDeleted,
  onDeleteError = onError,
  onDownloaded,
  onDownloadError = onError,

  onSaved,
  onSaveError = onError,
  onTestSuccess,
  onTestError,
  ...props
}) => {
  const [_] = useTranslation();
  const gmp = useGmp();
  const dispatch = useDispatch();

  const reportComposerDefaults = useShallowEqualSelector(
    getReportComposerDefaults,
  );
  const loadDefaults = useCallback(() => {
    dispatch(loadReportComposerDefaults(gmp)());
  }, [dispatch, gmp]);

  const saveDefaults = useCallback(
    defaults => {
      dispatch(saveReportComposerDefaults(gmp)(defaults));
    },
    [dispatch, gmp],
  );
  const [alertDialogVisible, setAlertDialogVisible] = useState(false);
  const [credentialDialogVisible, setCredentialDialogVisible] = useState(false);
  const [contentComposerDialogVisible, setContentComposerDialogVisible] =
    useState(false);
  const [credentialDialogTitle, setCredentialDialogTitle] = useState('');
  const [credentialTypes, setCredentialTypes] = useState([]);
  const [credentialError, setCredentialError] = useState();

  const [id, setId] = useState(undefined);
  const [alert, setAlert] = useState(undefined);
  const [active, setActive] = useState(undefined);
  const [name, setName] = useState(undefined);
  const [comment, setComment] = useState(undefined);
  const [filters, setFilters] = useState([]);
  const [filterId, setFilterId] = useState(undefined);
  const [composerFilterId, setComposerFilterId] = useState(undefined);
  const [composerIgnorePagination, setComposerIgnorePagination] =
    useState(undefined);
  const [composerIncludeNotes, setComposerIncludeNotes] = useState(undefined);
  const [composerIncludeOverrides, setComposerIncludeOverrides] =
    useState(undefined);
  const [composerStoreAsDefault, setComposerStoreAsDefault] =
    useState(NO_VALUE);
  const [credentials, setCredentials] = useState([]);
  const [resultFilters, setResultFilters] = useState([]);
  const [secinfoFilters, setSecinfoFilters] = useState([]);
  const [reportFormats, setReportFormats] = useState([]);
  const [reportConfigs, setReportConfigs] = useState([]);
  const [reportFormatIds, setReportFormatIds] = useState([]);
  const [reportConfigIds, setReportConfigIds] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');

  const [condition, setCondition] = useState(undefined);
  const [conditionDataCount, setConditionDataCount] = useState(undefined);
  const [conditionDataDirection, setConditionDataDirection] =
    useState(undefined);
  const [conditionDataFilters, setConditionDataFilters] = useState(undefined);
  const [conditionDataFilterId, setConditionDataFilterId] = useState(undefined);
  const [conditionDataAtLeast, setConditionDataAtLeast] = useState([
    undefined,
    undefined,
  ]);
  const [conditionDataAtLeastFilterId, conditionDataAtLeastCount] =
    conditionDataAtLeast;
  const [conditionDataSeverity, setConditionDataSeverity] = useState(undefined);

  const [event, setEvent] = useState(undefined);
  const [eventDataStatus, setEventDataStatus] = useState(DEFAULT_EVENT_STATUS);
  const [eventDataFeedEvent, setEventDataFeedEvent] = useState(undefined);
  const [eventDataSecinfoType, setEventDataSecinfoType] = useState(undefined);

  const [method, setMethod] = useState(undefined);
  const [
    methodDataComposerIgnorePagination,
    setMethodDataComposerIgnorePagination,
  ] = useState(undefined);
  const [methodDataComposerIncludeNotes, setMethodDataComposerIncludeNotes] =
    useState(undefined);
  const [
    methodDataComposerIncludeOverrides,
    setMethodDataComposerIncludeOverrides,
  ] = useState(undefined);
  const [methodDataDefenseCenterIp, setMethodDataDefenseCenterIp] =
    useState(undefined);
  const [methodDataDefenseCenterPort, setMethodDataDefenseCenterPort] =
    useState(undefined);
  const [methodDataDetailsUrl, setMethodDataDetailsUrl] = useState(undefined);
  const [methodDataToAddress, setMethodDataToAddress] = useState(undefined);
  const [methodDataFromAddress, setMethodDataFromAddress] = useState(undefined);
  const [methodDataSubject, setMethodDataSubject] = useState(undefined);
  const [methodDataMessage, setMethodDataMessage] = useState(undefined);
  const [methodDataMessageAttach, setMethodDataMessageAttach] =
    useState(undefined);
  const [methodDataNotice, setMethodDataNotice] = useState(undefined);
  const [methodDataNoticeReportFormat, setMethodDataNoticeReportFormat] =
    useState(undefined);
  const [methodDataNoticeReportConfig, setMethodDataNoticeReportConfig] =
    useState(undefined);
  const [methodDataNoticeAttachFormat, setMethodDataNoticeAttachFormat] =
    useState(undefined);
  const [methodDataNoticeAttachConfig, setMethodDataNoticeAttachConfig] =
    useState(undefined);
  const [methodDataRecipientCredential, setMethodDataRecipientCredential] =
    useState(UNSET_VALUE);
  const [methodDataScpCredential, setMethodDataScpCredential] =
    useState(undefined);
  const [methodDataScpReportConfig, setMethodDataScpReportConfig] =
    useState(undefined);
  const [methodDataScpReportFormat, setMethodDataScpReportFormat] =
    useState(undefined);
  const [methodDataScpPath, setMethodDataScpPath] = useState(DEFAULT_SCP_PATH);
  const [methodDataScpHost, setMethodDataScpHost] = useState(undefined);
  const [methodDataScpPort, setMethodDataScpPort] = useState(22);
  const [methodDataScpKnownHosts, setMethodDataScpKnownHosts] =
    useState(undefined);
  const [methodDataSendPort, setMethodDataSendPort] = useState(undefined);
  const [methodDataSendHost, setMethodDataSendHost] = useState(undefined);
  const [methodDataSendReportConfig, setMethodDataSendReportConfig] =
    useState(undefined);
  const [methodDataSendReportFormat, setMethodDataSendReportFormat] =
    useState(undefined);
  const [methodDataSmbCredential, setMethodDataSmbCredential] =
    useState(undefined);
  const [methodDataSmbFilePath, setMethodDataSmbFilePath] = useState(undefined);
  const [methodDataSmbFilePathType, setMethodDataSmbFilePathType] =
    useState(undefined);
  const [methodDataSmbMaxProtocol, setMethodDataSmbMaxProtocol] =
    useState(undefined);
  const [methodDataSmbReportConfig, setMethodDataSmbReportConfig] =
    useState(undefined);
  const [methodDataSmbReportFormat, setMethodDataSmbReportFormat] =
    useState(undefined);
  const [methodDataSmbSharePath, setMethodDataSmbSharePath] =
    useState(undefined);
  const [methodDataSnmpAgent, setMethodDataSnmpAgent] = useState(undefined);
  const [methodDataSnmpCommunity, setMethodDataSnmpCommunity] =
    useState(undefined);
  const [methodDataSnmpMessage, setMethodDataSnmpMessage] = useState(undefined);
  const [methodDataStartTaskTask, setMethodDataStartTaskTask] =
    useState(undefined);
  const [methodDataTpSmsCredential, setMethodDataTpSmsCredential] =
    useState(undefined);
  const [methodDataTpSmsHostname, setMethodDataTpSmsHostname] =
    useState(undefined);
  const [methodDataTpSmsTlsWorkaround, setMethodDataTpSmsTlsWorkaround] =
    useState(undefined);
  const [
    methodDataVeriniceServerReportConfig,
    setMethodDataVeriniceServerReportConfig,
  ] = useState(undefined);
  const [
    methodDataVeriniceServerReportFormat,
    setMethodDataVeriniceServerReportFormat,
  ] = useState(undefined);
  const [methodDataVeriniceServerUrl, setMethodDataVeriniceServerUrl] =
    useState(undefined);
  const [
    methodDataVeriniceServerCredential,
    setMethodDataVeriniceServerCredential,
  ] = useState(undefined);
  const [methodDataPkcs12Credential, setMethodDataPkcs12Credential] =
    useState(UNSET_VALUE);
  const [methodDataVfireCredential, setMethodDataVfireCredential] =
    useState(undefined);
  const [methodDataVfireBaseUrl, setMethodDataVfireBaseUrl] =
    useState(undefined);
  const [methodDataVfireCallDescription, setMethodDataVfireCallDescription] =
    useState(undefined);
  const [methodDataVfireCallImpactName, setMethodDataVfireCallImpactName] =
    useState(undefined);
  const [
    methodDataVfireCallPartitionName,
    setMethodDataVfireCallPartitionName,
  ] = useState(undefined);
  const [methodDataVfireCallTemplateName, setMethodDataVfireCallTemplateName] =
    useState(undefined);
  const [methodDataVfireCallTypeName, setMethodDataVfireCallTypeName] =
    useState(undefined);
  const [methodDataVfireCallUrgencyName, setMethodDataVfireCallUrgencyName] =
    useState(undefined);
  const [methodDataVfireClientId, setMethodDataVfireClientId] =
    useState(undefined);
  const [methodDataVfireSessionType, setMethodDataVfireSessionType] =
    useState(undefined);
  const [methodDataURL, setMethodDataURL] = useState(undefined);
  const [methodDataDeltaType, setMethodDataDeltaType] = useState(undefined);
  const [methodDataDeltaReportId, setMethodDataDeltaReportId] =
    useState(undefined);

  const credentialTypeRef = useRef(null);

  const handleCreateCredential = credentialData => {
    let credentialId;
    gmp.credential
      .create(credentialData)
      .then(response => {
        credentialId = response.data.id;
        setCredentialDialogVisible(false);
      })
      .then(() => gmp.credentials.getAll())
      .then(response => {
        const {data: newCredentials} = response;
        setCredentials(newCredentials);
        if (String(credentialTypeRef.current) === 'scp') {
          setMethodDataScpCredential(credentialId);
        } else if (String(credentialTypeRef.current) === 'smb') {
          setMethodDataSmbCredential(credentialId);
        } else if (String(credentialTypeRef.current) === 'verinice') {
          setMethodDataVeriniceServerCredential(credentialId);
        } else if (String(credentialTypeRef.current) === 'vfire') {
          setMethodDataVfireCredential(credentialId);
        } else if (String(credentialTypeRef.current) === 'tippingpoint') {
          setMethodDataTpSmsCredential(credentialId);
        } else if (String(credentialTypeRef.current) === 'email') {
          setMethodDataRecipientCredential(credentialId);
        } else if (String(credentialTypeRef.current) === 'pw') {
          setMethodDataPkcs12Credential(credentialId);
        }
      })
      .catch(error => {
        setCredentialError(error.message);
      });
  };

  const openCredentialDialog = ({type, types}) => {
    credentialTypeRef.current = type;
    setCredentialDialogVisible(true);
    setCredentialDialogTitle(_('New Credential'));
    setCredentialTypes(types);
  };

  const closeCredentialDialog = () => {
    setCredentialDialogVisible(false);
  };

  const handleCloseCredentialDialog = () => {
    closeCredentialDialog();
  };

  const openContentComposerDialog = () => {
    setContentComposerDialogVisible(true);
  };

  const handleOpenContentComposerDialog = () => {
    openContentComposerDialog();
  };

  const closeContentComposerDialog = () => {
    setComposerIgnorePagination(methodDataComposerIgnorePagination);
    setComposerIncludeNotes(methodDataComposerIncludeNotes);
    setComposerIncludeOverrides(methodDataComposerIncludeOverrides);
    setComposerFilterId(filterId);
    setComposerStoreAsDefault(NO_VALUE);
    setContentComposerDialogVisible(false);
  };

  const handleSaveComposerContent = ({
    ignorePagination,
    includeNotes,
    includeOverrides,
    filterId,
    storeAsDefault,
  }) => {
    if (storeAsDefault) {
      const defaults = {
        ...reportComposerDefaults,
        reportResultFilterId: filterId === UNSET_VALUE ? undefined : filterId,
        ignorePagination,
        includeNotes,
        includeOverrides,
      };
      saveDefaults(defaults);
    }

    setFilterId(filterId);
    setMethodDataComposerIgnorePagination(ignorePagination);
    setMethodDataComposerIncludeNotes(includeNotes);
    setMethodDataComposerIncludeOverrides(includeOverrides);
    setComposerStoreAsDefault(NO_VALUE);
    setContentComposerDialogVisible(false);
  };

  const openScpCredentialDialog = types => {
    openCredentialDialog({type: 'scp', types});
  };

  const openSmbCredentialDialog = types => {
    openCredentialDialog({type: 'smb', types});
  };

  const openVeriniceCredentialDialog = types => {
    openCredentialDialog({type: 'verinice', types});
  };

  const openPasswordOnlyCredentialDialog = types => {
    openCredentialDialog({type: 'pw', types});
  };

  const openVfireCredentialDialog = types => {
    openCredentialDialog({type: 'vfire', types});
  };

  const openTippingPointCredentialDialog = types => {
    openCredentialDialog({type: 'tippingpoint', types});
  };

  const openEmailCredentialDialog = types => {
    openCredentialDialog({type: 'email', types});
  };

  const openAlertDialog = alertObj => {
    const credentialPromise = gmp.credentials.getAll().then(r => r.data);
    loadDefaults();

    if (isDefined(alertObj)) {
      const alertPromise = gmp.alert
        .editAlertSettings(alertObj)
        .then(r => r.data);
      Promise.all([credentialPromise, alertPromise]).then(
        ([newCredentials, settings]) => {
          const {
            filters = [],
            report_formats = [],
            report_configs = [],
            tasks = [],
            alert: lalert,
          } = settings;

          const {method, condition, event} = lalert;

          const emailCredentials = newCredentials.filter(
            email_credential_filter,
          );
          const vFireCredentials = newCredentials.filter(
            vFire_credential_filter,
          );
          const passwordOnlyCredentials = newCredentials.filter(
            password_only_credential_filter,
          );

          const resultFilters = filters.filter(filterResultsFilter);
          const secinfoFilters = filters.filter(filterSecinfoFilter);

          let conditionDataFilters;
          const conditionDataFilterId = getValue(condition.data.filter_id);

          let methodDataMessage;
          let methodDataMessageAttach;
          const methodDataNotice = getValue(method.data.notice, DEFAULT_NOTICE);

          let methodDataSubject;
          let feedEvent;
          let eventType = event.type;

          if (eventType === 'Task run status changed') {
            conditionDataFilters = resultFilters;
            methodDataSubject = getValue(method.data.subject, TASK_SUBJECT);

            if (methodDataNotice === NOTICE_ATTACH) {
              methodDataMessageAttach = getValue(
                method.data.message,
                ATTACH_MESSAGE_DEFAULT,
              );
              methodDataMessage = INCLUDE_MESSAGE_DEFAULT;
            } else {
              methodDataMessage = getValue(
                method.data.message,
                INCLUDE_MESSAGE_DEFAULT,
              );
              methodDataMessageAttach = ATTACH_MESSAGE_DEFAULT;
            }
          } else {
            conditionDataFilters = secinfoFilters;
            methodDataSubject = getValue(method.data.subject, SECINFO_SUBJECT);

            if (methodDataNotice === NOTICE_ATTACH) {
              methodDataMessageAttach = getValue(
                method.data.message,
                ATTACH_MESSAGE_SECINFO,
              );
              methodDataMessage = INCLUDE_MESSAGE_SECINFO;
            } else {
              methodDataMessage = getValue(
                method.data.message,
                INCLUDE_MESSAGE_SECINFO,
              );
              methodDataMessageAttach = ATTACH_MESSAGE_SECINFO;
            }
          }

          if (event.type === 'Updated SecInfo arrived') {
            eventType = 'New SecInfo arrived';
            feedEvent = 'updated';
          } else {
            feedEvent = 'new';
          }

          const scpCredentialId = isDefined(method.data.scp_credential)
            ? method.data.scp_credential.credential.id
            : undefined;

          const veriniceCredentialId = isDefined(
            method.data.verinice_server_credential,
          )
            ? method.data.verinice_server_credential.credential.id
            : undefined;

          const tpSmsCredentialId = isDefined(method.data.tp_sms_credential)
            ? getValue(method.data.tp_sms_credential)
            : undefined;

          const recipientCredentialId = isDefined(
            method.data.recipient_credential,
          )
            ? getValue(method.data.recipient_credential)
            : undefined;

          const pkcs12CredentialId = isDefined(method.data.pkcs12_credential)
            ? getValue(method.data.pkcs12_credential)
            : undefined;

          const vfireCredentialId = isDefined(method.data.vfire_credential)
            ? getValue(method.data.vfire_credential)
            : undefined;

          setAlertDialogVisible(true);
          setId(alertObj.id);
          setAlert(alertObj);
          setActive(alertObj.active);
          setName(alertObj.name);
          setComment(alertObj.comment);
          setFilters(filters);
          setFilterId(
            isDefined(alertObj.filter) ? alertObj.filter.id : undefined,
          );
          setComposerFilterId(
            isDefined(alertObj.filter) ? alertObj.filter.id : undefined,
          );
          setComposerIgnorePagination(
            getValue(method.data.composer_ignore_pagination),
          );
          setComposerIncludeNotes(getValue(method.data.composer_include_notes));
          setComposerIncludeOverrides(
            getValue(method.data.composer_include_overrides),
          );
          setComposerStoreAsDefault(NO_VALUE);
          setCredentials(newCredentials);
          setResultFilters(resultFilters);
          setSecinfoFilters(secinfoFilters);
          setReportFormats(report_formats);
          setReportFormatIds(method.data.report_formats);
          setReportConfigs(report_configs);
          setReportConfigIds(method.data.report_configs);

          setCondition(condition.type);
          setConditionDataCount(parseInt(getValue(condition.data.count, 1)));
          setConditionDataDirection(
            getValue(condition.data.direction, DEFAULT_DIRECTION),
          );
          setConditionDataFilters(conditionDataFilters);
          setConditionDataFilterId(conditionDataFilterId);
          setConditionDataAtLeast([
            conditionDataFilterId,
            parseInt(getValue(condition.data.count, 1)),
          ]);
          setConditionDataSeverity(
            parseSeverity(getValue(condition.data.severity, DEFAULT_SEVERITY)),
          );

          setEvent(eventType);
          setEventDataStatus(getValue(event.data.status, DEFAULT_EVENT_STATUS));
          setEventDataFeedEvent(feedEvent);
          setEventDataSecinfoType(
            getValue(event.data.secinfo_type, DEFAULT_SECINFO_TYPE),
          );

          setMethod(alertObj.method.type);

          setMethodDataComposerIgnorePagination(
            getValue(method.data.composer_ignore_pagination),
          );
          setMethodDataComposerIncludeNotes(
            getValue(method.data.composer_include_notes),
          );
          setMethodDataComposerIncludeOverrides(
            getValue(method.data.composer_include_overrides),
          );
          setMethodDataDefenseCenterIp(
            getValue(method.data.defense_center_ip, ''),
          );
          setMethodDataDefenseCenterPort(
            parseInt(
              getValue(
                method.data.defense_center_port,
                DEFAULT_DEFENSE_CENTER_PORT,
              ),
            ),
          );
          setMethodDataDetailsUrl(
            getValue(method.data.details_url, DEFAULT_DETAILS_URL),
          );
          setMethodDataRecipientCredential(
            selectSaveId(emailCredentials, recipientCredentialId, UNSET_VALUE),
          );
          setMethodDataToAddress(getValue(alertObj.method.data.to_address, ''));
          setMethodDataFromAddress(
            getValue(alertObj.method.data.from_address, ''),
          );
          setMethodDataSubject(methodDataSubject);
          setMethodDataMessage(methodDataMessage);
          setMethodDataMessageAttach(methodDataMessageAttach);
          setMethodDataNotice(methodDataNotice);
          setMethodDataNoticeReportFormat(
            selectSaveId(
              report_formats,
              getValue(
                method.data.notice_report_format,
                DEFAULT_NOTICE_REPORT_FORMAT,
              ),
            ),
          );
          setMethodDataNoticeReportConfig(
            selectSaveId(
              report_configs,
              getValue(method.data.notice_report_config, UNSET_VALUE),
              UNSET_VALUE,
            ),
          );
          setMethodDataNoticeAttachFormat(
            selectSaveId(
              report_formats,
              getValue(
                method.data.notice_attach_format,
                DEFAULT_NOTICE_ATTACH_FORMAT,
              ),
            ),
          );
          setMethodDataNoticeAttachConfig(
            selectSaveId(
              report_configs,
              getValue(method.data.notice_attach_config, UNSET_VALUE),
              UNSET_VALUE,
            ),
          );
          setMethodDataScpCredential(
            selectSaveId(newCredentials, scpCredentialId),
          );
          setMethodDataScpReportConfig(
            selectSaveId(
              report_configs,
              getValue(method.data.scp_report_config, UNSET_VALUE),
              UNSET_VALUE,
            ),
          );
          setMethodDataScpReportFormat(
            selectSaveId(
              report_formats,
              getValue(method.data.scp_report_format),
            ),
          );
          setMethodDataScpPath(
            getValue(method.data.scp_path, DEFAULT_SCP_PATH),
          );
          setMethodDataScpHost(getValue(method.data.scp_host, ''));
          setMethodDataScpPort(getValue(method.data.scp_port, 22));
          setMethodDataScpKnownHosts(getValue(method.data.scp_known_hosts, ''));
          setMethodDataSendPort(getValue(method.data.send_port, ''));
          setMethodDataSendHost(getValue(method.data.send_host, ''));
          setMethodDataSendReportConfig(
            selectSaveId(
              report_configs,
              getValue(method.data.send_report_config, UNSET_VALUE),
              UNSET_VALUE,
            ),
          );
          setMethodDataSendReportFormat(
            selectSaveId(
              report_formats,
              getValue(method.data.send_report_format),
            ),
          );
          setMethodDataSmbCredential(getValue(method.data.smb_credential, ''));
          setMethodDataSmbFilePath(getValue(method.data.smb_file_path, ''));
          setMethodDataSmbFilePathType(
            getValue(method.data.smb_file_path_type, ''),
          );
          setMethodDataSmbMaxProtocol(
            getValue(method.data.smb_max_protocol, ''),
          );
          setMethodDataSmbReportConfig(
            selectSaveId(
              report_configs,
              getValue(method.data.smb_report_config, UNSET_VALUE),
              UNSET_VALUE,
            ),
          );
          setMethodDataSmbReportFormat(
            selectSaveId(
              report_formats,
              getValue(method.data.smb_report_format),
            ),
          );
          setMethodDataSmbSharePath(getValue(method.data.smb_share_path, ''));
          setMethodDataSnmpAgent(getValue(method.data.snmp_agent, ''));
          setMethodDataSnmpCommunity(getValue(method.data.snmp_community, ''));
          setMethodDataSnmpMessage(getValue(method.data.snmp_message, ''));
          setMethodDataStartTaskTask(
            selectSaveId(tasks, getValue(method.data.start_task_task)),
          );
          setMethodDataTpSmsCredential(
            selectSaveId(newCredentials, tpSmsCredentialId),
          );
          setMethodDataTpSmsHostname(getValue(method.data.tp_sms_hostname, ''));
          setMethodDataTpSmsTlsWorkaround(
            parseYesNo(getValue(method.data.tp_sms_tls_workaround, NO_VALUE)),
          );
          setMethodDataVeriniceServerReportConfig(
            selectSaveId(
              report_configs,
              getValue(method.data.verinice_server_report_config, UNSET_VALUE),
              UNSET_VALUE,
            ),
          );
          setMethodDataVeriniceServerReportFormat(
            selectVeriniceReportId(
              report_formats,
              getValue(method.data.verinice_server_report_format),
            ),
          );
          setMethodDataVeriniceServerUrl(
            getValue(method.data.verinice_server_url),
          );
          setMethodDataVeriniceServerCredential(
            selectSaveId(newCredentials, veriniceCredentialId),
          );
          setMethodDataPkcs12Credential(
            selectSaveId(passwordOnlyCredentials, pkcs12CredentialId, '0'),
          );
          setMethodDataVfireCredential(
            selectSaveId(vFireCredentials, vfireCredentialId),
          );
          setMethodDataVfireBaseUrl(getValue(method.data.vfire_base_url));
          setMethodDataVfireCallDescription(
            getValue(method.data.vfire_call_description),
          );
          setMethodDataVfireCallImpactName(
            getValue(method.data.vfire_call_impact_name),
          );
          setMethodDataVfireCallPartitionName(
            getValue(method.data.vfire_call_partition_name),
          );
          setMethodDataVfireCallTemplateName(
            getValue(method.data.vfire_call_template_name),
          );
          setMethodDataVfireCallTypeName(
            getValue(method.data.vfire_call_type_name),
          );
          setMethodDataVfireCallUrgencyName(
            getValue(method.data.vfire_call_urgency_name),
          );
          setMethodDataVfireClientId(getValue(method.data.vfire_client_id));
          setMethodDataVfireSessionType(
            getValue(method.data.vfire_session_type),
          );
          setMethodDataURL(getValue(method.data.URL, ''));
          setMethodDataDeltaType(getValue(alertObj.method.data.delta_type, ''));
          setMethodDataDeltaReportId(
            getValue(alertObj.method.data.delta_report_id, ''),
          );
          setTasks(tasks);
          setTitle(_('Edit Alert {{name}}', {name: shorten(alertObj.name)}));
        },
      );
    } else {
      const alertPromise = gmp.alert.newAlertSettings().then(r => r.data);
      Promise.all([credentialPromise, alertPromise]).then(
        ([newCredentials, settings]) => {
          const {
            filters = [],
            report_formats = [],
            report_configs = [],
            tasks = [],
          } = settings;

          const resultFilters = filters.filter(filterResultsFilter);
          const secinfoFilters = filters.filter(filterSecinfoFilter);
          const smbCredentials = newCredentials.filter(smb_credential_filter);

          const resultFilterId = selectSaveId(resultFilters);
          const reportFormatId = selectSaveId(report_formats);
          const reportConfigId = UNSET_VALUE;

          const filterId = isDefined(
            reportComposerDefaults.reportResultFilterId,
          )
            ? reportComposerDefaults.reportResultFilterId
            : undefined;

          setActive(undefined);
          setAlert(undefined);
          setAlertDialogVisible(true);
          setName(undefined);
          setComment(undefined);
          setCondition(undefined);
          setConditionDataAtLeast([resultFilterId, undefined]);
          setConditionDataCount(undefined);
          setConditionDataDirection(undefined);
          setConditionDataFilters(resultFilters);
          setConditionDataFilterId(resultFilterId);
          setConditionDataSeverity(undefined);
          setCredentials(newCredentials);
          setEvent(undefined);
          setEventDataStatus(DEFAULT_EVENT_STATUS);
          setEventDataFeedEvent(undefined);
          setEventDataSecinfoType(undefined);
          setFilterId(filterId);
          setFilters(filters);
          setComposerFilterId(reportComposerDefaults.reportResultFilterId);
          setComposerIgnorePagination(reportComposerDefaults.ignorePagination);
          setComposerIncludeNotes(reportComposerDefaults.includeNotes);
          setComposerIncludeOverrides(reportComposerDefaults.includeOverrides);
          setComposerStoreAsDefault(NO_VALUE);
          setId(undefined);
          setMethod(undefined);
          setMethodDataComposerIgnorePagination(undefined);
          setMethodDataComposerIncludeNotes(undefined);
          setMethodDataComposerIncludeOverrides(undefined);
          setMethodDataDefenseCenterIp(undefined);
          setMethodDataDefenseCenterPort(undefined);
          setMethodDataDetailsUrl(undefined);
          setMethodDataToAddress(undefined);
          setMethodDataFromAddress(undefined);
          setMethodDataSubject(undefined);
          setMethodDataMessage(undefined);
          setMethodDataMessageAttach(undefined);
          setMethodDataNotice(undefined);
          setMethodDataNoticeReportFormat(
            selectSaveId(report_formats, DEFAULT_NOTICE_REPORT_FORMAT),
          );
          setMethodDataNoticeReportConfig(undefined);
          setMethodDataNoticeAttachFormat(
            selectSaveId(report_formats, DEFAULT_NOTICE_ATTACH_FORMAT),
          );
          setMethodDataNoticeAttachConfig(undefined);
          setMethodDataScpCredential(undefined);
          setMethodDataScpPath(DEFAULT_SCP_PATH);
          setMethodDataScpReportConfig(reportConfigId);
          setMethodDataScpReportFormat(reportFormatId);
          setMethodDataScpHost(undefined);
          setMethodDataScpPort(22);
          setMethodDataScpKnownHosts(undefined);
          setMethodDataSendPort(undefined);
          setMethodDataSendHost(undefined);
          setMethodDataSnmpAgent(undefined);
          setMethodDataSnmpCommunity(undefined);
          setMethodDataSnmpMessage(undefined);
          setMethodDataTpSmsCredential(undefined);
          setMethodDataTpSmsHostname(undefined);
          setMethodDataTpSmsTlsWorkaround(undefined);
          setMethodDataVeriniceServerUrl(undefined);
          setMethodDataVeriniceServerCredential(undefined);
          setMethodDataURL(undefined);
          setMethodDataDeltaType(undefined);
          setMethodDataDeltaReportId(undefined);
          setMethodDataRecipientCredential(UNSET_VALUE);
          setMethodDataSendReportConfig(reportConfigId);
          setMethodDataSendReportFormat(reportFormatId);
          setMethodDataStartTaskTask(selectSaveId(tasks));
          setMethodDataSmbCredential(selectSaveId(smbCredentials));
          setMethodDataSmbSharePath(undefined);
          setMethodDataSmbFilePath(undefined);
          setMethodDataSmbFilePathType(undefined);
          setMethodDataSmbReportConfig(reportConfigId);
          setMethodDataSmbReportFormat(reportFormatId);
          setMethodDataVeriniceServerReportConfig(reportConfigId);
          setMethodDataVeriniceServerReportFormat(reportFormatId);
          setMethodDataPkcs12Credential(UNSET_VALUE);
          setMethodDataVfireCredential(undefined);
          setMethodDataVfireBaseUrl(undefined);
          setMethodDataVfireCallDescription(undefined);
          setMethodDataVfireCallImpactName(undefined);
          setMethodDataVfireCallPartitionName(undefined);
          setMethodDataVfireCallTemplateName(undefined);
          setMethodDataVfireCallTypeName(undefined);
          setMethodDataVfireCallUrgencyName(undefined);
          setMethodDataVfireClientId(undefined);
          setMethodDataVfireSessionType(undefined);
          setResultFilters(resultFilters);
          setSecinfoFilters(secinfoFilters);
          setReportFormats(report_formats);
          setReportFormatIds([]);
          setReportConfigs(report_configs);
          setReportConfigIds([]);
          setTasks(tasks);
          setTitle(_('New Alert'));
        },
      );
    }
  };

  const closeAlertDialog = () => {
    setAlertDialogVisible(false);
  };

  const handleCloseAlertDialog = () => {
    setComposerIgnorePagination(undefined);
    setComposerIncludeNotes(undefined);
    setComposerIncludeOverrides(undefined);
    setComposerFilterId(undefined);
    setComposerStoreAsDefault(NO_VALUE);
    closeAlertDialog();
  };

  const handleTestAlert = alertObj => {
    return gmp.alert
      .test(alertObj)
      .then(() => {
        if (isDefined(onTestSuccess)) {
          onTestSuccess(
            _('Testing the alert {{name}} was successful.', alertObj),
          );
        }
      })
      .catch(
        response => {
          const {details, message} = response;
          if (isDefined(onTestError)) {
            if (isDefined(details)) {
              onTestError(
                <>
                  <p>
                    {_('Testing the alert {{name}} failed. {{message}}.', {
                      name: alertObj.name,
                      message,
                    })}
                  </p>
                  <FootNote>{details}</FootNote>
                </>,
              );
            } else {
              onTestError(
                _('Testing the alert {{name}} failed. {{message}}.', {
                  name: alertObj.name,
                  message,
                }),
              );
            }
          }
        },
        () => {
          if (isDefined(onTestError)) {
            onTestError(
              _(
                'An error occurred during Testing the alert {{name}}',
                alertObj,
              ),
            );
          }
        },
      );
  };

  const handlePasswordOnlyCredentialChange = credential => {
    setMethodDataPkcs12Credential(credential);
  };

  const handleScpCredentialChange = credential => {
    setMethodDataScpCredential(credential);
  };

  const handleSmbCredentialChange = credential => {
    setMethodDataSmbCredential(credential);
  };

  const handleTippingPointCredentialChange = credential => {
    setMethodDataTpSmsCredential(credential);
  };

  const handleVeriniceCredentialChange = credential => {
    setMethodDataVeriniceServerCredential(credential);
  };

  const handleEmailCredentialChange = credential => {
    setMethodDataRecipientCredential(credential);
  };

  const handleVfireCredentialChange = credential => {
    setMethodDataVfireCredential(credential);
  };

  const handleReportFormatsChange = newReportFormatIds => {
    setReportFormatIds(newReportFormatIds);
  };

  const handleReportConfigsChange = newReportConfigIds => {
    setReportConfigIds(newReportConfigIds);
  };

  const handleValueChange = (value, name) => {
    name = capitalizeFirstLetter(name);

    if (name === 'IgnorePagination') {
      setComposerIgnorePagination(value);
    } else if (name === 'IncludeNotes') {
      setComposerIncludeNotes(value);
    } else if (name === 'IncludeOverrides') {
      setComposerIncludeOverrides(value);
    } else if (name === 'StoreAsDefault') {
      setComposerStoreAsDefault(value);
    }
  };

  const handleFilterIdChange = value => {
    setComposerFilterId(value === UNSET_VALUE ? undefined : value);
  };

  return (
    <EntityComponent
      name="alert"
      onCloneError={onCloneError}
      onCloned={onCloned}
      onCreateError={onCreateError}
      onCreated={onCreated}
      onDeleteError={onDeleteError}
      onDeleted={onDeleted}
      onDownloadError={onDownloadError}
      onDownloaded={onDownloaded}
      onSaveError={onSaveError}
      onSaved={onSaved}
    >
      {({save, ...other}) => (
        <Layout>
          {children({
            ...other,
            create: openAlertDialog,
            edit: openAlertDialog,
            test: handleTestAlert,
          })}
          {alertDialogVisible && (
            <AlertDialog
              active={active}
              alert={alert}
              comment={comment}
              condition={condition}
              condition_data_at_least_count={conditionDataAtLeastCount}
              condition_data_at_least_filter_id={conditionDataAtLeastFilterId}
              condition_data_count={conditionDataCount}
              condition_data_direction={conditionDataDirection}
              condition_data_filter_id={conditionDataFilterId}
              condition_data_filters={conditionDataFilters}
              condition_data_severity={conditionDataSeverity}
              credentials={credentials}
              event={event}
              event_data_feed_event={eventDataFeedEvent}
              event_data_secinfo_type={eventDataSecinfoType}
              event_data_status={eventDataStatus}
              filter_id={filterId}
              filters={filters}
              id={id}
              method={method}
              method_data_URL={methodDataURL}
              method_data_composer_ignore_pagination={
                methodDataComposerIgnorePagination
              }
              method_data_composer_include_notes={
                methodDataComposerIncludeNotes
              }
              method_data_composer_include_overrides={
                methodDataComposerIncludeOverrides
              }
              method_data_defense_center_ip={methodDataDefenseCenterIp}
              method_data_defense_center_port={methodDataDefenseCenterPort}
              method_data_delta_report_id={methodDataDeltaReportId}
              method_data_delta_type={methodDataDeltaType}
              method_data_details_url={methodDataDetailsUrl}
              method_data_from_address={methodDataFromAddress}
              method_data_message={methodDataMessage}
              method_data_message_attach={methodDataMessageAttach}
              method_data_notice={methodDataNotice}
              method_data_notice_attach_config={methodDataNoticeAttachConfig}
              method_data_notice_attach_format={methodDataNoticeAttachFormat}
              method_data_notice_report_config={methodDataNoticeReportConfig}
              method_data_notice_report_format={methodDataNoticeReportFormat}
              method_data_pkcs12_credential={methodDataPkcs12Credential}
              method_data_recipient_credential={methodDataRecipientCredential}
              method_data_scp_credential={methodDataScpCredential}
              method_data_scp_host={methodDataScpHost}
              method_data_scp_known_hosts={methodDataScpKnownHosts}
              method_data_scp_path={methodDataScpPath}
              method_data_scp_port={methodDataScpPort}
              method_data_scp_report_config={methodDataScpReportConfig}
              method_data_scp_report_format={methodDataScpReportFormat}
              method_data_send_host={methodDataSendHost}
              method_data_send_port={methodDataSendPort}
              method_data_send_report_config={methodDataSendReportConfig}
              method_data_send_report_format={methodDataSendReportFormat}
              method_data_smb_credential={methodDataSmbCredential}
              method_data_smb_file_path={methodDataSmbFilePath}
              method_data_smb_file_path_type={methodDataSmbFilePathType}
              method_data_smb_max_protocol={methodDataSmbMaxProtocol}
              method_data_smb_report_config={methodDataSmbReportConfig}
              method_data_smb_report_format={methodDataSmbReportFormat}
              method_data_smb_share_path={methodDataSmbSharePath}
              method_data_snmp_agent={methodDataSnmpAgent}
              method_data_snmp_community={methodDataSnmpCommunity}
              method_data_snmp_message={methodDataSnmpMessage}
              method_data_start_task_task={methodDataStartTaskTask}
              method_data_subject={methodDataSubject}
              method_data_to_address={methodDataToAddress}
              method_data_tp_sms_credential={methodDataTpSmsCredential}
              method_data_tp_sms_hostname={methodDataTpSmsHostname}
              method_data_tp_sms_tls_workaround={methodDataTpSmsTlsWorkaround}
              method_data_verinice_server_credential={
                methodDataVeriniceServerCredential
              }
              method_data_verinice_server_report_config={
                methodDataVeriniceServerReportConfig
              }
              method_data_verinice_server_report_format={
                methodDataVeriniceServerReportFormat
              }
              method_data_verinice_server_url={methodDataVeriniceServerUrl}
              method_data_vfire_base_url={methodDataVfireBaseUrl}
              method_data_vfire_call_description={
                methodDataVfireCallDescription
              }
              method_data_vfire_call_impact_name={methodDataVfireCallImpactName}
              method_data_vfire_call_partition_name={
                methodDataVfireCallPartitionName
              }
              method_data_vfire_call_template_name={
                methodDataVfireCallTemplateName
              }
              method_data_vfire_call_type_name={methodDataVfireCallTypeName}
              method_data_vfire_call_urgency_name={
                methodDataVfireCallUrgencyName
              }
              method_data_vfire_client_id={methodDataVfireClientId}
              method_data_vfire_credential={methodDataVfireCredential}
              method_data_vfire_session_type={methodDataVfireSessionType}
              name={name}
              report_config_ids={reportConfigIds}
              report_configs={reportConfigs}
              report_format_ids={reportFormatIds}
              report_formats={reportFormats}
              result_filters={resultFilters}
              secinfo_filters={secinfoFilters}
              tasks={tasks}
              title={title}
              onClose={handleCloseAlertDialog}
              onEmailCredentialChange={handleEmailCredentialChange}
              onNewEmailCredentialClick={openEmailCredentialDialog}
              onNewPasswordOnlyCredentialClick={
                openPasswordOnlyCredentialDialog
              }
              onNewScpCredentialClick={openScpCredentialDialog}
              onNewSmbCredentialClick={openSmbCredentialDialog}
              onNewTippingPointCredentialClick={
                openTippingPointCredentialDialog
              }
              onNewVeriniceCredentialClick={openVeriniceCredentialDialog}
              onNewVfireCredentialClick={openVfireCredentialDialog}
              onOpenContentComposerDialogClick={handleOpenContentComposerDialog}
              onPasswordOnlyCredentialChange={
                handlePasswordOnlyCredentialChange
              }
              onReportConfigsChange={handleReportConfigsChange}
              onReportFormatsChange={handleReportFormatsChange}
              onSave={d => {
                return save(d).then(() => closeAlertDialog());
              }}
              onScpCredentialChange={handleScpCredentialChange}
              onSmbCredentialChange={handleSmbCredentialChange}
              onTippingPointCredentialChange={
                handleTippingPointCredentialChange
              }
              onVerinceCredentialChange={handleVeriniceCredentialChange}
              onVfireCredentialChange={handleVfireCredentialChange}
            />
          )}
          {credentialDialogVisible && (
            <CredentialsDialog
              error={credentialError}
              title={credentialDialogTitle}
              types={credentialTypes}
              onClose={handleCloseCredentialDialog}
              onErrorClose={() => setCredentialError(undefined)}
              onSave={handleCreateCredential}
            />
          )}
          {contentComposerDialogVisible && (
            <ContentComposerDialog
              filterId={composerFilterId}
              filters={resultFilters}
              ignorePagination={parseYesNo(composerIgnorePagination)}
              includeNotes={parseYesNo(composerIncludeNotes)}
              includeOverrides={parseYesNo(composerIncludeOverrides)}
              storeAsDefault={parseYesNo(composerStoreAsDefault)}
              title={_('Compose Content for Scan Report')}
              onChange={handleValueChange}
              onClose={closeContentComposerDialog}
              onFilterIdChange={handleFilterIdChange}
              onSave={handleSaveComposerContent}
            />
          )}
        </Layout>
      )}
    </EntityComponent>
  );
};

AlertComponent.propTypes = {
  children: PropTypes.func.isRequired,
  onCloneError: PropTypes.func,
  onCloned: PropTypes.func,
  onCreateError: PropTypes.func,
  onCreated: PropTypes.func,
  onDeleteError: PropTypes.func,
  onDeleted: PropTypes.func,
  onDownloadError: PropTypes.func,
  onDownloaded: PropTypes.func,
  onError: PropTypes.func,
  onSaveError: PropTypes.func,
  onSaved: PropTypes.func,
  onTestError: PropTypes.func,
  onTestSuccess: PropTypes.func,
};

export default AlertComponent;
