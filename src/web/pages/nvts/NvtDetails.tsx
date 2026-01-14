/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type default as Nvt, TAG_NA} from 'gmp/models/nvt';
import {isDefined} from 'gmp/utils/identity';
import Severitybar from 'web/components/bar/SeverityBar';
import DateTime from 'web/components/date/DateTime';
import Layout from 'web/components/layout/Layout';
import CveLink from 'web/components/link/CveLink';
import Link from 'web/components/link/Link';
import InfoTable from 'web/components/table/InfoTable';
import TableBody from 'web/components/table/TableBody';
import TableCol from 'web/components/table/TableCol';
import TableData from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';
import DetailsBlock from 'web/entity/DetailsBlock';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import NvtReferences from 'web/pages/nvts/NvtReferences';
import Pre from 'web/pages/nvts/Preformatted';
import Solution from 'web/pages/nvts/Solution';
import {na, getTranslatableSeverityOrigin} from 'web/utils/Render';
import {renderPercentile, renderScore} from 'web/utils/severity';

interface NvtDetailsProps {
  entity: Nvt;
  links?: boolean;
}

const NvtDetailsColGroup = () => (
  <colgroup>
    <TableCol width="15%" />
    <TableCol width="85%" />
  </colgroup>
);

const NvtDetails = ({entity, links = true}: NvtDetailsProps) => {
  const [_] = useTranslation();
  const {
    epss,
    tags = {},
    severity,
    qod,
    family,
    solution,
    severityOrigin,
    severityDate,
  } = entity;
  const gmp = useGmp();
  return (
    <Layout flex="column" grow="1">
      {entity.isDeprecated() && <div>{_('This NVT is deprecated.')}</div>}
      {isDefined(tags.summary) && (
        <DetailsBlock title={_('Summary')}>
          <Pre>{tags.summary}</Pre>
        </DetailsBlock>
      )}

      <DetailsBlock title={_('Scoring')}>
        <h3>{_('CVSS')}</h3>
        <InfoTable>
          <NvtDetailsColGroup />
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
                      query={{cvssVector: tags.cvss_base_vector}}
                      to="cvsscalculator"
                    >
                      {tags.cvss_base_vector}
                    </Link>
                  </TableData>
                </TableRow>
              )}
            <TableRow>
              <TableData>{_('CVSS Origin')}</TableData>
              <TableData>
                {na(getTranslatableSeverityOrigin(severityOrigin as string))}
              </TableData>
            </TableRow>
            <TableRow>
              <TableData>{_('CVSS Date')}</TableData>
              <TableData>
                {isDefined(severityDate) ? (
                  <DateTime date={severityDate} />
                ) : (
                  _('N/A')
                )}
              </TableData>
            </TableRow>
          </TableBody>
        </InfoTable>
        {gmp.settings.enableEPSS && isDefined(epss?.maxSeverity) && (
          <>
            <h3>{_('EPSS (CVE with highest severity)')}</h3>
            <InfoTable>
              <NvtDetailsColGroup />
              <TableBody>
                <TableData colSpan={2}></TableData>
                <TableRow>
                  <TableData>{_('EPSS Score')}</TableData>
                  <TableData>{renderScore(epss?.maxSeverity?.score)}</TableData>
                </TableRow>
                <TableRow>
                  <TableData>{_('EPSS Percentile')}</TableData>
                  <TableData>
                    {renderPercentile(epss?.maxSeverity?.percentile)}
                  </TableData>
                </TableRow>
                <TableRow>
                  <TableData>{_('CVE')}</TableData>
                  <TableData>
                    <CveLink id={epss.maxSeverity.cve?.id as string}>
                      {epss.maxSeverity.cve?.id}
                    </CveLink>
                  </TableData>
                </TableRow>
                <TableRow>
                  <TableData>{_('CVE Severity')}</TableData>
                  <TableData>
                    <Severitybar
                      severity={
                        isDefined(epss.maxSeverity.cve?.severity)
                          ? epss.maxSeverity.cve?.severity
                          : _('N/A')
                      }
                    />
                  </TableData>
                </TableRow>
              </TableBody>
            </InfoTable>
          </>
        )}
        {gmp.settings.enableEPSS && isDefined(epss?.maxEpss) && (
          <>
            <h3>{_('EPSS (highest EPSS score)')}</h3>
            <InfoTable>
              <NvtDetailsColGroup />
              <TableBody>
                <TableData colSpan={2}></TableData>
                <TableRow>
                  <TableData>{_('EPSS Score')}</TableData>
                  <TableData>{renderScore(epss.maxEpss.score)}</TableData>
                </TableRow>
                <TableRow>
                  <TableData>{_('EPSS Percentile')}</TableData>
                  <TableData>
                    {renderPercentile(epss.maxEpss.percentile)}
                  </TableData>
                </TableRow>
                <TableRow>
                  <TableData>{_('CVE')}</TableData>
                  <TableData>
                    <CveLink id={epss.maxEpss.cve?.id as string}>
                      {epss?.maxEpss.cve?.id}
                    </CveLink>
                  </TableData>
                </TableRow>
                <TableRow>
                  <TableData>{_('CVE Severity')}</TableData>
                  <TableData>
                    <Severitybar
                      severity={
                        isDefined(epss?.maxEpss?.cve?.severity)
                          ? epss?.maxEpss?.cve?.severity
                          : _('N/A')
                      }
                    />
                  </TableData>
                </TableRow>
              </TableBody>
            </InfoTable>
          </>
        )}
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
          <Link filter={'family="' + family + '"'} textOnly={!links} to="nvts">
            {family}
          </Link>
        </DetailsBlock>
      )}

      <NvtReferences links={links} nvt={entity} />
    </Layout>
  );
};

export default NvtDetails;
