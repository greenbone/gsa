/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Icon from 'web/components/icon/svg/new_note.svg';
import withSvgIcon from 'web/components/icon/withSvgIcon';

const NewNoteIconComponent = withSvgIcon()(Icon);

const NewNoteIcon = props => (
  <NewNoteIconComponent {...props} data-testid="new-note-icon" />
);

export default NewNoteIcon;
