/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Icon from './svg/dfn_cert_adv.svg';
import withSvgIcon from './withSvgIcon';


const DfnCertAdvIconComponent = withSvgIcon()(Icon);

const DfnCertAdvIcon = props => (
  <DfnCertAdvIconComponent {...props} data-testid="dfn-cert-adv-icon" />
);

export default DfnCertAdvIcon;

// vim: set ts=2 sw=2 tw=80:
