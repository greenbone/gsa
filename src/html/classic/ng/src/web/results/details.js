/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import React from 'react';

import glamorous from 'glamorous';

import _ from '../../locale.js';
import {is_empty, is_defined} from '../../utils.js';

import Layout from '../components/layout/layout.js';

import CveId from '../cveid.js';
import PropTypes from '../proptypes.js';
import SolutionType from '../solutiontype.js';
import {render_nvt_name} from '../render.js';

import Divider from '../components/layout/divider.js';

import DetailsBlock from '../entity/block.js';

import DetailsLink from '../link/detailslink.js';
import ExternalLink from '../link/external.js';
import InfoLink from '../link/infolink.js';

import InfoTable from '../table/info.js';
import TableBody from '../table/body.js';
import TableData from '../table/data.js';
import TableRow from '../table/row.js';

const N_A = 'N/A';

const B = glamorous.b({
  marginRight: '0.5em',
});

const Pre = glamorous.pre({
  whiteSpace: 'pre-line',
  wordWrap: 'normal',
});

const P = Pre.withComponent('div');

const CertLink = ({
    id,
    textOnly = false,
    type,
  }) => {

  if (type !== 'CERT-Bund' && type !== 'DFN-CERT') {
    return (
      <span><b>?</b>{id}</span>
    );
  }

  let info_type;
  let title;

  if (type === 'CERT-Bund') {
    info_type = 'cert_bund_adv';
    title = _('View details fo CERT-Bund Advisory {{name}}', {name: id});
  }
  else if (type === 'DFN-CERT') {
    title = _('View details fo DFN-CERT Advisory {{name}}', {name: id});
    info_type = 'dfn_cert_adv';
  }
  return (
    <InfoLink
      title={title}
      name={id}
      type={info_type}
      textOnly={textOnly}>
      {id}
    </InfoLink>
  );
};

CertLink.propTypes = {
  id: PropTypes.string.isRequired,
  textOnly: PropTypes.bool,
  type: PropTypes.string.isRequired,
};

