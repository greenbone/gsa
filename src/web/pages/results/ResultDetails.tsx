/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import styled from 'styled-components';
import Nvt, {TAG_NA} from 'gmp/models/nvt';
import {DEFAULT_OID_VALUE} from 'gmp/models/override';
import Result from 'gmp/models/result';
import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';
import Layout from 'web/components/layout/Layout';
import DetailsLink from 'web/components/link/DetailsLink';
import InfoTable from 'web/components/table/InfoTable';
import TableBody from 'web/components/table/TableBody';
import TableCol from 'web/components/table/TableCol';
import TableData from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';
import DetailsBlock from 'web/entity/Block';
import useTranslation from 'web/hooks/useTranslation';
import P from 'web/pages/nvts/Preformatted';
import References from 'web/pages/nvts/References';
import Solution from 'web/pages/nvts/Solution';
import ResultDiff, {Added, Removed} from 'web/pages/results/ResultDiff';
import {renderNvtName} from 'web/utils/Render';

interface DerivedDiffProps {
  deltaType?: string;
  firstDescription: string;
  secondDescription: string;
}

export interface ResultDetailsProps {
  className?: string;
  entity: Result;
  links?: boolean;
}

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

const DerivedDiff = ({
  deltaType,
  firstDescription,
  secondDescription,
}: DerivedDiffProps) => {
  const [_] = useTranslation();
  let Component: React.ComponentType<{children: React.ReactNode}>;
  let lines: string[];
  let prefix: string;

  if (deltaType === 'new') {
    lines = secondDescription.split(/\r|\n|\r\n/);
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
    <>
      {lines.map((line, i) => {
        const lineWithPrefix = prefix + line;
        return <Component key={i}>{lineWithPrefix}</Component>;
      })}
    </>
  );
};

const ResultDetails = ({
  className,
  links = true,
  entity,
}: ResultDetailsProps) => {
  const [_] = useTranslation();
  const result = entity;

  const {information} = result;
  const {id: infoId, tags = {}, solution} = information as Nvt;

  const hasDetection =
    isDefined(result.detection) && isDefined(result.detection.result);

  const detectionDetails = hasDetection
    ? result.detection.result.details
    : undefined;

  const result2 = isDefined(result.delta) ? result.delta.result : undefined;
  const result2Id = isDefined(result2) ? result2.id : undefined;

  const deltaType = isDefined(result.delta)
    ? result.delta.delta_type
    : undefined;

  let result2Description: string | undefined;
  let result1Description: string | undefined;
  let result1Link: string | undefined;
  let result2Link: string | undefined;

  if (deltaType === 'same') {
    result2Description = result.description;
    result1Description = result.description;
    result1Link = result.id;
    result2Link = result.id;
  } else if (deltaType === 'changed') {
    result1Description = result.description;
    result2Description = result2?.description;
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
            {isDefined(result.delta?.diff) && result.delta.diff.length > 0 ? (
              <ResultDiff>{result.delta.diff}</ResultDiff>
            ) : (
              <DerivedDiff
                deltaType={deltaType}
                firstDescription={
                  isDefined(result1Description) ? result1Description : ''
                }
                secondDescription={
                  isDefined(result2Description) ? result2Description : ''
                }
              />
            )}
          </div>
        </DetailsBlock>
      ) : (
        <DetailsBlock title={_('Detection Result')}>
          {!isEmpty(result.description) &&
          (result.description?.length || 0) > 1 ? (
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

      {hasDetection && (
        <DetailsBlock title={_('Product Detection Result')}>
          <InfoTable>
            <TableBody>
              <TableRow>
                <TableData>{_('Product')}</TableData>
                <TableData>
                  <span>
                    <DetailsLink
                      id={detectionDetails?.product as string}
                      textOnly={!links}
                      type="cpe"
                    >
                      {detectionDetails?.product}
                    </DetailsLink>
                  </span>
                </TableData>
              </TableRow>
              <TableRow>
                <TableData>{_('Method')}</TableData>
                <TableData>
                  <span>
                    <DetailsLink
                      id={detectionDetails?.source_oid as string}
                      textOnly={!links}
                      type={
                        (detectionDetails?.source_oid as string).startsWith(
                          'CVE-',
                        )
                          ? 'cve'
                          : 'nvt'
                      }
                    >
                      {detectionDetails?.source_name +
                        ' (OID: ' +
                        detectionDetails?.source_oid +
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
                      id={result.detection.result.id as string}
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
              <TableCol width="10%" />
              <TableCol width="90%" />
            </colgroup>
            <TableBody>
              <TableRow>
                <TableData>{_('Details: ')}</TableData>
                <TableData>
                  {isDefined(infoId) &&
                    infoId.startsWith(DEFAULT_OID_VALUE) && (
                      <span>
                        <DetailsLink id={infoId} textOnly={!links} type="nvt">
                          {renderNvtName(infoId, information?.name)}
                          {' OID: ' + infoId}
                        </DetailsLink>
                      </span>
                    )}
                  {isDefined(infoId) && infoId.startsWith('CVE-') && (
                    <span>
                      <DetailsLink id={infoId} textOnly={!links} type="cve">
                        {renderNvtName(infoId, information?.name)}
                        {' (OID: ' + infoId + ')'}
                      </DetailsLink>
                    </span>
                  )}
                  {!isDefined(infoId) &&
                    _('No details available for this method.')}
                </TableData>
              </TableRow>
              {isDefined(result.scan_nvt_version) && (
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

      {isDefined(information) && (information as Nvt)?.entityType === 'nvt' && (
        <References links={links} nvt={information as Nvt} />
      )}
    </Layout>
  );
};

export default ResultDetails;
