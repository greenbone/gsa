/* Copyright (C) 2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import React from 'react';

import _ from 'gmp/locale';

import EditIcon from 'web/components/icon/editicon';

import PropTypes from 'web/utils/proptypes';

const SolveIcon = ({
  ticket,
  onClick,
}) => (
  <EditIcon
    title={ticket.isSolved() ?
      _('Ticket is already solved') :
      _('Mark Ticket as solved')
    }
    active={!ticket.isSolved()}
    value={ticket}
    onClick={onClick}
  />
);

SolveIcon.propTypes = {
  ticket: PropTypes.model.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default SolveIcon;

// vim: set ts=2 sw=2 tw=80:
