/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import styled from 'styled-components';
import {map} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';
import Layout from 'web/components/layout/Layout';
import DetailsLink from 'web/components/link/DetailsLink';
import TableBody from 'web/components/table/Body';
import Col from 'web/components/table/Col';
import TableData, {TableDataAlignTop} from 'web/components/table/Data';
import InfoTable from 'web/components/table/InfoTable';
import TableRow from 'web/components/table/TableRow';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';
import {renderYesNo} from 'web/utils/Render';

export const ReportConfigParamValue = ({
  param,
  value = param.value,
  valueLabels = param.valueLabels,
  links = true,
}) => {
  if (param.type === 'report_format_list') {
    return map(value, reportFormatId => {
      const label = isDefined(valueLabels[reportFormatId])
        ? valueLabels[reportFormatId]
        : reportFormatId;
      return (
        <DetailsLink
          key={param.name + '_' + reportFormatId}
          id={reportFormatId}
          textOnly={!links}
          type="reportformat"
        >
          {label}
        </DetailsLink>
      );
    });
  } else if (param.type === 'multi_selection') {
    const OptionsList = styled.ul`
      margin: 0;
      padding-left: 1em;
    `;
    return (
      <OptionsList>
        {value.map(option => {
          return <li key={param.name + '=' + option}>{option}</li>;
        })}
      </OptionsList>
    );
  } else if (param.type === 'text') {
    return <pre>{value}</pre>;
  } else if (param.type === 'boolean') {
    return renderYesNo(value);
  }

  return value;
};

ReportConfigParamValue.propTypes = {
  links: PropTypes.bool,
  param: PropTypes.any.isRequired,
  value: PropTypes.any,
  valueLabels: PropTypes.object,
};

const ReportConfigDetails = ({entity, links = true}) => {
  const [_] = useTranslation();
  const {orphan, reportFormat, params, alerts = []} = entity;

  const reportFormatLink = orphan ? (
    reportFormat?.id
  ) : (
    <DetailsLink id={reportFormat.id} textOnly={!links} type="reportformat">
      {reportFormat.name}
    </DetailsLink>
  );
  const paramRows = orphan ? (
    <TableRow>
      <TableData>
        <i>{_('not available for orphaned report configs')}</i>
      </TableData>
    </TableRow>
  ) : (
    params.map(param => {
      return (
        <TableRow key={param.name}>
          <TableDataAlignTop>{param.name}</TableDataAlignTop>
          <TableData>
            <ReportConfigParamValue links={links} param={param} />
          </TableData>
        </TableRow>
      );
    })
  );

  return (
    <Layout grow flex="column">
      <InfoTable>
        <colgroup>
          <Col width="10%" />
          <Col width="90%" />
        </colgroup>
        <TableBody>
          <TableRow>
            <TableData>{_('Report Format')}</TableData>
            <TableData>
              <span>{reportFormatLink}</span>
            </TableData>
          </TableRow>

          <TableRow>
            <TableDataAlignTop>{_('Parameters')}</TableDataAlignTop>
            <TableData>
              <Layout>
                <InfoTable>
                  <TableBody>{paramRows}</TableBody>
                </InfoTable>
              </Layout>
            </TableData>
          </TableRow>

          {alerts.length > 0 && (
            <TableRow>
              <TableDataAlignTop>
                {_('Alerts using this Report Config')}
              </TableDataAlignTop>
              <TableData>
                {alerts.map(alert => {
                  return (
                    <span key={alert.id}>
                      <DetailsLink id={alert.id} type="alert">
                        {alert.name}
                      </DetailsLink>
                    </span>
                  );
                })}
              </TableData>
            </TableRow>
          )}
        </TableBody>
      </InfoTable>
    </Layout>
  );
};

ReportConfigDetails.propTypes = {
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
};

export default ReportConfigDetails;
