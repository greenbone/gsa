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

  $.widget('greenbone.slider', $.ui.slider, {
    _create: function() {
      var self = this;

      this.root = this.element;

      this.element = $('<div class="gb-slider"></div>');
      this.spinner_element = $('<input type="text"/>');

      if (this.options.type !== undefined) {
        this.spinner_element.data('type', this.options.type);
      }

      this.spinner_element.attr('name', this.options.name);

      $.each(['min', 'max', 'step', 'value'], function(i, option) {
        var value = self.options[option];
        if (value !== undefined) {
          self.spinner_element.attr(option, value);
        }
      });

      this.root.addClass('gb-slider-container');
      this.root.append(this.spinner_element);
      this.root.append(this.element);

      this.spinner_element.spinner({
        change: this._onSpinChange(),
        spin: this._onSpin(),
      });
      this.spinner = this.spinner_element.spinner('instance');

      this._super();
    },
    _getCreateOptions: function() {
      var options = {};
      var element = this.element;
      var value;

      $.each(['min', 'max', 'step', 'value'], function(i, option) {
        value = element.attr(option);
        if (value !== undefined && value.length) {
          options[option] = +value;
        }
      });

      $.each(['type', 'name'], function(i, option) {
        value = element.attr(option);
        if (value !== undefined && value.length) {
          options[option] = value;
        }
      });

      return options;
    },

    _onSpinChange: function() {
      var self = this;
      return function() {
        var value = self.spinner.value();
        self._setValue(value);
      };
    },
    _onSpin: function() {
      var self = this;
      return function(event, ui) {
        var value = ui.value;
        self._setValue(value);
      };
    },
    _change: function() {
      this.spinner._value(this.value());
    },
    _setValue: function(value) {
      this.options.value = this._trimAlignValue(value);
      this._refreshValue();
    }
  });

  $.widget('greenbone.spinner', $.ui.spinner, {
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

      this._on({
        'focusout': this._checkValue,
      });

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
      if ((event.which <= 0 || (event.which > 57 && event.which < 96) ||
            event.which > 105 || this.disallowed.indexOf(event.which) > 0) &&
          this.allowed.indexOf(event.which) === -1 &&
          !event.ctrlKey) {
        // '9' == keycode 57 and 105 on numpad
        // '0' == keycode 48 and 96 on numpad
        // umlauts have keycode 0
        // only allow ints
        event.preventDefault();
        return true;
      }
      return this._super(event);
    },
    _checkValue: function(event) {

      var value = this.value();
      /* value is greater then max or value is smaller then min */
      if (value === null || value === undefined ||
          (this.options.max !== null && value > this.options.max) ||
          (this.options.min !== null && value < this.options.min)) {
        // call _value instead of value to avoid triggering change event again
        this._value(this.previous);
        return;
      }
    },
    _draw: function() {
      this._super();
      this.uiSpinner.addClass('gb-spinner');
    },
  });

})(window, window.$, window.console);
// vim: set ts=2 sw=2 tw=80:
