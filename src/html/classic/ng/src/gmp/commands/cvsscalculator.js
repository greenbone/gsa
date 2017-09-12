/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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
import {HttpCommand, register_command} from '../command.js';

 class CvssCalculator extends HttpCommand {
   constructor(http) {
     super(http, {cmd: 'cvss_calculator'});
   }

   get({
     cvss_vector,
     access_complexity,
     access_vector,
     authentication,
     availability_impact,
     confidentiality_impact,
     integrity_impact,
   }) {
     return this.httpGet({
       cvss_vector,
       cvss_av: access_vector,
       cvss_au: authentication,
       cvss_ac: access_complexity,
       cvss_c: confidentiality_impact,
       cvss_i: integrity_impact,
       cvss_a: availability_impact,
     }).then(
       response => {
         const envelope = response.data;
         return response.setData(envelope.cvss_calculator);
      }
    );
   }
 }

 register_command('cvsscalculator', CvssCalculator);
