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

import _, {long_date} from 'gmp/locale.js';

import PropTypes from '../../utils/proptypes.js';

import DetailsBlock from '../../entity/block.js';
import EntityPage from '../../entity/page.js';
import EntityContainer from '../../entity/container.js';
import {EntityInfoTable} from '../../entity/info.js';

import ManualIcon from '../../components/icon/manualicon.js';
import ListIcon from '../../components/icon/listicon.js';

import IconDivider from '../../components/layout/icondivider.js';
import Layout from '../../components/layout/layout.js';

import CertLink from '../../components/link/certlink.js';
import DetailsLink from '../../components/link/detailslink.js';

import Table from '../../components/table/stripedtable.js';
import TableHeader from '../../components/table/header.js';
import TableHead from '../../components/table/head.js';
import TableBody from '../../components/table/body.js';
import TableData from '../../components/table/data.js';
import TableRow from '../../components/table/row.js';

import CveDetails from './details.js';

const ToolBarIcons = () => (
  <IconDivider>
    <ManualIcon
      page="vulnerabilitymanagement"
      anchor="cve"
      title={_('Help: CVEs')}
    />
    <ListIcon
      title={_('CVE List')}
      page="cves"
    />
  </IconDivider>
);

const Details = ({
  entity,
  links = true,
}) => {
  const {certs, nvts} = entity;
  let {products} = entity;
  products = products.sort();
  return (
    <Layout flex="column">

      <CveDetails
        entity={entity}
      />

      {certs.length > 0 &&
        <DetailsBlock
          title={_('CERT Advisories referencing this CVE')}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  {_('Name')}
                </TableHead>
                <TableHead>
                  {_('Title')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {certs.map(cert => (
                <TableRow key={cert.name}>
                  <TableData>
                    <CertLink
                      id={cert.name}
                      type={cert.cert_type}
                      textOnly={!links}
                    />
                  </TableData>
                  <TableData>
                    {cert.title}
                  </TableData>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DetailsBlock>
      }

      {products.length > 0 &&
        <DetailsBlock
          title={_('Vulnerable Products')}>
          <Layout flex="column">
            {products.map(product => (
              <DetailsLink
                key={product}
                type="cpe"
                id={product}
              >
                {product}
              </DetailsLink>
            ))}
          </Layout>
        </DetailsBlock>
      }

      {nvts.length > 0 &&
        <DetailsBlock
          title={_('NVTs addressing this CVE')}>
          <Layout flex="column">
            {nvts.map(nvt => (
              <DetailsLink
                key={nvt.id}
                type="info"
                page="nvt"
                id={nvt.id}
              >
                {nvt.name}
              </DetailsLink>
            ))}
          </Layout>
        </DetailsBlock>
      }
    </Layout>
  );
};

Details.propTypes = {
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
};

const EntityInfo = ({
  entity,
}) => {
  const {id, published_time, last_modified_time, update_time} = entity;
  return (
    <EntityInfoTable>
      <TableBody>
        <TableRow>
          <TableData>
            {_('ID')}
          </TableData>
          <TableData>
            {id}
          </TableData>
        </TableRow>
        <TableRow>
          <TableData>
            {_('Published')}
          </TableData>
          <TableData>
            {long_date(published_time)}
          </TableData>
        </TableRow>
        <TableRow>
          <TableData>
            {_('Modified')}
          </TableData>
          <TableData>
            {long_date(update_time)}
          </TableData>
        </TableRow>
        <TableRow>
          <TableData>
            {_('Last updated')}
          </TableData>
          <TableData>
            {long_date(last_modified_time)}
          </TableData>
        </TableRow>
      </TableBody>
    </EntityInfoTable>
  );
};

EntityInfo.propTypes = {
  entity: PropTypes.model.isRequired,
};

const CvePage = props => (
  <EntityContainer
    {...props}
    name="cve"
  >
    {({
      onChanged,
      onDownloaded,
      onError,
      ...cprops
    }) => (
      <EntityPage
        {...props}
        {...cprops}
        sectionIcon="cve.svg"
        title={_('CVE')}
        detailsComponent={Details}
        infoComponent={EntityInfo}
        permissionsComponent={false}
        toolBarIcons={ToolBarIcons}
        onPermissionChanged={onChanged}
        onPermissionDownloaded={onDownloaded}
        onPermissionDownloadError={onError}
      />
    )}
  </EntityContainer>
);

export default CvePage;

// vim: set ts=2 sw=2 tw=80:
