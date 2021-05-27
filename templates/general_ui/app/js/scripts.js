'use strict';

// Safari datepicker
if (document.getElementById("birth_date")) {
  // document.write('<link href="https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/themes/base/jquery-ui.css" rel="stylesheet" type="text/css" />\n');
  document.write('<script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js"><\/script>\n');
}

$(document).ready(function () {
  //disable context
  $(document).bind("contextmenu", function (e) {
    return false;
  });

  // form-input
  $('input').focus(function () {
    $(this).parents('.form-group').addClass('focused');
  });

  $('input').blur(function () {
    var inputValue = $(this).val();
    if (inputValue == "") {
      $(this).removeClass('filled');
      $(this).parents('.form-group').removeClass('focused');
    } else {
      $(this).addClass('filled');
    }
  });

  //validate email
  function isEmail(email) {
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,6})+$/;
    return regex.test(email);
  };

  // field doesn't consist of spaces
  function ifNotSpace(field) {
    var regex = /\S/;
    return regex.test(field);
  }

  // validate form
  var email = $('#email');
  var customerSubmitLabel = $('#customer_form_label');
  var customerSubmit = $('#customer_form_submit');
  var text_inputs = $('.user-form input[type=text]:not([name=address2])');
  var birth_date = $('#birth_date');
  var phone = $('#phone');
  var terms = $('#terms');

  var form_validation = function () {
    var text_inputs_filled_arr = [];
    var text_inputs_filled = false;

    // text inputs require validation
    text_inputs.each(function () {
      if ($(this).val() === '' || !ifNotSpace($(this).val())) {
        text_inputs_filled_arr.push(false)
        $(this).closest('div').addClass('required');
      } else {
        text_inputs_filled_arr.push(true)
        $(this).closest('div').removeClass('required');
      }
    })

    // check if all text inputs are filled
    text_inputs_filled = !text_inputs_filled_arr.includes(false);

    // birth_date validation
    if (birth_date.val() === "") {
      birth_date.closest('div').addClass('required');
    } else {
      birth_date.closest('div').removeClass('required');
    }

    // email validation
    if (!isEmail(email.val()) && !email.hasClass('required')) {
      email.closest('div').addClass('invalid-email');
    } else {
      email.closest('div').removeClass('invalid-email');
    }

    // form validation
    if (isEmail(email.val()) &&
      text_inputs_filled === true &&
      birth_date.val() !== "" &&
      $(terms).is(':checked')
    ) {
      customerSubmit.removeAttr('disabled');
      customerSubmitLabel.removeClass('disabled');
    } else {
      customerSubmit.attr('disabled', 'disabled');
      customerSubmitLabel.addClass('disabled');
    }
  };

  email.change(function () {
    form_validation()
  });

  email.keyup(function () {
    form_validation()
  });

  text_inputs.keyup(function () {
    form_validation()
  });

  birth_date.change(function () {
    form_validation()
  });

  terms.click(form_validation);

  customerSubmit.click(form_validation);

  // number
  $.fn.inputFilter = function (inputFilter) {
    return this.on("input keydown keyup mousedown mouseup select contextmenu drop", function () {
      if (inputFilter(this.value)) {
        this.oldValue = this.value;
        this.oldSelectionStart = this.selectionStart;
        this.oldSelectionEnd = this.selectionEnd;
      } else if (this.hasOwnProperty("oldValue")) {
        this.value = this.oldValue;
        this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
      } else {
        this.value = "";
      }
    });
  };

  phone.inputFilter(function (value) {
    return /^[\+]?\d*$/.test(value);    // Allow digits only, using a RegExp
  });

  /* setup modal */
  var termsBtn = $('.terms-btn');
  var policyBtn = $('.policy-btn');
  var informationProvided = $('.information-provided');
  var termsModal = $('#modal-terms');
  var policyModal = $('#modal-policy');
  var modalInformation = $('#modal-information');
  var closeBtn = $('.ui-close-modal');

  termsBtn.on('click', function () {
    termsModal.addClass('show');
  });

  policyBtn.on('click', function () {
    policyModal.addClass('show');
  });

  informationProvided.on('click', function () {
    modalInformation.addClass('show');
  });

  closeBtn.on('click', function () {
    termsModal.removeClass('show');
    policyModal.removeClass('show');
    modalInformation.removeClass('show');
  });

  // close modal by clicking outside the modal window
  $('.modal-wrap').click(function (e) {
    if (e.target === $('.modal-wrap.show')[0]) {
      $('.modal-wrap').removeClass('show');
    }
  })
  /* end modal */

  // date - set max date
  if (document.getElementById("birth_date")) {
    // datepicker
    $('#birth_date').datepicker({
      changeMonth: true,
      changeYear: true,
      yearRange: '-100:+0',
      maxDate: "+0m +0w +0d",
      dateFormat: 'dd/mm/yy'
    }).on('change', function () {
      if ($(this).val() !== '') {
        $(this).closest('.form-group').addClass('focused');
      };
    });
  };

  // send timezone offset to server
  if (window.location.pathname.includes('/index.html')) {
    sessionStorage.setItem('setTimezoneReques_sent', 'false');
  };

  var setTimezoneReques_sent = sessionStorage.getItem('setTimezoneReques_sent');
  if (setTimezoneReques_sent !== 'true') {

    // get poll_session
    var req = new XMLHttpRequest();
    req.open('GET', document.location, false);
    req.send(null);
    var headers = req.getAllResponseHeaders().toLowerCase();
    var headersArr = headers.trim().split('\n');

    function getPollSession(arr) {
      var poll_session;

      arr.forEach(function (item) {
        var ItemKey = item.split(':')[0];
        var itemValue = item.split(':')[1];

        if (ItemKey === 'poll-session') {
          poll_session = itemValue;
        }
      })
      return poll_session;
    };

    var poll_session = getPollSession(headersArr) !== undefined ? getPollSession(headersArr).trim() : false;

    // get timezone offset
    var date = new Date();
    const currentTimeZoneOffsetInHours_func = () => {
      let offset = date.getTimezoneOffset() / 60;
      if (Math.sign(offset) === -1) {
        return Math.abs(offset);
      }
      if (Math.sign(offset) === 1) {
        return -Math.abs(offset);
      }
      if (Math.sign(offset) === 0 && Math.sign(offset) === -0) {
        return Math.abs(offset);
      }
    };

    const currentTimeZoneOffsetInHours = currentTimeZoneOffsetInHours_func();
    console.log(`current TimeZone Offset In Hours = ${currentTimeZoneOffsetInHours}`);

    var base_url = window.location.origin;
    var setTimezoneRequest_Url = `${base_url}/bo/poll-sessions/${poll_session}/set-tz-offset/${currentTimeZoneOffsetInHours}/`;
    $.ajax({
      url: setTimezoneRequest_Url,
      type: "GET",
      success: function (data) {
        console.log(data);
        // set setTimezoneReques_sent to true
        sessionStorage.setItem('setTimezoneReques_sent', 'true');
      },
      error: function (error_data) {
        console.log(error_data);
      }
    });
  };
  // end send timezone offset to server

});
