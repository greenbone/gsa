/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import Select from 'web/components/form/select';

const Metrics = ({metrics, selectedOptions, handleOptionChange}) => {
  return Object.entries(metrics).map(([metricShort, metric]) => (
    <section key={`${metric.name}-${metricShort}`}>
      <Select
        items={Object.entries(metric.options).map(([value, name]) => ({
          label: `${_(name)} (${value})`,
          value: value,
        }))}
        label={`${_(metric.name)} (${metricShort})`}
        menuPosition="adjust"
        name={metricShort}
        value={selectedOptions[metricShort]}
        onChange={handleOptionChange}
      />
    </section>
  ));
};

export default Metrics;
