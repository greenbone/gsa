/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import SaveDialog from 'web/components/dialog/savedialog';
import FormGroup from 'web/components/form/formgroup';
import Select from 'web/components/form/select';
import TextField from 'web/components/form/textfield';
import useTranslation from 'web/hooks/useTranslation';
import {CertBundCreatedDisplay} from 'web/pages/certbund/dashboard/createddisplay';
import {CertBundCvssDisplay} from 'web/pages/certbund/dashboard/cvssdisplay';
import {CvesCreatedDisplay} from 'web/pages/cves/dashboard/createddisplay';
import {CvesSeverityClassDisplay} from 'web/pages/cves/dashboard/severityclassdisplay';
import {HostsModifiedDisplay} from 'web/pages/hosts/dashboard/modifieddisplay';
import {HostsTopologyDisplay} from 'web/pages/hosts/dashboard/topologydisplay';
import {HostsVulnScoreDisplay} from 'web/pages/hosts/dashboard/vulnscoredisplay';
import {NvtsSeverityClassDisplay} from 'web/pages/nvts/dashboard/severityclassdisplay';
import {OsSeverityClassDisplay} from 'web/pages/operatingsystems/dashboard/severityclassdisplay';
import {OsVulnScoreDisplay} from 'web/pages/operatingsystems/dashboard/vulnscoredisplay';
import {ReportsHighResultsDisplay} from 'web/pages/reports/dashboard/highresultsdisplay';
import {ReportsSeverityDisplay} from 'web/pages/reports/dashboard/severityclassdisplay';
import {ResultsSeverityDisplay} from 'web/pages/results/dashboard/severityclassdisplay';
import {TasksSeverityDisplay} from 'web/pages/tasks/dashboard/severityclassdisplay';
import {TasksStatusDisplay} from 'web/pages/tasks/dashboard/statusdisplay';
import PropTypes from 'web/utils/proptypes';

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

const NewDashboardDialog = ({additionalDisplayChoices, onClose, onSave}) => {
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
    {label: _('Empty'), key: 'empty', value: EMPTY_DISPLAYS},
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
      onSave={values =>
        onSave({
          ...values,
          defaultDisplays: uniqueDisplayChoices.find(
            choice => choice.key === values.defaultDisplays,
          )?.value,
        })
      }
    >
      {({values, onValueChange}) => (
        <>
          <FormGroup title={_('Dashboard Title')}>
            <TextField
              maxLength={MAX_TITLE_LENGTH}
              name="title"
              value={values.title}
              onChange={onValueChange}
            />
          </FormGroup>
          <FormGroup title={_('Initial Displays')}>
            <Select
              items={uniqueDisplayChoices.map(({label, key}) => ({
                label,
                value: key,
              }))}
              name="defaultDisplays"
              value={values.defaultDisplays}
              onChange={onValueChange}
            />
          </FormGroup>
        </>
      )}
    </SaveDialog>
  );
};

NewDashboardDialog.propTypes = {
  additionalDisplayChoices: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.array.isRequired,
    }),
  ).isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default NewDashboardDialog;
