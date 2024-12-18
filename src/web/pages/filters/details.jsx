/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import HorizontalSep from 'web/components/layout/horizontalsep';
import Layout from 'web/components/layout/layout';
import DetailsLink from 'web/components/link/detailslink';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import InfoTable from 'web/components/table/infotable';
import TableRow from 'web/components/table/row';
import {Col} from 'web/entity/page';
import PropTypes from 'web/utils/proptypes';

const FilterDetails = ({entity}) => {
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
                  {alerts.map(alert => (
                    <span key={alert.id}>
                      <DetailsLink id={alert.id} type="alert">
                        {alert.name}
                      </DetailsLink>
                    </span>
                  ))}
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
