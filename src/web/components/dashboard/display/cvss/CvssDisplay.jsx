/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import Filter from 'gmp/models/filter';
import FilterTerm from 'gmp/models/filter/filterterm';
import {isDefined} from 'gmp/utils/identity';
import BarChart from 'web/components/chart/Bar';
import transformCvssData from 'web/components/dashboard/display/cvss/cvssTransform';
import DataDisplay from 'web/components/dashboard/display/DataDisplay';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';

const CvssDisplay = ({
  filter,
  title,
  yLabel,
  xLabel,
  onFilterChanged,
  ...props
}) => {
  const [_] = useTranslation();
  xLabel = xLabel || _('Severity');
  const gmp = useGmp();
  const severityRating = gmp.settings.severityRating;
  const handleDataClick = data => {
    if (!isDefined(onFilterChanged)) {
      return;
    }

    const {filterValue = {}} = data;
    const {start, end} = filterValue;

    let statusFilter;

    if (isDefined(start) && isDefined(end) && start >= 0) {
      const startTerm = FilterTerm.fromString(`severity>${start}`);
      const endTerm = FilterTerm.fromString(`severity<${end}`);

      if (
        isDefined(filter) &&
        filter.hasTerm(startTerm) &&
        filter.hasTerm(endTerm)
      ) {
        return;
      }

      statusFilter = Filter.fromTerm(startTerm).and(Filter.fromTerm(endTerm));
    } else {
      let statusTerm;

      if (isDefined(start)) {
        statusTerm = FilterTerm.fromString(`severity=${start}`);
      } else {
        statusTerm = FilterTerm.fromString('severity=""');
      }

      if (isDefined(filter) && filter.hasTerm(statusTerm)) {
        return;
      }

      statusFilter = Filter.fromTerm(statusTerm);
    }

    const newFilter = isDefined(filter)
      ? filter.copy().and(statusFilter)
      : statusFilter;

    onFilterChanged(newFilter);
  };
  return (
    <DataDisplay
      {...props}
      dataTransform={transformCvssData}
      severityRating={severityRating}
      showToggleLegend={false}
      title={title}
    >
      {({width, height, data, svgRef}) => {
        return (
          <BarChart
            data={data}
            height={height}
            showLegend={false}
            svgRef={svgRef}
            width={width}
            xLabel={xLabel}
            yLabel={yLabel}
            onDataClick={
              isDefined(onFilterChanged) ? handleDataClick : undefined
            }
          />
        );
      }}
    </DataDisplay>
  );
};

CvssDisplay.propTypes = {
  filter: PropTypes.filter,
  title: PropTypes.func.isRequired,
  xLabel: PropTypes.toString,
  yLabel: PropTypes.toString,
  onFilterChanged: PropTypes.func,
};

export default CvssDisplay;
