(function () {

  window.StaticContentAnnotation = function (container, config) {
    this.container = container;
    this.options = config;
    this.initialize();
  };

  StaticContentAnnotation.prototype.initialize = function () {
    // populate the textarea and
    // initialize CodeMirror here
    
    this.container.find('[role=static-content]').text(this.options.content);
    this.codeMirror = CodeMirror.fromTextArea(this.container.find('[role=static-content]').get(0), {
      theme: 'mdn-like',
      lineNumbers: true
    });
  };

  StaticContentAnnotation.prototype.toJSON = function () {
    return {
      content: this.codeMirror.getValue()
    };
  };

}());