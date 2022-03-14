/* Copyright (C) 2021-2022 Greenbone Networks GmbH
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

import styled from 'styled-components';

import _ from 'gmp/locale';

import date from 'gmp/models/date';

import {isDefined} from 'gmp/utils/identity';

import DateTime from 'web/components/date/datetime';

import ErrorDialog from 'web/components/dialog/errordialog';

import LicenseIcon from 'web/components/icon/licenseicon';
import ManualIcon from 'web/components/icon/manualicon';
import NewIcon from 'web/components/icon/newicon';
import HelpIcon from 'web/components/icon/helpicon';

import IconDivider from 'web/components/layout/icondivider';
import Layout from 'web/components/layout/layout';
import PageTitle from 'web/components/layout/pagetitle';

import Loading from 'web/components/loading/loading';

import Section from 'web/components/section/section';

import InfoTable from 'web/components/table/infotable';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';

import {Col} from 'web/entity/page';

import PropTypes from 'web/utils/proptypes';
import useGmp from 'web/utils/useGmp';
import useLicense from 'web/utils/useLicense';

import useCapabilities from 'web/utils/useCapabilities';

import LicenseDialog from './dialog';

const HowToDiv = styled.div`
  width: 33%;
`;

const ToolBarIcons = ({onNewLicenseClick}) => {
  const capabilities = useCapabilities();
  const mayModify = capabilities.mayEdit('license');

  return (
    <Layout>
      <IconDivider>
        <ManualIcon
          size="small"
          page="web-interface" // TODO Change!
          anchor="license-management" // TODO Change!
          title={_('Help: License Management')}
        />
        {mayModify && (
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
  const {isLoading, license, licenseError, updateLicense} = useLicense();
  const [file, setFile] = useState();
  const [error, setError] = useState(licenseError);
  const [dialogError, setDialogError] = useState();
  const [newLicenseDialogVisible, setNewLicenseDialogVisible] = useState(false);

  useEffect(() => {
    setError(licenseError);
  }, [licenseError]);

  const handleNewLicenseClick = () => {
    setNewLicenseDialogVisible(true);
  };

  const handleCloseDialog = () => {
    setNewLicenseDialogVisible(false);
    setDialogError(undefined);
    setFile(undefined);
  };

  const handleSaveLicense = data => {
    return gmp.license
      .modifyLicense(file)
      .then(() => {
        handleCloseDialog();
        updateLicense();
      })
      .catch(err => {
        setDialogError(err.message);
      });
  };

  const handleValueChange = value => {
    setFile(value);
  };

  const handleErrorClose = () => {
    setError(undefined);
  };

  const handleDialogErrorClose = () => {
    setDialogError(undefined);
  };

  const dur = date(license.expires).diff(date(), 'days');
  let durationUntilExpires;

  if (dur > 30) {
    durationUntilExpires = date(license.expires).fromNow();
  } else {
    durationUntilExpires = _('in {{dur}} days', {dur});
  }

  return (
    <React.Fragment>
      <PageTitle title={_('License Management')} />
      <Layout flex="column">
        <ToolBarIcons onNewLicenseClick={handleNewLicenseClick} />
        {error && (
          <ErrorDialog
            text={error.message}
            title={_('Error while loading license information')}
            onClose={handleErrorClose}
          />
        )}
        <Section
          img={<LicenseIcon size="large" />}
          title={_('License Management')}
        >
          {isLoading ? (
            <Loading />
          ) : (
            <Layout flex="column" grow>
              <h3>Information</h3>
              <InfoTable>
                <colgroup>
                  <Col width="10%" />
                  <Col width="90%" />
                </colgroup>
                <TableBody>
                  <TableRow>
                    <TableData>{_('The license expires')}</TableData>
                    <TableData>{durationUntilExpires}</TableData>
                  </TableRow>
                  <TableRow>
                    <TableData>{_('Status')}</TableData>
                    <TableData>{license.status}</TableData>
                  </TableRow>
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
                      <DateTime date={license.created} />
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
                    <TableData>{_('Expires on')}</TableData>
                    <TableData>
                      <DateTime date={license.expires} />
                    </TableData>
                  </TableRow>
                  {isDefined(license.comment) && (
                    <TableRow>
                      <TableData>{_('Comment')}</TableData>
                      <TableData>{license.comment}</TableData>
                    </TableRow>
                  )}
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
              <h3>
                <HelpIcon /> {_('How to get a Greenbone Enterprise License')}
              </h3>
              <HowToDiv>
                <p>
                  {_(
                    'A Greenbone Enterprise License grants access to the ' +
                      'newest vulnerability information, including tests for ' +
                      'several proprietary products, policies, report formats and' +
                      ' system updates.',
                  )}
                </p>
                <p>
                  {_(
                    'Please contact our sales team for purchasing or ' +
                      ' re-newing a subscription to Greenbone Enterprise ' +
                      'products.',
                  )}
                </p>
                <a href={'mailto:sales@greenbone.net'}>sales@greenbone.net</a>
              </HowToDiv>
            </Layout>
          )}
        </Section>
      </Layout>
      {newLicenseDialogVisible && (
        <LicenseDialog
          error={dialogError}
          onClose={handleCloseDialog}
          onErrorClose={handleDialogErrorClose}
          onSave={handleSaveLicense}
          onValueChange={handleValueChange}
        />
      )}
    </React.Fragment>
  );
};

export default LicensePage;

// vim: set ts=2 sw=2 tw=80:
