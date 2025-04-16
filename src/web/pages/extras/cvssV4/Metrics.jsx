/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Select from 'web/components/form/Select';
import useTranslation from 'web/hooks/useTranslation';


const Metrics = ({metrics, selectedOptions, handleOptionChange}) => {
  const [_] = useTranslation();
  return Object.entries(metrics).map(([metricShort, metric]) => {
    return (
      <section key={`${metric.name}-${metricShort}`}>
        <Select
          items={Object.entries(metric.options).map(([value, name]) => ({
            label: `${_(name)} (${value})`,
            value: value,
          }))}
          label={`${_(metric.name)} (${metricShort})`}
          name={metricShort}
          value={selectedOptions[metricShort]}
          onChange={handleOptionChange}
        />
      </section>
    );
  });
};

export default Metrics;
