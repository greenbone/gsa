/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {CVSS40} from '@pandatix/js-cvss';
import {expectedMetricOptionsOrdered} from './cvssConfig';

/**
 * This function calculates the CVSS vector from a set of metrics.
 *
 * @param {Record<string,string>} cvssVectorObject - An object with key-value pairs of the metrics.
 * @returns {string} - The CVSS vector string.
 */

export const calculateVector = cvssVectorObject => {
  const result = expectedMetricOptionsOrdered
    .filter(metric => cvssVectorObject[metric[0]] !== undefined)
    .map(metric => `${metric[0]}:${cvssVectorObject[metric[0]]}`)
    .join('/');
  return result;
};

/**
 * This function processes a CVSS vector string and returns an object with the metrics.
 * Checks if the metric is a valid option.
 *
 * @param {string} vectorString - The CVSS vector string to process.
 * @returns {Record<string,string>} - An object with key-value pairs of the metrics.
 */

export const processVector = vectorString => {
  const vector = vectorString.replace(/^CVSS:4.0\//, '').split('/');
  const result = {};
  const expectedMetricMap = new Map(
    expectedMetricOptionsOrdered.map(metric => [metric[0], metric]),
  );

  vector.forEach(metricString => {
    const [key, value] = metricString.split(':');
    if (
      expectedMetricMap.has(key) &&
      value &&
      expectedMetricMap.get(key).includes(value)
    ) {
      result[key] = value;
    }
  });

  return result;
};

/**
 * This function removes the unused metrics from a CVSS vector.
 * The unused optional metrics are the ones with the value 'X'.
 *
 * @param {Record<string,string>} cvssVector - The CVSS vector to remove the unused metrics.
 * @returns {string} - The CVSS vector without the unused metrics.
 */

export const removeUnusedMetrics = cvssVector => {
  const vector = calculateVector(cvssVector).split('/');

  const validMetrics = vector.filter(metric => {
    const [, value] = metric.split(':');
    return value !== 'X';
  });

  const orderMap = new Map(
    expectedMetricOptionsOrdered.map((metric, index) => [metric[0], index]),
  );

  const getKey = metricString => metricString.split(':')[0];
  validMetrics.sort(
    (a, b) => orderMap.get(getKey(a)) - orderMap.get(getKey(b)),
  );

  return validMetrics.join('/');
};

/**
 * This function calculates the CVSS score from a CVSS vector.
 * @param {string} cvssVector - The CVSS vector with all the metrics to calculate the score.
 * @returns {number | undefined} - The CVSS score.
 *
 */

export const calculateScoreSafely = cvssVector => {
  try {
    return new CVSS40(cvssVector).Score();
  } catch {
    return undefined;
  }
};
