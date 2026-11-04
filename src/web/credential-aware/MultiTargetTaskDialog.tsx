/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useEffect, useState} from 'react';
import SaveDialog from 'web/components/dialog/SaveDialog';
import Button from 'web/components/form/Button';
import Checkbox from 'web/components/form/Checkbox';
import FormGroup from 'web/components/form/FormGroup';
import MultiSelect from 'web/components/form/MultiSelect';
import Select from 'web/components/form/Select';
import TextField from 'web/components/form/TextField';
import {
  credentialAwareApi,
  type Inventory,
  type TaskGroup,
  type TaskPlan,
  type TaskRequest,
} from 'web/credential-aware/api';
import useSessionToken from 'web/hooks/useSessionToken';

interface Props {
  initial?: {
    name?: string;
    targetId?: string;
    configId?: string;
    scannerId?: string;
  };
  onClose: () => void;
  onCreated: (group: TaskGroup) => void;
  onUseStandard: (draft: TaskRequest) => void;
}

const MultiTargetTaskDialog = ({
  initial,
  onClose,
  onCreated,
  onUseStandard,
}: Props) => {
  const token = useSessionToken();
  const [inventory, setInventory] = useState<Inventory>();
  const [name, setName] = useState(initial?.name || '');
  const [targetIds, setTargetIds] = useState<string[]>(
    initial?.targetId ? [initial.targetId] : [],
  );
  const [configId, setConfigId] = useState(initial?.configId || '');
  const [scannerId, setScannerId] = useState(initial?.scannerId || '');
  const [plan, setPlan] = useState<TaskPlan>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewError, setPreviewError] = useState('');

  useEffect(() => {
    let active = true;
    credentialAwareApi<Inventory>(token, 'inventory')
      .then(data => {
        if (active) {
          setInventory(data);
          setConfigId(
            current =>
              current ||
              data.configs.find(item => item.name === 'Full and fast')?.id ||
              data.configs[0]?.id ||
              '',
          );
          setScannerId(
            current =>
              current ||
              data.scanners.find(item => item.name === 'OpenVAS Default')?.id ||
              data.scanners[0]?.id ||
              '',
          );
        }
      })
      .catch(err => active && setError((err as Error).message));
    return () => {
      active = false;
    };
  }, [token]);

  const request = (): TaskRequest => ({
    backend_mode: 'enhanced',
    name: name.trim(),
    target_ids: targetIds,
    config_id: configId,
    scanner_id: scannerId,
  });

  const change = <T,>(setter: (value: T) => void, value: T) => {
    setter(value);
    setPlan(undefined);
    setError('');
    setPreviewError('');
  };

  const preview = async () => {
    setPreviewError('');
    if (!name.trim() || !targetIds.length || !configId || !scannerId) {
      setPlan(undefined);
      setPreviewError(
        'Enter a name, select at least one source target, and choose a scan configuration and scanner.',
      );
      return;
    }
    setLoading(true);
    try {
      const result = await credentialAwareApi<TaskPlan>(
        token,
        'preview',
        request(),
      );
      setPlan(result);
    } catch (err) {
      setPlan(undefined);
      setPreviewError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const create = async () => {
    if (!plan) {
      throw new Error(
        'Select the source targets and preview the scan plan before creating the task.',
      );
    }
    const group = await credentialAwareApi<TaskGroup>(
      token,
      'groups',
      request(),
    );
    onCreated(group);
    onClose();
  };

  const credentialName = (id: string) =>
    inventory?.credentials.find(item => item.id === id)?.name || id;

  return (
    <SaveDialog
      buttonTitle="Create multi-target task"
      error={error || undefined}
      isLoading={!inventory || loading}
      title="New multi-target task"
      width="58vw"
      onClose={onClose}
      onErrorClose={() => setError('')}
      onSave={create}
    >
      <FormGroup title="Scan mode">
        <Checkbox
          checked
          title="Scan multiple targets"
          onChange={enabled => {
            if (!enabled) {
              onUseStandard(request());
            }
          }}
        />
      </FormGroup>
      <p>
        Select one or more existing targets. Hosts in the same source target
        share one scan. A combined report appears after all scans finish; source
        reports remain available.
      </p>
      <FormGroup title="Name">
        <TextField
          name="name"
          value={name}
          onChange={value => change(setName, value)}
        />
      </FormGroup>
      <FormGroup title="Source targets">
        <MultiSelect
          items={
            inventory?.targets
              .filter(item => !item.review_managed)
              .map(item => ({
                value: item.id,
                label: `${item.name} — ${item.hosts || ''}`,
              })) || []
          }
          value={targetIds}
          onChange={value => change(setTargetIds, value)}
        />
      </FormGroup>
      <FormGroup title="Scan configuration">
        <Select
          items={
            inventory?.configs.map(item => ({
              value: item.id,
              label: item.name,
            })) || []
          }
          value={configId}
          onChange={value => change(setConfigId, value)}
        />
      </FormGroup>
      <FormGroup title="Scanner">
        <Select
          items={
            inventory?.scanners.map(item => ({
              value: item.id,
              label: item.name,
            })) || []
          }
          value={scannerId}
          onChange={value => change(setScannerId, value)}
        />
      </FormGroup>
      <Button
        disabled={loading || !inventory}
        type="button"
        variant="outline"
        onClick={() => void preview()}
      >
        Preview scan plan
      </Button>
      {previewError && (
        <p role="alert" style={{color: 'var(--color-error, #b3261e)'}}>
          {previewError}
        </p>
      )}
      {!plan && <p>Preview is required before creating this task.</p>}
      {plan && (
        <div aria-live="polite">
          <p>
            <strong>
              {plan.units.length} hosts in{' '}
              {plan.scan_units?.length || plan.units.length} scans.
            </strong>{' '}
            The task remains stopped until you start it.
          </p>
          <table style={{width: '100%'}}>
            <thead>
              <tr>
                <th>Host</th>
                <th>Effective credentials</th>
              </tr>
            </thead>
            <tbody>
              {plan.units.map(unit => (
                <tr key={unit.host}>
                  <td>{unit.host}</td>
                  <td>
                    {Object.entries(unit.credentials)
                      .map(
                        ([service, id]) => `${service}: ${credentialName(id)}`,
                      )
                      .join(', ') || 'None'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SaveDialog>
  );
};

export default MultiTargetTaskDialog;
