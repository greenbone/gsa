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

import styled from 'styled-components';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

import {TAG_NA} from 'gmp/models/nvt';

import {DEFAULT_OID_VALUE} from 'gmp/models/override';

import Layout from 'web/components/layout/layout';

import DetailsLink from 'web/components/link/detailslink';

import InfoTable from 'web/components/table/infotable';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';

import DetailsBlock from 'web/entity/block';
import {Col} from 'web/entity/page';

import References from 'web/pages/nvts/references';
import Solution from 'web/pages/nvts/solution';
import P from 'web/pages/nvts/preformatted';

import PropTypes from 'web/utils/proptypes';
import {renderNvtName} from 'web/utils/render';

import Diff, {Added, Removed} from './diff';

/*
 security and log messages from nvts are converted to results
 results should preserve newlines AND whitespaces for formatting
*/
const Pre = styled.pre`
  white-space: pre-wrap;
  word-wrap: word-break;
`;

const GrowDiv = styled.div`
  min-width: 500px;
  max-width: 1080px;
`;

const DerivedDiff = ({deltaType, firstDescription, secondDesription}) => {
  let Component;
  let lines;
  let prefix;

  if (deltaType === 'new') {
    lines = secondDesription.split(/\r|\n|\r\n/);
    Component = Added;
    prefix = '+';
  } else if (deltaType === 'gone') {
    lines = firstDescription.split(/\r|\n|\r\n/);
    Component = Removed;
    prefix = '-';
  } else {
    lines = [_('None.')];
    Component = Pre;
    prefix = '';
  }

  return (
    <React.Fragment>
      {lines.map((line, i) => {
        const lineWithPrefix = prefix + line;
        return <Component key={i}>{lineWithPrefix}</Component>;
      })}
    </React.Fragment>
  );
};

DerivedDiff.propTypes = {
  deltaType: PropTypes.string.isRequired,
  firstDescription: PropTypes.string.isRequired,
  secondDesription: PropTypes.string.isRequired,
};

