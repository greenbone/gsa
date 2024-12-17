/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import withSvgIcon from './withSvgIcon';

import Icon from './svg/cert_bund_adv.svg';

const CertBundAdvIconComponent = withSvgIcon()(Icon);

const CertBundAdvIcon = props => (
  <CertBundAdvIconComponent {...props} data-testid="cert-bund-adv-icon" />
);

export default CertBundAdvIcon;

// vim: set ts=2 sw=2 tw=80:
