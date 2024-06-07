/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';

import {
  calculateVector,
  processVector,
  removeUnusedMetrics,
} from 'web/pages/extras/cvssV4/utils';
import {expectedMetricOptionsOrdered} from 'web/pages/extras/cvssV4/cvssConfig';

describe('CVSS V4.0 Utils', () => {
  describe('calculateVector', () => {
    test('should correctly calculate the CVSS vector', () => {
      const cvssVectorObject = {
        AC: 'L',
        PR: 'N',
        S: 'P',
        UI: 'N',
        AV: 'N',
      };

      const result = calculateVector(
        cvssVectorObject,
        expectedMetricOptionsOrdered,
      );
      expect(result).toEqual('AV:N/AC:L/PR:N/UI:N/S:P');
    });
  });

  describe('processVector', () => {
    test('should correctly process the CVSS vector', () => {
      const vectorString =
        'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:N/VI:N/VA:N/SC:N/SI:N/SA:N';
      const result = processVector(vectorString);
      expect(result).toEqual({
        AC: 'L',
        AT: 'N',
        AV: 'N',
        PR: 'N',
        SA: 'N',
        SC: 'N',
        SI: 'N',
        UI: 'N',
        VA: 'N',
        VC: 'N',
        VI: 'N',
      });
    });

    test('should return only valid elements', () => {
      const incompleteVectorString =
        'CVSS:4.0/AV:Q/AC:L/AT:N/PR:N/UI:N/VC:N/CR';
      const result = processVector(incompleteVectorString);
      expect(result).toEqual({
        AC: 'L',
        AT: 'N',
        PR: 'N',
        UI: 'N',
        VC: 'N',
      });
    });
  });
  describe('removeUnusedMetrics', () => {
    test('removes metrics with value X and returns the rest in order', () => {
      const cvssVector = {
        AV: 'N',
        AC: 'L',
        AT: 'N',
        PR: 'L',
        UI: 'A',
        VC: 'N',
        VI: 'H',
        VA: 'N',
        SC: 'L',
        SI: 'N',
        SA: 'N',
        E: 'X',
        CR: 'X',
        IR: 'X',
        AR: 'X',
        MVA: 'L',
        MSC: 'X',
        MSI: 'X',
        MSA: 'L',
        U: 'X',
      };
      const result = removeUnusedMetrics(cvssVector);
      expect(result).toBe(
        'AV:N/AC:L/AT:N/PR:L/UI:A/VC:N/VI:H/VA:N/SC:L/SI:N/SA:N/MVA:L/MSA:L',
      );
    });
  });
});
