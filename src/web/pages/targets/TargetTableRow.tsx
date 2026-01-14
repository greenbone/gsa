/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Model from 'gmp/models/model';
import type Target from 'gmp/models/target';
import {isDefined} from 'gmp/utils/identity';
import {shorten} from 'gmp/utils/string';
import Layout from 'web/components/layout/Layout';
import DetailsLink from 'web/components/link/DetailsLink';
import TableData from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';
import EntityNameTableData from 'web/entities/EntityNameTableData';
import useFeatures from 'web/hooks/useFeatures';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import TargetTableActions, {
  type TargetTableActionsProps,
} from 'web/pages/targets/TargetTableActions';

export interface TargetTableRowProps extends TargetTableActionsProps {
  actionsComponent?: React.ComponentType<TargetTableActionsProps>;
  links?: boolean;
  onToggleDetailsClick?: (entity: Target) => void;
}

interface CredProps {
  credential?: Model;
  title?: string;
  links?: boolean;
}

const Cred = ({credential, title, links = true}: CredProps) => {
  if (!isDefined(credential) || !isDefined(credential.id)) {
    return null;
  }
  return (
    <Layout>
      <span>{title}: </span>
      <Layout>
        <DetailsLink id={credential.id} textOnly={!links} type="credential">
          {credential.name}
        </DetailsLink>
      </Layout>
    </Layout>
  );
};

const TargetTableRow = ({
  actionsComponent: ActionsComponent = TargetTableActions,
  entity,
  links = true,
  onToggleDetailsClick,
  'data-testid': dataTestId,
  ...props
}: TargetTableRowProps) => {
  const [_] = useTranslation();
  const features = useFeatures();
  const gmp = useGmp();
  const isKerberosEnabled = gmp.settings.enableKrb5;
  return (
    <TableRow data-testid={dataTestId}>
      <EntityNameTableData
        displayName={_('Target')}
        entity={entity}
        links={links}
        type="target"
        onToggleDetailsClick={onToggleDetailsClick}
      />
      <TableData>{shorten(entity.hosts.join(', '), 500)}</TableData>
      <TableData>{entity.maxHosts}</TableData>
      <TableData>
        {isDefined(entity.portList) && (
          <span>
            <DetailsLink
              id={entity.portList.id as string}
              textOnly={!links}
              type="portlist"
            >
              {entity.portList.name}
            </DetailsLink>
          </span>
        )}
      </TableData>
      <TableData align="center" flex="column">
        <Cred credential={entity.sshCredential} links={links} title={'SSH'} />
        <Cred
          credential={entity.sshElevateCredential}
          links={links}
          title={_('SSH Elevate')}
        />
        {isKerberosEnabled && (
          <Cred
            credential={entity.krb5Credential}
            links={links}
            title={'SMB (Kerberos)'}
          />
        )}
        <Cred
          credential={entity.smbCredential}
          links={links}
          title={'SMB (NTLM)'}
        />
        <Cred credential={entity.esxiCredential} links={links} title={'ESXi'} />
        <Cred credential={entity.snmpCredential} links={links} title={'SNMP'} />
        {features.featureEnabled('ENABLE_CREDENTIAL_STORES') && (
          <Cred
            // @ts-expect-error
            credential={entity.credential_store}
            links={links}
            title={_('Credential Store')}
          />
        )}
      </TableData>
      <ActionsComponent {...props} entity={entity} />
    </TableRow>
  );
};

export default TargetTableRow;
