/*
 * Greenbone Security Assistant
 * $Id$
 * Description: Base JavaScript for GSA.
 *
 * Authors:
 * Timo Pollmeier <timo.pollmeier@greenbone.net>
 * Benoît Allard <benoit.allard@greenbone.net>
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2015 - 2016 Greenbone Networks GmbH
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

(function(global, document, $, console, localStorage, location) {
  'use strict';

  // work-around select2 not working inside dialogs from here:
  // https://github.com/select2/select2/issues/1246#issuecomment-17428249
  global.jQuery.ui.dialog.prototype._allowInteraction = function(e) {
    return !!$(e.target).closest(
        '.ui-dialog, .ui-datepicker, .select2-dropdown').length;
  };

  /* A utility function that returns only the text in the current selection */
  global.jQuery.fn.justtext = function() {
    return $(this)
      .clone()
        .children()
          .remove()
        .end()
      .text();
  };

  /*
  * GSA base object
  */
  if (global.gsa === undefined) {
    global.gsa = {};
  }

  var gsa = global.gsa;

  gsa.has_value = has_value;
  gsa.is_date = is_date;
  gsa.is_object = is_object;
  gsa.is_string = is_string;
  gsa.is_defined = is_defined;
  gsa.is_function = is_function;
  gsa.is_array = Array.isArray;
  gsa.is_float = is_float;
  gsa.is_float_string = is_float_string;
  gsa.array_sum = array_sum;
  gsa.derive = derive;
  gsa.parse_int = parse_int;
  gsa.parse_float = parseFloat;
  gsa.shallow_copy = shallow_copy;
  gsa.extend = extend;
  gsa.log = {};
  gsa.for_each = for_each;
  gsa.upper_case_first = upper_case_first;
  gsa.start_auto_refresh = start_auto_refresh;
  gsa.stop_auto_refresh = stop_auto_refresh;
  gsa.set_token = set_token;

  gsa.OMPRequest = OMPRequest;

  gsa.log.error =  function() {
    console.error.apply(console, arguments);
  };

  gsa.log.warn = function() {
    console.warn.apply(console, arguments);
  };

  if (gsa.DEBUG) {
    gsa.log.debug = function() {
      console.log.apply(console, arguments);
    };
  }
  else {
    gsa.log.debug = function() {
    };
  }

  function set_token(token) {
    global.sessionStorage.token = token;
    gsa.token = token;
  }

  function is_date(value) {
    return is_object(value) && value instanceof Date;
  }

  function is_object(value) {
    return has_value(value) && typeof value === 'object';
  }

  function is_string(value) {
    return has_value(value) && typeof value === 'string';
  }

  function is_function(value) {
    return has_value(value) && typeof value === 'function';
  }

  function has_value(value) {
    return value !== null && is_defined(value);
  }

  function is_defined(value) {
    return value !== undefined;
  }

  function is_float(value) {
    return !isNaN(value) && isFinite(value); // !isNaN may be superfluous
  }

  function is_float_string(value, f_value) {
    if (!gsa.is_defined(f_value)) {
      f_value = gsa.parse_float(value);
    }
    return !isNaN(f_value) && isFinite(value);
  }

  function array_sum(array) {
    if (!gsa.is_array(array) || array.length === 0) {
      return 0;
    }

    var sum = 0;
    if (Array.prototype.reduce) {
      sum = array.reduce(function(a, b) {
        return a + b;
      });
    }
    else {
      for (var i in array) {
        sum += array[i];
      }
    }
    return sum;
  }

  function derive(child, base) {
    child.prototype = Object.create(base.prototype);
    child.prototype.constructor = child;
  }

  function parse_int(value) {
    var val = parseInt(value);
    if (isNaN(val)) {
      val = undefined;
    }
    return val;
  }

  function shallow_copy(object) {
    return $.extend({}, object);
  }

  function extend() { //  extend(target [, object1 ] [, objectN ])
    return $.extend.apply(null, arguments);
  }

  function for_each(array, func) {
    if (!gsa.has_value(array)) {
      return;
    }

    if (!gsa.is_array(array)) {
      array = [array];
    }
    array.forEach(func);
  }

  function upper_case_first(value) {
    if (gsa.is_string(value)) {
      return value.charAt(0).toUpperCase() + value.substr(1);
    }
    return value;
  }

  function encode_url_object(url) {
    // currently only local urls are supported
    return url.pathname + '?' + $.param(url.params);
  }
  function OMPRequest(options) {
    this.params = gsa.is_defined(options.params) ? options.params : {};
    this.method = gsa.is_string(options.method) ?
      options.method.toUpperCase() : 'POST';
    this.xml = gsa.is_defined(options.xml) ? options.xml : true;
    this.form = options.form;
    this.success_callback = options.success_callback;
    this.fail_callback = options.fail_callback;
  }

  OMPRequest.prototype.do = function(success_callback, fail_callback) {
    var self = this;

    if (success_callback) {
      this.success_callback = success_callback;
    }
    if (fail_callback) {
      this.fail_callback = fail_callback;
    }

    if (this.xml) {
      this.params.xml = 1;
    }

    if (this.method === 'GET') {
      self.request_data = {
        url: '/omp?' + $.param(this.params),
        cache: false,
        type: 'GET',
      };
    }
    else if (this.method === 'POST') {
      var data = new FormData(this.form);

      for (var param in this.params) {
        if (this.xml && param === 'no_redirect') {
          // skip values
          continue;
        }
        data.append(param, this.params[param]);
      }

      if (this.xml) {
        data.append('no_redirect', 1);
      }

      self.request_data = {
        url: '/omp',
        data: data,
        cache: false,
        processData: false,
        contentType: false,
        type: 'POST',
      };
    }
    else {
      throw new Error('Unknown method "' + this.method + '"');
    }

    function done_func(data, status, jqXHR) {
      self.success(data, status, jqXHR);
    }
    function fail_func(jqXHR) {
      self.fail(jqXHR);
    }

    self.ajax_request
      = $.ajax(self.request_data).done(done_func).fail(fail_func);
    return this;
  };

  OMPRequest.prototype.success = function(data, status, jqXHR) {
    if (this.success_callback) {
      this.success_callback(data, status, jqXHR);
    }
  };

  OMPRequest.prototype.fail = function(jqXHR) {
    if (this.fail_callback) {
      this.fail_callback(jqXHR);
    }
  };

  var timeout_id;
  var auto_refresh_stop_counter = 0;

  function start_auto_refresh() {
    if (auto_refresh_stop_counter > 0) {
      auto_refresh_stop_counter --;
    }

    if (auto_refresh_stop_counter >= 1) {
      // Still open dialogs, edit mode dashboards, etc.
      return;
    }

    if ($(document).find('.dashboard.edit').length > 0) {
      // Dashboard(s) in edit mode.
      return;
    }

    if (!timeout_id && +localStorage.getItem('autorefresh-interval') &&
        global.autorefresh_enabled) {
      timeout_id = global.setTimeout(function() {
        location.reload();
      }, localStorage.getItem('autorefresh-interval') * 1000);
    }
  }

  function stop_auto_refresh() {
    auto_refresh_stop_counter ++;

    if (timeout_id !== undefined) {
      clearTimeout(timeout_id);
      timeout_id = undefined;
    }
  }
})(window, window.document, window.$, window.console, window.localStorage,
  window.location);
// vim: set ts=2 sw=2 tw=80:
