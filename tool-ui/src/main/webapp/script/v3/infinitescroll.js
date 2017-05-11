define([ 'jquery', 'bsp-utils' ], function($, bsp_utils) {

    bsp_utils.onDomInsert(document, '.infiniteScroll', {

      insert : function (scrollable) {

        var defaults  = {
          navSelector              : '.searchResult-pagination',
          nextSelector             : 'li.next a',
          previousSelector         : 'li.prev a',
          itemsContainerSelector   : '.searchResult-images',
          itemSelector             : 'figure',
          scrollBuffer             : 100,
          prefill                  : true,
          window                   : false
        };

        var $scrollable = $(scrollable);
        var settings = $.extend({}, defaults, $scrollable.data().options);
        settings.state = { activePromise : new $.Deferred().resolve()};

        var $itemContainer = $scrollable.find(settings.itemsContainerSelector);
        var $nav = $scrollable.find(settings.navSelector);

        if (settings.prefill) {
          fill();
        }

        if (settings.window) {
          $scrollable = $(window);
        }

        $scrollable.scroll(bsp_utils.throttle(100, fill));

        function shouldFetch() {
          var $items = $itemContainer.find(settings.itemSelector);
          if ($items) {
            var $item = $items.first();
            return $scrollable.outerWidth() * ($scrollable.outerHeight() + $scrollable.scrollTop() + settings.scrollBuffer) >= ($item.outerWidth() * $item.outerHeight() * $items.size());
          } else {
            return false;
          }
        }

        function fill() {
          if (shouldFetch() && settings.state.hasLoadedAllItems !== true && (settings.state.activePromise.state() !== "pending")) {
            doFetchAndAppend();
          }
        }

        function doFetchAndAppend() {

          var $next = $nav.find(settings.nextSelector);

          if ($next) {

            settings.state.activePromise = $.ajax({
              'cache': false,
              'type': 'get',
              'url' : $next.attr('href')
            });

            settings.state.activePromise.done(function(html) {

                var $html = $(html);
                var $items = $html.find(settings.itemsContainerSelector).children();
                var nextLink = $html.find(settings.navSelector).find(settings.nextSelector);

                if ($items.size() == 0 || nextLink.size() == 0) {
                  settings.state.hasLoadedAllItems = true;
                }

                $itemContainer.append($items);
                $next.attr('href', nextLink.attr('href'));
                fill();

                // TODO: This should be changed so that multiple callbacks can be registered
                if ($itemContainer.data('onLoadCallback') !== undefined) {
                    $itemContainer.data('onLoadCallback')($scrollable);
                }
              });
          }
        }
      }
    });

});
