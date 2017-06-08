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
 * Copyright (C) 2015 - 2017 Greenbone Networks GmbH
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

(function(global, document, $, localStorage, location) {
  'use strict';

  /*
  * GSA base object
  */
  if (global.gsa === undefined) {
    global.gsa = {};
  }

  var gsa = global.gsa;

  gsa.on_ready = on_ready;

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
      gsa.init_omp_dialog({
        type: 'edit',
        element: $(this),
        default_reload: 'window',
        button: gsa._('Save')
      });
    });

    doc.find('.new-action-icon').each(function() {
      gsa.init_omp_dialog({
        type: 'new',
        element: $(this),
        default_reload: 'next',
        button: gsa._('Create'),
      });
    });

    doc.find('.upload-action-icon').each(function() {
      gsa.init_omp_dialog({
        type: 'upload',
        element: $(this),
        button: gsa._('Create'),
      });
    });

    doc.find('.delete-action-icon').each(function() {
      gsa.init_omp_dialog({
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
        new gsa.GMPRequest({
          params: gsa.parse_params(elem.data('extra')),
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
      params[this.name + '.x'] = '0';

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
        new gsa.GMPDialog({
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

      var dialog = new gsa.GMPDialog({
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
          location.replace(next_url);
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

        var request = new gsa.GMPRequest({
          form: form[0],
          params: {next_xml: 0},
        });

        var busy_dialog = gsa.show_busy_dialog(busy_text, request);

        request.do(function(response) {
          if (busy_dialog) {
            busy_dialog.dialog('close');
          }
          if (success.length) {
            if (success.data('reload')) {
              reload = success.data('reload');
            }

            var dialog = new gsa.InfoDialog({
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
          if (jqXHR.status === 0 && jqXHR.readyState === 0) {
            // Request was aborted. Do not show error dialog.
            return;
          }

          if (busy_dialog) {
            busy_dialog.dialog('close');
          }

          var dialog = new gsa.InfoDialog({
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
        new gsa.FilterDialog(id, gsa._('Update Filter')).show();
      });
    });

    doc.find('.info-dialog').each(function() {
      var elem = $(this);
      new gsa.InfoDialog({
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
        min_date = '-3Y';
        max_date = cur_date;
      }
      else {
        min_date = cur_date;
        max_date = '+3Y';
      }

      if (elem_year.length && gsa.is_defined(elem_year.val())) {
        var year = parseInt(elem_year.val(), 10);
        cur_date.setFullYear(year);
      }
      if (elem_month.length && gsa.is_defined(elem_month.val())) {
        var month = parseInt(elem_month.val(), 10);
        if (month > 0) {
          cur_date.setMonth(month - 1); // js Date uses 0-11 for month value
        }
      }
      if (elem_day.length && gsa.is_defined(elem_day.val())) {
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
          if (gsa.has_value(date)) {
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
        gsa.stop_auto_refresh();
        localStorage.setItem('autorefresh-interval', $(this).val());
        gsa.start_auto_refresh();
      });
      if (!global.autorefresh_enabled) {
        var autorefresh_off = autorefresh.find('option[value="0"]');
        autorefresh.prop('disabled', 'disabled');
        autorefresh_off.prop('selected', 'selected');
      }
    }

    doc.find('.toggle-action-icon').each(function() {
      var elem = $(this);
      var ticon = new gsa.ToggleIcon({
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

      if (gsa.is_defined(option)) {
        value = option.data('select');
      }

      if (!gsa.is_defined(value)) {
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

        if (gsa.is_defined(value)) {
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
      var disable = gsa.is_defined(elem.attr('disable-on')) ?
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

  $(document).ready(function() {

    gsa.init_i18n();

    // generic widget pimping
    on_ready(document);

    $(window).on('scroll', function() {
      var h_height = $('#gb_header').height();
      var scroll = $(window).scrollTop();
      $('.gsa-head').toggleClass('sticky', scroll > h_height);
    });

    $(window).trigger('scroll');

    // autorefresh
    gsa.start_auto_refresh();
  });


})(window, window.document, window.$, window.localStorage, window.location);

// vim: set ts=2 sw=2 tw=80:
