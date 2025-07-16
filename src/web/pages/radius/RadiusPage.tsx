/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';
import {EditIcon, RadiusIcon} from 'web/components/icon';
import ManualIcon from 'web/components/icon/ManualIcon';
import IconDivider from 'web/components/layout/IconDivider';
import Layout from 'web/components/layout/Layout';
import PageTitle from 'web/components/layout/PageTitle';
import Loading from 'web/components/loading/Loading';
import Section from 'web/components/section/Section';
import Table from 'web/components/table/SimpleTable';
import TableBody from 'web/components/table/TableBody';
import TableCol from 'web/components/table/TableCol';
import TableData from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import RadiusDialog from 'web/pages/radius/RadiusDialog';
import {renewSessionTimeout} from 'web/store/usersettings/actions';
import {renderYesNo} from 'web/utils/Render';

interface RadiusSettings {
  enabled?: boolean;
  radiushost?: string;
  radiuskey?: string;
}

interface ToolBarIconsProps {
  onOpenDialogClick: () => void;
}

const ToolBarIcons = ({onOpenDialogClick}: ToolBarIconsProps) => {
  const [_] = useTranslation();
  return (
    <IconDivider>
      <ManualIcon
        anchor="radius"
        page="web-interface-access"
        size="small"
        title={_('Help: RADIUS Authentication')}
      />
      <EditIcon
        title={_('Edit RADIUS Authentication')}
        onClick={onOpenDialogClick}
      />
    </IconDivider>
  );
};

const RadiusAuthentication = () => {
  const gmp = useGmp();
  const [_] = useTranslation();
  const dispatch = useDispatch();
  const [dialogVisible, setDialogVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasRadiusSupport, setHasRadiusSupport] = useState(true);
  const [radiusEnabled, setRadiusEnabled] = useState(false);
  const [radiusHost, setRadiusHost] = useState('');
  const [radiusKey, setRadiusKey] = useState('');

  // @ts-expect-error
  const handleInteraction = () => dispatch(renewSessionTimeout(gmp)());

  const loadRadiusAuthSettings = useCallback(async () => {
    const response = await gmp.user.currentAuthSettings();
    const {data: settings} = response;
    // radius support is enabled in gvm-libs
    const hasRadiusSupport = settings.has('method:radius_connect');
    const radiusSettings = settings.get(
      'method:radius_connect',
    ) as RadiusSettings;
    setHasRadiusSupport(hasRadiusSupport);
    setRadiusEnabled(radiusSettings.enabled || false);
    setLoading(false);
    setRadiusHost(radiusSettings.radiushost || '');
    setRadiusKey(radiusSettings.radiuskey || '');
  }, [gmp.user]);

  const handleSaveSettings = async ({radiusEnabled, radiusHost, radiusKey}) => {
    handleInteraction();

    await gmp.auth.saveRadius({
      radiusEnabled,
      radiusHost,
      radiusKey,
    });
    await loadRadiusAuthSettings();
    setDialogVisible(false);
  };

  const openDialog = () => {
    handleInteraction();
    setDialogVisible(true);
  };

  const closeDialog = () => {
    setDialogVisible(false);
  };

  useEffect(() => {
    void loadRadiusAuthSettings();
  }, [loadRadiusAuthSettings]);

  if (loading) {
    return <Loading />;
  }
  return (
    <>
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
              <TableCol width="10%" />
              <TableCol width="90%" />
            </colgroup>
            <TableBody>
              <TableRow>
                <TableData>{_('Enabled')}</TableData>
                <TableData>{renderYesNo(radiusEnabled)}</TableData>
              </TableRow>
              <TableRow>
                <TableData>{_('RADIUS Host')}</TableData>
                <TableData>{radiusHost}</TableData>
              </TableRow>
              <TableRow>
                <TableData>{_('Secret Key')}</TableData>
                <TableData>{radiusKey}</TableData>
              </TableRow>
            </TableBody>
          </Table>
        ) : (
          <p>{_('Support for RADIUS is not available.')}</p>
        )}
      </Layout>
      {dialogVisible && (
        <RadiusDialog
          radiusEnabled={radiusEnabled}
          radiusHost={radiusHost}
          onClose={closeDialog}
          onSave={handleSaveSettings}
        />
      )}
    </>
  );
};

export default RadiusAuthentication;
