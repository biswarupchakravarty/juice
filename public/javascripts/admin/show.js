(function ($) {

  // Set underscore's templating style to more closely
  // resemble Mustache's
  _.templateSettings = {
    interpolate: /\{\{(.+?)\}\}/g
  };

  window.CM = window.CodeMirror;
  window.CodeMirror = null;

  window.annotationPopoverTemplate = _.template($('#tmplAnnotationPopover').html()),
  window.annotationPopoverContent = _.template($('#tmplAnnotationPopoverContent').html());
  window.annotationDOMTemplate = _.template($('#tmplAnnotationDOM').html());

}(jQuery));