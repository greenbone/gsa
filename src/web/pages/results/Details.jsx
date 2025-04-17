/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {TAG_NA} from 'gmp/models/nvt';
import {DEFAULT_OID_VALUE} from 'gmp/models/override';
import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';
import React from 'react';
import styled from 'styled-components';
import Layout from 'web/components/layout/Layout';
import DetailsLink from 'web/components/link/DetailsLink';
import TableBody from 'web/components/table/Body';
import Col from 'web/components/table/Col';
import TableData from 'web/components/table/Data';
import InfoTable from 'web/components/table/InfoTable';
import TableRow from 'web/components/table/Row';
import DetailsBlock from 'web/entity/Block';
import useTranslation from 'web/hooks/useTranslation';
import P from 'web/pages/nvts/Preformatted';
import References from 'web/pages/nvts/References';
import Solution from 'web/pages/nvts/Solution';
import Diff, {Added, Removed} from 'web/pages/results/Diff';
import PropTypes from 'web/utils/PropTypes';
import {renderNvtName} from 'web/utils/Render';

/*
 security and log messages from nvts are converted to results
 results should preserve newlines AND whitespaces for formatting
*/
const Pre = styled.pre`
  white-space: pre-wrap;
  word-wrap: break-word;
`;

const GrowDiv = styled.div`
  min-width: 500px;
  max-width: 1080px;
`;

const DerivedDiff = ({deltaType, firstDescription, secondDesription}) => {
  const [_] = useTranslation();
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
  const [_] = useTranslation();
  const result = entity;

  const {information} = result;
  const {id: infoId, tags = {}, solution} = information;

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
    <Layout className={className} flex="column" grow="1">
      {isDefined(tags.summary) && (
        <DetailsBlock title={_('Summary')}>
          <P>{tags.summary}</P>
        </DetailsBlock>
      )}

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
            {isDefined(result.delta.diff) && result.delta.diff.length > 0 ? (
              <Diff>{result.delta.diff}</Diff>
            ) : (
              <DerivedDiff
                deltaType={deltaType}
                firstDescription={
                  isDefined(result1Description) ? result1Description : ''
                }
                secondDesription={
                  isDefined(result2Description) ? result2Description : ''
                }
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
                      id={detection_details.product}
                      textOnly={!links}
                      type="cpe"
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
                      textOnly={!links}
                      type={
                        detection_details.source_oid.startsWith('CVE-')
                          ? 'cve'
                          : 'nvt'
                      }
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
                      id={result.detection.result.id}
                      textOnly={!links}
                      type="result"
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
          <P>{tags.vuldetect}</P>
          <InfoTable>
            <colgroup>
              <Col width="10%" />
              <Col width="90%" />
            </colgroup>
            <TableBody>
              <TableRow>
                <TableData>{_('Details: ')}</TableData>
                <TableData>
                  {isDefined(infoId) &&
                    infoId.startsWith(DEFAULT_OID_VALUE) && (
                      <span>
                        <DetailsLink id={infoId} textOnly={!links} type="nvt">
                          {renderNvtName(infoId, information.name)}
                          {' OID: ' + infoId}
                        </DetailsLink>
                      </span>
                    )}
                  {isDefined(infoId) && infoId.startsWith('CVE-') && (
                    <span>
                      <DetailsLink id={infoId} textOnly={!links} type="cve">
                        {renderNvtName(infoId, information.name)}
                        {' (OID: ' + infoId + ')'}
                      </DetailsLink>
                    </span>
                  )}
                  {!isDefined(infoId) &&
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

      {information.entityType === 'nvt' && (
        <References links={links} nvt={information} />
      )}
    </Layout>
  );
};

ResultDetails.propTypes = {
  className: PropTypes.string,
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
};

export default ResultDetails;
