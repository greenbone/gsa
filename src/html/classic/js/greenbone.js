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

  var DIALOGS = {};

  var DIALOG_DEFAULT_HEIGHT = 'auto';
  var DIALOG_DEFAULT_WIDTH = 800;

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

  function LanguageDetector() {
    global.i18nextBrowserLanguageDetector.call(this);
  }

  gsa.derive(LanguageDetector, global.i18nextBrowserLanguageDetector);

  LanguageDetector.prototype.detect = function() {
    var lang = $('html').attr('lang');

    if (lang) {
      return lang;
    }

    return global.i18nextBrowserLanguageDetector.prototype.detect.call(this);
  };

  LanguageDetector.type = 'languageDetector';

  global.i18next
    .use(global.i18nextXHRBackend) // use ajax backend
    .use(LanguageDetector) // use own detector for language detection
    .init({
      nsSeparator: false, // don't use a namespace seperator in keys
      keySeperator: false, // don't use a key spererator in keys
      fallbackLng: 'en',
      ns: ['gsad'], // use gsad as namespace
      defaultNS: 'gsad',
      fallbackNS: 'gsad',
      backend: {
        loadPath: '/js/locales/{{ns}}-{{lng}}.json', // e.g. /js/locales/gsad-en.json
      },
      detection: {
        /* only use url querystring and browser settings for language detection */
        order: ['querystring', 'navigator'],
        /* use url?lang=de as querystring */
        lookupQuerystring: 'lang',
      },
    }, function(err, t) {
      /* keep quiet if translations have not be found.
       * errors can be debugged here */
    });

  /* Use an own function for translations
   *
   * This may allow to switch the i18n backend easily without having to adjust
   * all function calls.
   * */
  gsa._ = function(key, options) {
    return global.i18next.t(key, options);
  };

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

  var RESPONSE_SELECTORS = {
    new_agent:           'create_agent_response',
    new_host:            'create_asset_response',
    new_alert:           'create_alert_response',
    new_config:          'create_config_response',
    new_credential:      'create_credential_response',
    new_filter:          'create_filter_response',
    new_group:           'create_group_response',
    new_note:            'create_note_response',
    new_override:        'create_override_response',
    new_permission:      'create_permission_response',
    new_port_list:       'create_port_list_response',
    new_report_format:   'create_report_format_response',
    new_role:            'create_role_response',
    new_scanner:         'create_scanner_response',
    new_schedule:        'create_schedule_response',
    new_slave:           'create_slave_response',
    new_tag:             'create_tag_response',
    new_target:          'create_target_response',
    new_task:            'create_task_response',
    new_container_task:  'create_task_response',
    new_user:            'create_user_response',
    // ------
    upload_config:       'create_config_response',
    upload_port_list:    'create_port_list_response',
    upload_report:       'create_report_response',
    // ------
    edit_agent:          'modify_agent_response',
    edit_alert:          'modify_alert_response',
    edit_asset:          'modify_asset_response',
    edit_credential:     'modify_credential_response',
    edit_filter:         'modify_filter_response',
    edit_group:          'modify_group_response',
    edit_my_settings:    'modify_setting_response',
    edit_note:           'modify_note_response',
    edit_override:       'modify_override_response',
    edit_permission:     'modify_permission_response',
    edit_port_list:      'modify_port_list_response',
    edit_report_format:  'modify_report_format_response',
    edit_role:           'modify_role_response',
    edit_slave:          'modify_slave_response',
    edit_tag:            'modify_tag_response',
    edit_target:         'modify_target_response',
    edit_task:           'modify_task_response',
    edit_user:           'modify_user_response',
    // ------
    delete_user:         'delete_user_response',
    // ------
    process_bulk:        'commands_response',
    // ------
    verify_scanner:      'verify_scanner_response',
    verify_agent:        'verify_agent_response',
    verify_report_format: 'verify_report_format_response',
  };

  var ENTITY_SELECTORS = {
    new_target: function(doc) {
      return get_entity_from_element(doc.find('get_targets_response > target'));
    },
    new_container_task: function(doc) {
      return get_entity_from_element(
          doc.find('get_tasks_response > task'));
    },
    new_credential: function(doc) {
      return get_entity_from_element(
          doc.find('get_credentials_response > credential'));
    },
    new_port_list: function(doc) {
      return get_entity_from_element(
          doc.find('get_port_lists_response > port_list'));
    },
    new_slave: function(doc) {
      return get_entity_from_element(
          doc.find('get_slaves_response > slave'));
    },
    new_schedule: function(doc) {
      return get_entity_from_element(
          doc.find('get_schedules_response > schedule'));
    },
    new_config: function(doc) {
      return get_entity_from_element(
          doc.find('get_configs_response > config'));
    },
    new_alert: function(doc) {
      return get_entity_from_element(
          doc.find('get_alerts_response > alert'));
    },
  };

  function get_entity_from_element(element) {
    if (!element) {
      return undefined;
    }

    return {
      name: element.children('name').text(),
      id: element.attr('id'),
    };
  }

  function get_entity(cmd, xml) {
    if (cmd in ENTITY_SELECTORS) {
      return ENTITY_SELECTORS[cmd](xml);
    }
    console.warn('No entity selector found for command ', cmd);
    return undefined;
  }

  function parse_size(value, full, def) {
    if (gsa.is_defined(value)) {
      if (gsa.is_string(value) && value.endsWith('%')) {
        return full * (gsa.parse_int(value.slice(0, -1)) / 100);
      }
      return value;
    }
    return def;
  }

  function Dialog(options) {
    this.command = options.cmd;
    this.dialog_id = options.dialog_id;
    this.title = options.title;
  }

  Dialog.prototype.error = function(message, title, status_code,
                                    status_details) {
    var displayed_title;
    if (!gsa.is_defined(title)) {
      displayed_title = this.title || 'Error:';
    }
    else {
      displayed_title = title;
    }

    if (gsa.is_defined(status_code) && status_code !== '') {
      displayed_title = '(Status code: ' + status_code + ') ' + displayed_title;
    }

    this.dialog.dialog('option', 'title', displayed_title);

    // Remove previous errors
    this.dialog.find('div.ui-state-error').remove();
    // Insert our error message
    this.dialog.prepend($('<div/>', {
      'class': 'ui-state-error ui-corner-all',
      html: $('<p>' + message + '</p>'),
    }));

    if (gsa.is_defined(status_details) && status_details !== '') {
      this.dialog.append($('<b>' + gsa._('Details') + ':</b>'));
      this.dialog.append($('<p class="footnote">' + status_details + '</p>'));
    }
  };

  Dialog.prototype.setErrorFromResponse = function(jqXHR) {
    var self = this;
    var xml = $(jqXHR.responseXML);
    var html = $(jqXHR.responseText);
    var response = xml.find(RESPONSE_SELECTORS[self.command] +
        '[status!="200"][status!="201"][status!="202"]');
    var gsad_msg = xml.find('gsad_msg');
    var gsad_response = xml.find('gsad_response');
    var action_result = xml.find('action_result');
    var generic_omp_response = xml.find('omp_response');
    var internal_error_html = html.find(
        '.gb_error_dialog .gb_window_part_content_error');
    var top_line_error_html = html.find(
        '.gb_window .gb_window_part_content_error');
    var login_form_html = html.find(
        '.gb_login_dialog .gb_window_part_content');
    var error_title = 'Error:';
    var error = 'Unknown error';
    var error_code = '';
    var error_details = undefined;

    if (gsad_msg.length) {
      error = gsad_msg.attr('status_text');
      if (is_string(gsad_msg.justtext()) && gsad_msg.justtext() !== '') {
        error = error + '<br/>' + gsad_msg.justtext();
      }
      error_code = gsad_msg.attr('status_code');
    }
    else if (gsad_response.length) {
      error = gsad_response.find('message').text();
      error_title = gsad_response.find('title').text();
      error_code = jqXHR.status;
    }
    else if (response.length) {
      var parent = response.parent();
      if (parent[0].nodeName === 'save_setting') {
        var id = parent.attr('id');
        var name = parent.attr('name');
        if (!gsa.is_defined(name)) {
          var name_elem = xml.find('setting[id="' + id + '"] name');
          if (gsa.is_defined(name_elem)) {
            name = name_elem.justtext();
          }
          else {
            name = id;
          }
        }
        error_title = 'Error modifying setting "' + name + '":';
      }
      else {
        error_title = undefined;
      }
      error = response.attr('status_text');
      error_code = response.attr('status');
    }
    else if (generic_omp_response.length) {
      error = generic_omp_response.attr('status_text');
      error_code = generic_omp_response.attr('status');
    }
    else if (action_result.length) {
      error_title = 'Operation \'' + action_result.find('action').text() +
        '\' failed';
      error = '<br/>' + action_result.find('message').text();
      error_code = action_result.find('status').text();
      error_details = action_result.find('details').text();
    }
    else if (internal_error_html.length) {
      error_title = internal_error_html.find('span div').text();
      if (!error_title) {
        error_title = 'Internal Error';
      }
      error = internal_error_html.find('span').text();
    }
    else if (top_line_error_html.length) {
      error_title = 'Operation \'' +
        top_line_error_html.find('#operation').text() + '\' failed';
      error = '<br/>' + top_line_error_html.find('#message').text();
    }
    else if (login_form_html.length) {
      error = login_form_html.find('.error_message').text();
    }

    self.error(error, error_title, error_code, error_details);
    return self;
  };

  Dialog.prototype.waiting = function() {
    var buttons = this.dialog.closest('.ui-dialog').find('button.ui-button');
    buttons.each(function() {
      // disable ALL ui dialog buttons in title and footer
      var button = $(this);
      button.button('disable');
    });

    buttons = this.dialog.closest('.ui-dialog')
      .find('.ui-dialog-buttonset button.ui-button');

    buttons.each(function() {
      var button = $(this);
      if (button.button('option', 'label') !== 'Close') {
        this.label = button.button('option', 'label');
        if (this.label === 'Create' || this.label === 'Save') {
          button.button('option', 'label', this.label.substring(
                0, this.label.length - 1) + 'ing ...');
        }
        button.button('option', 'icon', 'ui-icon-waiting');
      }
    });
    return this;
  };

  /**
   * command is the name of the gsa command that has to be send initialy
   * done is the select that will get the value of the newly created resource or true if a global reload is to be triggered.
   * params are extra parameters to send to the initial GET request.
   * show_method specifies the method to send the initial request instead of GET.
  **/
  function OMPDialog(options) {
    Dialog.call(this, options); // call super
    this.success_reload = options.success_reload || {};
    this.close_reload = options.close_reload || {};

    this.height = parse_size(options.height, $(window).height(),
      DIALOG_DEFAULT_HEIGHT);
    this.width = parse_size(options.width, $(window).width(),
      DIALOG_DEFAULT_WIDTH);

    if (options.params === undefined) {
      this.params = {};
    } else {
      this.params = options.params;
    }
    if (options.show_method === undefined) {
      this.show_method = 'GET';
    } else {
      this.show_method = options.show_method;
    }
    if (options.parent_dialog) {
      this.parent_dialog = options.parent_dialog.$omp;
    }
  }

  gsa.derive(OMPDialog, Dialog);

  OMPDialog.prototype.finished = function() {
    var buttons = this.dialog.closest('.ui-dialog').find('button.ui-button');

    buttons.each(function() {
      // reenable all dialog buttons
      var button = $(this);
      button.button('enable');
    });

    buttons = this.dialog.closest('.ui-dialog')
      .find('.ui-dialog-buttonset button.ui-button');

    buttons.each(function() {
      var button = $(this);

      if (button.button('option', 'label') !== 'Close') {
        button.button('option', 'label', this.label);
        button.button('option', 'icon', null);
      }
    });
  };

  OMPDialog.prototype.close = function() {
    if (this.dialog.$omp) {
      // dereference self to avoid memory leak
      this.dialog.$omp = undefined;
    }
    if (gsa.is_defined(this.dialog_id)) {
      // remove dialog from global dialogs
      delete DIALOGS[this.dialog_id];
    }

    this.dialog.remove();
    this.dialog = undefined;
    this.parent_dialog = undefined;
    start_auto_refresh();

    if (this.close_reload.type === 'window') {
      location.reload();
    }

    return this;
  };

  OMPDialog.prototype.postForm = function() {
    var self = this;

    var request = new OMPRequest({
      form: this.dialog.find('form')[0],
      xml: true,
    });

    request.do(function(xml) {
      var entity;

      xml = $(xml);
      if (self.success_reload.type === 'window') {
        location.reload();
        // a bit overkill, but better-safe-than-sorry.
        return;
      }
      else if (self.success_reload.type === 'parent' && self.parent_dialog) {
        self.parent_dialog.reload();
      }
      else if (self.success_reload.type === 'next' &&
          xml.find('action_result next')) {
        var url = parse_url(xml.find('action_result next').text());
        // we need the html page
        url.params.xml = 0;
        location.href = encode_url_object(url);
      }
      else if (self.success_reload.type === 'dialog') {
        var elem = $(self.success_reload.data);

        entity = self.getActionResultEntity(xml);

        if (!gsa.has_value(entity)) {
          // element not found. raise warning
          console.warn('Entity element not found!');
          self.close();
          return;
        }

        elem.data('id', entity.id);

        var show_dialog = init_omp_dialog({
          element: elem,
          button: gsa._('Save'),
          listeners: false,
        });

        var overlay = $('<div>')
          .addClass('ui-widget-overlay ui-front')
          .appendTo($('body'));

        show_dialog(function() {
          overlay.remove();
        });
      }
      else if (self.success_reload.type === 'done') {
        var done = $(self.success_reload.data);

        if (!gsa.has_value(done)) {
          // No element to update, exit early.
          self.close();
          return;
        }

        if (!done.length) {
          // element not found. raise warning
          console.warn('Done element not found!');
          self.close();
          return;
        }

        entity = self.getActionResultEntity(xml);
        if (gsa.has_value(entity)) {
          // fill in the new information in the $done element and make it selected
          done.append($('<option/>', {
            value: entity.id,
            html: entity.name,
            selected: true,
          }));

          // refresh the select widget.
          done.trigger('change');
        }
      }

      // And finally, close our dialog.
      self.close();
    }, function(response) {
      if (response.status === 401) {
        // not authorized (anymore)
        // reload page to show login dialog
        location.reload();
        return;
      }

      self.setErrorFromResponse(response);

      // restore the original button.
      self.finished();
    });
  };

  OMPDialog.prototype.setContent = function(html) {
    var self = this;
    var dialog_title, dialog_html;
    var response = $('<div/>', {html: html});

    // get the content of the (first) window
    // needs to wrap it in a div to be able to select the top-level elements.
    var gb_windows = response.find('.gb_window');
    var edit_dialog = response.find('.edit-dialog');

    if (gb_windows.length) {
      if (gb_windows.length > 1) {
        gsa.log.error('The html response contains several dialog forms. ' +
          'Only the first form is displayed. ' + (gb_windows.length - 1) +
          ' forms are not displayed!');
      }

      var gb_window = gb_windows.first();
      var content = gb_window.find('div:nth-child(4)');

      // remove all 'submit' buttons
      content.find('input[type=submit]').remove();

      dialog_title = gb_window.find('.gb_window_part_center').justtext();
      dialog_html = content.html();
    }
    else if (edit_dialog.length) {
      dialog_title = edit_dialog.find('.title').justtext();
      dialog_html = edit_dialog.find('.content').html();
    }

    self.dialog.attr('title', dialog_title);
    self.dialog.html(dialog_html);

    self.dialog.find('form').on('submit', function(event) {
      // prevent default form submission. we need to use our function
      self.submit();
      event.preventDefault();
    });

    self.dialog.on('keydown', function(event) {
      if (event.which === $.ui.keyCode.ENTER) {
        var focused = $(':focus');
        var tag = focused[0].tagName;
        // submit form on enter, unless focus is on a multi-line text area.
        if (tag !== 'TEXTAREA') {
          self.submit();
          event.preventDefault();
        }
      }
    });

    // enable buttons, set up selects, ...
    on_ready(self.dialog);
  };

  OMPDialog.prototype.show = function(button, callback) {
    var self = this;
    var done_func, fail_func;

    if (gsa.is_defined(this.dialog_id)) {
      // check if the dialog is already shown
      if (gsa.is_defined(DIALOGS[this.dialog_id])) {
        return;
      }
      DIALOGS[this.dialog_id] = this;
    }

    if (button === undefined) { button = 'Create';}
    this.params.cmd = this.command;
    this.params.token = $('#gsa-token').text();
    $('html').css('cursor', 'wait');
    stop_auto_refresh();

    self.dialog = $('<div/>', {
      'class': 'dialog-form',
    });

    // connect this OMPDialog with the DOM
    self.dialog[0].$omp = self;

    done_func = function(html) {
      self.setContent(html);

      // show the dialog !
      self.dialog.dialog({
        modal: true,
        width: self.width,
        height: self.height,
        buttons: [
          {
            text: button,
            click: function() {
              self.submit();
            },
          }
        ],
        open: function() {
          if (gsa.is_function(callback)) {
            callback();
          }
        },
        close: function() {
          self.close();
        },
      });

      $('html').css('cursor', '');
    };

    fail_func = function(response) {
      if (response.status === 401) {
        // not authorized (anymore)
        // reload page to show login dialog
        location.reload();
        return;
      }

      self.dialog.dialog({
        modal: true,
        width: 800,
        maxHeight: self.height
      });

      self.setErrorFromResponse(response);

      // restore the original button.
      self.finished();

      $('html').css('cursor', '');
    };

    self.request = new OMPRequest({
      params: self.params,
      method: self.show_method,
      xml: false,
    });

    self.request.do(done_func, fail_func);

    return this;
  };

  OMPDialog.prototype.reload = function() {
    var self = this;
    self.waiting();
    self.request.do(function(data) {
        self.setContent(data);
        self.finished();
      }, function() {
      }
    );
  };

  OMPDialog.prototype.getActionResultEntity = function(xml) {
    var entity;
    var self = this;
    var action_result_next = xml.find('action_result > next');

    if (action_result_next.length > 0) {
      // got an "action_result" with "next" element,
      //  so get "next" url and extract entity from response.
      var next_url = action_result_next.text();
      $.ajax({
        url: next_url,
        async: false,
        success: function(doc) {
          entity = get_entity(self.command, $(doc));
        },
        error: function(doc) {
          self.setErrorFromResponse($(doc));
        },
      });
    } else {
      // got a response directly, extract entity directly.
      entity = get_entity(self.command, xml);
    }
    return entity;
  };

  OMPDialog.prototype.submit = function() {
    this.waiting();
    this.postForm();
  };

  global.OMPDialog = OMPDialog;

  function FilterDialog(id, title) {
    this.id = id;
    this.title = title;
  }

  gsa.derive(FilterDialog, Dialog);

  FilterDialog.prototype.show = function() {
    var self = this;
    var content = $('#' + this.id);
    var parent = content.parent();

    content.show();

    // Update the form parameter
    var input = content.find('input[name=build_filter]');
    if (input.length) {
      input.val(input.val() ^ 1);
    }

    this.dialog = $('<div/>', {
      'class': 'dialog-form',
      title:  this.title,
      html: content,
    });

    stop_auto_refresh();

    // show the dialog !
    this.dialog.dialog({
      modal: true,
      width: 800,
      buttons: [
        {
          text: 'Update',
          click: function() {
            self.waiting();
            self.dialog.find('form').submit();
          },
        }
      ],
      close: function() {
        content.hide();
        parent.append(content);
        self.dialog.remove();
        self.dialog = undefined;
        start_auto_refresh();
      },
    });

    // Rebuild select2 dropdown lists as the original copies do not work.
    content.find('span.select2').remove();
    content.find('select').removeClass('select2-hidden-accessible');
    content.find('select').removeAttr('aria-hidden');
    content.find('select').select2();
  };

  global.FilterDialog = FilterDialog;

  function InfoDialog(options) {
    Dialog.call(this, options); // call super
    this.timeout = gsa.is_defined(options.timeout) ? options.timeout : 5000;
    this.width = gsa.is_defined(options.width) ? options.width : 600;
    this.transfer_to = options.transfer_to ? $(options.transfer_to) : undefined;
    this.interval_time = 1000; // 1 sec
    this.progress_value = this.timeout;
    this.modal = gsa.is_defined(options.modal) ? options.modal : true;
    this.fade_in_duration = gsa.is_defined(options.fade_in_duration) ?
      options.fade_in_duration : 1000;

    this.dialog = $('<div/>', {
      'class': 'dialog-form',
    });

    this.dialog_css = options.dialog_css;

    if (options.element && options.element.length) {
      this.dialog.append(options.element.children());
    }
  }

  gsa.derive(InfoDialog, Dialog);

  InfoDialog.prototype.close = function() {
    if (this.transfer_to !== undefined) {
      this.dialog.parent('.ui-dialog').effect('transfer', {
        to: this.transfer_to,
      }, 1000);
    }

    this.stopProgress();

    this.progress = undefined;
    this.progress_value = this.timeout;

    this.dialog.remove();
    this.dialog = undefined;
  };

  InfoDialog.prototype.stopProgress = function() {
    if (this.progress_timer !== undefined) {
      global.clearInterval(this.progress_timer);
      this.progress_timer = undefined;
    }
  };

  InfoDialog.prototype.startProgress = function() {
    var self = this;

    var element = $('<div class="progress"/>');

    this.progress = $('<span />');
    this.progress.text(this.progress_value / 1000);

    this.progress_button = $('<img/>', {
      src: '/img/pause.svg',
      alt: 'Pause/Resume',
      class: 'icon icon-sm',
    });
    this.progress_button.on('click', function() {
      if (self.progress_timer === undefined) {
        self.resumeProgress();
      }
      else {
        self.pauseProgress();
      }
    });

    element.append(this.progress);
    element.append(this.progress_button);

    this.dialog.after(element);

    this.resumeProgress();
  };

  InfoDialog.prototype.pauseProgress = function() {
    if (this.progress_timer !== undefined) {
      global.clearInterval(this.progress_timer);
      this.progress_timer = undefined;
    }
    this.progress_button.attr('src', '/img/resume.svg');
  };

  InfoDialog.prototype.resumeProgress = function() {
    var self = this;

    self.progress_button.attr('src', '/img/pause.svg');

    self.progress_timer = global.setInterval(function() {
      self.progress_value -= self.interval_time;

      if (self.progress_value < 0) {
        self.stopProgress();
        self.close();
        return;
      }

      self.progress.text(self.progress_value / 1000);
    }, self.interval_time);
  };

  InfoDialog.prototype.show = function() {
    var self = this;

    self.dialog.css('cursor', 'progress');

    self.dialog.dialog({
      dialogClass: self.dialog_css,
      modal: self.modal,
      width: self.width,
      minHeight: 0,
      title: self.title,
      show: {effect: 'fade', duration: self.fade_in_duration},
      beforeClose: function() {
        self.close();
      },
    });

    if (self.timeout) {
      self.startProgress();
    }

    return this;
  };

  global.InfoDialog = InfoDialog;

  function parse_params(data) {
    var params = {};

    if (data) {
      $.each(data.split('&'), function(i, v) {
        var pair = v.split('=');
        return (params[pair[0]] = pair[1]);
      });
    }
    return params;
  }

  function parse_url(value) {
    var parser = document.createElement('a');
    parser.href = value;

    return {
      protocol: parser.protocol,
      hostname: parser.hostname,
      port: parser.port,
      host: parser.host,
      pathname: parser.pathname,
      hash: parser.hash,
      params: parse_params(parser.search.substr(1)),
    };
  }

  function encode_url_object(url) {
    // currently only local urls are supported
    return url.pathname + '?' + $.param(url.params);
  }

  function init_omp_dialog(options) {
    var params;
    var reload_data;

    var cmd = options.element.data('cmd');
    var type_id = options.element.data('id');
    var type_name = options.element.data('type');
    var extra = options.element.data('extra');
    var done = options.element.data('done');
    var task_id = options.element.data('task_id');
    var parent_dialog = options.element.parents('.dialog-form')[0];
    var reload_type = options.element.data('reload');
    var height = options.element.data('height');
    var width = options.element.data('width');
    var close_reload_type = options.element.data('close-reload');
    var dialog_id = options.element.data('dialog-id');

    if (!is_defined(reload_type)) {
      reload_type = options.default_reload;
    }

    if (reload_type === 'dialog') {
      reload_data = options.element.find('.success-dialog');
    }

    if (done) {
      // done is used to add newly created elements to the dialog
      // therefore we must not reload anything
      reload_type = 'done';
      reload_data = done;
    }

    if (!is_defined(cmd)) {
      cmd = options.type + '_' + type_name;

      if (options.postfix !== undefined) {
        cmd = cmd + '_' + options.postfix;
      }
    }

    params = parse_params(extra);

    if (is_defined(type_id)) {
      params[type_name + '_id'] = type_id;
    }

    if (is_defined(task_id)) {
      params.task_id = task_id;
    }

    function show_dialog(callback) {
      new OMPDialog({
        cmd: cmd,
        done: done,
        params: params,
        success_reload: {type: reload_type, data: reload_data},
        close_reload: {type: close_reload_type},
        parent_dialog: parent_dialog,
        height: height,
        width: width,
        dialog_id: dialog_id,
      }).show(options.button, callback);
    }

    if (options.listeners !== true) {
      options.element.on('click', function(event) {
        event.preventDefault();
        show_dialog();
      });

      options.element.on('keydown', function(event) {
        console.log('keydown');
        if (event.which === $.ui.keyCode.ENTER) {
          event.stopPropagation();
          show_dialog();
        }
      });
    }

    return show_dialog;
  }

  function ToggleIcon(options) {
    this.name = options.name;
    this.target = options.target;
    this.icon = options.icon;
    this.variable = options.variable;
    this.collapsed = options.collapsed !== undefined ?
      !!options.collapsed : false;
    this.storage = localStorage;
  }

  ToggleIcon.prototype.init = function() {
    if (this.variable) {
      if (this.storage.getItem(this.variable) === 'true' ||
          (this.storage.getItem(this.variable) === null && this.collapsed)) {
        this.target.hide();
        this.toggleIcon();
      }
    }
  };

  ToggleIcon.prototype.toggleIcon = function() {
    // manage the button itself
    this.icon.toggleClass('expand');
    if (this.icon.hasClass('expand')) {
      this.icon.attr({
        src:   '/img/unfold.svg',
        title: gsa._('Unfold {{name}}', {name: this.name}),
        alt:   gsa._('Unfold {{name}}', {name: this.name}),
      });
    } else {
      this.icon.attr({
        src:   '/img/fold.svg',
        title: gsa._('Fold {{name}}', {name: this.name}),
        alt:   gsa._('Fold {{name}}', {name: this.name}),
      });
    }
  };

  ToggleIcon.prototype.toggle = function() {
    // Update the localStorage
    if (this.variable) {
      if (this.storage.getItem(this.variable) === 'true') {
        // visible
        this.storage.setItem(this.variable, 'false');
      }
      else {
        // hidden
        this.storage.setItem(this.variable, 'true');
      }
    }
    this.target.slideToggle();
    this.toggleIcon();
  };

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
      var data = new FormData();

      var elem_i;
      if (gsa.is_defined(this.form)) {
        for (elem_i = 0; elem_i < this.form.length; elem_i++) {
          var elem = this.form[elem_i];

          if (!elem.matches('div[style*="display: none"] *')) {
            if (elem.matches('select')) {
              var val_i;
              for (val_i = 0; val_i < elem.length; val_i++) {
                if (elem[val_i].selected) {
                  data.append(elem.name, elem[val_i].value);
                }
              }
            }
            else if (elem.matches('input') || elem.matches('textarea')) {
              if (elem.type === 'file' && gsa.is_defined (elem.files[0])) {
                data.append(elem.name, elem.files[0]);
              }
              else if ((elem.type !== 'checkbox' && elem.type !== 'radio') ||
                  elem.checked === true) {
                data.append(elem.name, elem.value);
              }
            }
          }
        }
      }

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

  function set_datepicker_date(elem, date, old_date) {
    var elem_year = elem.find('.datepicker-year');
    var elem_month = elem.find('.datepicker-month');
    var elem_day = elem.find('.datepicker-day');

    // only update form if date has changed
    if (old_date && date.getDate() === old_date.getDate() &&
      date.getMonth() === old_date.getMonth() &&
      date.getFullYear() === old_date.getFullYear()) {
      return;
    }

    elem_day.val(date.getDate());
    elem_month.val(date.getMonth() + 1);
    elem_year.val(date.getFullYear());

    // trigger change events
    elem_day.trigger('change');
    elem_month.trigger('change');
    elem_year.trigger('change');
  }

  function moment_to_timezone_date(moment_date) {
    // returns a date with CET === moment_date.tz
    return new Date(moment_date.year(), moment_date.month(), moment_date.date(),
      moment_date.hours(), moment_date.minutes(), moment_date.seconds(),
      moment_date.milliseconds());
  }

  function on_ready(doc) {
    doc = $(doc);

    doc.find('.edit-action-icon').each(function() {
      init_omp_dialog({
        type: 'edit',
        element: $(this),
        default_reload: 'window',
        button: gsa._('Save')
      });
    });

    doc.find('.new-action-icon').each(function() {
      init_omp_dialog({
        type: 'new',
        element: $(this),
        default_reload: 'next',
        button: gsa._('Create'),
      });
    });

    doc.find('.upload-action-icon').each(function() {
      init_omp_dialog({
        type: 'upload',
        element: $(this),
        button: gsa._('Create'),
      });
    });

    doc.find('.delete-action-icon').each(function() {
      init_omp_dialog({
        type: 'delete',
        element: $(this),
        button: gsa._('Delete'),
        default_reload: 'window',
        postfix: 'confirm',
      });
    });

    doc.find('.dialog-action').each(function() {
      var elem = $(this);
      elem.on('click', function(event) {
        event.preventDefault();
        var dialog = elem.parents('.dialog-form')[0].$omp;
        new OMPRequest({
          params: parse_params(elem.data('extra')),
          form: elem.parents('form')[0],
        }).do(function() {
          dialog.reload();
        }, function(jqXHR) {
          dialog.setErrorFromResponse(jqXHR);
        });
      });
    });

    doc.find('.bulk-dialog-icon').each(function() {
      var elem = $(this);
      var type_name = elem.data('type');
      var done = elem.data('done');

      var reload;
      var params = {
        resource_type: type_name,
      };
      params [this.name + '.x'] = '0';

      elem.on('click', function(event) {
        event.preventDefault();
        var form = elem.closest('form');
        form.find(':input').each(function() {
          if (this.getAttribute('type') !== 'image' &&
                  (this.getAttribute('type') !== 'checkbox' || this.checked)) {
            params[this.name] = this.value;
          }
        });
        if (done === undefined) {
          reload = 'window';
        }
        new OMPDialog({
          cmd: 'process_bulk',
          done: done,
          params: params,
          show_method: 'POST',
          success_reload: {type: reload},
          height: elem.data('height'),
        }).show('OK', 'confirmation');
      });
    });

    doc.find('.wizard-action-icon').each(function() {
      var elem = $(this);
      var name = elem.data('name');
      var params = {name: name};
      var dialog_id = elem.data('dialog-id');

      var dialog = new OMPDialog({
        cmd: 'wizard',
        success_reload: {type: 'window'},
        params: params,
        height: elem.data('height'),
        dialog_id: dialog_id,
      });

      if (name === 'quick_first_scan') {
        dialog.old_postForm = dialog.postForm;
        dialog.postForm = function() {
          this.old_postForm();
          // set 30 sec.
          localStorage.setItem('autorefresh-interval', 30);
        };
      }

      elem.on('click', function(event) {
        event.preventDefault();
        dialog.show(elem.data('button'));
      });
    });

    // Replace icon forms
    doc.find('.ajax-post').each(function() {
      var elem = $(this);
      var busy_text = elem.data('busy-text');

      if (!busy_text) {
        busy_text = gsa._('Please wait...');
      }

      function reload_next(response) {
        var action_result = $(response).find('action_result');

        var next_url = action_result.children('next').text();
        if (gsa.is_defined(next_url) && next_url !== '') {
          window.location = next_url;
        }
      }

      var reload = elem.data('reload');
      var modal = elem.data('modal') && true;

      var selector = 'form';
      if (elem.data('form')) {
        selector = elem.data('form');
      }

      var form = elem.find(selector);
      if (!form.length) {
        throw new Error('Form for ajax request not found');
      }

      var button = elem;
      if (elem.data('button')) {
        button = elem.find(elem.data('button'));
      }

      var error = elem.find('.error-dialog');
      var success = elem.find('.success-dialog');

      button.on('click', function(event) {
        event.preventDefault();

        var request = new OMPRequest({
          form: form[0],
          params: {next_xml: 0},
        });

        var busy_dialog = show_busy_dialog(busy_text, request);

        request.do(function(response) {
          if (busy_dialog) {
            busy_dialog.dialog('close');
          }
          if (success.length) {
            if (success.data('reload')) {
              reload = success.data('reload');
            }

            var dialog = new InfoDialog({
              element: success.clone(),
              timeout: 5000,
              modal: modal,
              title: success.data('title'),
              width: success.data('width') || 300,
              fade_in_duration: 0,
            });
            dialog.show();
          }

          if (reload === 'next') {
            reload_next(response);
          }
        },
        function(jqXHR) {
          if (jqXHR.status == 0 && jqXHR.readyState == 0) {
            // Request was aborted. Do not show error dialog.
            return;
          }

          if (busy_dialog) {
            busy_dialog.dialog('close');
          }

          var dialog = new InfoDialog({
            element: error.clone(),
            timeout: 10000,
            modal: modal,
            title: error.data('title'),
            dialog_css: 'ui-dialog-error',
            width: error.data('width') || 300,
            cmd: elem.find('input[name=cmd]').val(),
          });
          dialog.show().setErrorFromResponse(jqXHR);
        });
      });
    });

    doc.find('.edit-filter-action-icon').each(function() {
      var elem = $(this);
      var id = elem.data('id');
      elem.on('click', function(event) {
        event.preventDefault();
        new FilterDialog(id, gsa._('Update Filter')).show();
      });
    });

    doc.find('.info-dialog').each(function() {
      var elem = $(this);
      new InfoDialog({
        element: elem,
        timeout: elem.data('timeout'),
        width: elem.data('width'),
        transfer_to: elem.data('transfer-to'),
      }).show();
    });

    doc.find('.datepicker').each(function() {
      var elem = $(this);
      var button = elem.find('.datepicker-button').first();
      var tooltip = gsa._('Select date') + '';
      var elem_year = elem.find('.datepicker-year');
      var elem_month = elem.find('.datepicker-month');
      var elem_day = elem.find('.datepicker-day');
      var cur_date = new Date();
      var limit_type = elem.data('limit-type');
      var min_date;
      var max_date;

      if (limit_type === 'none') {
        min_date = undefined;
        max_date = undefined;
      }
      else if (limit_type === 'backward') {
        min_date = '-3Y'
        max_date = cur_date;
      }
      else {
        min_date = cur_date;
        max_date = '+3Y'
      }

      if (elem_year.length && is_defined(elem_year.val())) {
        var year = parseInt(elem_year.val(), 10);
        cur_date.setFullYear(year);
      }
      if (elem_month.length && is_defined(elem_month.val())) {
        var month = parseInt(elem_month.val(), 10);
        if (month > 0) {
          cur_date.setMonth(month - 1); // js Date uses 0-11 for month value
        }
      }
      if (elem_day.length && is_defined(elem_day.val())) {
        var day = parseInt(elem_day.val(), 10);
        if (day > 0) {
          cur_date.setDate(day);
        }
      }

      button.datepicker({
        showOn: 'button',
        buttonImage: 'img/calendar.svg',
        buttonImageOnly: true,
        buttonText: tooltip,
        dateFormat: 'DD, d MM, yy',
        minDate: min_date,
        maxDate: max_date,
        onClose: function() {
          var date = button.datepicker('getDate');
          if (has_value(date)) {
            set_datepicker_date(elem, date, cur_date);
          }
        },
      });
      button.datepicker('setDate', cur_date);

      /* don't allow to change value_field by user */
      button.prop('readonly', true);
      button.attr('title', tooltip);

      button.on('click', function() {
        /* show datepicker when clicking on deactivated button */
        button.datepicker('show');
      });

      button.on('keydown', function(event) {
        if (event.which === $.ui.keyCode.ENTER) {
          /* show datepicker on enter */
          event.stopPropagation();
          button.datepicker('show');
        }
      });
    });

    doc.find('.system-report').each(function() {
      var elem = $(this);
      var range_type = elem.find('input[name="range_type"]');

      function change_range_type() {
        range_type.val('from_start');
      }

      elem.find('.performance-spinner').spinner({
        spin: change_range_type,
        change: change_range_type,
      });

      elem.find('.datepicker-day').on('change', change_range_type);
    });

    doc.find('.setting-control').each(function() {
      var elem = $(this);
      var form = elem.parents('form');
      var setting = elem.data('setting');
      var input_name = 'settings_changed:' + setting;
      var changed_input = form.children('input[name="' + input_name + '"]');
      var event;

      switch (elem.attr('type')) {
        case 'text':
        case 'password':
          event = 'keyup';
          break;
        case 'radio':
          event = 'click';
          break;
        default:
          event = 'change';
      }

      if (changed_input.length === 0) {
        changed_input = $('<input/>',
          {
            name: input_name,
            type: 'hidden',
            value: 0,
          }).appendTo(form);
      }
      // Add input elements to indicate that a setting was changed
      elem.on(event, function() {
          changed_input.attr('value', 1);
        });
    });

    var autorefresh = doc.find('#autorefresh');
    if (autorefresh.length) {
      if (localStorage.getItem('autorefresh-interval')) {
        autorefresh.val(localStorage.getItem('autorefresh-interval'));
      }
      autorefresh.change(function() {
        stop_auto_refresh();
        localStorage.setItem('autorefresh-interval', $(this).val());
        start_auto_refresh();
      });
      if (!global.autorefresh_enabled) {
        autorefresh.remove();
      }
    }

    doc.find('.toggle-action-icon').each(function() {
      var elem = $(this);
      var ticon = new ToggleIcon({
        target: doc.find(elem.data('target')),
        icon: elem.find('img'),
        name: elem.data('name'),
        collapsed: elem.data('collapsed'),
        variable: elem.data('variable'),
      });

      ticon.init();

      elem.on('click', function() {
        ticon.toggle();
      });
    });

    /**
     * Initializes input fields only if its not a radio and not a checkbox
     * element or if radio/checkbox is selected or it is the only element with
     * the name attribute.
     *
     * This avoids calling the func several times with invalid value for
     * checkboxes and radios.
     */
    function init_input(elem, func) {
      var form = elem.parents('form');
      var name = elem.attr('name');
      var group = form.find('[name=' + name + ']');

      if ((elem.attr('type') !== 'radio' && elem.attr('type') !== 'checkbox') ||
          elem.prop('checked') || group.length === 1) {
        func();
      }
    }

    function get_option(elem) {
      if (elem.attr('type') === 'radio' || elem.attr('type') === 'checkbox') {
        return elem;
      }
      return elem.find(':selected');
    }

    function get_value(elem) {
      var value;
      var option = get_option(elem);

      if (is_defined(option)) {
        value = option.data('select');
      }

      if (!is_defined(value)) {
        /* fallback to elem.val() if data-select is not set or option not
          * found */
        return elem.val();
      }

      return value;
    }

    doc.find('input.spinner').spinner();

    doc.find('.slider').slider();

    doc.find('select:not(.no-select2)').select2();

    doc.find('.form-selection-control').each(function() {
      var elem = $(this);
      var form = elem.parents('form');
      var name = elem.attr('id');

      function on_change() {
        var value = get_value(elem);

        /* hide all elements of the selection */
        form.find('.form-selection-input-' + name).prop('disabled', true);
        form.find('.form-selection-item-' + name).hide();

        if (is_defined(value)) {
          /* show elements wich have the selected value css class set */

          form.find('.form-selection-input-' + name + '--' + value).prop(
              'disabled', false);
          form.find('.form-selection-item-' + name + '--' + value).show();
        }
      }

      elem.on('change', on_change);

      init_input(elem, on_change);
    });

    doc.find('.form-enable-control').each(function() {
      var elem = $(this);
      var form = elem.parents('form');
      var name = elem.attr('id');
      var disable = is_defined(elem.attr('disable-on')) ?
        elem.attr('disable-on') : '1';
      var use_checked = false;

      if (disable === ':checked') {
        disable = true;
        use_checked = true;
      }
      else if (disable === 'not(:checked)') {
        disable = false;
        use_checked = true;
      }

      function on_change() {
        var value = elem.val();

        if (use_checked && elem.attr('type') === 'checkbox') {
          value = elem.prop('checked');
        }

        form.find('.form-enable-item--' + name).each(function() {
          var cur = $(this);

          cur.removeClass('disabled');
          if (value === disable) {
            cur.addClass('disabled');
          }
          if (cur.hasClass('spinner')) {
            cur.spinner('option', 'disabled', value === disable);
          }
          else {
            cur.prop('disabled', value === disable);
          }
        });
      }

      elem.on('change', on_change);

      init_input(elem, on_change);
    });

    doc.find('.form-label-control').each(function() {
      var elem = $(this);
      var form = elem.parents('form');
      var name = elem.attr('id');

      function on_change() {
        if (elem.prop('disabled')) {
          return;
        }

        var option = get_option(elem);
        var value = option.data('label-name');
        var field = option.data('label-field');

        if (!gsa.is_defined(value) && gsa.is_defined(field)) {
          option = get_option($(field));
          value = option.data('label-name');
        }

        if (gsa.is_defined(value)) {
          form.find('.form-label-item-' + name).text(value);
        }
      }

      elem.on('change', on_change);

      init_input(elem, on_change);
    });

    doc.find('a.external').on('click', function(event) {
      event.preventDefault(); // prevent opening url

      var url = $(this).attr('href');

      var p = $('<p/>').append($('<span/>', {
        'class': 'ui-icon ui-icon-alert',
        style: 'float: left; margin: 0 15px 15px 0;',
      }));
      var dialog = $('<div/>', {
        'class': 'dialog-form',
        title: gsa._('Follow link?'),
      }).append(p);

      p.append(gsa._('This dialog will open a new window for <a>{{url}}</a> ' +
            'if you click on follow link. Following this link is on your own ' +
            'responsibility. Greenbone doesn\'t endorse the content you will ' +
            'see there.', {url: url}));

      var close = '' + gsa._('Abort');
      var follow = '' + gsa._('Follow link');
      var buttons = {};

      buttons[close] = function() {
        $(this).dialog('close');
      };
      buttons[follow] = function() {
        window.open(url);
        $(this).dialog('close');
      };

      dialog.dialog({
        modal: true,
        width: 600,
        maxHeight: 400,
        buttons: buttons,
      });
    });

    doc.find('.credential-type-sort').each(function() {
      var elem = $(this);
      var select = elem.find('select');
      var token = elem.data('token');
      var filter = elem.data('filter');
      var sort_colum = elem.data('sort-colum');
      var sort_value = elem.data('sort-value');

      function filter_url(column, value) {
        return '/omp?cmd=get_targets&token=' + token + '&filter=' +
          column + '=' + value + ' ' + filter;
      }

      elem.find('.credential-type-sort-asc').attr('href',
          filter_url('sort', sort_value));
      elem.find('.credential-type-sort-desc').attr('href',
          filter_url('sort-reverse', sort_value));

      select.on('change', function() {
        var type = select.val();
        location.href = filter_url(sort_colum, type);
      });
    });

    doc.find('.permission-description').each(function() {
      var elem = $(this);
      var form = elem.parents('form');
      var perm = form.find('select[name="permission"]');
      var resource_type = form.find('select[name="optional_resource_type"]');
      var subject_type = form.find('input[name="subject_type"]');
      var id = form.find('input[name="id_or_empty"]');

      function on_change() {
        var text;
        var subject = subject_type.filter(':checked');
        var subject_id = subject.parents('.radio')
          .find('select option:selected');
        var description = perm.find('option:selected').data('description');
        var values = {
          subject: gsa.upper_case_first(subject.val()),
          subject_id: subject_id.text(),
          description: description,
          id: id.val(),
        };

        if (!id.prop('disabled') && id.val()) {
          if (resource_type.is(':visible')) {
            var resource = resource_type.val();
            if (resource) {
              values.resource = resource;
            }
            else {
              values.resource = 'resource';
            }
            text = gsa._('{{subject}} {{subject_id}} {{description}} to ' +
                '{{resource}} {{id}}', values);
          }
          else {
            if (perm.val().startsWith('get_') && description.endsWith('s')) {
              // this is a hack and may not work for all get commands ...
              values.description = description.slice(0, -1);
            }
            text = gsa._('{{subject}} {{subject_id}} {{description}} ' +
                ' {{id}}', values);
          }
        }
        else {
          text = gsa._('{{subject}} {{subject_id}} {{description}}', values);
        }

        elem.text(text);
      }

      perm.on('change', on_change);
      resource_type.on('change', on_change);
      subject_type.on('change', on_change);
      id.on('input', on_change);
      form.find('select[name="permission_user_id"]').on('change', on_change);
      form.find('select[name="permission_role_id"]').on('change', on_change);
      form.find('select[name="permission_group_id"]').on('change', on_change);

      on_change();
    });
  }

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

  function show_busy_dialog(busy_text, request) {
    var box = $('<div/>');
    var text = $('<b>');
    var img = $('<img/>');

    box.css('text-align', 'center');

    img.attr('src', '/img/loading.gif');
    img.css('margin-right', '16px');
    box.append(img);

    text.text(busy_text);
    box.append(text);

    box.dialog({
      height: 100,
      width: 300,
      modal: true,
      closeText: 'Cancel',
      close: function() {
        request.ajax_request.abort('Aborted');
        box.dialog('destroy');
      },
      classes: {
        "ui-dialog": "dialog-transparent",
        "ui-dialog-titlebar": "dialog-title-transparent",
      },
    });

    $('.ui-widget-overlay').css('opacity', '0.25');

    return box;
  }

  $(document).ready(function() {

    // generic widget pimping
    on_ready(document);

    $(window).on('scroll', function() {
      var h_height = $('#gb_header').height();
      var scroll = $(window).scrollTop();
      $('.gsa-head').toggleClass('sticky', scroll > h_height);
    });

    $(window).trigger('scroll');

    // autorefresh
    start_auto_refresh();

    $(window).bind('beforeunload', function() {
      stop_auto_refresh();
    });
  });

})(window, window.document, window.$, window.console, window.localStorage,
  window.location);
// vim: set ts=2 sw=2 tw=80:
