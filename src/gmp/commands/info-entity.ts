/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type ModelClass} from 'gmp/collection/parser';
import EntityCommand from 'gmp/commands/entity';
import type Http from 'gmp/http/http';
import {type XmlResponseData} from 'gmp/http/transform/fast-xml';
import type Model from 'gmp/models/model';

export type InfoType = 'nvt' | 'cve' | 'cpe' | 'dfn_cert_adv' | 'cert_bund_adv';

class InfoEntityCommand<TModel extends Model> extends EntityCommand<TModel> {
  constructor(http: Http, infoType: InfoType, model: ModelClass<TModel>) {
    super(http, 'info', model);
    this.setDefaultParam('info_type', infoType);
    this.setDefaultParam('details', '1');
  }

  getElementFromRoot(root: XmlResponseData): XmlResponseData {
    /* return the first info element from the response
     * the second info element is for the counts */
    // @ts-expect-error
    return root.get_info.get_info_response.info[0];
  }
}

export default InfoEntityCommand;
