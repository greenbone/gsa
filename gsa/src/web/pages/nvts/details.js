/* Copyright (C) 2017-2021 Greenbone Networks GmbH
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
import React from 'react';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import {TAG_NA} from 'gmp/models/nvt';

import Severitybar from 'web/components/bar/severitybar';

import Layout from 'web/components/layout/layout';

import Link from 'web/components/link/link';

import InfoTable from 'web/components/table/infotable';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';

import DetailsBlock from 'web/entity/block';

import PropTypes from 'web/utils/proptypes';

import {na, getTranslatableSeverityOrigin} from 'web/utils/render';

import References from './references';
import Solution from './solution';
import Pre from './preformatted';

const NvtDetails = ({entity, links = true}) => {
  const {tags = {}, severity, qod, family, solution, severityOrigin} = entity;
  return (
    <Layout flex="column" grow="1">
      {isDefined(tags.summary) && (
        <DetailsBlock title={_('Summary')}>
          <Pre>{tags.summary}</Pre>
        </DetailsBlock>
      )}

      <DetailsBlock title={_('Scoring')}>
        <InfoTable>
          <TableBody>
            <TableRow>
              <TableData>{_('CVSS Base')}</TableData>
              <TableData>
                <Severitybar severity={severity} />
              </TableData>
            </TableRow>

            {isDefined(tags.cvss_base_vector) &&
              tags.cvss_base_vector !== TAG_NA && (
                <TableRow>
                  <TableData>{_('CVSS Base Vector')}</TableData>
                  <TableData>
                    <Link
                      to="cvsscalculator"
                      query={{cvssVector: tags.cvss_base_vector}}
                    >
                      {tags.cvss_base_vector}
                    </Link>
                  </TableData>
                </TableRow>
              )}
            <TableRow>
              <TableData>{_('CVSS Origin')}</TableData>
              <TableData>
                {na(getTranslatableSeverityOrigin(severityOrigin))}
              </TableData>
            </TableRow>
          </TableBody>
        </InfoTable>
      </DetailsBlock>

      {isDefined(tags.insight) && tags.insight !== TAG_NA && (
        <DetailsBlock title={_('Insight')}>
          <Pre>{tags.insight}</Pre>
        </DetailsBlock>
      )}

      {(isDefined(qod) ||
        (isDefined(tags.vuldetect) && tags.vuldetect !== TAG_NA)) && (
        <DetailsBlock title={_('Detection Method')}>
          {isDefined(tags.vuldetect) && tags.vuldetect !== TAG_NA && (
            <Pre>{tags.vuldetect}</Pre>
          )}
          {isDefined(qod) && (
            <Pre>
              <b>{_('Quality of Detection')}: </b>

              {isDefined(qod.type) ? qod.type : _('N/A')}
              {isDefined(qod.value) && ' (' + qod.value + '%)'}
            </Pre>
          )}
        </DetailsBlock>
      )}

      {isDefined(tags.affected) && tags.affected !== TAG_NA && (
        <DetailsBlock title={_('Affected Software/OS')}>
          <Pre>{tags.affected}</Pre>
        </DetailsBlock>
      )}

      {isDefined(tags.impact) && tags.impact !== TAG_NA && (
        <DetailsBlock title={_('Impact')}>
          <Pre>{tags.impact}</Pre>
        </DetailsBlock>
      )}

      <Solution
        solutionDescription={solution?.description}
        solutionType={solution?.type}
      />

      {isDefined(family) && (
        <DetailsBlock title={_('Family')}>
          <Link to="nvts" filter={'family="' + family + '"'} textOnly={!links}>
            {family}
          </Link>
        </DetailsBlock>
      )}

      <References links={links} nvt={entity} />
    </Layout>
  );
};

NvtDetails.propTypes = {
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
};

export default NvtDetails;

// vim: set ts=2 sw=2 tw=80:
