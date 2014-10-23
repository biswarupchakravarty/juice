(function ($, _) {

  var model = window.JuicedImageModel = function (image) {
    _.extend(this, image);
    this.annotations = _.map(this.annotations, function (annotation) { return new AnnotationModel(annotation); });
    this.annotations = _.chain(this.annotations);
  };

  model.prototype.addAnnotation = function (options) {
    var annotation = new AnnotationModel({
      x: options.x,
      y: options.y
    });
    this.annotations.push(annotation);
    return annotation;
  };

  model.prototype.removeAnnotation = function (annotation) {
    this.annotations = this.annotations.reject({ id: annotation.id });
  };

  model.prototype.sync = function (callback) {
    this.syncAnnotations(callback);
  };

  model.prototype.syncAnnotations = function (callback) {
    var annotations = this.annotations.invoke('toDataModel');
    $.ajax({
      url: '/admin/files/' + this._id + '/annotations/',
      type: 'POST',
      data: JSON.stringify({ annotations: annotations.value() }),
      contentType: 'application/json',
      success: function (response) {
        callback(null, response);
      },
      error: function (error) {
        callback(error)
      }
    });
  };

}(jQuery, _));