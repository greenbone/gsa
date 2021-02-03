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
import React, {useState, useEffect, useCallback} from 'react';

import _ from 'gmp/locale';

import EditIcon from 'web/components/icon/editicon';
import ManualIcon from 'web/components/icon/manualicon';
import RadiusIcon from 'web/components/icon/radiusicon';

import IconDivider from 'web/components/layout/icondivider';
import Layout from 'web/components/layout/layout';
import PageTitle from 'web/components/layout/pagetitle';

import Section from 'web/components/section/section';

import Loading from 'web/components/loading/loading';

import Table from 'web/components/table/simpletable';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';

import {Col} from 'web/entity/page';

import PropTypes from 'web/utils/proptypes';
import {renderYesNo} from 'web/utils/render';

import useGmp from 'web/utils/useGmp';
import useUserSessionTimeout from 'web/utils/useUserSessionTimeout';

import RadiusDialog from './dialog';

const ToolBarIcons = ({onOpenDialogClick}) => (
  <IconDivider>
    <ManualIcon
      page="web-interface-access"
      anchor="radius"
      size="small"
      title={_('Help: RADIUS Authentication')}
    />
    <EditIcon
      onClick={onOpenDialogClick}
      title={_('Edit RADIUS Authentication')}
    />
  </IconDivider>
);

ToolBarIcons.propTypes = {
  onOpenDialogClick: PropTypes.func,
};

const RadiusAuthentication = () => {
  const gmp = useGmp();
  const [, renewSession] = useUserSessionTimeout();

  const [hasRadiusSupport, setHasRadiusSupport] = useState(true);
  const [loading, setLoading] = useState(true);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [enabled, setEnabled] = useState();
  const [radiushost, setRadiusHost] = useState();
  const [radiuskey, setRadiusKey] = useState();

  const loadRadiusAuthSettings = useCallback(() => {
    const authData = gmp.user.currentAuthSettings().then(response => {
      const {data: settings} = response;
      // radius support is enabled in gvm-libs
      const hasRadiusConnectMethod = settings.has('method:radius_connect');
      const {
        enabled: isEnabled,
        radiushost: radHost,
        radiuskey: radKey,
      } = settings.get('method:radius_connect');
      setHasRadiusSupport(hasRadiusConnectMethod);
      setEnabled(isEnabled);
      setRadiusHost(radHost);
      setRadiusKey(radKey);
      setLoading(false);
    });
    return authData;
  }, [gmp]);

  useEffect(() => {
    loadRadiusAuthSettings();
  }, [loadRadiusAuthSettings]);

  const handleInteraction = () => {
    renewSession();
  };

  // eslint-disable-next-line no-shadow
  const handleSaveSettings = ({enable, radiushost, radiuskey}) => {
    handleInteraction();

    return gmp.auth
      .saveRadius({
        enable,
        radiushost,
        radiuskey,
      })
      .then(() => {
        loadRadiusAuthSettings();
        setDialogVisible(false);
      });
  };

  const openDialog = () => {
    setDialogVisible(true);
  };

  const closeDialog = () => {
    setDialogVisible(false);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <React.Fragment>
      <PageTitle title={_('RADIUS Authentication')} />
      <Layout flex="column">
        {hasRadiusSupport && <ToolBarIcons onOpenDialogClick={openDialog} />}
        <Section
          img={<RadiusIcon size="large" />}
          title={_('RADIUS Authentication')}
        />
        {hasRadiusSupport ? (
          <Table>
            <colgroup>
              <Col width="10%" />
              <Col width="90%" />
            </colgroup>
            <TableBody>
              <TableRow>
                <TableData>{_('Enabled')}</TableData>
                <TableData>{renderYesNo(enabled)}</TableData>
              </TableRow>
              <TableRow>
                <TableData>{_('RADIUS Host')}</TableData>
                <TableData>{radiushost}</TableData>
              </TableRow>
              <TableRow>
                <TableData>{_('Secret Key')}</TableData>
                <TableData>********</TableData>
              </TableRow>
            </TableBody>
          </Table>
        ) : (
          <p>{_('Support for RADIUS is not available.')}</p>
        )}
      </Layout>
      {dialogVisible && (
        <RadiusDialog
          enable={enabled}
          radiushost={radiushost}
          radiuskey={radiuskey}
          onClose={closeDialog}
          onSave={handleSaveSettings}
        />
      )}
    </React.Fragment>
  );
};

export default RadiusAuthentication;

// vim: set ts=2 sw=2 tw=80:
