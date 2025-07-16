/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {isDefined} from 'gmp/utils/identity';
import HorizontalSep from 'web/components/layout/HorizontalSep';
import Layout from 'web/components/layout/Layout';
import DetailsLink from 'web/components/link/DetailsLink';
import TableBody from 'web/components/table/Body';
import Col from 'web/components/table/Col';
import InfoTable from 'web/components/table/InfoTable';
import TableData from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';

const FilterDetails = ({entity}) => {
  const [_] = useTranslation();
  const {comment, filter_type, alerts = []} = entity;
  return (
    <Layout grow flex="column">
      <InfoTable>
        <colgroup>
          <Col width="10%" />
          <Col width="90%" />
        </colgroup>
        <TableBody>
          {isDefined(comment) && (
            <TableRow>
              <TableData>{_('Comment')}</TableData>
              <TableData>{comment}</TableData>
            </TableRow>
          )}

          <TableRow>
            <TableData>{_('Term')}</TableData>
            <TableData>{entity.toFilterString()}</TableData>
          </TableRow>

          <TableRow>
            <TableData>{_('Type')}</TableData>
            <TableData>{filter_type}</TableData>
          </TableRow>

          {alerts.length > 0 && (
            <TableRow>
              <TableData>{_('Alerts using this Filter')}</TableData>
              <TableData>
                <HorizontalSep wrap>
                  {alerts.map(alert => {
                    return (
                      <span key={alert.id}>
                        <DetailsLink id={alert.id} type="alert">
                          {alert.name}
                        </DetailsLink>
                      </span>
                    );
                  })}
                </HorizontalSep>
              </TableData>
            </TableRow>
          )}
        </TableBody>
      </InfoTable>
    </Layout>
  );
};

FilterDetails.propTypes = {
  entity: PropTypes.model.isRequired,
};

export default FilterDetails;
