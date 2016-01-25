(function() {
  'use strict';

  // work-around select2 not working inside dialogs from here:
  // https://github.com/select2/select2/issues/1246#issuecomment-17428249
  window.jQuery.ui.dialog.prototype._allowInteraction = function(e) {
    return !!$(e.target).closest('.ui-dialog, .ui-datepicker, .select2-dropdown').length;
  };

  /* A utility function that returns only the text in the current selection */
  window.jQuery.fn.justtext = function() {
    return $(this)
      .clone()
        .children()
          .remove()
        .end()
      .text();
  };

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
    process_bulk:        'commands_response'
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
    new_port_list: function(doc){
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
    }
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

  var isStatusOk = function(status_code){
    return (status_code == 200) || (status_code == 201) || (status_code == 202);
  };

  /**
   * command is the name of the gsa command that has to be send initialy
   * element is the select that will get the value of the newly created resource or true if a global reload is to be triggered.
   * params are extra parameters to send to the initial GET request.
   * show_method specifies the method to send the initial request instead of GET.
  **/
  var OMPDialog = function(command, element, params, show_method){
    this.command = command;
    this.reload = false;
    if (element === true){
      this.reload = true;
    } else {
      this.element = $(element);
    }
    if (params === undefined) {
      this.params = {};
    } else {
      this.params = params;
    }
    if (show_method === undefined) {
      this.show_method = "GET";
    } else {
      this.show_method = show_method;
    }
  };

  var waiting = function(){
    // I believe there have to be a better way to find this.
    var buttons = this.dialog.closest('.ui-dialog').find('button.ui-button');
    buttons.each(function() {
      var button = $(this);
      if (button.button('option', 'label') != "Close") {
        this.label = button.button('option', 'label');
        if (this.label != "OK") {
          button.button('option', 'label', this.label.substring(0, this.label.length - 1) + 'ing ...');
        }
        button.button('option', 'icons', {primary: 'ui-icon-waiting'});
        button.button('disable');
      }
    });
  };

  OMPDialog.prototype.waiting = waiting;

  OMPDialog.prototype.done = function() {
    // I believe there have to be a better way to find this.
    var buttons = this.dialog.closest('.ui-dialog').find('button.ui-button');
    buttons.each (function() {
      var button = $(this);
      if (button.button('option', 'label') != "Close") {
        button.button('enable');
        button.button('option', 'label', this.label);
        button.button('option', 'icons', {primary: null});
      }
    });
  };

  OMPDialog.prototype.error = function(message, title) {
    if (! title) {
      title = "Error:";
    }
    // Remove previous errors
    this.dialog.find('div.ui-state-error').remove();
    // Insert our error message
    this.dialog.prepend($("<div/>", {
      "class": "ui-state-error ui-corner-all",
      html: $("<p><strong>" + title + "</strong> " + message + "</p>"),
    }));
  };

  OMPDialog.prototype.close = function() {
    this.dialog.dialog("close");
    // the rest happens in the ``close`` handler of the dialog.
  };

  OMPDialog.prototype.postForm = function() {
    var self = this,
        data = new FormData(this.dialog.find('form')[0]);
    data.append('xml', 1);
    $.ajax({
      url: '/omp',
      data: data,
      processData: false,
      contentType: false,
      type: 'POST',
      dataType: 'xml',
    })
      .fail(function(jqXHR){
        var xml = $(jqXHR.responseXML),
            html = $(jqXHR.responseText),
            response = xml.find(RESPONSE_SELECTORS[self.command]),
            gsad_msg = xml.find('gsad_msg'),
            action_result = xml.find('action_result'),
            generic_omp_response = xml.find('omp_response'),
            internal_error_html
              = html.find(".gb_error_dialog .gb_window_part_content_error"),
            top_line_error_html
              = html.find(".gb_window .gb_window_part_content_error"),
            login_form_html
              = html.find(".gb_login_dialog .gb_window_part_content"),
            error_title = "Error:",
            error = "Unknown error";

        if (gsad_msg.length) {
          error = gsad_msg.attr("status_text");
        }
        else if (response.length) {
          error = response.attr('status_text');
        }
        else if (generic_omp_response.length) {
          error = generic_omp_response.attr('status_text');
        }
        else if (action_result.length) {
          error_title = "Operation \"" + action_result.find("action").text () + "\" failed";
          error = "<br/>" + action_result.find("message").text();
        }
        else if (internal_error_html.length) {
            error_title = internal_error_html.find("span div").text();
            if (! (error_title)) {
              error_title = "Internal Error";
            }
            error = "<br/>" + internal_error_html.find("span")[0].lastChild.textContent;
        }
        else if (top_line_error_html.length) {
          error_title = "Operation \"" + top_line_error_html.find("#operation").text() + "\" failed";
          error = "<br/>" + top_line_error_html.find ("#message").text ();
        }
        else if (login_form_html.length) {
          error = login_form_html.find("center div")[0].lastChild.textContent;
        }

        self.error(error, error_title);

        // restore the original button.
        self.done();
      })
      .done(function(xml) {
        xml = $(xml);
        if (self.reload === true) {
          window.location.reload();
          // a bit overkill, but better-safe-than-sorry.
          return;
        }
        if (self.element === undefined) {
          // No element to update, exit early.
          self.close();
          return;
        }
        var entity = get_entity(self.command, xml);
        if (entity !== undefined) {
          // fill in the new information in the $element and make it selected
          self.element.append($("<option/>", {
            value: entity.id,
            html: entity.name,
            selected: true,
          }));

          // refresh the select widget.
          self.element.select2("destroy");
          self.element.select2();
        }

        // And finally, close our dialog.
        self.close();
      });
  };

  OMPDialog.prototype.show = function(button){
    var self = this;
    var done_func, fail_func;
    var request;
    if (button === undefined) { button = 'Create';}
    this.params.cmd = this.command;
    this.params.token = $('#gsa-token').text();
    $('html').css('cursor', 'wait');
    stopAutoRefresh();

    done_func = function(html) {
      var dialog_title, dialog_html;
      var response = $('<div/>', {html: html});

      // get the content of the (first) window
      // needs to wrap it in a div to be able to select the top-level elements.
      var gb_windows = response.find('.gb_window');
      var edit_dialog = response.find('.edit-dialog');

      if (gb_windows.length) {
        if (gb_windows.length > 1) {
          self.error( (gb_windows.length - 1) + " forms not displayed !");
        }

        var gb_window = gb_windows.first();
        var content = gb_window.find('div:nth-child(4)');

        // remove all 'submit' buttons
        content.find('input[type=submit]').remove();

        dialog_title = gb_window.find('.gb_window_part_center').justtext();
        dialog_html = content.html();
      }
      else if(edit_dialog.length) {
        dialog_title = edit_dialog.find('.title').justtext();
        dialog_html = edit_dialog.find('.content').html();
      }

      self.dialog = $("<div/>", {
        'class': "dialog-form",
        title: dialog_title,
        html: dialog_html,
      });

      // show the dialog !
      self.dialog.dialog({
        modal: true,
        width: 800,
        buttons:[
          {
            text: button,
            click: function(){
              self.waiting();

              self.postForm();
            },
          }
        ],
        close: function(event, ui){
          self.dialog.remove();
          self.dialog = undefined;
          startAutoRefresh();
        },
      });
      // fancy-up the selects
      onReady(self.dialog);
      $('html').css('cursor', "");
    };

    fail_func = function(response) {

      self.dialog = $("<div/>", {
        'class': "dialog-form",
        title:  "Error"
      });

      var html = $(response.responseText),
          internal_error_html
            = html.find (".gb_error_dialog .gb_window_part_content_error"),
          login_form_html
            = html.find (".gb_login_dialog .gb_window_part_content"),
          error_title = "Error:",
          error = "Unknown error";

      if (internal_error_html.length) {
        error_title = internal_error_html.find("span div").text();
        if (! (error_title)) {
          error_title = "Internal Error";
        }
        error = internal_error_html.find("span").text();
      }
      else if (login_form_html.length) {
        error = login_form_html.find(".error_message").text();
      }

      self.dialog.dialog({
        modal: true,
        width: 800
      });

      self.error(error, error_title);

      $('html').css('cursor', "");
    };

    if (this.show_method == 'GET') {
      request = $.get(
        '/omp?' + $.param(this.params)
      );
    }
    else if (this.show_method == 'POST') {
      var data = new FormData();
      for (var param in this.params) {
        data.append(param, this.params[param]);
      }

      request = $.ajax({
        url: '/omp',
        data: data,
        processData: false,
        contentType: false,
        type: 'POST',
        dataType: 'html',
      });
    }
    else
      throw new Error('Unknown show_method "' + this.show_method + '"');

    request.done(done_func).fail(fail_func);
  };

  window.OMPDialog = OMPDialog;

  var FilterDialog = function(id, title) {
    this.id = id;
    this.title = title;
  };

  FilterDialog.prototype.waiting = waiting;

  FilterDialog.prototype.show = function() {
    var self = this,
        content = $('#' + this.id).closest('form').clone();
    content.find('#' + this.id).show();
    content.css('float', '');
    content.find('#' + this.id).css("padding-top", "2em");
    content.find('a, div.footnote, input[type=image], input[type=submit]').remove();

    // Update the form parameter
    var input = content.find('input[name=build_filter]');
    if (input.length) {
      input.val(input.val() ^ 1);
    }

    this.dialog = $("<div/>", {
      'class': "dialog-form",
      title:  this.title,
      html: content,
    });

    stopAutoRefresh();

    // show the dialog !
    this.dialog.dialog({
      modal: true,
      width: 800,
      buttons:[
        {
          text: 'Update',
          click: function(){
            self.waiting();
            self.dialog.find('form').submit();
          },
        }
      ],
      close: function(event, ui) {
        self.dialog.remove();
        self.dialog = undefined;
        startAutoRefresh();
      },
    });
  };

  window.FilterDialog = FilterDialog;

  var InfoDialog = function(options) {
    this.timeout = options.timeout !== undefined ? options.timeout : 5000;
    this.width = options.width !== undefined ? options.width : 600;
    this.transfer_to = options.transfer_to ? $(options.transfer_to) : undefined;
    this.interval_time = 1000; // 1 sec
    this.progress_value = this.timeout;

    this.dialog = $("<div/>", {
      'class': "dialog-form",
    });
    options.element.detach();
    this.dialog.append(options.element.children());
    this.dialog_css = options.dialog_css;
  };

  InfoDialog.prototype.close = function() {
    if (this.transfer_to !== undefined) {
      this.dialog.parent('.ui-dialog').effect('transfer', {
        to: this.transfer_to,
      }, 1000);
    }

    this.stop_progress();

    this.progress = undefined;
    this.progress_value = this.timeout;

    this.dialog.remove();
    this.dialog = undefined;
  };

  InfoDialog.prototype.stop_progress = function() {
    if (this.progress_timer !== undefined) {
      window.clearInterval(this.progress_timer);
      this.progress_timer = undefined;
    }
  };

  InfoDialog.prototype.start_progress = function() {
    var self = this;

    var element = $('<div class="progress"/>');

    this.progress = $('<span />');
    this.progress.text(this.progress_value / 1000);

    this.progress_button = $('<img src="/img/pause.png" alt="Pause/Resume" />');
    this.progress_button.on('click', function() {
      if (self.progress_timer === undefined ) {
        self.resume_progress();
      }
      else {
        self.pause_progress();
      }
    });

    element.append(this.progress);
    element.append(this.progress_button);

    this.dialog.after(element);

    this.resume_progress();
  };

  InfoDialog.prototype.pause_progress = function() {
    if (this.progress_timer !== undefined) {
      window.clearInterval(this.progress_timer);
      this.progress_timer = undefined;
    }
    this.progress_button.attr('src', '/img/resume.png');
  };

  InfoDialog.prototype.resume_progress = function() {
    var self = this;

    self.progress_button.attr('src', '/img/pause.png');

    self.progress_timer = window.setInterval(function() {
      self.progress_value -= self.interval_time;

      if (self.progress_value < 0) {
        self.stop_progress();
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
      modal: false,
      width: self.width,
      show: { effect: "fade", duration: 1000 },
      beforeClose: function(event, ui) {
        self.close();
      },
    });

    if (self.timeout) {
      self.start_progress();
    }
  };

  window.InfoDialog = InfoDialog;

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

  function init_omp_dialog(type, elem, button, postfix) {
    var params;

    var cmd = elem.data('cmd');
    var type_id = elem.data('id');
    var type_name = elem.data('type');
    var extra = elem.data('extra');
    var done = elem.data('done');
    var task_id = elem.data('task_id');

    if (cmd === undefined) {
      cmd = type + '_' + type_name;

      if (postfix !== undefined) {
        cmd = cmd + '_' + postfix;
      }
    }

    if (done === undefined) {
      done = true;
    }

    params = parse_params(extra);

    if (type_id !== undefined) {
      params[type_name + '_id'] = type_id;
    }

    if (task_id !== undefined) {
      params.task_id = task_id;
    }

    elem.on('click', function(event) {
      event.preventDefault();
      new OMPDialog(cmd, done, params).show(button);
    });
  }

  var onReady = function(doc) {
    doc = $(doc);

    doc.find(".edit-action-icon").each(function() {
      init_omp_dialog('edit', $(this), 'Save');
    });

    doc.find(".new-action-icon").each(function() {
      init_omp_dialog('new', $(this), 'Create');
    });

    doc.find(".upload-action-icon").each(function() {
      init_omp_dialog('upload', $(this), 'Create');
    });

    doc.find(".delete-action-icon").each(function() {
      init_omp_dialog('delete', $(this), 'Delete', 'confirm');
    });

    doc.find(".bulk-dialog-icon").each(function() {
      var elem = $(this),
          type_name = elem.data('type'),
          done = elem.data('done');
      if (done === undefined) {
        done = true;
      }
      var params = {
         "resource_type" : type_name
      };
      params [this.name + ".x"] = "0";

      elem.on('click', function(event) {
        event.preventDefault();
        var form = elem.closest("form");
        form.find(":input").each(function() {
          if (this.getAttribute("type") != "image" &&
                  (this.getAttribute("type") != "checkbox" || this.checked))
            params[this.name] = this.value;
        });
        new OMPDialog('process_bulk', done, params, "POST")
                      .show("OK", "confirmation");
      });
    });

    doc.find(".wizard-action-icon").each(function(){
      var elem = $(this),
          name = elem.data('name'),
          params = {name: name};
      elem.on('click', function(event) {
        var dialog = new OMPDialog('wizard', true, params);
        event.preventDefault();
        if (name === 'quick_first_scan'){
          dialog.old_postForm = dialog.postForm;
          dialog.postForm = function() {
            this.old_postForm();
            // set 30 sec.
            window.localStorage.setItem('autorefresh-interval', 30);
          };
        }
        dialog.show();
      });
    });

    doc.find(".edit-filter-action-icon").each(function() {
      var elem = $(this),
          id = elem.data('id');
      elem.on('click', function(event) {
        event.preventDefault();
        new FilterDialog(id, 'Update Filter').show();
      });
    });

    doc.find(".info-dialog").each(function() {
      var elem = $(this);
      new InfoDialog({
        element: elem,
        timeout: elem.data('timeout'),
        width: elem.data('width'),
        transfer_to: elem.data('transfer-to'),
      }).show();
    });

    var datepicker = doc.find("#datepicker");
    if (datepicker.length) {
      var curDate = doc.find('input[name=month]').val() +
        '/' + doc.find('input[name=day_of_month]').val() + '/' +
        doc.find('input[name=year]').val();
      datepicker.datepicker({
        showOn: "button",
        buttonImage: "img/calendar.png",
        buttonText: "Select date",
        altField: doc.find("#datevalue"),
        altFormat: "DD, d MM, yy",
        minDate: curDate,
        maxDate: "+3Y",
        onClose: function() {
          var date = $(this).datepicker("getDate");
          doc.find('input[name=day_of_month]').val(date.getDate());
          doc.find('input[name=month]').val(date.getMonth() + 1);
          doc.find('input[name=year]').val(date.getFullYear());
        },
      });
      datepicker.datepicker("setDate", curDate);
    }

    var autorefresh = doc.find('#autorefresh');
    if (autorefresh.length){
      if (window.localStorage.getItem('autorefresh-interval')) {
        autorefresh.val(window.localStorage.getItem('autorefresh-interval'));
      }
      autorefresh.change(function() {
        stopAutoRefresh();
        window.localStorage.setItem('autorefresh-interval', $(this).val());
        startAutoRefresh();
      });
      if (!window.autorefresh_enabled){
        autorefresh.prop('disabled', 'disabled');
      }
    }

    doc.find('.toggle-action-icon').each(function() {
      var elem = $(this),
          target = doc.find(elem.data('target')),
          icon = elem.find('img'),
          name = elem.data('name'),
          collapsed = elem.data('variable');

      function toggleIcon (icon) {
        // manage the button itself
        icon.toggleClass('expand');
        if (icon.hasClass('expand')) {
          icon.attr({
            src:   "/img/unfold.png",
            title: "Unfold " + name,
            alt:   "Unfold " + name
          });
        } else {
          icon.attr({
            src:   "/img/fold.png",
            title: "Fold " + name,
            alt:   "Fold " + name
          });
        }
      }

      function foldComplete() {
        if (collapsed && window.localStorage.getItem(collapsed)) {
          // Section collapsed
        } else {
          // Section unfolded
          if (name == "Summary") {
            for (var display in gsa.displays) {
              if (! gsa.displays[display].requested())
                gsa.displays[display].refresh();
            }
          }
        }
      }

      if (collapsed && window.localStorage.getItem(collapsed)) {
        target.hide();
        toggleIcon(icon);
      } else {
        if (name == "Summary") {
          for (var display in gsa.displays) {
            if (! gsa.displays[display].requested ()) {
              gsa.displays[display].refresh();
            }
          }
        }
      }
      elem.on('click', function() {
        // Update the localStorage
        if (collapsed){
          if (window.localStorage.getItem(collapsed)) {
            // visible
            window.localStorage.removeItem(collapsed);
          } else {
            // hidden
            window.localStorage.setItem(collapsed, true);
          }
        }
        target.slideToggle(undefined, foldComplete);
        toggleIcon(icon);
      });
    });

    doc.find('select').select2();
  };

  var timeout_id;

  function startAutoRefresh() {
    if ($('.dialog-form').length > 0) {
      // Still open dialogs.
      return;
    }
    if (!timeout_id && +window.localStorage.getItem('autorefresh-interval') && window.autorefresh_enabled) {
      timeout_id = window.setTimeout(function() {
        window.location.reload();
      }, window.localStorage.getItem('autorefresh-interval') * 1000);
    }
  }

  function stopAutoRefresh() {
    if (timeout_id !== undefined) {
      clearTimeout(timeout_id);
      timeout_id = undefined;
    }
  }

  $(window.document).ready(function() {

    // generic widget pimping
    onReady(window.document);

    // autorefresh
    startAutoRefresh();
  });

  /*
   * Page specific UI functions
   */

  /* Credentials */

  /* Credential type selection */
  window.newCredentialUpdateForm = function() {
    var type, auto;
    type = $('select[name="base"]').val();
    auto = Boolean(Number($('input[name="autogenerate"]:checked').val()));

    switch(type)
    {
      case "up":
        $("#autogenerate_row, #login_row, #password_row").show();
        $("#community_row, #certificate_row, #private_key_row, #passphrase_row, #priv_password_row, #auth_algo_row, #priv_algo_row").hide();
        break;
      case "usk":
        $("#autogenerate_row, #login_row, #private_key_row, #passphrase_row").show();
        $("#community_row, #password_row, #certificate_row, #priv_password_row, #auth_algo_row, #priv_algo_row").hide();
        break;
      case "cc":
        $("#certificate_row, #private_key_row").show();
        $("#community_row, #autogenerate_row, #login_row, #password_row, #passphrase_row, #priv_password_row, #auth_algo_row, #priv_algo_row").hide();
        auto = false;
        break;
      case "snmp":
        $("#community_row, #login_row, #password_row, #priv_password_row, #auth_algo_row, #priv_algo_row").show();
        $("#autogenerate_row, #certificate_row, #private_key_row, #passphrase_row").hide();
        auto = false;
        break;
    }

    if (auto)
    {
      $("#password_row input, #certificate_row input, #private_key_row input, #passphrase_row input").attr("disabled", "1");
    }
    else
    {
      $("#password_row input, #certificate_row input, #private_key_row input, #passphrase_row input").attr("disabled", null);
    }
  };

  /* Alert event type selection */
  window.editAlertUpdateForm = function () {
    var type;
    type = $('input[name="event"]:checked').val();

    switch(type)
    {
      case "New SecInfo arrived":
        /* Conditions. */
        $("#severity_at_least_row, #severity_changed_row, #filter_count_changed_row").hide();
        /* Methods. */
        $("#http_get_row, #start_task_row, #sourcefire_row, #verinice_row").hide();

        $("#email_subject_task").hide();
        $("#email_subject_task_input").attr("name", "subject_dummy");
        $("#email_subject_secinfo").show();
        $("#email_subject_secinfo_input").attr("name", "method_data:subject");

        $("#email_content_include_task").hide();
        $("#email_content_include_secinfo").show();
        $("#email_content_include_secinfo").attr("style", "display: inline");
        $("#email_content_include_message_task").hide();
        $("#message_include_task").attr("name", "message_include_dummy");
        $("#email_content_include_message_secinfo").show();
        $("#message_include_secinfo").attr("name", "method_data:message");

        $("#email_content_attach_task").hide();
        $("#email_content_attach_secinfo").show();
        $("#email_content_attach_secinfo").attr("style", "display: inline");
        $("#email_content_attach_message_task").hide();
        $("#message_attach_task").attr("name", "message_attach_dummy");
        $("#email_content_attach_message_secinfo").show();
        $("#message_attach_secinfo").attr("name", "method_data:message_attach");

        /* Method fields. */
        $("#send_to_host_report_row").hide();
        $("#details_url_row").show();
        /* Filter. */
        $("#report_result_filter_row").hide();

        $("#filter_count_at_least_span_nvts").show();
        $("#filter_count_at_least_span_task").hide();
        $("#filter_count_at_least_results_span").hide();
        $("#filter_count_at_least_nvts_span").show();
        $("#filter_count_at_least_select_task").attr("name", "dummy");
        $("#filter_count_at_least_select_nvts").attr("name", "condition_data:filter_id");

        break;
      case "Task run status changed":
        /* Conditions. */
        $("#severity_at_least_row, #severity_changed_row, #filter_count_changed_row").show();
        /* Methods. */
        $("#http_get_row, #start_task_row, #sourcefire_row, #verinice_row").show();

        $("#email_subject_task").show();
        $("#email_subject_task_input").attr("name", "method_data:subject");
        $("#email_subject_secinfo").hide();
        $("#email_subject_secinfo_input").attr("name", "subject_dummy");
        $("#email_content_include_task").show();
        $("#email_content_include_task").attr("style", "display: inline");
        $("#email_content_include_secinfo").hide();
        $("#email_content_include_message_task").show();
        $("#message_include_task").attr("name", "method_data:message");
        $("#email_content_include_message_secinfo").hide();
        $("#message_include_secinfo").attr("name", "message_include_dummy");

        $("#email_content_attach_task").show();
        $("#email_content_attach_task").attr("style", "display: inline");
        $("#email_content_attach_secinfo").hide();
        $("#email_content_attach_message_task").show();
        $("#message_attach_task").attr("name", "method_data:message_attach");
        $("#email_content_attach_message_secinfo").hide();
        $("#message_attach_secinfo").attr("name", "message_attach_dummy");

        /* Method fields. */
        $("#send_to_host_report_row").show();
        $("#details_url_row").hide();
        /* Filter. */
        $("#report_result_filter_row").show();

        $("#filter_count_at_least_span_nvts").hide();
        $("#filter_count_at_least_span_task").show();
        $("#filter_count_at_least_results_span").show();
        $("#filter_count_at_least_nvts_span").hide();
        $("#filter_count_at_least_select_nvts").attr("name", "dummy");
        $("#filter_count_at_least_select_task").attr("name", "condition_data:filter_id");

        break;
    }
  };

})();
// vim: set ts=2 sw=2 tw=80:
