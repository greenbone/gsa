/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useEffect, useReducer, useState} from 'react';
import {isDefined} from 'gmp/utils/identity';
import SeverityBar from 'web/components/bar/SeverityBar';
import DateTime from 'web/components/date/DateTime';
import SaveDialog from 'web/components/dialog/SaveDialog';
import Radio from 'web/components/form/Radio';
import TextField from 'web/components/form/TextField';
import Column from 'web/components/layout/Column';
import Divider from 'web/components/layout/Divider';
import Layout from 'web/components/layout/Layout';
import DetailsLink from 'web/components/link/DetailsLink';
import Link from 'web/components/link/Link';
import Loading from 'web/components/loading/Loading';
import TableBody from 'web/components/table/Body';
import TableData from 'web/components/table/Data';
import SimpleTable from 'web/components/table/SimpleTable';
import Table from 'web/components/table/StripedTable';
import TableHead from 'web/components/table/TableHead';
import TableHeader from 'web/components/table/TableHeader';
import TableRow from 'web/components/table/TableRow';
import useTranslation from 'web/hooks/useTranslation';
import NvtPreference from 'web/pages/nvts/NvtPreference';
import Preformatted from 'web/pages/nvts/Preformatted';
import PropTypes from 'web/utils/PropTypes';

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
    case 'setValue': {
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
    }
    case 'setAll': {
      const {formValues} = action;
      return formValues;
    }
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
      {({values: state}) =>
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
                    <Column>
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
                    </Column>
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
