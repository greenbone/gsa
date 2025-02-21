/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Icon from 'web/components/icon/svg/wizard.svg';
import withSvgIcon from 'web/components/icon/withSvgIcon';

const WizardIconComponent = withSvgIcon()(Icon);

const WizardIcon = props => (
  <WizardIconComponent {...props} data-testid="wizard-icon" />
);

export default WizardIcon;
