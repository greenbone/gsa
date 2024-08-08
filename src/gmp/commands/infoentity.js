/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntityCommand from './entity';

class InfoEntityCommand extends EntityCommand {
  constructor(http, info_type, model) {
    super(http, 'info', model);
    this.setDefaultParam('info_type', info_type);
    this.setDefaultParam('details', '1');
  }

  getElementFromRoot(root) {
    /* return the first info element from the response
     * the second info element is for the counts */
    return root.get_info.get_info_response.info[0];
  }
}

export default InfoEntityCommand;

// vim: set ts=2 sw=2 tw=80:
