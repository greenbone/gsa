/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export const cvssConfigData = {
  'Base Metrics': {
    'Exploitability Metrics': {
      AV: {
        default: 'N',
        name: 'Attack Vector',
        options: {
          N: 'Network',
          A: 'Adjacent',
          L: 'Local',
          P: 'Physical',
        },
      },
      AC: {
        name: 'Attack Complexity',
        default: 'L',
        options: {
          L: 'Low',
          H: 'High',
        },
      },
      AT: {
        default: 'N',
        name: 'Attack Requirements',
        options: {
          N: 'None',
          P: 'Present',
        },
      },
      PR: {
        default: 'N',
        name: 'Privileges Required',
        options: {
          N: 'None',
          L: 'Low',
          H: 'High',
        },
      },
      UI: {
        default: 'N',
        name: 'User Interaction',
        options: {
          N: 'None',
          P: 'Passive',
          A: 'Active',
        },
      },
    },
    'Vulnerable System Impact Metrics': {
      VC: {
        default: 'N',
        name: 'Confidentiality Impact',
        options: {
          H: 'High',
          L: 'Low',
          N: 'None',
        },
      },
      VI: {
        default: 'N',
        name: 'Integrity Impact',
        options: {
          H: 'High',
          L: 'Low',
          N: 'None',
        },
      },
      VA: {
        default: 'N',
        name: 'Availability Impact',
        options: {
          H: 'High',
          L: 'Low',
          N: 'None',
        },
      },
    },
    'Subsequent System Impact Metrics': {
      SC: {
        default: 'N',
        name: 'Confidentiality Impact',
        options: {
          H: 'High',
          L: 'Low',
          N: 'None',
        },
      },
      SI: {
        default: 'N',
        name: 'Integrity Impact',
        options: {
          H: 'High',
          L: 'Low',
          N: 'None',
        },
      },
      SA: {
        default: 'N',
        name: 'Availability Impact',
        options: {
          H: 'High',
          L: 'Low',
          N: 'None',
        },
      },
    },
  },
  'Supplemental Metrics': {
    'Supplemental Metrics': {
      S: {
        default: 'X',
        name: 'Safety',
        options: {
          X: 'Not Defined',
          N: 'Negligible',
          P: 'Present',
        },
      },
      AU: {
        default: 'X',
        name: 'Automatable',
        options: {
          X: 'Not Defined',
          N: 'No',
          Y: 'Yes',
        },
      },
      R: {
        default: 'X',
        name: 'Recovery',
        options: {
          X: 'Not Defined',
          A: 'Automatic',
          U: 'User',
          I: 'Irrecoverable',
        },
      },
      V: {
        default: 'X',
        name: 'Value Density',
        options: {
          X: 'Not Defined',
          D: 'Diffuse',
          C: 'Concentrated',
        },
      },
      RE: {
        default: 'X',
        name: 'Vulnerability Response Effort',
        options: {
          X: 'Not Defined',
          L: 'Low',
          M: 'Moderate',
          H: 'High',
        },
      },
      U: {
        default: 'X',
        name: 'Provider Urgency',
        options: {
          X: 'Not Defined',
          Clear: 'Clear',
          Green: 'Green',
          Amber: 'Amber',
          Red: 'Red',
        },
      },
    },
  },
  'Environmental (Modified Base Metrics)': {
    'Exploitability Metrics': {
      MAV: {
        default: 'X',
        name: 'Attack Vector',
        options: {
          X: 'Not Defined',
          N: 'Network',
          A: 'Adjacent',
          L: 'Local',
          P: 'Physical',
        },
      },
      MAC: {
        default: 'X',
        name: 'Attack Complexity',
        options: {
          X: 'Not Defined',
          L: 'Low',
          H: 'High',
        },
      },
      MAT: {
        default: 'X',
        name: 'Attack Requirements',
        options: {
          X: 'Not Defined',
          N: 'None',
          P: 'Present',
        },
      },
      MPR: {
        default: 'X',
        name: 'Privileges Required',
        options: {
          X: 'Not Defined',
          N: 'None',
          L: 'Low',
          H: 'High',
        },
      },
      MUI: {
        default: 'X',
        name: 'User Interaction',
        options: {
          X: 'Not Defined',
          N: 'None',
          P: 'Passive',
          A: 'Active',
        },
      },
    },
    'Vulnerable System Impact Metrics': {
      MVC: {
        default: 'X',
        name: 'Confidentiality Impact',
        options: {
          X: 'Not Defined',
          H: 'High',
          L: 'Low',
          N: 'None',
        },
      },
      MVI: {
        default: 'X',
        name: 'Integrity Impact',
        options: {
          X: 'Not Defined',
          H: 'High',
          L: 'Low',
          N: 'None',
        },
      },
      MVA: {
        default: 'X',
        name: 'Availability Impact',
        options: {
          X: 'Not Defined',
          H: 'High',
          L: 'Low',
          N: 'None',
        },
      },
    },
    'Subsequent System Impact Metrics': {
      MSC: {
        default: 'X',
        name: 'Confidentiality Impact',
        options: {
          X: 'Not Defined',
          H: 'High',
          L: 'Low',
          N: 'Negligible',
        },
      },
      MSI: {
        default: 'X',
        name: 'Integrity Impact',
        options: {
          X: 'Not Defined',
          S: 'Safety',
          H: 'High',
          L: 'Low',
          N: 'Negligible',
        },
      },
      MSA: {
        default: 'X',
        name: 'Availability Impact',
        options: {
          X: 'Not Defined',
          S: 'Safety',
          H: 'High',
          L: 'Low',
          N: 'Negligible',
        },
      },
    },
  },
  'Environmental (Security Requirements)': {
    'Environmental (Security Requirements)': {
      CR: {
        default: 'X',
        name: 'Confidentiality Requirements',
        options: {
          X: 'Not Defined',
          H: 'High',
          M: 'Medium',
          L: 'Low',
        },
      },
      IR: {
        default: 'X',
        name: 'Integrity Requirements',
        options: {
          X: 'Not Defined',
          H: 'High',
          M: 'Medium',
          L: 'Low',
        },
      },
      AR: {
        default: 'X',
        name: 'Availability Requirements',
        options: {
          X: 'Not Defined',
          H: 'High',
          M: 'Medium',
          L: 'Low',
        },
      },
    },
  },
  'Threat Metrics': {
    'Threat Metrics': {
      E: {
        default: 'X',
        name: 'Exploit Maturity',
        options: {
          X: 'Not Defined',
          A: 'Attacked',
          P: 'POC',
          U: 'Unreported',
        },
      },
    },
  },
};
