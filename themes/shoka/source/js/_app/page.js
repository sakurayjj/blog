const cardActive = function() {
  if(!$('.index.wrap'))
    return

  if (!window.IntersectionObserver) {
    $.each('.index.wrap article.item, .index.wrap section.item', function(article) {
      if( article.hasClass("show") === false){
          article.addClass("show");
      }
    })
  } else {
    var io = new IntersectionObserver(function(entries) {

        entries.forEach(function(article) {
          if (article.target.hasClass("show")) {
            io.unobserve(article.target)
          } else {
            if (article.isIntersecting || article.intersectionRatio > 0) {
              article.target.addClass("show");
              io.unobserve(article.target);
            }
          }
        })
    }, {
        root: null,
        threshold: [0.3]
    });

    $.each('.index.wrap article.item, .index.wrap section.item', function(article) {
      io.observe(article)
    })

    $('.index.wrap .item:first-child').addClass("show")
  }

  $.each('.cards .item', function(element, index) {
    ['mouseenter', 'touchstart'].forEach(function(item){
      element.addEventListener(item, function(event) {
        if($('.cards .item.active')) {
          $('.cards .item.active').removeClass('active')
        }
        element.addClass('active')
      })
    });
    ['mouseleave'].forEach(function(item){
      element.addEventListener(item, function(event) {
        element.removeClass('active')
      })
    });
  });
}

