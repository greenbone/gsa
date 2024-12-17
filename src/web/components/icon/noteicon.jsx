/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import withSvgIcon from './withSvgIcon';

import Icon from './svg/note.svg';

const NoteIconComponent = withSvgIcon()(Icon);

const NoteIcon = props => (
  <NoteIconComponent {...props} data-testid="note-icon" />
);

export default NoteIcon;

// vim: set ts=2 sw=2 tw=80:
