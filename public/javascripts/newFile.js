$(function () {

  $('#fileInput').on('change', function () {
    var fullPath = $(this).val().split('').reverse().join('');
    var token = fullPath.indexOf('/') !== -1 ? '/' : '\\';
    var fileName = fullPath.split(token)[0];
    $('.file-name').html(fileName.split('').reverse().join(''));
  });

  $('#lnkUpload').click(function () {
    var fileName = $('#txtFileName').val().trim(),
      file = $('#fileInput').val();
    if (fileName.length === 0) {
      $('#txtFileName').focus().closest('.form-group').addClass('has-error');
    } else {
      $('#txtFileName').closest('.form-group').removeClass('has-error');
    }

    if (file.length === 0) {
      $('#fileInput').focus().closest('.form-group').addClass('has-error');
    } else {
      $('#fileInput').closest('.form-group').removeClass('has-error');
    }

    if ($('.has-error').size() !== 0) return false;
    NProgress.start();
    $('#form').get(0).submit();
  });

});