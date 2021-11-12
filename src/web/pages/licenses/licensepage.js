/* Copyright (C) 2021 Greenbone Networks GmbH
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
import React, {useEffect, useState} from 'react';

import _ from 'gmp/locale';

import DateTime from 'web/components/date/datetime';

import LicenseIcon from 'web/components/icon/licenseicon';
import ManualIcon from 'web/components/icon/manualicon';
import NewIcon from 'web/components/icon/newicon';

import IconDivider from 'web/components/layout/icondivider';
import Layout from 'web/components/layout/layout';
import PageTitle from 'web/components/layout/pagetitle';

import Section from 'web/components/section/section';

import InfoTable from 'web/components/table/infotable';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';

import {Col} from 'web/entity/page';

import PropTypes from 'web/utils/proptypes';
import useGmp from 'web/utils/useGmp';

// import useCapabilities from 'web/utils/useCapabilities';

import LicenseDialog from './dialog';

const ToolBarIcons = ({onNewLicenseClick}) => {
  // const capabilities = useCapabilities();
  const mayCreate = false; // TODO Adjust for capabilities
  return (
    <Layout>
      <IconDivider>
        <ManualIcon
          size="small"
          page="web-interface" // TODO Change!
          anchor="license-management" // TODO Change!
          title={_('Help: License Management')}
        />
        {mayCreate && ( // TODO Adjust for capabilities
          <NewIcon
            size="small"
            title={_('New License')}
            onClick={onNewLicenseClick}
          />
        )}
      </IconDivider>
    </Layout>
  );
};
ToolBarIcons.propTypes = {
  onNewLicenseClick: PropTypes.func.isRequired,
};

const LicensePage = () => {
  const gmp = useGmp();

  const [license, setLicense] = useState({});
  const [newLicenseDialogVisible, setNewLicenseDialogVisible] = useState(false);

  useEffect(() => {
    gmp.license.getLicenseInformation().then(response => {
      setLicense(response.data);
    });
  }, [gmp.license]);

  const handleNewLicenseClick = () => {
    setNewLicenseDialogVisible(true);
  };
  const handleCloseDialog = () => {
    setNewLicenseDialogVisible(false);
  };
  const handleSaveLicense = data => {
    // gmp.save_license(data).then(setNewLicenseDialogVisible(false));
    setNewLicenseDialogVisible(false);
  };
  const handleValueChange = value => {
    setLicense(value);
  };

  return (
    <React.Fragment>
      <PageTitle title={_('License Management')} />
      <Layout flex="column">
        <ToolBarIcons onNewLicenseClick={handleNewLicenseClick} />
        <Section
          img={<LicenseIcon size="large" />}
          title={_('License Management')}
        >
          <Layout flex="column" grow>
            <h3>Information</h3>
            <InfoTable>
              <colgroup>
                <Col width="10%" />
                <Col width="90%" />
              </colgroup>
              <TableBody>
                <TableRow>
                  <TableData>{_('ID')}</TableData>
                  <TableData>{license.id}</TableData>
                </TableRow>
                <TableRow>
                  <TableData>{_('Customer Name')}</TableData>
                  <TableData>{license.customerName}</TableData>
                </TableRow>
                <TableRow>
                  <TableData>{_('Creation Date')}</TableData>
                  <TableData>
                    <DateTime date={license.creationDate} />
                  </TableData>
                </TableRow>
                <TableRow>
                  <TableData>{_('Version')}</TableData>
                  <TableData>{license.version}</TableData>
                </TableRow>
                <TableRow>
                  <TableData>{_('Begins')}</TableData>
                  <TableData>
                    <DateTime date={license.begins} />
                  </TableData>
                </TableRow>
                <TableRow>
                  <TableData>{_('Expires')}</TableData>
                  <TableData>
                    <DateTime date={license.expires} />
                  </TableData>
                </TableRow>
                <TableRow>
                  <TableData>{_('Comment')}</TableData>
                  <TableData>{license.comment}</TableData>
                </TableRow>
              </TableBody>
            </InfoTable>
            <h3>Model</h3>
            <InfoTable>
              <colgroup>
                <Col width="10%" />
                <Col width="90%" />
              </colgroup>
              <TableBody>
                <TableRow>
                  <TableData>{_('Model')}</TableData>
                  <TableData>{license.model}</TableData>
                </TableRow>
                <TableRow>
                  <TableData>{_('Model Type')}</TableData>
                  <TableData>{license.modelType}</TableData>
                </TableRow>
              </TableBody>
            </InfoTable>
          </Layout>
        </Section>
      </Layout>
      {newLicenseDialogVisible && (
        <LicenseDialog
          onClose={handleCloseDialog}
          onSave={handleSaveLicense}
          onValueChange={handleValueChange}
        />
      )}
    </React.Fragment>
  );
};

export default LicensePage;

// vim: set ts=2 sw=2 tw=80:
