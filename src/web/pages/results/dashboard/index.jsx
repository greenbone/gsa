/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import Dashboard from '../../../components/dashboard/dashboard';

import {ResultsCvssDisplay, ResultsCvssTableDisplay} from './cvssdisplay';
import {
  ResultsDescriptionWordCloudDisplay,
  ResultsDescriptionWordCloudTableDisplay,
} from './descriptionwordclouddisplay';
import {
  ResultsSeverityDisplay,
  ResultsSeverityTableDisplay,
} from './severityclassdisplay';
import {
  ResultsWordCloudDisplay,
  ResultsWordCloudTableDisplay,
} from './wordclouddisplay';

export const RESULTS_DASHBOARD_ID = '0b8ae70d-d8fc-4418-8a72-e65ac8d2828e';

export const RESULTS_DISPLAYS = [
  ResultsCvssDisplay.displayId,
  ResultsDescriptionWordCloudDisplay.displayId,
  ResultsSeverityDisplay.displayId,
  ResultsWordCloudDisplay.displayId,
  ResultsCvssTableDisplay.displayId,
  ResultsDescriptionWordCloudTableDisplay.displayId,
  ResultsSeverityTableDisplay.displayId,
  ResultsWordCloudTableDisplay.displayId,
];

const ResultsDashboard = props => (
  <Dashboard
    {...props}
    id={RESULTS_DASHBOARD_ID}
    permittedDisplays={RESULTS_DISPLAYS}
    defaultDisplays={[
      [ResultsSeverityDisplay.displayId, ResultsCvssDisplay.displayId],
    ]}
  />
);

export default ResultsDashboard;

// vim: set ts=2 sw=2 tw=80:
