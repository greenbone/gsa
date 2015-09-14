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
    new_target:    'create_target_response',
    new_port_list: 'create_port_list_response',
    // ------
    edit_task:     'modify_task_response',
  };

  var NAME_SELECTORS = {
    new_target:    function(doc, uuid){ return doc.find('get_targets_response > target[id=' + uuid +'] > name').text();},
    new_port_list: function(doc, uuid){ return doc.find('get_port_lists_response > port_list[id=' + uuid +'] > name').text();},
  }

  var isStatusOk = function(status_code){
    return (status_code == 200) || (status_code == 201);
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

  OMPDialog.prototype.postForm = function(dialog){
    var self = this,
        data = new FormData(dialog.find('form')[0]);
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
        //Remove previous errors
        dialog.find('div.ui-state-error').remove();
        // Insert our error message
        dialog.prepend($("<div/>", {
          "class": "ui-state-error ui-corner-all",
          html: $("<p><strong>Error :</strong> " + error + "</p>"),
        }));
        return;
      }
      if (self.reload === true){
        window.document.location.reload()
      }
      if (self.element === undefined){
        // No element to update, exit early.
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
      dialog.dialog("close");
    });
  };

  OMPDialog.prototype.show = function(button){
    var self = this;
    if (button === undefined){ button = 'Create';}
    this.params.cmd = this.command
    this.params.token = $('#gsa-token').text();
    $.get(
      '/omp?' + $.param(this.params)
    ).done(function(html){

      // get the content of the (first) window
      var gb_window = $(html).find('.gb_window').first(),

          // create a new div
          dialog = $("<div/>", {
            id: "dialog-form",
            title:  $(gb_window).find('.gb_window_part_center').justtext(),
            html: $(gb_window).find('.gb_window_part_content').html(),
          });
      // fancy-up the selects
      dialog.find('select').select2();

      // remove the 'submit' button
      dialog.find('input[type=submit]').closest('tr').remove();

      // show the dialog !
      dialog.dialog({
        modal: true,
        width: 800,
        buttons:[
          {
            text: button,
            click: function(){
              // small trick to have `this` set right inside the method.
              self.postForm($(this));
            },
          },
        ],
      });
    });
  };
  window.OMPDialog = OMPDialog;
}(window);
