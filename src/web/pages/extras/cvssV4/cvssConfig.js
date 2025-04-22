/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export const createCvssConfigData = _ => ({
  [_('Base Metrics')]: {
    [_('Exploitability Metrics')]: {
      AV: {
        default: 'N',
        name: _('Attack Vector'),
        options: {
          N: _('Network'),
          A: _('Adjacent'),
          L: _('Local'),
          P: _('Physical'),
        },
      },
      AC: {
        name: _('Attack Complexity'),
        default: 'L',
        options: {
          L: _('Low'),
          H: _('High'),
        },
      },
      AT: {
        default: 'N',
        name: _('Attack Requirements'),
        options: {
          N: _('None'),
          P: _('Present'),
        },
      },
      PR: {
        default: 'N',
        name: _('Privileges Required'),
        options: {
          N: _('None'),
          L: _('Low'),
          H: _('High'),
        },
      },
      UI: {
        default: 'N',
        name: _('User Interaction'),
        options: {
          N: _('None'),
          P: _('Passive'),
          A: _('Active'),
        },
      },
    },
    [_('Vulnerable System Impact Metrics')]: {
      VC: {
        default: 'N',
        name: _('Confidentiality Impact'),
        options: {
          H: _('High'),
          L: _('Low'),
          N: _('None'),
        },
      },
      VI: {
        default: 'N',
        name: _('Integrity Impact'),
        options: {
          H: _('High'),
          L: _('Low'),
          N: _('None'),
        },
      },
      VA: {
        default: 'N',
        name: _('Availability Impact'),
        options: {
          H: _('High'),
          L: _('Low'),
          N: _('None'),
        },
      },
    },
    [_('Subsequent System Impact Metrics')]: {
      SC: {
        default: 'N',
        name: _('Confidentiality Impact'),
        options: {
          H: _('High'),
          L: _('Low'),
          N: _('None'),
        },
      },
      SI: {
        default: 'N',
        name: _('Integrity Impact'),
        options: {
          H: _('High'),
          L: _('Low'),
          N: _('None'),
        },
      },
      SA: {
        default: 'N',
        name: _('Availability Impact'),
        options: {
          H: _('High'),
          L: _('Low'),
          N: _('None'),
        },
      },
    },
  },
  [_('Supplemental Metrics')]: {
    [_('Supplemental Metrics')]: {
      S: {
        default: 'X',
        name: _('Safety'),
        options: {
          X: _('Not Defined'),
          N: _('Negligible'),
          P: _('Present'),
        },
      },
      AU: {
        default: 'X',
        name: _('Automatable'),
        options: {
          X: _('Not Defined'),
          N: _('No'),
          Y: _('Yes'),
        },
      },
      R: {
        default: 'X',
        name: _('Recovery'),
        options: {
          X: _('Not Defined'),
          A: _('Automatic'),
          U: _('User'),
          I: _('Irrecoverable'),
        },
      },
      V: {
        default: 'X',
        name: _('Value Density'),
        options: {
          X: _('Not Defined'),
          D: _('Diffuse'),
          C: _('Concentrated'),
        },
      },
      RE: {
        default: 'X',
        name: _('Vulnerability Response Effort'),
        options: {
          X: _('Not Defined'),
          L: _('Low'),
          M: _('Moderate'),
          H: _('High'),
        },
      },
      U: {
        default: 'X',
        name: _('Provider Urgency'),
        options: {
          X: _('Not Defined'),
          Clear: _('Clear'),
          Green: _('Green'),
          Amber: _('Amber'),
          Red: _('Red'),
        },
      },
    },
  },
  [_('Environmental (Modified Base Metrics)')]: {
    [_('Exploitability Metrics')]: {
      MAV: {
        default: 'X',
        name: _('Attack Vector'),
        options: {
          X: _('Not Defined'),
          N: _('Network'),
          A: _('Adjacent'),
          L: _('Local'),
          P: _('Physical'),
        },
      },
      MAC: {
        default: 'X',
        name: _('Attack Complexity'),
        options: {
          X: _('Not Defined'),
          L: _('Low'),
          H: _('High'),
        },
      },
      MAT: {
        default: 'X',
        name: _('Attack Requirements'),
        options: {
          X: _('Not Defined'),
          N: _('None'),
          P: _('Present'),
        },
      },
      MPR: {
        default: 'X',
        name: _('Privileges Required'),
        options: {
          X: _('Not Defined'),
          N: _('None'),
          L: _('Low'),
          H: _('High'),
        },
      },
      MUI: {
        default: 'X',
        name: _('User Interaction'),
        options: {
          X: _('Not Defined'),
          N: _('None'),
          P: _('Passive'),
          A: _('Active'),
        },
      },
    },
    [_('Vulnerable System Impact Metrics')]: {
      MVC: {
        default: 'X',
        name: _('Confidentiality Impact'),
        options: {
          X: _('Not Defined'),
          H: _('High'),
          L: _('Low'),
          N: _('None'),
        },
      },
      MVI: {
        default: 'X',
        name: _('Integrity Impact'),
        options: {
          X: _('Not Defined'),
          H: _('High'),
          L: _('Low'),
          N: _('None'),
        },
      },
      MVA: {
        default: 'X',
        name: _('Availability Impact'),
        options: {
          X: _('Not Defined'),
          H: _('High'),
          L: _('Low'),
          N: _('None'),
        },
      },
    },
    [_('Subsequent System Impact Metrics')]: {
      MSC: {
        default: 'X',
        name: _('Confidentiality Impact'),
        options: {
          X: _('Not Defined'),
          H: _('High'),
          L: _('Low'),
          N: _('Negligible'),
        },
      },
      MSI: {
        default: 'X',
        name: _('Integrity Impact'),
        options: {
          X: _('Not Defined'),
          S: _('Safety'),
          H: _('High'),
          L: _('Low'),
          N: _('Negligible'),
        },
      },
      MSA: {
        default: 'X',
        name: _('Availability Impact'),
        options: {
          X: _('Not Defined'),
          S: _('Safety'),
          H: _('High'),
          L: _('Low'),
          N: _('Negligible'),
        },
      },
    },
  },
  [_('Environmental (Security Requirements)')]: {
    [_('Environmental (Security Requirements)')]: {
      CR: {
        default: 'X',
        name: _('Confidentiality Requirements'),
        options: {
          X: _('Not Defined'),
          H: _('High'),
          M: _('Medium'),
          L: _('Low'),
        },
      },
      IR: {
        default: 'X',
        name: _('Integrity Requirements'),
        options: {
          X: _('Not Defined'),
          H: _('High'),
          M: _('Medium'),
          L: _('Low'),
        },
      },
      AR: {
        default: 'X',
        name: _('Availability Requirements'),
        options: {
          X: _('Not Defined'),
          H: _('High'),
          M: _('Medium'),
          L: _('Low'),
        },
      },
    },
  },
  [_('Threat Metrics')]: {
    [_('Threat Metrics')]: {
      E: {
        default: 'X',
        name: _('Exploit Maturity'),
        options: {
          X: _('Not Defined'),
          A: _('Attacked'),
          P: _('POC'),
          U: _('Unreported'),
        },
      },
    },
  },
});
