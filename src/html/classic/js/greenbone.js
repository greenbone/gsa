!function(){
//  'use strict';

  /* A utility function that returns only the text in the current selection */
  this.jQuery.fn.justtext = function(){
    return $(this)
      .clone()
        .children()
          .remove()
        .end()
      .text();
  };

  var UUID_SELECTORS = {
    new_target:    function(doc){ return doc.find('input[name=target_id]').first().val();},
    new_port_list: function(doc){ return doc.find('input[name=port_list_id]').first().val();},
  };

  var NAME_SELECTORS = {
    new_target:    function(doc){ return doc.find('td:contains(Name:)').closest('tr').find('td').last().text();},
    new_port_list: function(doc){ return doc.find('td:contains(Name:)').closest('tr').find('td').last().text();},
  }

  /**
   * element is the select that will get the value of the newly created resource.
  **/
  var OMPDialog = function(omp_command, element){
    this.command = omp_command;
    this.element = $(element);
  };

  OMPDialog.prototype.postForm = function(dialog){
    var self = this;
    $.ajax({
      url: '/omp',
      data: new FormData(dialog.find('form')[0]),
      processData: false,
      contentType: false,
      type: 'POST',
    }).done(function(data){
      var jDoc = $(data),
          error = jDoc.find('.gb_window_part_center_error');
      if (error.length > 0){
        dialog.prepend(error.first().closest('.gb_window').find('.gb_window_part_content_no_pad').html());
        return;
      }
      if (self.element === undefined){
        // No element to update, exit early.
        return;
      }
      // get the uuid of the created resource
      if (UUID_SELECTORS[self.command] === undefined){
        console.log(self.command);
        console.log(UUID_SELECTORS);
        alert("Don't know how to get the UUID of the newly created resource.");
        return;
      }
      var uuid = UUID_SELECTORS[self.command](jDoc);
      // get its name
      var name = NAME_SELECTORS[self.command](jDoc);
      // fill in the new information in the $element and make it selected
      self.element.append($("<option/>", {value: uuid, html: name, selected: true}));
      /// make it the selected option.
      self.element.select2("destroy");
      self.element.select2();
      dialog.dialog("close");
    });
  };

  OMPDialog.prototype.show = function(){
    var self = this;
    $.get(
      '/omp?cmd=' + this.command + '&token='+$('#gsa-token').text()
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
        buttons:{
          Create: function(){
            // small trick to have `this` set right inside the method.
            self.postForm($(this));
          },
        },
      });
    });
  };
  this.OMPDialog = OMPDialog;
}();
