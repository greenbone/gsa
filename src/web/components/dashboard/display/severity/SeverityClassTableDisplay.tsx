/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type State} from 'web/components/dashboard/display/DataDisplay';
import DataTableDisplay, {
  type DataTableDisplayProps,
} from 'web/components/dashboard/display/DataTableDisplay';
import transformSeverityClassData, {
  type SeverityClassData,
  type SeverityData,
  type TransformSeverityDataProps,
} from 'web/components/dashboard/display/severity/severity-class-transform';

type SeverityClassTableDisplayProps = Omit<
  DataTableDisplayProps<
    SeverityData,
    State,
    SeverityClassData,
    TransformSeverityDataProps
  >,
  'dataRow' | 'dataTransform'
>;

const severityClassDataRow = ({label, value}: SeverityClassData) => [
  label,
  String(value),
];

const SeverityClassTableDisplay = (props: SeverityClassTableDisplayProps) => (
  <DataTableDisplay<
    SeverityData,
    State,
    SeverityClassData,
    TransformSeverityDataProps
  >
    {...props}
    dataRow={severityClassDataRow}
    dataTransform={transformSeverityClassData}
  />
);

export default SeverityClassTableDisplay;
