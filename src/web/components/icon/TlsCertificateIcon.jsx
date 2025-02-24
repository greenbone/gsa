/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Icon from 'web/components/icon/svg/tlscertificate.svg';
import withSvgIcon from 'web/components/icon/withSvgIcon';

const TlsCertificateIconComponent = withSvgIcon()(Icon);

const TlsCertificateIcon = props => (
  <TlsCertificateIconComponent {...props} data-testid="tls-certificate-icon" />
);

export default TlsCertificateIcon;
