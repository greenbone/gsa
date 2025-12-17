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
import InfoTable from 'web/components/table/InfoTable';
import TableBody from 'web/components/table/TableBody';
import TableCol from 'web/components/table/TableCol';
import TableData, {TableDataAlignTop} from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';
import {renderYesNo} from 'web/utils/Render';

const OptionsList = styled.ul`
  margin: 0;
  padding-left: 1em;
`;

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

const ReportConfigColGroup = () => (
  <colgroup>
    <TableCol width="10%" />
    <TableCol width="90%" />
  </colgroup>
);

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
        <ReportConfigColGroup />
        <TableBody>
          <TableRow>
            <TableData>{_('Report Format')}</TableData>
            <TableData>
              <span>{reportFormatLink}</span>
            </TableData>
          </TableRow>
        </TableBody>
      </InfoTable>

      <h3>{_('Parameters')}</h3>
      <InfoTable aria-label={_('Parameters')}>
        <ReportConfigColGroup />
        <TableBody>{paramRows}</TableBody>
      </InfoTable>

      {alerts.length > 0 && (
        <>
          <h3>{_('Alerts using this Report Config')}</h3>
          <OptionsList aria-label={_('Alerts using this Report Config')}>
            {alerts.map(alert => {
              return (
                <li key={alert.id}>
                  <DetailsLink id={alert.id} type="alert">
                    {alert.name}
                  </DetailsLink>
                </li>
              );
            })}
          </OptionsList>
        </>
      )}
    </Layout>
  );
};

ReportConfigDetails.propTypes = {
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
};

export default ReportConfigDetails;
