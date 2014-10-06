  $(function () {
  var annotating = false,
    paused = false,
    $imageContainer = $('.image-container'),
    annotations = _.chain([]),

    $btnStart = $('#btnStart'),
    $btnDeleteAll = $('#btnDeleteAll'),
    $btnSave = $('#btnSave'),

    annotationPopoverTemplate = $('#tmplAnnotationPopover').html(),
    annotationPopoverContent = _.template($('#tmplAnnotationPopoverContent').html());

  if ($imageContainer.size() === 0) return;

  var startStopAnnotating = function () {
    $imageContainer.toggleClass('annotating');
    $btnStart.find('.glyphicon-pencil').toggleClass('hidden').end().find('.glyphicon-pause').toggleClass('hidden');
    annotating ? bindAnnotationEvents() : unbindAnnotationEvents();
    annotating = !annotating;
  };

  var removeAnnotations = function () {
    annotations.each(function (annotation) {
      annotation.el.fadeOut('fast');
    });
    unbindAnnotationEvents();
    annotations = _.chain([]);
  };

  var bindAnnotationEvents = function () {
    unbindAnnotationEvents();
    annotations.each(function (annotation) {
      annotation.el.popover({
        html: true,
        trigger: 'focus',
        placement: 'bottom',
        title: 'Annotation #' + annotation.id,
        content: annotationPopoverContent(annotation),
        template: annotationPopoverTemplate
      });

      annotation.el.on('click', function () {
        return false;
      });
    });
  };

  var unbindAnnotationEvents = function () {
    annotations.each(function (annotation) {
      annotation.el.popover('destroy');
    });
  };

  var removeAnnotation = function (annotation) {
    annotations = annotations.reject({ id: $(this).data('id') });
    annotation.el.remove();
    updateButtonText();
  };

  $btnStart.on('click', function () {
    startStopAnnotating();
  });

  $btnDeleteAll.on('click', function () {
    removeAnnotations();
    annotating = false;
  });

  var updateButtonText = function () {
    if (annotations.value().length > 0) {
      $btnSave.html('Save ' + (annotations.value().length) + ' Annotation(s)').attr('disabled', false);
    } else {
      $btnSave.html('Save Annotations').attr('disabled', true);
    }
  };

  $imageContainer.on('click', function (e) {
    var id = ~~(Math.random() * 100000),
      $d, annotation;

    if (!annotating) return;

    $d = $('<a></a>')
      .addClass('annotation')
      .attr('tabindex', 0)
      .css({
        top: e.offsetY,
        left: e.offsetX
      })
      .data('id', id)
      .appendTo($imageContainer);

    annotation = {
      id: id,
      x: e.offsetX,
      y: e.offsetY,
      el: $d
    };

    annotations.push(annotation);

    updateButtonText();
  });
});