(function ($) {

  var modalContent = $('#tmplAnnotationLightbox').html(),
    showModal = function () { $('#annotationModal').modal(); },
    annotationModelConstructor, annotationModel;

  var fetchJS = function (annotationType) {
    var d = new $.Deferred(),
      scriptSelector = 'script[data-annotation-forms]';

    if ($(scriptSelector).size() > 0)
      d.resolve();

    $.get('/bundles/js/annotationForms.js', function (js) {
      if ($(scriptSelector).size() === 0) {
        $('<script></script>').html(js).attr('data-annotation-forms', true).appendTo($('body'));
      }
      d.resolve();
    });
    return d.promise();
  };

  var loader = window.FormLoader = {

    loadAnnotationForm: function (annotation) {
      fetchJS(annotation.type).then(function () {
        
      });
    }

  }

}(jQuery));

$(function () {
  return;
  var modalContent = $('#tmplAnnotationLightbox').html(),
    showModal = function () { $('#annotationModal').modal(); },
    annotationModelConstructor, annotationModel;

  $(document).on('annotation.open', function (e, annotation) {
    var type = annotation.type;

    NProgress.start();
    
    // OMG USE SOME CONTROL FLOW LIB (VASYNC) FFS !!!!! 
    
    // fetch the javascript
    $.get('/javascripts/annotations/' + type + '/form.js', function (js) {


      if ($('script[data-annotation-class="' + type + '"]').size() === 0) {
        $('<script></script>').html(js).attr('data-annotation-class', type).appendTo($('body'));
      }

      // fetch the markup
      $.get('/admin/templates/forms/' + type, function (response) {

        NProgress.done();

        // remove any existing instances
        $('#annotationModal').remove();

        // and insert this one
        $(modalContent).appendTo($('body'));

        // inject the dynamically loaded content
        $('#annotationModal')
          .find('.modal-title').html('Edit Annotation #' + annotation.id).end()
          .find('.annotation-form-content').append($(response)).end();
        
        // fire the modal
        requestAnimationFrame(showModal);

        // and init the relevant js
        annotationModelConstructor = window[type + 'Annotation'];
        annotationModel = new annotationModelConstructor($('#annotationModal').find('.annotation-form-content'), annotation);

        // tie up the save method
        $('#annotationModal').find('#btnSaveAnnotation').on('click', function () {
          var updatedAnnotation = _.extend(annotation, annotationModel.toJSON());
          $(document).trigger('annotation.update', [ updatedAnnotation ]);
        });
      });

    });
  });

});