/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Icon from 'web/components/icon/svg/new_ticket.svg';
import withSvgIcon from 'web/components/icon/withSvgIcon';

const NewTicketIconComponent = withSvgIcon()(Icon);

const NewTicketIcon = props => (
  <NewTicketIconComponent data-testid="new-ticket-icon" {...props} />
);

export default NewTicketIcon;
