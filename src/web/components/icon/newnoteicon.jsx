/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Icon from './svg/new_note.svg';
import withSvgIcon from './withSvgIcon';


const NewNoteIconComponent = withSvgIcon()(Icon);

const NewNoteIcon = props => (
  <NewNoteIconComponent {...props} data-testid="new-note-icon" />
);


export default NewNoteIcon;

// vim: set ts=2 sw=2 tw=80:
