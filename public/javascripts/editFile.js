$(function () {
  return;
  _.templateSettings = {
    interpolate: /\{\{(.+?)\}\}/g
  };

  var annotating = false,
    paused = false,
    $imageContainer = $('.image-container'),
    annotations = _.chain(window.image.annotations),

    $btnStart = $('#btnStart'),
    $btnDeleteAll = $('#btnDeleteAll'),
    $btnSave = $('#btnSave'),

    annotationPopoverTemplate = _.template($('#tmplAnnotationPopover').html()),
    annotationPopoverContent = _.template($('#tmplAnnotationPopoverContent').html());

  if ($imageContainer.size() === 0) return;

  var initialize = function () {
    _.each(window.image.annotations, plotAnnotation);
    bindAnnotationEvents();
  };
  $(initialize);

  // var startStopAnnotating = function () {
  //   $imageContainer.toggleClass('annotating');
  //   $btnStart.find('.glyphicon-pencil').toggleClass('hidden').end().find('.glyphicon-pause').toggleClass('hidden');
  //   annotating ? bindAnnotationEvents() : unbindAnnotationEvents();
  //   annotating = !annotating;
  // };

  // var removeAnnotations = function () {
  //   annotations.each(function (annotation) {
  //     annotation.el.fadeOut('fast');
  //   });
  //   unbindAnnotationEvents();
  //   annotations = _.chain(window.image.annotations);
  // };

  var bindAnnotationEvents = function () {
    unbindAnnotationEvents();
    annotations.each(function (annotation) {
      annotation.el.popover({
        html: true,
        trigger: 'click',
        placement: 'bottom',
        title: 'Annotation #' + annotation.id,
        content: annotationPopoverContent(annotation),
        template: annotationPopoverTemplate(annotation),
        container: "#adminContainer"
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

  $(document).on('click', '#lnkEditAnnotation', function (e) {
    var aId = $(this).data('annotation-id');
    var annotation = annotations.where({ id: aId }).value()[0];
    $(document).trigger('annotation.open', [ annotation ]);
    annotations.each(function (a) { a.el.popover('hide'); });
  });

  $(document).on('annotation.update', function (e, annotation) {
    NProgress.start();
    _.extend(annotations.where({ id: annotation.id }), annotation);
    console.dir(annotations.where({ id: annotation.id }));
    updateAnnotations().then(function (response) {
      NProgress.done();
    });
  });

  var updateAnnotations = function () {
    // list of keys to strip before saving the data
    var keysToIgnore = ['el'], temp;

    // strip the keys
    var transformedAnnotations = annotations.map(function (annotation) {
      temp = {};
      for (var key in annotation) {
        if (annotation.hasOwnProperty(key) && keysToIgnore.indexOf(key) === -1) {
          temp[key] = annotation[key];
        }
      }
      return temp;
    });
    var postData = { annotations: transformedAnnotations.value() };

    // sync the annotations to the server!
    return $.ajax({
      url: '/admin/files/' + window.fileId + '/annotations/',
      type: 'POST',
      data: JSON.stringify(postData),
      contentType: 'application/json'
    })
  }

  var updateButtonText = function () {
    if (annotations.value().length > 0) {
      $btnSave.html('Save ' + (annotations.value().length) + ' Annotation(s)').attr('disabled', false);
    } else {
      $btnSave.html('Save Annotations').attr('disabled', true);
    }
  };

  var plotAnnotation = function (annotation) {
    var $d = $('<a></a>')
      .addClass('annotation')
      .attr('tabindex', 0)
      .css({
        top: annotation.y,
        left: annotation.x
      })
      .data('id', annotation.id)
      .appendTo($imageContainer);

    annotation.el = $d;
  };

  $imageContainer.on('click', function (e) {
    var id = ~~(Math.random() * 100000),
      $d, annotation;

    if (!annotating) return;

    annotation = new Annotation({
      id: id,
      x: e.offsetX,
      y: e.offsetY
    });

    plotAnnotation(annotation);

    annotations.push(annotation);

    updateButtonText();
  });
});