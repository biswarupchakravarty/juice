(function ($, _) {

  var model = window.AnnotationModel = function (args) {
    for (var key in args) {
      if (args.hasOwnProperty(key)) {
        this[key] = args[key];
      }
    }
    this.type = this.type || 'StaticContent';
    this.id = this.id || 'annotation_' + (new Date().getTime());
  };

  model.prototype.toDataModel = function () {
    var keysToIgnore = ['el', 'saved'], dataModel = {};
    for (var key in this) {
      if (_.contains(keysToIgnore, key) === false && typeof this[key] !== 'function') {
        dataModel[key] = this[key];
      }
    }
    return dataModel;
  };

}(jQuery, _));