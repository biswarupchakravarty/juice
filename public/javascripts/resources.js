(function () {

  setTimeout(function () {
    var fetchResources = function (callback) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', '/bundles/pages/edit', false);
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4)
          return callback(xhr.responseText);
      }
      xhr.send(null);
    },

    parseResources = function (contents) {
      var files = contents.split('/*+_+_+_+_+_+ END_SECTION +_+_+_+_+_+_+*/');
      files.filter(isValidFile).forEach(attachFile);
    },

    isValidFile = function (contents) {
      return contents.trim().length > 0;
    },

    attachFile = function (contents) {
      var type = contents.match(/BEGIN:::([\w]+)/)[1], node;
      switch (type) {
        case 'js':
          node = document.createElement('script');
          node.type = 'text/javascript';
          node.innerHTML = contents;
          break;
        case 'css':
          node = document.createElement('style');
          node.innerHTML = contents;
          break;
      }
      if (typeof node !== "undefined")
        // setTimeout(function () {
          document.head.appendChild(node);
        // }, 0);
    };

    fetchResources(function (contents) {
      document.body.style.display = 'none';
      parseResources(contents);
      if (typeof $ !== "undefined") {
        $('img[data-img-src]').each(function () {
          $(this)
            .attr('src', $(this).attr('data-img-src'))
            .attr('data-img-src', null);
        });
      }
      document.body.style.display = '';
      setTimeout(function () {
        typeof window.onLoad === "function" && window.onLoad();
      }, 0);
    });
  }, 0);

}());