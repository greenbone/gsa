/*
 * Greenbone Security Assistant
 * $Id$
 * Description: Dialog JavaScript for GSA.
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

(function(global, document, $, console, location) {
  'use strict';

  var DIALOGS = {};

  /*
  * GSA base object
  */
  if (global.gsa === undefined) {
    global.gsa = {};
  }

  var gsa = global.gsa;

  gsa.show_busy_dialog = show_busy_dialog;
  gsa.init_omp_dialog = init_omp_dialog;
  gsa.Dialog = Dialog;
  gsa.InfoDialog = InfoDialog;
  gsa.OMPDialog = OMPDialog;
  gsa.FilterDialog = FilterDialog;
  gsa.ToggleIcon = ToggleIcon;

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

  function Dialog(options) {
    this.command = options.cmd;
    this.dialog_id = options.dialog_id;
    this.title = options.title;
  }

  Dialog.prototype.error = function(message, title, status_code) {
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

    self.error(error, error_title, error_code);
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
        if (this.label !== 'OK') {
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
    this.height = gsa.is_defined(options.height) ? options.height : 500;

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
    gsa.start_auto_refresh();

    if (this.close_reload.type === 'window') {
      location.reload();
    }

    return this;
  };

  OMPDialog.prototype.postForm = function() {
    var self = this;

    var request = new gsa.OMPRequest({
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
        location.href = gsa.encode_url_object(url);
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
        self.error((gb_windows.length - 1) + ' forms not displayed !');
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
    gsa.on_ready(self.dialog);
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
    gsa.stop_auto_refresh();

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
        width: 800,
        maxHeight: self.height,
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

    self.request = new gsa.OMPRequest({
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

    gsa.stop_auto_refresh();

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
        gsa.start_auto_refresh();
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
    var close_reload_type = options.element.data('close-reload');
    var dialog_id = options.element.data('dialog-id');

    if (!gsa.is_defined(reload_type)) {
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

    if (!gsa.is_defined(cmd)) {
      cmd = options.type + '_' + type_name;

      if (options.postfix !== undefined) {
        cmd = cmd + '_' + options.postfix;
      }
    }

    params = parse_params(extra);

    if (gsa.is_defined(type_id)) {
      params[type_name + '_id'] = type_id;
    }

    if (gsa.is_defined(task_id)) {
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


})(window, window.document, window.$, window.console, window.location);

// vim: set ts=2 sw=2 tw=80:
