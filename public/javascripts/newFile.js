$(function () {

  $('#fileInput').on('change', function () {
    var fullPath = $(this).val().split('').reverse().join('');
    var token = fullPath.indexOf('/') !== -1 ? '/' : '\\';
    var fileName = fullPath.split(token)[0];
    $('.file-name').html(fileName.split('').reverse().join(''));
  });

  $('#txtFileURL').on('change paste keyup', function () {
    var url = $(this).val().trim();
    $('#imgPreview').attr('src', url);
  }).trigger('change');

  $('#lnkUpload').click(function () {
    var fileName = $('#txtFileName').val().trim(),
      fileURL = $('#txtFileURL').val().trim(),
      file = $('#fileInput').val();
    if (fileName.length === 0) {
      $('#txtFileName').focus().closest('.form-group').addClass('has-error');
    } else {
      $('#txtFileName').closest('.form-group').removeClass('has-error');
    }

    if (file.length === 0 && fileURL.length === 0) {
      $('#fileInput').focus().closest('.form-group').addClass('has-error');
      $('#txtFileURL').focus().closest('.form-group').addClass('has-error');
    } else {
      $('#fileInput').closest('.form-group').removeClass('has-error');
      $('#txtFileURL').closest('.form-group').removeClass('has-error');
    }

    if ($('.has-error').size() !== 0) return false;
    NProgress.start();
    $('#form').get(0).submit();
  });

  $('#form').on('keyup', function (e) {
    if (e.which === 13) {
      $('#lnkUpload').trigger('click');
    }
  });

});