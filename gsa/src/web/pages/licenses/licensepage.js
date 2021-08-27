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
import React, {useState} from 'react';

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
// import useCapabilities from 'web/utils/useCapabilities';

import LicenseDialog from './dialog';

export const fakeLicense = {
  id: '12345',
  customerName: 'Monsters Inc.',
  creationDate: '2019-10-10T11:09:23.022Z',
  version: '21.10',
  begin: '2019-10-10T12:09:23.022Z',
  expires: '2026-10-10T11:09:23.022Z',
  model: 'GSM 450',
  modeType: 'Hardware Appliance',
  cpu: '8',
  memory: '8GB',
};

const ToolBarIcons = ({onNewLicenseClick}) => {
  // const capabilities = useCapabilities();
  const mayCreate = true; // TODO Change!
  return (
    <Layout>
      <IconDivider>
        <ManualIcon
          size="small"
          page="web-interface" // TODO Change!
          anchor="changing-the-user-settings" // TODO Change!
          title={_('Help: License Management')}
        />
        {mayCreate && (
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
  const [license, setLicense] = useState(fakeLicense);
  const [newLicenseDialogVisible, setNewLicenseDialogVisible] = useState(false);
  // TODO license = gmp.get_license

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
                  <TableData>{_('Name')}</TableData>
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
                    <DateTime date={license.begin} />
                  </TableData>
                </TableRow>
                <TableRow>
                  <TableData>{_('Expires')}</TableData>
                  <TableData>
                    <DateTime date={license.expires} />
                  </TableData>
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
                  <TableData>{_('Mode Type')}</TableData>
                  <TableData>{license.modeType}</TableData>
                </TableRow>
                <TableRow>
                  <TableData>{_('CPU')}</TableData>
                  <TableData>{license.cpu}</TableData>
                </TableRow>
                <TableRow>
                  <TableData>{_('Memory')}</TableData>
                  <TableData>{license.memory}</TableData>
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
