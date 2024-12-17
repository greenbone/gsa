/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import {isDefined} from 'gmp/utils/identity';
import React, {useEffect, useReducer, useState} from 'react';
import SeverityBar from 'web/components/bar/severitybar';
import DateTime from 'web/components/date/datetime';
import SaveDialog from 'web/components/dialog/savedialog';
import Radio from 'web/components/form/radio';
import TextField from 'web/components/form/textfield';
import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';
import DetailsLink from 'web/components/link/detailslink';
import Link from 'web/components/link/link';
import Loading from 'web/components/loading/loading';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableHead from 'web/components/table/head';
import TableHeader from 'web/components/table/header';
import TableRow from 'web/components/table/row';
import SimpleTable from 'web/components/table/simpletable';
import Table from 'web/components/table/stripedtable';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/proptypes';

import NvtPreference from '../nvts/nvtpreference';
import Preformatted from '../nvts/preformatted';

const createPrefValues = (preferences = []) => {
  const preferenceValues = {};

  preferences.forEach(pref => {
    let {id, value, type} = pref;

    if (type === 'password' || type === 'file') {
      value = undefined;
    }

    preferenceValues[pref.name] = {
      id,
      value,
      type,
    };
  });

  return preferenceValues;
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'setValue':
      const {newState} = action;
      const {name, value} = newState;

      const prefAttributes = state[name];

      // preference has other attributes like id, type, etc. those must be kept so its not as simple as [name]: value
      const updatedState = {
        ...state,
        [name]: {
          ...prefAttributes,
          value,
        },
      };

      return updatedState;
    case 'setAll':
      const {formValues} = action;
      return formValues;
    default:
      return state;
  }
};

const EditNvtDetailsDialog = ({
  configId,
  configName,
  configNameLabel,
  defaultTimeout,
  isLoadingNvt = true,
  nvtAffectedSoftware,
  nvtCvssVector,
  nvtFamily,
  nvtLastModified,
  nvtName,
  nvtOid,
  nvtSeverity,
  nvtSummary,
  timeout,
  preferences,
  title,
  onClose,
  onSave,
}) => {
  const [_] = useTranslation();
  const [preferenceValues, dispatch] = useReducer(
    reducer,
    createPrefValues(preferences),
  );

  const [controlledTimeout, setControlledTimeout] = useState(timeout);
  const [useDefaultTimeout, setDefaultTimeout] = useState(
    isDefined(timeout) ? '0' : '1',
  );

  useEffect(() => {
    dispatch({
      type: 'setAll',
      formValues: createPrefValues(preferences),
    });
  }, [preferences]);

  useEffect(() => {
    setControlledTimeout(timeout);
    setDefaultTimeout(isDefined(timeout) ? '0' : '1');
  }, [timeout]);

  const handleChangeTimeout = value => {
    setControlledTimeout(value);
  };

  const controlledData = {
    configId,
    nvtOid,
    preferenceValues,
    timeout: controlledTimeout,
    useDefaultTimeout,
  };

  return (
    <SaveDialog
      title={title}
      values={controlledData}
      onClose={onClose}
      onSave={onSave}
    >
      {({values: state, onValueChange}) =>
        isLoadingNvt ? (
          <Loading />
        ) : (
          <Layout flex="column">
            <SimpleTable>
              <TableBody>
                <TableRow>
                  <TableData>{_('Name')}</TableData>
                  <TableData>
                    <span>
                      <DetailsLink id={nvtOid} type="nvt">
                        {nvtName}
                      </DetailsLink>
                    </span>
                  </TableData>
                </TableRow>
                <TableRow>
                  <TableData>{configNameLabel}</TableData>
                  <TableData>{configName}</TableData>
                </TableRow>
                <TableRow>
                  <TableData>{_('Family')}</TableData>
                  <TableData>{nvtFamily}</TableData>
                </TableRow>
                <TableRow>
                  <TableData>{_('OID')}</TableData>
                  <TableData>{nvtOid}</TableData>
                </TableRow>
                <TableRow>
                  <TableData>{_('Last Modified')}</TableData>
                  <TableData>
                    <DateTime date={nvtLastModified} />
                  </TableData>
                </TableRow>
              </TableBody>
            </SimpleTable>

            {isDefined(nvtSummary) && (
              <div>
                <h1>{_('Summary')}</h1>
                <Preformatted>{nvtSummary}</Preformatted>
              </div>
            )}

            {isDefined(nvtAffectedSoftware) && (
              <div>
                <h1>{_('Affected Software/OS')}</h1>
                <Preformatted>{nvtAffectedSoftware}</Preformatted>
              </div>
            )}

            <div>
              <h1>{_('Vulnerability Scoring')}</h1>
              <SimpleTable>
                <TableBody>
                  <TableRow>
                    <TableData>{_('CVSS base')}</TableData>
                    <TableData>
                      <SeverityBar severity={nvtSeverity} />
                    </TableData>
                  </TableRow>
                  {isDefined(nvtCvssVector) && (
                    <TableRow>
                      <TableData>{_('CVSS base vector')}</TableData>
                      <TableData>
                        <Link
                          query={{cvssVector: nvtCvssVector}}
                          to="cvsscalculator"
                        >
                          {nvtCvssVector}
                        </Link>
                      </TableData>
                    </TableRow>
                  )}
                </TableBody>
              </SimpleTable>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{_('Name')}</TableHead>
                  <TableHead>{_('New Value')}</TableHead>
                  <TableHead>{_('Default Value')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableData>{_('Timeout')}</TableData>
                  <TableData>
                    <Divider flex="column">
                      <Divider>
                        <Radio
                          checked={state.useDefaultTimeout === '1'}
                          name="useDefaultTimeout"
                          value="1"
                          onChange={value => setDefaultTimeout(value)}
                        />
                        <span>
                          {_('Apply default timeout')}
                          {isDefined(defaultTimeout)
                            ? ' (' + defaultTimeout + ')'
                            : ''}
                        </span>
                      </Divider>
                      <Divider>
                        <Radio
                          checked={state.useDefaultTimeout === '0'}
                          name="useDefaultTimeout"
                          value="0"
                          onChange={value => setDefaultTimeout(value)}
                        />
                        <TextField
                          disabled={state.useDefaultTimeout === '1'}
                          name="timeout"
                          value={isDefined(state.timeout) ? state.timeout : ''}
                          onChange={handleChangeTimeout}
                        />
                      </Divider>
                    </Divider>
                  </TableData>
                  <TableData>
                    {isDefined(defaultTimeout) ? defaultTimeout : ''}
                  </TableData>
                </TableRow>
                {preferences.map(pref => {
                  const prefValue = isDefined(preferenceValues[pref.name])
                    ? preferenceValues[pref.name].value
                    : undefined;
                  return (
                    <NvtPreference
                      key={pref.name}
                      preference={pref}
                      value={prefValue}
                      onChange={dispatch}
                    />
                  );
                })}
              </TableBody>
            </Table>
          </Layout>
        )
      }
    </SaveDialog>
  );
};

EditNvtDetailsDialog.propTypes = {
  configId: PropTypes.string.isRequired,
  configName: PropTypes.string.isRequired,
  configNameLabel: PropTypes.string.isRequired,
  defaultTimeout: PropTypes.number,
  isLoadingNvt: PropTypes.bool,
  nvtAffectedSoftware: PropTypes.string,
  nvtCvssVector: PropTypes.string,
  nvtFamily: PropTypes.string,
  nvtLastModified: PropTypes.date,
  nvtName: PropTypes.string,
  nvtOid: PropTypes.string,
  nvtSeverity: PropTypes.number,
  nvtSummary: PropTypes.string,
  preferences: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      default: PropTypes.any,
      hr_name: PropTypes.string,
      name: PropTypes.string.isRequired,
      value: PropTypes.any,
      alt: PropTypes.array,
      type: PropTypes.string,
    }),
  ),
  timeout: PropTypes.number,
  title: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default EditNvtDetailsDialog;

// vim: set ts=2 sw=2 tw=80:
