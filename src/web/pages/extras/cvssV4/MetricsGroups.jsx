/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import PropTypes from 'prop-types';
import Metrics from 'web/pages/extras/cvssV4/Metrics';

const MetricsGroups = ({
  cvssConfigData,
  selectedOptions,
  handleOptionChange,
}) => {
  let lastMetricType = null;
  return Object.entries(cvssConfigData).flatMap(
    ([metricType, metricGroups]) => {
      const metricGroupElements = Object.entries(metricGroups).map(
        ([metricGroupName, metrics]) => {
          const isDifferentMetricType = lastMetricType !== metricType;
          lastMetricType = metricType;
          return (
            <section key={`${metricGroupName}-${metricType}`}>
              {isDifferentMetricType && <h3>{metricType}</h3>}
              {metricType !== metricGroupName && <h4>{metricGroupName}</h4>}
              <Metrics
                handleOptionChange={handleOptionChange}
                metrics={metrics}
                selectedOptions={selectedOptions}
              />
            </section>
          );
        },
      );
      return metricGroupElements;
    },
  );
};

MetricsGroups.propTypes = {
  cvssConfigData: PropTypes.object.isRequired,
  selectedOptions: PropTypes.object.isRequired,
  handleOptionChange: PropTypes.func.isRequired,
};

export default MetricsGroups;
