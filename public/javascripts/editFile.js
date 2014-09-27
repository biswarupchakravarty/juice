$(function () {
  var annotating = false,
    $imageContainer = $('.image-container'),
    annotations = _.chain([]),

    $btnStartStop = $('#btnStart'),
    $btnCancel = $('#btnCancel');

  if ($imageContainer.size() === 0) return;

  $btnStartStop.click(function () {
    if (annotating) return;
    annotating = true;
    $imageContainer.css('cursor', 'crosshair');
    $(this).attr('disabled', true);
    $btnCancel.attr('disabled', false);
  });

  var updateButtonText = function () {
    $('#btnSave').html('Save ' + (annotations.value().length) + ' Annotation(s)');
  };

  $imageContainer.on('click', function (e) {
    var id = ~~(Math.random() * 100000),
      $d = $('<div></div>').addClass('annotation');

    $d.css({
      top: e.offsetY,
      left: e.offsetX
    }).data('id', id).appendTo($imageContainer).click(function () {
      annotations = annotations.reject({ id: $(this).data('id') });
      $(this).remove();
      updateButtonText();
      return false;
    });

    annotations.push({
      id: id,
      x: e.offsetX,
      y: e.offsetY,
      el: $d
    });
    updateButtonText();
  });

  $btnCancel.click(function () {
    if (!annotating) return;
    annotating = false;
    $imageContainer.css('cursor', '');
    $(this).attr('disabled', true);
    $btnStartStop.attr('disabled', false);
    annotations = _.chain([]);
  });
});