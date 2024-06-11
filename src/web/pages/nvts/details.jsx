/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import _ from 'gmp/locale';

import {isDefined, isNumber} from 'gmp/utils/identity';

import {TAG_NA} from 'gmp/models/nvt';

import PropTypes from 'web/utils/proptypes';
import useGmp from "web/utils/useGmp";

import {na, getTranslatableSeverityOrigin} from 'web/utils/render';

import DetailsBlock from 'web/entity/block';

import Severitybar from 'web/components/bar/severitybar';

import Layout from 'web/components/layout/layout';

import Link from 'web/components/link/link';

import DateTime from 'web/components/date/datetime';
import InfoTable from 'web/components/table/infotable';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';

import References from './references';
import Solution from './solution';
import Pre from './preformatted';
import CveLink from "web/components/link/cvelink";

const NvtDetails = ({entity, links = true}) => {
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
        <InfoTable>
          <TableBody>
            <TableData>
              <b>{_('CVSS')}</b>
            </TableData>
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
            { gmp.settings.enableEPSS && isDefined(epss?.max_severity) &&
              <>
                <TableData colSpan="2">
                  <b>{_('EPSS (CVE with highest severity)')}</b>
                </TableData>
                <TableRow>
                  <TableData>{_('EPSS Score')}</TableData>
                  <TableData>
                    {isNumber(epss?.max_severity?.score)
                      ? epss?.max_severity?.score.toFixed(5) : _("N/A")}
                  </TableData>
                </TableRow>
                <TableRow>
                  <TableData>{_('EPSS Percentile')}</TableData>
                  <TableData>
                    {isNumber(epss?.max_severity?.percentile)
                      ? epss?.max_severity?.percentile.toFixed(5) : _("N/A")}
                  </TableData>
                </TableRow>
                <TableRow>
                  <TableData>{_('CVE')}</TableData>
                  <TableData>
                    <CveLink id={epss?.max_severity?.cve?._id}>
                      {epss?.max_severity?.cve?._id}
                    </CveLink>
                  </TableData>
                </TableRow>
                <TableRow>
                  <TableData>{_('CVE Severity')}</TableData>
                  <Severitybar
                    severity={isDefined(epss?.max_severity?.cve?.severity)
                      ? epss?.max_severity?.cve?.severity : _("N/A")}
                  />
                </TableRow>
              </>
            }
            { gmp.settings.enableEPSS && isDefined(epss?.max_epss) &&
              <>
                <TableData colSpan="2">
                  <b>{_('EPSS (highest EPSS score)')}</b>
                </TableData>
                <TableRow>
                  <TableData>{_('EPSS Score')}</TableData>
                  <TableData>
                    {isNumber(epss?.max_epss?.score)
                      ? epss?.max_epss?.score.toFixed(5) : _("N/A")}
                  </TableData>
                </TableRow>
                <TableRow>
                  <TableData>{_('EPSS Percentile')}</TableData>
                  <TableData>
                    {isNumber(epss?.max_epss?.percentile)
                      ? epss?.max_epss?.percentile.toFixed(5) : _("N/A")}
                  </TableData>
                </TableRow>
                <TableRow>
                  <TableData>{_('CVE')}</TableData>
                  <TableData>
                    <CveLink id={epss?.max_epss?.cve?._id}>
                      {epss?.max_epss?.cve?._id}
                    </CveLink>
                  </TableData>
                </TableRow>
                <TableRow>
                  <TableData>{_('CVE Severity')}</TableData>
                  <TableData>
                    <Severitybar
                      severity={isDefined(epss?.max_epss?.cve?.severity)
                                  ? epss?.max_epss?.cve?.severity : _("N/A")}
                    />
                  </TableData>
                </TableRow>
              </>
            }
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
