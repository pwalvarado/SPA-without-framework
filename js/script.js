$(function () {

  checkboxes.click(function () {
    // The checkboxes in our app serve the purpose of filters.
    // Here on every click we add or remove filtering criteria from a filters object.

    // Then we call this function which writes the filtering criteria in the url hash.
    createQueryHash(filters);
  });

  $.getJSON('products.json', function (data) {
    // Get data about our products from products.json.

    // Call a function that will turn that data into HTML.
    generateAllProductsHTML(data);

    // Manually trigger a hashchange to start the app.
    $(window).trigger('hashchange');
  });

  $(window).on('hashchange', function () {
    // On every hash change the render function is called with the new hash.
    // This is how the navigation of our app happens.
    render(decodeURI(window.location.hash));
  });

  // This function decides what type of page to show
  // depending on the current url hash value.
  function render(url) {
    // Get the keyword from the url.
    var temp = url.split('/')[0];

    // Hide whatever page is currently shown.
    $('.main-content .page').removeClass('visible');

    var map = {

      // The Homepage.
      '': function () {

        // Clear the filters object, uncheck all checkboxes, show all the products
        filters = {};
        checkboxes.prop('checked', false);

        renderProductsPage(products);
      },

      // Single Products page.
      '#product': function () {

        // Get the index of which product we want to show and call the appropriate function.
        var index = url.split('#product/')[1].trim();

        renderSingleProductPage(index, products);
      },

      // Page with filtered products
      '#filter': function () {

        // Grab the string after the '#filter/' keyword. Call the filtering function.
        url = url.split('#filter/')[1].trim();

        // Try and parse the filters object from the query string.
        try {
          filters = JSON.parse(url);
        }

        // If it isn't a valid json, go back to homepage ( the rest of the code won't be executed ).
        catch (err) {
          window.location.hash = '#';
        }

        renderFilterResults(filters, products);
      },

    };

    // Execute the needed function depending on the url keyword (stored in temp).
    if (map[temp]) {
      map[temp]();
    }

    // If the keyword isn't listed in the above - render the error page.
    else {
      renderErrorPage();
    }
  }

  // Uses Handlebars to create a list of products using the provided data.
  // This function is called only once on page load.
  function generateAllProductsHTML(data) {
    var $list = $('.all-products .products-list');

    var theTemplateScript = $('#products-template').html();

    //Compile the template​
    var theTemplate = Handlebars.compile(theTemplateScript);
    $list.append(theTemplate(data));

    // Each products has a data-index attribute.
    // On click change the url hash to open up a preview for this product only.
    // Remember: every hashchange triggers the render function.
    $list.find('li').on('click', function (e) {
      e.preventDefault();

      var productIndex = $(this).data('index');

      window.location.hash = 'product/' + productIndex;
    });
  }

  // Hides and shows products in the All Products Page depending on the data it recieves.
  function renderProductsPage(data) {
    var $page = $('.all-products'),
      allProducts = $('.all-products .products-list > li');

    // Hide all the products in the products list.
    allProducts.addClass('hidden');

    // Iterate over all of the products.
    // If their ID is somewhere in the data object remove the hidden class to reveal them.
    allProducts.each(function () {

      var that = $(this);

      data.forEach(function (item) {
        if (that.data('index') == item.id) {
          that.removeClass('hidden');
        }
      });
    });

    // Show the $page itself.
    // (the render function hides all $pages so we need to show the one we want).
    $page.addClass('visible');
  }

  // Shows the Single Product Page with appropriate data.
  function renderSingleProductPage(index, data) {
    var $page = $('.single-product'),
      container = $('.preview-large');

    // Find the wanted product by iterating the data object and searching for the chosen index.
    if (data.length) {
      data.forEach(function (item) {
        if (item.id == index) {
          // Populate '.preview-large' with the chosen product's data.
          container.find('h3').text(item.name);
          container.find('img').attr('src', item.image.large);
          container.find('p').text(item.description);
        }
      });
    }

    // Show the $page.
    $page.addClass('visible');
  }

  // Crates an object with filtered products and passes it to renderProductsPage.
  function renderFilterResults(filters, products) {
    // This array contains all the possible filter criteria.
    var criteria = ['manufacturer', 'storage', 'os', 'camera'],
      results = [],
      isFiltered = false;

    // Uncheck all the checkboxes.
    // We will be checking them again one by one.
    checkboxes.prop('checked', false);

    criteria.forEach(function (c) {

      // Check if each of the possible filter criteria is actually in the filters object.
      if (filters[c] && filters[c].length) {

        // After we've filtered the products once, we want to keep filtering them.
        // That's why we make the object we search in (products) to equal the one with the results.
        // Then the results array is cleared, so it can be filled with the newly filtered data.
        if (isFiltered) {
          products = results;
          results = [];
        }

        // In these nested 'for loops' we will iterate over the filters and the products
        // and check if they contain the same values (the ones we are filtering by).

        // Iterate over the entries inside filters.criteria (remember each
        // criteria contains an array).
        filters[c].forEach(function (filter) {

          // Iterate over the products.
          products.forEach(function (item) {

            // If the product has the same specification value as the one in the filter
            // push it inside the results array and mark the isFiltered flag true.

            if (typeof item.specs[c] == 'number') {
              if (item.specs[c] == filter) {
                results.push(item);
                isFiltered = true;
              }
            }

            if (typeof item.specs[c] == 'string') {
              if (item.specs[c].toLowerCase().indexOf(filter) != -1) {
                results.push(item);
                isFiltered = true;
              }
            }

          });

          // Here we can make the checkboxes representing the filters true,
          // keeping the app up to date.
          if (c && filter) {
            $('input[name=' + c + '][value=' + filter + ']').prop('checked', true);
          }
        });
      }

    });

    // Call the renderProductsPage.
    // As it's argument give the object with filtered products.
    renderProductsPage(results);
  }

  function renderErrorPage() {
    // Shows the error page.
  }

  function createQueryHash(filters) {
    // Get the filters object, turn it into a string and write it into the hash.
  }

});