const registerExtURL = function() {
  $.each('span.exturl', function(element) {
      var link = document.createElement('a');
      // https://stackoverflow.com/questions/30106476/using-javascripts-atob-to-decode-base64-doesnt-properly-decode-utf-8-strings
      link.href = decodeURIComponent(atob(element.dataset.url).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      link.rel = 'noopener external nofollow noreferrer';
      link.target = '_blank';
      link.className = element.className;
      link.title = element.title || element.innerText;
      link.innerHTML = element.innerHTML;
      if(element.dataset.backgroundImage) {
        link.dataset.backgroundImage = element.dataset.backgroundImage;
      }
      element.parentNode.replaceChild(link, element);
    });
}

const postFancybox = function(p) {
  if($(p + ' .md img')) {
    vendorCss('fancybox');
    vendorJs('fancybox', function() {
      var q = jQuery.noConflict();

      $.each(p + ' p.gallery', function(element) {
        var box = document.createElement('div');
        box.className = 'gallery';
        box.attr('data-height', element.attr('data-height')||220);

        box.innerHTML = element.innerHTML.replace(/<br>/g, "")

        element.parentNode.insertBefore(box, element);
        element.remove();
      });

      $.each(p + ' .md img:not(.emoji):not(.vemoji)', function(element) {
        var $image = q(element);
        var info, captionClass = 'image-info';
        if(!$image.is('a img')) {
          var imageLink = $image.attr('data-src') || $image.attr('src');
          $image.data('safe-src', imageLink)
          var $imageWrapLink = $image.wrap('<a class="fancybox" href="'+imageLink+'" itemscope itemtype="http://schema.org/ImageObject" itemprop="url"></a>').parent('a');
          if (!$image.is('.gallery img')) {
            $imageWrapLink.attr('data-fancybox', 'default').attr('rel', 'default');
          } else {
            captionClass = 'jg-caption'
          }
        }
        if(info = element.attr('title')) {
          $imageWrapLink.attr('data-caption', info);
          var para = document.createElement('span');
          var txt = document.createTextNode(info);
          para.appendChild(txt);
          para.addClass(captionClass);
          element.insertAfter(para);
        }
      });

      $.each(p + ' div.gallery', function (el, i) {
        q(el).justifiedGallery({rowHeight: q(el).data('height')||120, rel: 'gallery-' + i}).on('jg.complete', function () {
          q(this).find('a').each(function(k, ele) {
            ele.attr('data-fancybox', 'gallery-' + i);
          });
        });
      });

      q.fancybox.defaults.hash = false;
      q(p + ' .fancybox').fancybox({
        loop   : true,
        helpers: {
          overlay: {
            locked: false
          }
        }
      });
    }, window.jQuery);
  }
}

const postBeauty = function () {
  loadComments();

  if(!$('.md'))
    return

  postFancybox('.post.block');

  $('.post.block').oncopy = function(event) {
    showtip(LOCAL.copyright)

    if(LOCAL.nocopy) {
      event.preventDefault()
      return
    }

    var copyright = $('#copyright')
    if(window.getSelection().toString().length > 30 && copyright) {
      event.preventDefault();
      var author = "# " + copyright.child('.author').innerText
      var link = "# " + copyright.child('.link').innerText
      var license = "# " + copyright.child('.license').innerText
      var htmlData = author + "<br>" + link + "<br>" + license + "<br><br>" + window.getSelection().toString().replace(/\r\n/g, "<br>");;
      var textData = author + "\n" + link + "\n" + license + "\n\n" + window.getSelection().toString().replace(/\r\n/g, "\n");
      if (event.clipboardData) {
          event.clipboardData.setData("text/html", htmlData);
          event.clipboardData.setData("text/plain", textData);
      } else if (window.clipboardData) {
          return window.clipboardData.setData("text", textData);
      }
    }
  }

  $.each('li ruby', function(element) {
    var parent = element.parentNode;
    if(element.parentNode.tagName != 'LI') {
      parent = element.parentNode.parentNode;
    }
    parent.addClass('ruby');
  })

  $.each('ol[start]', function(element) {
    element.style.counterReset = "counter " + parseInt(element.attr('start') - 1)
  })

  $.each('.md table', function (element) {
    element.wrap({
      className: 'table-container'
    });
  });

  $.each('.highlight > .table-container', function (element) {
    element.className = 'code-container'
  });

  $.each('figure.highlight', function (element) {

    var code_container = element.child('.code-container');
    var caption = element.child('figcaption');

    element.insertAdjacentHTML('beforeend', '<div class="operation"><span class="breakline-btn"><i class="ic i-align-left"></i></span><span class="copy-btn"><i class="ic i-clipboard"></i></span><span class="fullscreen-btn"><i class="ic i-expand"></i></span></div>');

    var copyBtn = element.child('.copy-btn');
    if(LOCAL.nocopy) {
      copyBtn.remove()
    } else {
      copyBtn.addEventListener('click', function (event) {
        var target = event.currentTarget;
        var comma = '', code = '';
        code_container.find('pre').forEach(function(line) {
          code += comma + line.innerText;
          comma = '\n'
        })

        clipBoard(code, function(result) {
          target.child('.ic').className = result ? 'ic i-check' : 'ic i-times';
          target.blur();
          showtip(LOCAL.copyright);
        })
      });
      copyBtn.addEventListener('mouseleave', function (event) {
        setTimeout(function () {
          event.target.child('.ic').className = 'ic i-clipboard';
        }, 1000);
      });
    }

    var breakBtn = element.child('.breakline-btn');
    breakBtn.addEventListener('click', function (event) {
      var target = event.currentTarget;
      if (element.hasClass('breakline')) {
        element.removeClass('breakline');
        target.child('.ic').className = 'ic i-align-left';
      } else {
        element.addClass('breakline');
        target.child('.ic').className = 'ic i-align-justify';
      }
    });

    var fullscreenBtn = element.child('.fullscreen-btn');
    var removeFullscreen = function() {
      element.removeClass('fullscreen');
      element.scrollTop = 0;
      BODY.removeClass('fullscreen');
      fullscreenBtn.child('.ic').className = 'ic i-expand';
    }
    var fullscreenHandle = function(event) {
      var target = event.currentTarget;
      if (element.hasClass('fullscreen')) {
        removeFullscreen();
        hideCode && hideCode();
        pageScroll(element)
      } else {
        element.addClass('fullscreen');
        BODY.addClass('fullscreen');
        fullscreenBtn.child('.ic').className = 'ic i-compress';
        showCode && showCode();
      }
    }
    fullscreenBtn.addEventListener('click', fullscreenHandle);
    caption && caption.addEventListener('click', fullscreenHandle);

    if(code_container && code_container.find("tr").length > 15) {
      
      code_container.style.maxHeight = "300px";
      code_container.insertAdjacentHTML('beforeend', '<div class="show-btn"><i class="ic i-angle-down"></i></div>');
      var showBtn = code_container.child('.show-btn');

      var showCode = function() {
        code_container.style.maxHeight = ""
        showBtn.addClass('open')
      }

      var hideCode = function() {
        code_container.style.maxHeight = "300px"
        showBtn.removeClass('open')
      }

      showBtn.addEventListener('click', function(event) {
        if (showBtn.hasClass('open')) {
          removeFullscreen()
          hideCode()
          pageScroll(code_container)
        } else {
          showCode()
        }
      });
    }
  });

  $.each('pre.mermaid > svg', function (element) {
    element.style.maxWidth = ''
  });

  $.each('.reward button', function (element) {
    element.addEventListener('click', function (event) {
      event.preventDefault();
      var qr = $('#qr')
      if(qr.display() === 'inline-flex') {
        transition(qr, 0)
      } else {
        transition(qr, 1, function() {
          qr.display('inline-flex')
        }) // slideUpBigIn
      }
    });
  });

  //quiz
  $.each('.quiz > ul.options li', function (element) {
    element.addEventListener('click', function (event) {
      if (element.hasClass('correct')) {
        element.toggleClass('right')
        element.parentNode.parentNode.addClass('show')
      } else {
        element.toggleClass('wrong')
      }
    });
  });

  $.each('.quiz > p', function (element) {
    element.addEventListener('click', function (event) {
      element.parentNode.toggleClass('show')
    });
  });

  $.each('.quiz > p:first-child', function (element) {
    var quiz = element.parentNode;
    var type = 'choice'
    if(quiz.hasClass('true') || quiz.hasClass('false'))
      type = 'true_false'
    if(quiz.hasClass('multi'))
      type = 'multiple'
    if(quiz.hasClass('fill'))
      type = 'gap_fill'
    if(quiz.hasClass('essay'))
      type = 'essay'
    element.attr('data-type', LOCAL.quiz[type])
  });

  $.each('.quiz .mistake', function (element) {
    element.attr('data-type', LOCAL.quiz.mistake)
  });

  $.each('div.tags a', function(element) {
    element.className = ['primary', 'success', 'info', 'warning', 'danger'][Math.floor(Math.random() * 5)]
  })

  $.each('.md div.player', function(element) {
    mediaPlayer(element, {
      type: element.attr('data-type'),
      mode: 'order',
      btns: []
    }).player.load(JSON.parse(element.attr('data-src'))).fetch()
  })
}

const tabFormat = function() {
  // tab
  var first_tab
  $.each('div.tab', function(element, index) {
    if(element.attr('data-ready'))
      return

    var id = element.attr('data-id');
    var title = element.attr('data-title');
    var box = $('#' + id);
    if(!box) {
      box = document.createElement('div');
      box.className = 'tabs';
      box.id = id;
      box.innerHTML = '<div class="show-btn"></div>'

      var showBtn = box.child('.show-btn');
      showBtn.addEventListener('click', function(event) {
        pageScroll(box)
      });

      element.parentNode.insertBefore(box, element);
      first_tab = true;
    } else {
      first_tab = false;
    }

    var ul = box.child('.nav ul');
    if(!ul) {
      ul = box.createChild('div', {
        className: 'nav',
        innerHTML: '<ul></ul>'
      }).child('ul');
    }

    var li = ul.createChild('li', {
      innerHTML: title
    });

    if(first_tab) {
      li.addClass('active');
      element.addClass('active');
    }

    li.addEventListener('click', function(event) {
      var target = event.currentTarget;
      box.find('.active').forEach(function(el) {
        el.removeClass('active');
      })
      element.addClass('active');
      target.addClass('active');
    });

    box.appendChild(element);
    element.attr('data-ready', true)
  });
}

const loadComments = function () {
  var element = $('#comments');
  if (!element) {
    goToComment.display("none")
    return;
  } else {
    goToComment.display("")
  }

  if (!window.IntersectionObserver) {
    vendorCss('valine');
  } else {
    var io = new IntersectionObserver(function(entries, observer) {
      var entry = entries[0];
      vendorCss('valine');
      if (entry.isIntersecting || entry.intersectionRatio > 0) {
        transition($('#comments'), 'bounceUpIn');
        observer.disconnect();
      }
    });

    io.observe(element);
  }
}

const algoliaSearch = function(pjax) {
  if(CONFIG.search === null || !window.instantsearch || !window.algoliasearch)
    return

  if(!siteSearch) {
    siteSearch = BODY.createChild('div', {
      id: 'search',
      innerHTML: '<div class="inner"><div class="header"><span class="icon"><i class="ic i-search"></i></span><div class="search-input-container"></div><span class="close-btn"><i class="ic i-times-circle"></i></span></div><div class="results"><div class="inner"><div id="search-stats"></div><div id="search-hits"></div><div id="search-pagination"></div></div></div></div>'
    });
  }

  var search = instantsearch({
    indexName: CONFIG.search.indexName,
    searchClient  : algoliasearch(CONFIG.search.appID, CONFIG.search.apiKey),
    searchFunction: function(helper) {
      var searchInput = $('.search-input');
      if (searchInput.value) {
        helper.search();
      }
    }
  });

  search.on('render', function() {
    if (pjax && pjax.refresh) {
      pjax.refresh($('#search-hits'));
    }
  });

  // Registering Widgets
  search.addWidgets([
    instantsearch.widgets.configure({
      hitsPerPage: CONFIG.search.hits.per_page || 10
    }),

    instantsearch.widgets.searchBox({
      container           : '.search-input-container',
      placeholder         : LOCAL.search.placeholder,
      // Hide default icons of algolia search
      showReset           : false,
      showSubmit          : false,
      showLoadingIndicator: false,
      cssClasses          : {
        input: 'search-input'
      }
    }),

    instantsearch.widgets.stats({
      container: '#search-stats',
      templates: {
        text: function(data) {
          var stats = LOCAL.search.stats
            .replace(/\$\{hits}/, data.nbHits)
            .replace(/\$\{time}/, data.processingTimeMS);
          return stats + '<span class="algolia-powered"></span><hr>';
        }
      }
    }),

    instantsearch.widgets.hits({
      container: '#search-hits',
      templates: {
        item: function(data) {
          var cats = data.categories ? '<span>'+data.categories.join('<i class="ic i-angle-right"></i>')+'</span>' : '';
          return '<a href="' + CONFIG.root + data.path +'">'+cats+data._highlightResult.title.value+'</a>';
        },
        empty: function(data) {
          return '<div id="hits-empty">'+
              LOCAL.search.empty.replace(/\$\{query}/, data.query) +
            '</div>';
        }
      },
      cssClasses: {
        item: 'item'
      }
    }),

    instantsearch.widgets.pagination({
      container: '#search-pagination',
      scrollTo : false,
      showFirst: false,
      showLast : false,
      templates: {
        first   : '<i class="ic i-angle-double-left"></i>',
        last    : '<i class="ic i-angle-double-right"></i>',
        previous: '<i class="ic i-angle-left"></i>',
        next    : '<i class="ic i-angle-right"></i>'
      },
      cssClasses: {
        root        : 'pagination',
        item        : 'pagination-item',
        link        : 'page-number',
        selectedItem: 'current',
        disabledItem: 'disabled-item'
      }
    })
  ]);

  search.start();

  const onPopupOpen = function() {
    document.body.style.overflow = 'hidden';
    transition(siteSearch, 'shrinkIn', function() {
      $('.search-input').focus();
    }) // transition.shrinkIn
  };

  // Handle and trigger popup window
  $.each('.search', function(element) {
    element.addEventListener('click', function(event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      onPopupOpen();
    });
  });
  bindSearchTrigger(onPopupOpen);

  // Monitor main search box
  const onPopupClose = function() {
    document.body.style.overflow = '';
    transition(siteSearch, 0); // "transition.shrinkOut"
  };

  siteSearch.addEventListener('click', function(event) {
    if (event.target === siteSearch) {
      onPopupClose();
    }
  });
  $('.close-btn').addEventListener('click', onPopupClose);
  window.addEventListener('pjax:success', onPopupClose);
  window.addEventListener('keyup', function(event) {
    if (event.key === 'Escape') {
      onPopupClose();
    }
  });
}

const localSearch = function(pjax) {
  if(CONFIG.search !== null && window.instantsearch && window.algoliasearch)
    return

  if(!siteSearch) {
    siteSearch = BODY.createChild('div', {
      id: 'search',
      innerHTML: '<div class="inner"><div class="header"><span class="icon"><i class="ic i-search"></i></span><div class="search-input-container"></div><span class="close-btn"><i class="ic i-times-circle"></i></span></div><div class="results"><div class="inner"><div id="search-stats"></div><div id="search-hits"></div><div id="search-pagination"></div></div></div></div>'
    });
  }

  var inputContainer = $('.search-input-container', siteSearch);
  if (inputContainer && !$('.search-input', inputContainer)) {
    inputContainer.innerHTML = '';
    var input = document.createElement('input');
    input.type = 'search';
    input.className = 'search-input';
    input.placeholder = LOCAL.search.placeholder || '';
    inputContainer.appendChild(input);
  }

  var searchInput = $('.search-input', siteSearch);
  if (!searchInput)
    return

  var searchIndex = null;
  var searchPromise = null;
  var currentHits = [];
  var currentKeywords = [];
  var currentQuery = '';
  var currentPage = 1;
  var hitsPerPage = (CONFIG.search_hits && parseInt(CONFIG.search_hits.per_page, 10)) || 10;
  if (!hitsPerPage || hitsPerPage < 1) {
    hitsPerPage = 10;
  }
  var searchTimer = null;
  var queryId = 0;

  var escapeRegExp = function(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  var escapeHtml = function(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  var normalizeText = function(text) {
    return (text || '').replace(/\s+/g, ' ').trim();
  };

  var highlight = function(text, keywords) {
    var output = escapeHtml(text);
    if (!keywords.length)
      return output;

    keywords.forEach(function(keyword) {
      if (!keyword) return;
      var reg = new RegExp(escapeRegExp(keyword), 'gi');
      output = output.replace(reg, '<em class="search-highlight">$&</em>');
    });

    return output;
  };

  var snippetFrom = function(item, keywords) {
    var text = normalizeText(item.summary || item.content || '');
    if (!text)
      return '';

    var lower = text.toLowerCase();
    var index = -1;
    keywords.forEach(function(keyword) {
      if (index === -1 && keyword) {
        var idx = lower.indexOf(keyword);
        if (idx !== -1) index = idx;
      }
    });

    if (index === -1)
      index = 0;

    var start = Math.max(0, index - 30);
    var end = Math.min(text.length, start + 120);
    var snippet = text.substring(start, end);

    if (start > 0)
      snippet = '...' + snippet;
    if (end < text.length)
      snippet = snippet + '...';

    return highlight(snippet, keywords);
  };

  var loadIndex = function() {
    if (searchPromise)
      return searchPromise;

    var url = CONFIG.root + 'index.json';
    searchPromise = fetch(url)
      .then(function(res) { return res.json(); })
      .then(function(data) {
        searchIndex = (data || []).map(function(item) {
          var categories = Array.isArray(item.categories) ? item.categories : [];
          var title = normalizeText(item.title || '');
          var summary = normalizeText(item.summary || '');
          var content = normalizeText(item.content || '');
          var categoryText = normalizeText(categories.join(' '));
          return {
            item: item,
            title: title.toLowerCase(),
            summary: summary.toLowerCase(),
            content: content.toLowerCase(),
            categories: categoryText.toLowerCase(),
            searchable: (title + ' ' + summary + ' ' + content + ' ' + categoryText).toLowerCase()
          };
        });
        return searchIndex;
      })
      .catch(function() {
        searchIndex = [];
        return searchIndex;
      });

    return searchPromise;
  };

  var calcScore = function(record, keywords) {
    var score = 0;
    var phrase = keywords.join(' ');

    keywords.forEach(function(keyword) {
      if (!keyword) return;
      if (record.title.indexOf(keyword) !== -1) score += 20;
      if (record.categories.indexOf(keyword) !== -1) score += 8;
      if (record.summary.indexOf(keyword) !== -1) score += 4;
      if (record.content.indexOf(keyword) !== -1) score += 1;
      if (record.title.indexOf(keyword) === 0) score += 8;
    });

    if (phrase && record.title.indexOf(phrase) !== -1) score += 12;

    return score;
  };

  var buildHits = function(keywords, data) {
    if (!keywords.length)
      return [];

    var results = [];
    data.forEach(function(record) {
      var matched = keywords.every(function(keyword) {
        return keyword && record.searchable.indexOf(keyword) !== -1;
      });

      if (matched) {
        results.push({
          item: record.item,
          score: calcScore(record, keywords)
        });
      }
    });

    results.sort(function(a, b) {
      return b.score - a.score;
    });

    return results.map(function(entry) {
      return entry.item;
    });
  };

  var renderStats = function(total, time) {
    var statsEl = $('#search-stats');
    if (!statsEl)
      return;
    var stats = (LOCAL.search.stats || '${hits} results found in ${time} ms')
      .replace(/\$\{hits}/, total)
      .replace(/\$\{time}/, Math.max(1, Math.round(time || 0)));
    statsEl.innerHTML = stats + '<hr>';
  };

  var renderPagination = function(totalPages) {
    var container = $('#search-pagination');
    if (!container)
      return;
    container.innerHTML = '';
    if (totalPages <= 1)
      return;

    var list = document.createElement('ul');
    list.className = 'pagination';

    var addItem = function(page, label, disabled, current) {
      var item = document.createElement('li');
      item.className = 'pagination-item';
      if (current) item.className += ' current';
      if (disabled) item.className += ' disabled-item';
      var link = document.createElement('a');
      link.className = 'page-number';
      link.innerHTML = label;
      if (!disabled) {
        link.dataset.page = page;
      }
      item.appendChild(link);
      list.appendChild(item);
    };

    addItem(currentPage - 1, '<i class="ic i-angle-left"></i>', currentPage <= 1, false);
    for (var i = 1; i <= totalPages; i++) {
      addItem(i, i, false, i === currentPage);
    }
    addItem(currentPage + 1, '<i class="ic i-angle-right"></i>', currentPage >= totalPages, false);

    container.appendChild(list);
  };

  var renderHits = function(hits, query, keywords) {
    var hitsEl = $('#search-hits');
    if (!hitsEl)
      return;

    if (!query) {
      hitsEl.innerHTML = '';
      $('#search-pagination').innerHTML = '';
      $('#search-stats').innerHTML = '';
      return;
    }

    if (!hits.length) {
      hitsEl.innerHTML = '<div id="hits-empty">' +
        (LOCAL.search.empty || '').replace(/\$\{query}/, escapeHtml(query)) +
        '</div>';
      $('#search-pagination').innerHTML = '';
      return;
    }

    var html = '';
    hits.forEach(function(item) {
      var cats = '';
      if (item.categories && item.categories.length) {
        cats = '<span>' + item.categories.map(function(cat) {
          return escapeHtml(cat);
        }).join('<i class="ic i-angle-right"></i>') + '</span>';
      }
      var title = highlight(item.title || '', keywords);
      var snippet = snippetFrom(item, keywords);
      var snippetHtml = snippet ? '<p class="search-snippet">' + snippet + '</p>' : '';
      var url = item.path || item.permalink || '#';
      if (url && !/^([a-z]+:)?\/\//i.test(url) && !url.startsWith('/')) {
        url = CONFIG.root + url.replace(/^\.?\//, '');
      }
      html += '<div class="item"><a href="' + url + '">' + cats + title + '</a>' + snippetHtml + '</div>';
    });

    hitsEl.innerHTML = html;
    if (pjax && pjax.refresh) {
      pjax.refresh(hitsEl);
    }
  };

  var renderPage = function(time) {
    var total = currentHits.length;
    var totalPages = Math.max(1, Math.ceil(total / hitsPerPage));
    if (currentPage > totalPages)
      currentPage = totalPages;
    var start = (currentPage - 1) * hitsPerPage;
    var pageHits = currentHits.slice(start, start + hitsPerPage);
    renderHits(pageHits, currentQuery, currentKeywords);
    renderStats(total, time);
    renderPagination(totalPages);
  };

  var runSearch = function() {
    var query = searchInput.value.trim();
    currentQuery = query;
    currentPage = 1;
    queryId += 1;
    var localId = queryId;

    if (!query) {
      currentHits = [];
      currentKeywords = [];
      renderHits([], '', []);
      return;
    }

    currentKeywords = query.toLowerCase().split(/\s+/).filter(Boolean).filter(function(keyword, index, list) {
      return list.indexOf(keyword) === index;
    });

    loadIndex().then(function(data) {
      if (localId !== queryId) return;
      var startTime = (window.performance && performance.now) ? performance.now() : Date.now();
      currentHits = buildHits(currentKeywords, data);
      var endTime = (window.performance && performance.now) ? performance.now() : Date.now();
      renderPage(endTime - startTime);
    });
  };

  var paginationEl = $('#search-pagination');
  if (paginationEl) {
    paginationEl.addEventListener('click', function(event) {
      var target = event.target;
      if (target.tagName === 'I') {
        target = target.parentNode;
      }
      if (!target || !target.dataset.page)
        return;
      var page = parseInt(target.dataset.page, 10);
      if (!page || page === currentPage)
        return;
      currentPage = page;
      renderPage(0);
    });
  }

  searchInput.addEventListener('input', function() {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(runSearch, 200);
  });

  searchInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  });

  const onPopupClose = function() {
    document.body.style.overflow = '';
    transition(siteSearch, 0);
  };

  const onPopupOpen = function() {
    document.body.style.overflow = 'hidden';
    transition(siteSearch, 'shrinkIn', function() {
      searchInput.focus();
    });
  };

  $.each('.search', function(element) {
    element.addEventListener('click', function(event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      onPopupOpen();
    });
  });
  bindSearchTrigger(onPopupOpen);

  siteSearch.addEventListener('click', function(event) {
    if (event.target === siteSearch) {
      onPopupClose();
    }
  });

  $('.close-btn', siteSearch).addEventListener('click', onPopupClose);
  window.addEventListener('pjax:success', onPopupClose);
  window.addEventListener('keyup', function(event) {
    if (event.key === 'Escape') {
      onPopupClose();
    }
  });

  loadIndex();

  if (LOCAL.path && /(^|\/)search\/?$/.test(LOCAL.path)) {
    onPopupOpen();
  }
}
