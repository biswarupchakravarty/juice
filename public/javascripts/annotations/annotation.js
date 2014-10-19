(function () {

  var annotation = function (args) {
    if (!this instanceof window.Annotation)
      return new Annotation(args);

    for (var key in args) {
      if (args.hasOwnProperty(key)) {
        this[key] = args[key];
      }
    }

    if (typeof this.id === 'undefined') {
      this.id = ~~(Math.random() * 100000);
    }

    this.type = this.type || 'StaticContent';
  };

  this.Annotation = annotation;

}());