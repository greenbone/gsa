/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Icon from './svg/note.svg';
import withSvgIcon from './withSvgIcon';


const NoteIconComponent = withSvgIcon()(Icon);

const NoteIcon = props => (
  <NoteIconComponent {...props} data-testid="note-icon" />
);

export default NoteIcon;

// vim: set ts=2 sw=2 tw=80:
