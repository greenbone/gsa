/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */



import _ from 'gmp/locale';
import {map} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import styled from 'styled-components';
import Layout from 'web/components/layout/layout';
import DetailsLink from 'web/components/link/detailslink';
import TableBody from 'web/components/table/body';
import TableData, {TableDataAlignTop} from 'web/components/table/data';
import InfoTable from 'web/components/table/infotable';
import TableRow from 'web/components/table/row';
import {Col} from 'web/entity/page';
import PropTypes from 'web/utils/proptypes';
import {renderYesNo} from 'web/utils/render';

export const ReportConfigParamValue = ({
  param,
  value = param.value,
  value_labels = param.value_labels,
  links = true,
}) => {
  if (param.type === 'report_format_list') {
    return map(value, report_format_id => {
      const label = isDefined(value_labels[report_format_id])
        ? value_labels[report_format_id]
        : report_format_id;
      return (
        <DetailsLink
          key={param.name + '_' + report_format_id}
          id={report_format_id}
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
        {value.map(option => (
          <li key={param.name + '=' + option}>{option}</li>
        ))}
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
  value_labels: PropTypes.object,
};

const ReportConfigDetails = ({entity, links = true}) => {
  const {orphan, report_format, params, alerts = []} = entity;

  const reportFormatLink = orphan ? (
    report_format.id
  ) : (
    <DetailsLink id={report_format.id} textOnly={!links} type="reportformat">
      {report_format.name}
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
                {alerts.map(alert => (
                  <span key={alert.id}>
                    <DetailsLink id={alert.id} type="alert">
                      {alert.name}
                    </DetailsLink>
                  </span>
                ))}
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

// vim: set ts=2 sw=2 tw=80:
