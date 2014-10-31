(function ($) {

  var view = window.AnnotationView = function (annotation) {
    this.model = annotation;
    this.createDOM();
  };

  view.prototype.createDOM = function () {
    var $d = $(annotationDOMTemplate(this.model));
    this.$el = $d;
    return $d;
  };

  view.prototype.removeDOM = function () {
    this.$el.remove();
  };

  view.prototype.renderTo = function (juicedImage) {
    this.juicedImage = juicedImage;
    this.juicedImage.append(this.$el);
    this.onRender();
  };

  view.prototype.onRender = function () {
    this.bindEvents();
  };

  view.prototype.bindEvents = function () {
    this.$el.popover({
      html: true,
      trigger: 'click',
      placement: 'bottom',
      title: 'Annotation ' + this.model.id,
      content: annotationPopoverContent(this.model),
      template: annotationPopoverTemplate(this.model),
      container: this.$el
    });

    this.$el
      .on('click', _.bind(this.onAnnotationClick, this))
      .on('click', '.delete-annotation', _.bind(this.deleteAnnotation, this))
      .on('click', '#lnkEditAnnotation', _.bind(this.editAnnotation, this));

  };

  view.prototype.showMenu = function() { this.$el.trigger('click'); };

  view.prototype.getDOM = function () { return this.$el; };

  view.prototype.onAnnotationClick = function (e) { return false; };

  view.prototype.deleteAnnotation = function () {
    this.removeDOM();
    this.juicedImage.trigger('annotation.delete', this);
  };

  view.prototype.editAnnotation = function (e) {
    var annotation = this.model;
    this.juicedImage.trigger('annotation.open', this);
  };

}(jQuery));