/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import SaveDialog from 'web/components/dialog/SaveDialog';
import Select from 'web/components/form/Select';
import TextField from 'web/components/form/TextField';
import useTranslation from 'web/hooks/useTranslation';
import {CertBundCreatedDisplay} from 'web/pages/certbund/dashboard/CreatedDisplay';
import {CertBundCvssDisplay} from 'web/pages/certbund/dashboard/CvssDisplay';
import {CvesCreatedDisplay} from 'web/pages/cves/dashboard/CreatedDisplay';
import {CvesSeverityClassDisplay} from 'web/pages/cves/dashboard/SeverityClassDisplay';
import HostsTopologyDisplay from 'web/pages/hosts/dashboard/HostsTopologyDisplay';
import {HostsVulnScoreDisplay} from 'web/pages/hosts/dashboard/HostsVulnScoreDisplay';
import {HostsModifiedDisplay} from 'web/pages/hosts/dashboard/ModifiedDisplay';
import {NvtsSeverityClassDisplay} from 'web/pages/nvts/dashboard/SeverityClassDisplay';
import {OsSeverityClassDisplay} from 'web/pages/operatingsystems/dashboard/SeverityClassDisplay';
import {OsVulnScoreDisplay} from 'web/pages/operatingsystems/dashboard/VulnScoreDisplay';
import {ReportsHighResultsDisplay} from 'web/pages/reports/dashboard/HighResultsDisplay';
import {ReportsSeverityDisplay} from 'web/pages/reports/dashboard/SeverityClassDisplay';
import {ResultsSeverityDisplay} from 'web/pages/results/dashboard/SeverityClassDisplay';
import {TasksSeverityDisplay} from 'web/pages/tasks/dashboard/SeverityClassDisplay';
import {TasksStatusDisplay} from 'web/pages/tasks/dashboard/StatusDisplay';

interface NewDashboardDialogProps {
  additionalDisplayChoices: Array<{
    label: string;
    value: Array<unknown>;
  }>;
  onClose: () => void;
  onSave: ({
    title,
    defaultDisplays,
  }: {
    title: string;
    defaultDisplays?: string[][];
  }) => void;
}

export const MAX_TITLE_LENGTH = 50;

export const DEFAULT_DISPLAYS = [
  [TasksSeverityDisplay.displayId, TasksStatusDisplay.displayId],
  [CvesCreatedDisplay.displayId, NvtsSeverityClassDisplay.displayId],
];

const SCAN_DEFAULT_DISPLAYS = [
  [ResultsSeverityDisplay.displayId, ReportsSeverityDisplay.displayId],
  [
    TasksStatusDisplay.displayId,
    ReportsHighResultsDisplay.displayId,
    TasksSeverityDisplay.displayId,
  ],
];

const ASSET_DEFAULT_DISPLAYS = [
  [
    HostsVulnScoreDisplay.displayId,
    HostsTopologyDisplay.displayId,
    OsVulnScoreDisplay.displayId,
  ],
  [OsSeverityClassDisplay.displayId, HostsModifiedDisplay.displayId],
];

const SECINFO_DEFAULT_DISPLAYS = [
  [
    NvtsSeverityClassDisplay.displayId,
    CvesCreatedDisplay.displayId,
    CvesSeverityClassDisplay.displayId,
  ],
  [CertBundCreatedDisplay.displayId, CertBundCvssDisplay.displayId],
];

const EMPTY_DISPLAYS = [];

const NewDashboardDialog = ({
  additionalDisplayChoices,
  onClose,
  onSave,
}: NewDashboardDialogProps) => {
  const [_] = useTranslation();

  const uniqueDisplayChoices = [
    {label: _('Default'), key: 'default', value: DEFAULT_DISPLAYS},
    {
      label: _('Scan Displays'),
      key: 'scan-displays',
      value: SCAN_DEFAULT_DISPLAYS,
    },
    {
      label: _('Asset Displays'),
      key: 'asset-displays',
      value: ASSET_DEFAULT_DISPLAYS,
    },
    {
      label: _('SecInfo Displays'),
      key: 'secinfo-displays',
      value: SECINFO_DEFAULT_DISPLAYS,
    },
    {label: _('No Displays'), key: 'empty', value: EMPTY_DISPLAYS},
    ...additionalDisplayChoices.map(choice => ({
      label: choice.label,
      key: `${choice.label}-${JSON.stringify(choice.value)}`,
      value: choice.value,
    })),
  ].filter(
    (choice, index, self) =>
      index === self.findIndex(item => item.key === choice.key),
  );

  return (
    <SaveDialog
      buttonTitle={_('Add')}
      defaultValues={{title: _('Unnamed'), defaultDisplays: 'default'}}
      title={_('Add new Dashboard')}
      onClose={onClose}
      onSave={values => {
        const selectedChoice = uniqueDisplayChoices.find(
          choice => choice.key === values.defaultDisplays,
        );
        const defaultDisplaysValue =
          (selectedChoice?.value as string[][]) || EMPTY_DISPLAYS;
        onSave({
          title: values.title,
          defaultDisplays: defaultDisplaysValue,
        });
      }}
    >
      {({values, onValueChange}) => (
        <>
          <TextField
            maxLength={MAX_TITLE_LENGTH}
            name="title"
            title={_('Dashboard Title')}
            value={values.title}
            onChange={onValueChange}
          />
          <Select
            items={uniqueDisplayChoices.map(({label, key}) => ({
              label,
              value: key,
            }))}
            label={_('Initial Displays')}
            name="defaultDisplays"
            value={values.defaultDisplays}
            onChange={onValueChange}
          />
        </>
      )}
    </SaveDialog>
  );
};

export default NewDashboardDialog;