const ResultDetails = ({className, links = true, entity}) => {
  const result = entity;

  const {nvt} = result;
  const {oid, tags, solution} = nvt;

  const is_oval = isDefined(oid) && oid.startsWith('oval:');
  const has_detection =
    isDefined(result.detection) && isDefined(result.detection.result);

  const detection_details = has_detection
    ? result.detection.result.details
    : undefined;

  const result2 = isDefined(result.delta) ? result.delta.result : undefined;
  const result2Id = isDefined(result2) ? result2.id : undefined;

  const deltaType = isDefined(result.delta)
    ? result.delta.delta_type
    : undefined;

  let result2Description;
  let result1Description;
  let result1Link;
  let result2Link;

  if (deltaType === 'same') {
    result2Description = result.description;
    result1Description = result.description;
    result1Link = result.id;
    result2Link = result.id;
  } else if (deltaType === 'changed') {
    result1Description = result.description;
    result2Description = result2.description;
    result1Link = result.id;
    result2Link = result2Id;
  } else if (deltaType === 'new') {
    result1Description = undefined;
    result2Description = result.description;
    result1Link = undefined;
    result2Link = result.id;
  } else {
    result1Description = result.description;
    result2Description = undefined;
    result1Link = result.id;
    result2Link = undefined;
  }

  return (
    <Layout flex="column" grow="1" className={className}>
      <DetailsBlock title={_('Summary')}>
        <P>{tags.summary}</P>
      </DetailsBlock>

      {result.hasDelta() ? (
        <DetailsBlock title={_('Detection Results')}>
          <div>
            {isDefined(result1Link) ? (
              <DetailsLink id={result1Link} type="result">
                <h3>{_('Result 1')}</h3>
              </DetailsLink>
            ) : (
              <h3>{_('Result 1')}</h3>
            )}
            <Pre>
              {isDefined(result1Description)
                ? result1Description
                : _('No first result available.')}
            </Pre>
          </div>
          <div>
            {isDefined(result2Link) ? (
              <DetailsLink id={result2Link} type="result">
                <h3>{_('Result 2')}</h3>
              </DetailsLink>
            ) : (
              <h3>{_('Result 2')}</h3>
            )}
            <Pre>
              {isDefined(result2Description)
                ? result2Description
                : _('No second result available.')}
            </Pre>
          </div>
          <div>
            <h3>{_('Different Lines')}</h3>
            {isDefined(result.delta.diff) ? (
              <Diff>{result.delta.diff}</Diff>
            ) : (
              <DerivedDiff
                deltaType={deltaType}
                firstDescription={result1Description}
                secondDesription={result2Description}
              />
            )}
          </div>
        </DetailsBlock>
      ) : (
        <DetailsBlock title={_('Detection Result')}>
          {!isEmpty(result.description) && result.description.length > 1 ? (
            <GrowDiv>
              <Pre>{result.description}</Pre>
            </GrowDiv>
          ) : (
            _(
              'Vulnerability was detected according to the ' +
                'Detection Method.',
            )
          )}
        </DetailsBlock>
      )}

      {has_detection && (
        <DetailsBlock title={_('Product Detection Result')}>
          <InfoTable>
            <TableBody>
              <TableRow>
                <TableData>{_('Product')}</TableData>
                <TableData>
                  <span>
                    <DetailsLink
                      type="cpe"
                      id={detection_details.product}
                      textOnly={!links}
                    >
                      {detection_details.product}
                    </DetailsLink>
                  </span>
                </TableData>
              </TableRow>
              <TableRow>
                <TableData>{_('Method')}</TableData>
                <TableData>
                  <span>
                    <DetailsLink
                      id={detection_details.source_oid}
                      type={
                        detection_details.source_oid.startsWith('CVE-')
                          ? 'cve'
                          : 'nvt'
                      }
                      textOnly={!links}
                    >
                      {detection_details.source_name +
                        ' (OID: ' +
                        detection_details.source_oid +
                        ')'}
                    </DetailsLink>
                  </span>
                </TableData>
              </TableRow>
              <TableRow>
                <TableData>{_('Log')}</TableData>
                <TableData>
                  <span>
                    <DetailsLink
                      type="result"
                      id={result.detection.result.id}
                      textOnly={!links}
                    >
                      {_('View details of product detection')}
                    </DetailsLink>
                  </span>
                </TableData>
              </TableRow>
            </TableBody>
          </InfoTable>
        </DetailsBlock>
      )}

      {isDefined(tags.insight) && tags.insight !== TAG_NA && (
        <DetailsBlock title={_('Insight')}>
          <P>{tags.insight}</P>
        </DetailsBlock>
      )}

      <DetailsBlock title={_('Detection Method')}>
        <Layout flex="column">
          <Layout>{tags.vuldetect}</Layout>
          <InfoTable>
            <colgroup>
              <Col width="10%" />
              <Col width="90%" />
            </colgroup>
            <TableBody>
              <TableRow>
                <TableData>{_('Details: ')}</TableData>
                <TableData>
                  {is_oval && (
                    <DetailsLink
                      type="ovaldef"
                      id={oid}
                      title={_('View Details of OVAL Definition {{oid}}', {
                        oid,
                      })}
                      textOnly={!links}
                    >
                      {oid}
                    </DetailsLink>
                  )}
                  {isDefined(oid) && oid.startsWith(DEFAULT_OID_VALUE) && (
                    <span>
                      <DetailsLink type="nvt" id={oid} textOnly={!links}>
                        {renderNvtName(oid, nvt.name)}
                        {' OID: ' + oid}
                      </DetailsLink>
                    </span>
                  )}
                  {!isDefined(oid) &&
                    _('No details available for this method.')}
                </TableData>
              </TableRow>
              {!isEmpty(result.scan_nvt_version) && (
                <TableRow>
                  <TableData>{_('Version used: ')}</TableData>
                  <TableData>{result.scan_nvt_version}</TableData>
                </TableRow>
              )}
            </TableBody>
          </InfoTable>
        </Layout>
      </DetailsBlock>

      {isDefined(tags.affected) && tags.affected !== TAG_NA && (
        <DetailsBlock title={_('Affected Software/OS')}>
          <P>{tags.affected}</P>
        </DetailsBlock>
      )}

      {isDefined(tags.impact) && tags.impact !== TAG_NA && (
        <DetailsBlock title={_('Impact')}>
          <P>{tags.impact}</P>
        </DetailsBlock>
      )}

      <Solution
        solutionDescription={solution?.description}
        solutionType={solution?.type}
      />

      <References links={links} nvt={nvt} />
    </Layout>
  );
};

ResultDetails.propTypes = {
  className: PropTypes.string,
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
};

export default ResultDetails;

// vim: set ts=2 sw=2 tw=80:
