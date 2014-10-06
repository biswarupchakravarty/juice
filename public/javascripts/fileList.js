$(function () {
  var idToDelete = null;
  $('.delete-image').click(function () {
    $('.delete-image-link').attr('href', $(this).attr('data-href'));
  });
});