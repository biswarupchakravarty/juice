(function ($) {

  var view = window.JuicedImageView = function ($container, image) {
    this.model = new JuicedImageModel(image);

    this.$container = $container;
    this.$imageContainer = $('.image-container', this.$container);
    this.initialize();
    this.initializeEvents();
  };

  view.prototype.initialize = function () {
    this.model.annotations.each(function (annotation) {
      this.renderAnnotation(new AnnotationView(annotation));
    }, this);
  };

  view.prototype.initializeEvents = function () {
    this.$imageContainer.on('click', $.proxy(this.onImageClick, this));
    this.$imageContainer.on('annotation.delete', _.bind(this.onAnnotationDelete, this));
    this.$imageContainer.on('annotation.open', _.bind(this.onEditAnnotation, this));
  };

  view.prototype.renderAnnotation = function (annotationView) {
    annotationView.renderTo(this.$imageContainer);
  };

  view.prototype.onImageClick = function (e) {
    var annotation = this.createAnnotation(e),
      annotationView = new AnnotationView(annotation);

    this.renderAnnotation(annotationView);
    annotationView.showMenu();
    this.syncModel();
  };

  view.prototype.onAnnotationDelete = function (event, annotationView) {
    this.model.removeAnnotation(annotationView.model);
    this.syncModel();
  };

  view.prototype.onEditAnnotation = function  (event, annotation) {
    console.log(annotation);
  };

  view.prototype.syncModel = function () {
    NProgress.start();
    this.model.sync($.proxy(function (err, model) {
      console.log(arguments);
      NProgress.done();
    }, this));
  };

  view.prototype.createAnnotation = function (e) {
    return this.model.addAnnotation({ x: e.offsetX, y: e.offsetY });
  };

}(jQuery));