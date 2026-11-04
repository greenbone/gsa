/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useEffect, useState} from 'react';
import Button from 'web/components/form/Button';
import Checkbox from 'web/components/form/Checkbox';
import FormGroup from 'web/components/form/FormGroup';
import Select from 'web/components/form/Select';
import {
  credentialAwareApi,
  type AssetOverride,
  type Inventory,
} from 'web/credential-aware/api';
import useSessionToken from 'web/hooks/useSessionToken';

const SERVICE_TYPES: Record<string, string[]> = {
  ssh: ['up', 'usk'],
  ssh_elevate: ['up'],
  smb: ['up'],
  esxi: ['up'],
  snmp: ['snmp'],
  krb5: ['krb5'],
};

const SERVICE_NAMES: Record<string, string> = {
  ssh: 'SSH',
  ssh_elevate: 'SSH privilege elevation',
  smb: 'SMB',
  esxi: 'ESXi',
  snmp: 'SNMP',
  krb5: 'Kerberos',
};

interface Props {
  assetId: string;
  hostName: string;
}

const AssetCredentials = ({assetId, hostName}: Props) => {
  const token = useSessionToken();
  const [inventory, setInventory] = useState<Inventory>();
  const [overrides, setOverrides] = useState<AssetOverride[]>([]);
  const [service, setService] = useState('ssh');
  const [credentialId, setCredentialId] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const reload = async () => {
    const [items, saved] = await Promise.all([
      credentialAwareApi<Inventory>(token, 'inventory'),
      credentialAwareApi<AssetOverride[]>(token, 'asset-overrides'),
    ]);
    setInventory(items);
    const hostOverrides = saved.filter(item => item.asset_id === assetId);
    setOverrides(hostOverrides);
    setCredentialId(
      hostOverrides.find(item => item.service === service)?.credential_id || '',
    );
  };

  useEffect(() => {
    void reload().catch(err => setError((err as Error).message));
    // The host ID and session determine the data shown by this tab.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetId, token]);

  const matchingCredentials =
    inventory?.credentials.filter(item =>
      SERVICE_TYPES[service].includes(item.type || ''),
    ) || [];

  const save = async () => {
    if (!credentialId) {
      setError('Choose a credential for this service.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await credentialAwareApi(token, 'asset-overrides', {
        asset_id: assetId,
        service,
        credential_id: credentialId,
      });
      await reload();
      setMessage(`${SERVICE_NAMES[service]} credential saved for ${hostName}.`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (item: AssetOverride) => {
    setBusy(true);
    setError('');
    try {
      await credentialAwareApi(token, 'asset-overrides/delete', {
        asset_id: assetId,
        service: item.service,
      });
      await reload();
      setMessage(`${SERVICE_NAMES[item.service]} override removed.`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (item: AssetOverride, enabled: boolean) => {
    setBusy(true);
    setError('');
    try {
      await credentialAwareApi(token, 'asset-overrides/toggle', {
        asset_id: assetId,
        service: item.service,
        enabled,
      });
      await reload();
      setMessage(
        `${SERVICE_NAMES[item.service]} override ${enabled ? 'enabled' : 'paused'} for new scan groups.`,
      );
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section style={{padding: '1rem'}}>
      <h2>Scan credential overrides</h2>
      <p>
        Choose a credential for this host. New multi-target scan groups use it
        instead of the selected target's credential for the same service only
        while its override is enabled. Standard tasks and existing scan groups
        are unchanged.
      </p>
      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}
      {overrides.length ? (
        <ul>
          {overrides.map(item => (
            <li key={item.service}>
              {SERVICE_NAMES[item.service] || item.service}:{' '}
              {inventory?.credentials.find(
                credential => credential.id === item.credential_id,
              )?.name || item.credential_id}{' '}
              <Checkbox
                checked={item.enabled}
                disabled={busy}
                title={`Use ${SERVICE_NAMES[item.service] || item.service} override for new scan groups`}
                onChange={enabled => void toggle(item, enabled)}
              />{' '}
              <Button
                disabled={busy}
                type="button"
                variant="outline"
                onClick={() => void remove(item)}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No credential overrides are set for this host.</p>
      )}
      <FormGroup title="Authentication service">
        <Select
          items={Object.entries(SERVICE_NAMES).map(([value, label]) => ({
            value,
            label,
          }))}
          value={service}
          onChange={value => {
            const selected = value || 'ssh';
            setService(selected);
            setCredentialId(
              overrides.find(item => item.service === selected)
                ?.credential_id || '',
            );
            setMessage('');
          }}
        />
      </FormGroup>
      <FormGroup title="Credential">
        <Select
          items={matchingCredentials.map(item => ({
            value: item.id,
            label: item.name,
          }))}
          placeholder="Choose a credential"
          value={credentialId}
          onChange={value => {
            setCredentialId(value || '');
            setMessage('');
          }}
        />
      </FormGroup>
      {!matchingCredentials.length && (
        <p>Create a compatible credential under Configuration → Credentials.</p>
      )}
      <Button
        disabled={busy || !credentialId}
        type="button"
        onClick={() => void save()}
      >
        Save credential override
      </Button>
    </section>
  );
};

export default AssetCredentials;
