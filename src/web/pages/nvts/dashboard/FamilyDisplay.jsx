/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import Filter, {NVTS_FILTER_FILTER} from 'gmp/models/filter';
import FilterTerm from 'gmp/models/filter/filterterm';
import {parseFloat, parseSeverity} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';
import React from 'react';
import BubbleChart from 'web/components/chart/Bubble';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import DataDisplay from 'web/components/dashboard/display/DataDisplay';
import DataTable from 'web/components/dashboard/display/DataTable';
import DataTableDisplay from 'web/components/dashboard/display/DataTableDisplay';
import {riskFactorColorScale} from 'web/components/dashboard/display/Utils';
import withFilterSelection from 'web/components/dashboard/display/withFilterSelection';
import {registerDisplay} from 'web/components/dashboard/Registry';
import PropTypes from 'web/utils/PropTypes';
import {severityFormat} from 'web/utils/Render';
import {resultSeverityRiskFactor} from 'web/utils/Severity';

import {NvtsFamilyLoader} from './Loaders';

const transformFamilyData = (data = {}) => {
  const {groups = []} = data;
  const totalNvts = groups.reduce(
    (prev, current) => prev + parseFloat(current.count),
    0,
  );

  const tdata = groups.map(family => {
    const {count, value} = family;
    const severity = parseSeverity(family.stats.severity.mean);
    const riskFactor = resultSeverityRiskFactor(severity);
    const formattedSeverity = severityFormat(severity);
    const toolTip = _('{{value}}: {{count}} (severity: {{severity}})', {
      value: value,
      count: count,
      severity: formattedSeverity,
    });

    return {
      value: parseFloat(count),
      color: riskFactorColorScale(riskFactor),
      label: value,
      toolTip,
      severity: formattedSeverity,
      filterValue: value,
    };
  });

  tdata.total = totalNvts;
  return tdata;
};

export class NvtsFamilyDisplay extends React.Component {
  constructor(...args) {
    super(...args);

    this.handleDataClick = this.handleDataClick.bind(this);
  }

  handleDataClick(data) {
    const {onFilterChanged, filter} = this.props;

    if (!isDefined(onFilterChanged)) {
      return;
    }

    const {filterValue = ''} = data;

    let familyFilter;

    if (!isEmpty(filterValue)) {
      const familyTerm = FilterTerm.fromString(`family="${filterValue}"`);

      if (isDefined(filter) && filter.hasTerm(familyTerm)) {
        return;
      }
      familyFilter = Filter.fromTerm(familyTerm);
    }

    const newFilter = isDefined(filter)
      ? filter.copy().and(familyFilter)
      : familyFilter;

    onFilterChanged(newFilter);
  }

  render() {
    const {filter, onFilterChanged, ...props} = this.props;

    return (
      <NvtsFamilyLoader filter={filter}>
        {loaderProps => (
          <DataDisplay
            {...props}
            {...loaderProps}
            dataTransform={transformFamilyData}
            filter={filter}
            showToggleLegend={false}
            title={({data: tdata}) =>
              _('NVTs by Family (Total: {{count}})', {count: tdata.total})
            }
          >
            {({width, height, data: tdata, svgRef}) => (
              <BubbleChart
                data={tdata}
                height={height}
                svgRef={svgRef}
                width={width}
                onDataClick={
                  isDefined(onFilterChanged) ? this.handleDataClick : undefined
                }
              />
            )}
          </DataDisplay>
        )}
      </NvtsFamilyLoader>
    );
  }
}

NvtsFamilyDisplay.propTypes = {
  filter: PropTypes.filter,
  onFilterChanged: PropTypes.func,
};

NvtsFamilyDisplay = withFilterSelection({
  filtersFilter: NVTS_FILTER_FILTER,
})(NvtsFamilyDisplay);

NvtsFamilyDisplay.displayId = 'nvt-by-family';

export const NvtsFamilyTableDisplay = createDisplay({
  loaderComponent: NvtsFamilyLoader,
  displayComponent: DataTableDisplay,
  chartComponent: DataTable,
  dataTitles: [_l('NVT Family'), _l('# of NVTs'), _l('Severity')],
  dataRow: row => [row.label, row.value, row.severity],
  dataTransform: transformFamilyData,
  title: ({data}) =>
    _('NVTs by Family (Total: {{count}})', {count: data.total}),
  displayId: 'nvt-by-family-table',
  displayName: 'NvtsFamilyTableDisplay',
  filtersFilter: NVTS_FILTER_FILTER,
});

registerDisplay(NvtsFamilyDisplay.displayId, NvtsFamilyDisplay, {
  title: _l('Chart: NVTs by Family'),
});

registerDisplay(NvtsFamilyTableDisplay.displayId, NvtsFamilyTableDisplay, {
  title: _l('Table: NVTs by Family'),
});
