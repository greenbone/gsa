!function(){

  /* A utility function that returns only the text in the current selection */
  this.jQuery.fn.justtext = function(){
    return $(this)
      .clone()
        .children()
          .remove()
        .end()
      .text();
  };

  var OMPDialog = function(omp_command, element){
    this.command = omp_command;
  };

  OMPDialog.prototype.postForm = function(){
    var dialog = $(this);
    $.ajax({
      url: '/omp',
      data: new FormData(dialog.find('form')[0]),
      processData: false,
      contentType: false, 
      type: 'POST',
    }).done(function(data){
      var error = $(data).find('.gb_window_part_center_error');
      if (error.length > 0){
        dialog.prepend(error.first().closest('.gb_window').find('.gb_window_part_content_no_pad').html());
      } else {
        alert("The new Resource might have been created, I just don't know it's UUID");
        dialog.dialog("close");
      }
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
          Create: self.postForm,
        },
      });
    });
  };
  this.OMPDialog = OMPDialog;
}();
