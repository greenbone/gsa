/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Select from 'web/components/form/Select';

const Metrics = ({metrics, selectedOptions, handleOptionChange}) => {
  return Object.entries(metrics).map(([metricShort, metric]) => {
    return (
      <section key={`${metric.name}-${metricShort}`}>
        <Select
          items={Object.entries(metric.options).map(([value, name]) => ({
            label: `${name} (${value})`,
            value: value,
          }))}
          label={`${metric.name} (${metricShort})`}
          name={metricShort}
          value={selectedOptions[metricShort]}
          onChange={handleOptionChange}
        />
      </section>
    );
  });
};

export default Metrics;