const ResultDetails = ({
    className,
    links = true,
    entity,
  }) => {

  const result = entity;

  const {nvt} = result;
  const {oid, tags} = nvt;

  const detection_title = result.severity > 0 || result.nvt.severity > 0 ?
    _('Vulnerability Detection Method') : _('Log Method');
  const is_oval = is_defined(oid) && oid.startsWith('oval:');
  const has_reference = nvt.cves.length > 0 || nvt.bids.length > 0 ||
    nvt.certs.length > 0 || nvt.xrefs.length > 0;
  const has_detection = is_defined(result.detection) &&
    is_defined(result.detection.result);

  const detection_details = has_detection ? result.detection.result.details :
    undefined;

  return (
    <Layout
      flex="column"
      grow="1"
      className={className}>

      <DetailsBlock
        title={_('Summary')}>
        <P>
          {tags.summary}
        </P>
      </DetailsBlock>

      <DetailsBlock
        title={_('Vulnerability Detection Result')}>
        {!is_empty(result.description) && result.description.length > 1 ?
          (
            <Pre>
              {result.description}
            </Pre>
          ) : (
            _('Vulnerability was detected according to the Vulnerability ' +
            'Detection Method.')
          )
        }
      </DetailsBlock>

      {is_defined(tags.impact) && tags.impact !== N_A &&
        <DetailsBlock
          title={_('Impact')}>
          <P>
            {tags.impact}
          </P>
        </DetailsBlock>
      }

      {is_defined(tags.solution) && tags.solution !== N_A &&
        <DetailsBlock
          title={_('Solution')}>
          <Layout
            flex
            className="solution-type">
            <B>{_('Solution Type:')}</B>
            <SolutionType
              displayTitleText
              type={tags.solution_type}/>
          </Layout>
          <P>
            {tags.solution}
          </P>
        </DetailsBlock>
      }

      {is_defined(tags.affected) && tags.affected !== N_A &&
        <DetailsBlock
          title={_('Affected Software/OS')}>
          <P>
            {tags.affected}
          </P>
        </DetailsBlock>
      }

      {is_defined(tags.insight) && tags.insight !== N_A &&
        <DetailsBlock
          title={_('Vulnerability Insight')}>
          <P>
            {tags.insight}
          </P>
        </DetailsBlock>
      }

      <DetailsBlock
        title={detection_title}>
        <Layout flex="column">
          <Layout flex box>
            {tags.vuldetect}
          </Layout>
          <InfoTable>
            <TableBody>
              <TableRow>
                <TableData>
                  {_('Details: ')}
                </TableData>
                <TableData>
                  {is_oval && (
                    <InfoLink
                      type="oval_def"
                      id={oid}
                      title={_('View Details of OVAL Definition {{oid}}',
                        {oid})}
                      textOnly={!links}
                    >
                      {oid}
                    </InfoLink>
                  )}
                  {is_defined(oid) &&
                      oid.startsWith('1.3.6.1.4.1.25623.1.0.') && (
                        <InfoLink
                          type="nvt"
                          id={oid}
                          textOnly={!links}
                        >
                          {render_nvt_name(nvt)}
                          {' OID: ' + oid}
                        </InfoLink>
                      )}
                  {!is_defined(oid) &&
                    _('No details available for this method.')
                  }
                </TableData>
              </TableRow>
              {!is_empty(result.scan_nvt_version) &&
                <TableRow>
                  <TableData>
                    {_('Version used: ')}
                  </TableData>
                  <TableData>
                    {result.scan_nvt_version}
                  </TableData>
                </TableRow>
              }
            </TableBody>
          </InfoTable>
        </Layout>
      </DetailsBlock>

      {has_detection &&
        <DetailsBlock
          title={_('Product Detection Result')}>
          <InfoTable>
            <TableBody>
              <TableRow>
                <TableData>
                  {_('Product')}
                </TableData>
                <TableData>
                  <InfoLink
                    type="cpe"
                    name={detection_details.product}
                    textOnly={!links}
                  >
                    {detection_details.product}
                  </InfoLink>
                </TableData>
              </TableRow>
              <TableRow>
                <TableData>
                  {_('Method')}
                </TableData>
                <TableData>
                  <InfoLink
                    id={detection_details.source_oid}
                    type={
                      detection_details.source_oid.startsWith('CVE-') ?
                        'cve' : 'nvt'
                    }
                    textOnly={!links}
                  >
                    {
                      detection_details.source_name + ' (OID: ' +
                        detection_details.source_oid + ')'
                    }
                  </InfoLink>
                </TableData>
              </TableRow>
              <TableRow>
                <TableData>
                  {_('Log')}
                </TableData>
                <TableData>
                  <DetailsLink
                    type="result"
                    id={result.detection.result.id}
                    textOnly={!links}
                  >
                    {_('View details of product detection')}
                  </DetailsLink>
                </TableData>
              </TableRow>
            </TableBody>
          </InfoTable>
        </DetailsBlock>
      }

      {has_reference &&
        <DetailsBlock
          title={_('References')}>
          <InfoTable>
            <TableBody>
              {nvt.cves.length > 0 &&
                <TableRow>
                  <TableData>
                    {_('CVE')}
                  </TableData>
                  <TableData>
                    {
                      nvt.cves.map(cve_id => {
                        return (
                          <CveId
                            title={_('View Details of {{cve_id}}', {cve_id})}
                            key={cve_id}
                            id={cve_id}
                            textOnly={!links}
                          />
                        );
                      })
                    }
                  </TableData>
                </TableRow>
              }

              {nvt.bids.length > 0 &&
                <TableRow>
                  <TableData>
                    {_('BID')}
                  </TableData>
                  <TableData>
                    <Divider wrap>
                      {
                        nvt.bids.map(bid => {
                          return (
                            <span key={bid}>{bid}</span>
                          );
                        })
                      }
                    </Divider>
                  </TableData>
                </TableRow>
              }

              {nvt.certs.length > 0 &&
                <TableRow>
                  <TableData>
                    {_('CERT')}
                  </TableData>
                  <TableData>
                    <Divider wrap>
                      {
                        nvt.certs.map(cert => {
                          return (
                            <CertLink
                              key={cert.id}
                              type={cert.type}
                              id={cert.id}
                              links={links}
                            />
                          );
                        })

                      }
                    </Divider>
                  </TableData>
                </TableRow>
              }

              {nvt.xrefs.length > 0 &&
                <TableRow>
                  <TableData>
                    {_('Other')}
                  </TableData>
                  <TableData>
                    <Divider wrap>
                      {
                        nvt.xrefs.map(xref => {
                          return (
                            <ExternalLink
                              key={xref.ref}
                              textOnly={!links || xref.type !== 'URL'}
                              href={xref.ref}>
                              {xref.ref}
                            </ExternalLink>
                          );
                        })
                      }
                    </Divider>
                  </TableData>
                </TableRow>
              }
            </TableBody>
          </InfoTable>
        </DetailsBlock>
      }
    </Layout>
  );
};

ResultDetails.propTypes = {
  className: PropTypes.string,
  links: PropTypes.bool,
  entity: PropTypes.model.isRequired,
};

export default ResultDetails;

// vim: set ts=2 sw=2 tw=80:
