!function(window){
  'use strict';

  /* A utility function that returns only the text in the current selection */
  window.jQuery.fn.justtext = function(){
    return $(this)
      .clone()
        .children()
          .remove()
        .end()
      .text();
  };

  var RESPONSE_SELECTORS = {
    new_agent:           'create_agent_response',
    new_alert:           'create_alert_response',
    new_config:          'create_config_response',
    new_filter:          'create_filter_response',
    new_group:           'create_group_response',
    new_lsc_credential:  'create_lsc_credential_response',
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
    new_user:            'create_user_response',
    // ------
    upload_config:       'create_config_response',
    // ------
    edit_agent:          'modify_agent_response',
    edit_alert:          'modify_alert_response',
    edit_filter:         'modify_filter_response',
    edit_group:          'modify_group_response',
    edit_lsc_credential: 'modify_lsc_credential_response',
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
  };

  var NAME_SELECTORS = {
    new_target:    function(doc, uuid){ return doc.find('get_targets_response > target[id=' + uuid +'] > name').text();},
    new_port_list: function(doc, uuid){ return doc.find('get_port_lists_response > port_list[id=' + uuid +'] > name').text();},
  }

  var isStatusOk = function(status_code){
    return (status_code == 200) || (status_code == 201) || (status_code == 202);
  }

  /**
   * command is the name of the gsa command that has to be send initialy
   * element is the select that will get the value of the newly created resource or true if a global reload is to be triggered.
   * params are extra parameters to send to the initial GET request.
  **/
  var OMPDialog = function(command, element, params){
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
      this.params = params
    }
  };

  OMPDialog.prototype.waiting = function(){
    // I believe there have to be a better way to find this.
    var button = this.dialog.closest('.ui-dialog').find('button').last();
    this.label = button.button('option', 'label');
    button.button('disable');
    button.button('option', 'label', this.label.substring(0, this.label.length - 1) + 'ing ...');
    button.button('option', 'icons', {primary: 'ui-icon-waiting'});
  }

  OMPDialog.prototype.done = function(){
    // I believe there have to be a better way to find this.
    var button = this.dialog.closest('.ui-dialog').find('button').last();
    button.button('enable');
    button.button('option', 'label', this.label);
    button.button('option', 'icons', {primary: null});
  }

  OMPDialog.prototype.error = function(message){
    //Remove previous errors
    this.dialog.find('div.ui-state-error').remove();
    // Insert our error message
    this.dialog.prepend($("<div/>", {
      "class": "ui-state-error ui-corner-all",
      html: $("<p><strong>Error :</strong> " + message + "</p>"),
    }));
  };

  OMPDialog.prototype.postForm = function(){
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
    }).done(function(xml){
      xml = $(xml);
      var response = xml.find(RESPONSE_SELECTORS[self.command]),
          gsad_msg = xml.find('gsad_msg');
      if ((gsad_msg.length > 0) || (! isStatusOk(response.attr('status')))){
        var error = gsad_msg.attr("status_text");
        if (gsad_msg.length == 0){
          error = response.attr('status_text');
        }
        self.error(error);

        // restore the original button.
        self.done();

        return;
      }
      if (self.reload === true){
        window.document.location.reload();
        // a bit overkill, but better-safe-than-sorry.
        return;
      }
      if (self.element === undefined){
        // No element to update, exit early.
        self.dialog.dialog("close");
        return;
      }
      // get the uuid of the created resource
      var uuid = response.attr("id");
      // get its name
      var name = NAME_SELECTORS[self.command](xml, uuid);
      // fill in the new information in the $element and make it selected
      self.element.append($("<option/>", {value: uuid, html: name, selected: true}));
      /// make it the selected option.
      self.element.select2("destroy");
      self.element.select2();

      // And finally, close our dialog.
      self.dialog.dialog("close");
      self.dialog = undefined;
    });
  };

  OMPDialog.prototype.show = function(button){
    var self = this;
    if (button === undefined){ button = 'Create';}
    this.params.cmd = this.command
    this.params.token = $('#gsa-token').text();
    $('html').css('cursor', 'wait');
    $.get(
      '/omp?' + $.param(this.params)
    ).done(function(html){

      // get the content of the (first) window
      var gb_windows = $(html).find('.gb_window'),
          gb_window = gb_windows.first();
          // create a new div
      self.dialog = $("<div/>", {
        id: "dialog-form",
        title:  gb_window.find('.gb_window_part_center').justtext(),
        html: gb_window.find('div:nth-child(4)').html(),
      });
      if (gb_windows.length > 1){
        self.error( (gb_windows.length - 1) + " forms not displayed !");
      }
      // fancy-up the selects
      onReady(self.dialog);

      // remove the last 'submit' button
      self.dialog.find('input[type=submit]').last().closest('tr').remove();

      $('html').css('cursor', "");

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
          },
        ],
      });
    });
  };
  window.OMPDialog = OMPDialog;

  var onReady = function(doc){
    doc = $(doc);

    doc.find(".edit-action-icon").each(function(){
      var elem = $(this),
          type_id = elem.data('id'),
          type_name = elem.data('type'),
          params = {};
      params[type_name + '_id'] = type_id;
      elem.on('click', function(event){
        event.preventDefault();
        new OMPDialog('edit_' + type_name, true, params).show('Save');
      });
    });

    doc.find(".new-action-icon").each(function(){
      var elem = $(this),
          type_name = elem.data('type'),
          done = elem.data('done');
      if (done === undefined){
        done = true;
      }
      elem.on('click', function(event){
        event.preventDefault();
        new OMPDialog('new_' + type_name, done).show();
      });
    });

    doc.find(".upload-action-icon").each(function(){
      var elem = $(this),
          type_name = elem.data('type'),
          done = elem.data('done');
      if (done === undefined){
        done = true;
      }
      elem.on('click', function(event){
        event.preventDefault();
        new OMPDialog('upload_' + type_name, done).show();
      });
    });

    doc.find('select').select2();


    var datepicker = doc.find("#datepicker");
    if (datepicker.length) {
      var curDate = doc.find('input[name=month]').val() + '/' + doc.find('input[name=day_of_month]').val() + '/' + doc.find('input[name=year]').val();
      datepicker.datepicker({
        showOn: "button",
        buttonImage: "img/calendar.png",
        buttonText: "Select date",
        altField: doc.find("#datevalue"),
        altFormat: "DD, d MM, yy",
        minDate: curDate,
        maxDate: "+3Y",
        onClose: function(){
          var date = $(this).datepicker("getDate");
          doc.find('input[name=day_of_month]').val(date.getDate())
          doc.find('input[name=month]').val(date.getMonth() + 1)
          doc.find('input[name=year]').val(date.getFullYear())
        },
      });
      datepicker.datepicker("setDate", curDate);
    }
  };

  $(window.document).ready(function(){
    onReady(window.document);
  });

}(window);
