/*
 * Greenbone Security Assistant
 * $Id$
 * Description: A JQuery UI Slider for GSA.
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 Greenbone Networks GmbH
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

(function(global, $, console) {
  'use strict';

  $.widget('greenbonde.spinner', $.ui.spinner, {
    _create: function() {
      this.allowed = [
        109, // subtract
        173, // -
      ];

      this.disallowed = [
        $.ui.keyCode.SPACE,
      ];

      if (this.options.type === 'float') {
        this.allowed.push($.ui.keyCode.PERIOD); // .
      }

      this._super();
    },
    _getCreateOptions: function() {
      var options = this._super();

      var type = this.element.data('type');
      if (type !== undefined) {
        options.type = type;
      }

      if (options.step === undefined) {
        if (options.type === 'int') {
          options.step = 1;
        }
        else if (options.type === 'float') {
          options.step = 0.1;
        }
      }

      return options;
    },
    _keydown: function(event) {
      if ((event.which > 57 || event.shiftKey ||
            this.disallowed.indexOf(event.which) > 0) &&
          this.allowed.indexOf(event.which) === -1) {
        // don't allow keys > 57, combinations with shift and space
        // ('9' == keycode 57)
        event.preventDefault();
        return true;
      }
      return this._super(event);
    },
    _stop: function(event) {
      if (!this.spinning) {
        return;
      }

      var value = this.value();
      /* reset to previous value if value is null, value is greater then max or
       * value is smaller then min */
      if ((value === undefined || value === null) ||
          (this.options.max !== null && value > this.options.max) ||
          (this.options.min !== null && value < this.options.min)) {
        // call _value instead of value to avoid triggering change event again
        this._value(this.previous);
        return;
      }

      return this._super(event);
    },
  });

})(window, window.$, window.console);
// vim: set ts=2 sw=2 tw=80:
