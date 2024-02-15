/***
Spot SDK Overview
======================

## Who should read this document?

This is a technical document, **intended for users with Javascript, HTML and CSS experience**.

It's aim is to explain how to use the Spot SDK to integrate Spot functionality on a Shopify store.

**If you're non-technical** or you're looking to install Spot on a free theme on Shopify, or a relatively standard theme, it is recommended that you **use the configurable Spot "section" 
installed via the Spot control panel**. It works by default with at least the following themes:

* Simple
* Minimal
* Brooklyn
* Narrative
* Supply
* Venture
* Boundless
* Debut
* Dawn

## What exactly is the Spot SDK?

The **Spot SDK** is a [single javascript file](/docs/spot.js) ([minified](/docs/spot.min.js)), which provides all spot functionality in an easy-to-digest package. 
The SDK consists of three separate classes, in a layered architecture, each [defined below](#core-classes).

You should **not** link to these files directly from your website; please download a copy, and upload to Shopify's CDN, or use the [Spot setup section](/setup).

### What aspects of a website does it handle interact with/handle?

The Spot SDK interacts with a merchant's collection page, and search page, and to a very minor extent, the merchant's product pages.

### What does the SDK *not* provide out of the box?

The Spot SDK provides quite a lot. However, sometimes custom features that are specific to a merchant's site do need to be built. Spot's SDK does not provide any of the following out of the box:

* An entirely new theme.
* A new homepage design.
* A completely custom product tile that integrates perfectly with an existing custom theme. This should be provided, or the default should be at least styled by the integrator.
* A completely custom instant search bar that integrates perfectly with an existing custom theme. This should be provided, or the default should be at least styled by the integrator.
* A quick buy modal on the collection listing page. This is up to the integrator to provide.
* The ability to upload, edit or delete color swatch images, or the ability to display swatches to the product display page, or the collections page. This is up to the interator.
* The ability to provide a system where alternate images to show on products on hover. This is up to the integrator. By default, we will show the most appropriate image for a product or variant.
* Automatic translation of untranslated products. (Though it does work with Shopify's multi-language data, if it is present).
* The ability to provide solutions to unelicited requirements.

### Core Classes

There are three core classes in Spot's SDK. A high-level sample implementation (`SpotDefault`), a low-level state tracker (`SpotDOM`), and a means of sending requests to the HTTPS endpoint (`SpotAPI`).

#### [SpotDefault](#spotdefault-documentation)

This class contains a **sample high-level implementation** that uses the two below classes. It implements these features:

* Faceting Pane
* Recommendations Panel
* Pagination Selector
* Infinite Scroll
* Search-as-you-Type
* Product Result Listing
* Spell Correction Display

This is called directly by the Spot section (`spot.liquid`), that works out-of-the-box with all free themes on Shopify.

#### [SpotDOM](#spotdom-documentation)

This class contains a **higher-level API**, which keeps track of things like page state, and facet composition, allowing you to easily build things like a
pagination mechanism, a sorting dropdown, a faceting panel, a search bar, that sort of thing. *You normally won't need to use this directly.*

#### [SpotAPI](#spotapi-documentation)

This class contains the **low-level API**. It lets you construct queries, send them to Spot, and get a JSON representation of the objects you want back. This
is the bare minimum you'll need to create a Spot implementation on a website. *You normally won't need to use this directly.*

## Theme Section (spot.liquid)

`spot.liquid` is a sample invocation of `SpotDefault`. You can retrieve the `spot.liquid` section from [spot's setup section](/setup). This is how most themes
will interact with the Spot SDK.

## Conventions

### Casing

By default, the SpotSDK will *always* use **camelCase** when dealing with **variables, methods**, and most other data. It will use **TitleCase** when dealing with **class names**.

### No Modification

In an ideal world, **there should be no modification of `spot.js`**, as new versions of the file are pushed out regulary, and merging them can be onerous. If you
find you need to modify `spot.js` during what you would consider to be fairly normal operations, please contact us, and let us know what you're doing! We'd
be happy to add it to the API if it doesn't exist, or give clarification about how to perform a particular operation.

The generally accepted way, if you need to modify the underlying Spot classes, is to override the individual methods, and call the original methods, while
modifying their output. As a brief example, if you wanted to modify how the system generates queries in general, you'd place inside the `init` parameter call 
in `SpotDefault.init`, something like the following:

```javascript
  var oldGenerateQuery = spotDOM.generateQuery;
  spotDOM.generateQuery = function() {
    var query = oldGenerateQuery();
    query = query.available(true);
    return query;
  };
```

## Are there are sample implementations of Spot?

You can see https://merchman-filters.myshopify.com for a sample implementation of the system, or look at [SpotDefault](#spotdefault-documentation) below.

## Where can I go to get help?

You can contact spot@moddapps.com to get more infromation, or visit our SDK guide at https://spot.moddapps.com/docs, which will have a few more examples.

If you're internal to Modd, or to Diff, you can feel free to reach out to the `#spot` channel, on Slack.

## Found a bug?

If you've found a bug, please tell us at the address above! If you do file a bug report, please include the following information.

1. Your .myshopify.com URL.
2. The time at which the bug ocurred.
3. Whether or not the bug is consistently repeatable.

**If your bug is with the Spot API itself**, meaning that you are not getting the expected result from the search service, please also include:

1. The full request you're sending. (Including all Request Headers)
2. The full response you're receiving. (Including all Response Headers)

If you have a browser debugger active, this information can usually be found under the "Network" tab.

**If your bug is with the Spot SDK**, please ensure that you haven't modified `spot.js` (or if you have, that none of the modifications have any effect on the bug at hand). In this case, be sure to include the following information.

1. A link to preview the Shopify theme on the store where you're seeing the issue.
2. Any actions to take that will reproduce the problem.

## [Endpoint Details](#spot-endpoint-documentation)

In addition to this SDK, there are also a few details on the actual endpoint itself, that is directly queriable in HTTP, should you be in an environment that does not support JavaScript.

***/

/***

SpotAPI Documentation
=====================

## Overview

### What is this class?

This is the low-level query API for Spot. What this means is, this is how you talk to Spot directly, without any intervening modules.

### When should I use it?

If you're trying to implement a collections page with various filters, you should not use this directly. You should use [SpotDom](#spotdom-documentation) which
provides a lot of time-saving functionality, built over top of this. If you need/want to talk to the shopify product index directly, this is what
you should use.

### How do I use it?

The first step to using this module is to instantiate it, as an object, with new. Like below:

    var spotAPI = new SpotAPI({{ shop.metafields.esafilters.clusters | json }});

You can treat this as a global object; you really only ever need to make one of these. The object keeps track of some global options
(stuff like which filters server to point at, whether to use JSONP, GET, or POST, etc..), you'd like to use for all your queries.
It has sensible defaults, so you don't really need to customize anything unless you really want to; it should just work.

Once you've made the object, you can start making queries. A query is also an object. To start a query, type:

    var query = spotAPI.s();

This will instantiate a query object. Queries record most of the stuff you want to communicate to filters, like what collection you'd
like to look up, what colors of things you want to see, the price range, the pagination, etc.., etc... To specify these things, you make
method calls on the query object, like you would a normal javascript object. There are a bunch of different fields to choose from; and you
can choose exactly what you want to query, by passing desired paramters to the query object. There are a number examples in the querying
section below.

The query object keeps track of all operations you perform on it. As you're constructing your query, no remote calls to the server have been made yet,
you're just assembling your request in javascript. Once you've finished querying things, and are ready to finish up, call e(), on the object.

    query.e()

This will make a query to the server. This function returns a jQuery-style deferred (you can also pass in a success function to it).
What this means is that you can then make things happen depending on what the result of the query is. So, instead of just calling e()
(which does nothing), you can tell it to do things after we get our data back from Spot.

    query.e().done(function(products) {
      console.log(products);
    });

This will dump all the products that matched your query to the console. You can do whatever you like, though, build HTML, amend the page,
whatever you like.

In summary, as an example:

    new SpotAPI({{ shop.metafields.esafilters.clusters | json }}).s().product_type("T-Shirt").e().done(function(products) {
      console.log(products);
    });

Will output a list of all products that have the product type of T-Shirt to the console.

## Querying Basics

### Filtering

Say for example, you want to get all products, that have the vendor "My Vendor" in the store. After instanting the query, you do:

    query = query.vendor("My Vendor");

or

    query = query.vendor("==", "My Vendor");

The operator can be changed to any of the following: ==, !=, ^, in, not_in.


This will add the requirement that you only want red products to the query. You can also chain queries together. Let's say you've made
the call above, and now you decide you also want to restrict things to those products under 100$, and only hats. So, you'd then do:

    query = query.price("<", 100).product_type("Hat");

The list of full properties that can be queried is as follows: "id", "price", "grams", "compare_at_price", "inventory_quantity", "priority", "title", "option1", "option2", "option3", "product_type", "vendor","tags", "sku", "product_metafield", "variant_metafield", "option", "available".

Metafields and options work a bit differently, as you have to specify the name of the option, or the namespace and key of the metafield , like so:

    query = query.option("Color", "==", "Red")

    query = query.product_metafield("myKey", "myNamspace", "<", 100)

In addition to the normal operators, you can also perform and and or queries:

    query = spotAPI.s().and(query1, query2)

    query = spotAPI.s().or(query1, query2)

### Searching

Searching works much like regular filtering; you can also narrow down *any* resultset with free-text searches.

    query = query.search("Red Dresses")

    query = query.in_search("Red Dresses")

The difference between the two of these is that the top one will affect sort order (ranking by relevancy), whereas the second will act purely as a filter.

Almost always, you'll want to use the first one.

#### Spell Checking

By default you can also have your results spelling-corrected.

    query = query.search("Red Drasses")

This will likely automatically return "Red Dresses", if that exists in your catalog. The rules of the spell check are also returned under the `spellCheck` key in the options
arugment of the `done` function. Allowing you to easily construct "Did you mean?" dialogs.

This behaviour can be turned off by using `.autoCorrect(false)`.

You can also just use `.spellCheck(true).autoCorrect(false)` to get the results of the spellcheck, if you want to manage how that works yourself, and not have the user's search
be autoCorrected to a most likely correct search.

### Collections

You can also restrict searches to occur inside a particular collection with one of two operators.

    query = query.collection("my-collection-handle")

    query = query.in_collection("my-collection-handle")

The difference here is that collection should be used whenever you're on a particular collection's page, or if you need to operate in the context of that collection. It lets you do things like sort by the sort order of that collection, and a couple of other things. in_collection should be used when you need to use it as part of a query; or if you're creating collection unions.

### Sorting

#### Default Sort Orders

Sorting can be used in various ways. The normal Shopify sorting strings that exist on the default front-end of Shopify can be passed to the query object to change the sort order
of the object. As an example:

    query = query.sort("alpha-asc")

You can also, more intuitively pass an object to this function, and specify the sort direction independent of the sort field, like so:

    query = query.sort({ "asc": "alpha"})

#### Collection Sort Order

Using the sort order "manual" will sort the collection via the collection's specified manual ordering. Please note that this *only* applies when the query has a collection associated with it.

    query = query.sort("manual")

#### Search Sort Order

Using the sort order `"search"` will sort the resultset based on the most relevant results for a given search term. Please note that this *only* applies when a search term has been provided with `.search`

    query = query.search("My Search Terms")

The above query will automatically set the sort order to `"search"` if their has been no previous sort order set. You can reset a query's sort order back to `"search"` explicitly by doing:

    query = query.sort("search")

#### Priority Sort Order

Uses the priorities set in the spot back-end control panel to order the resultset.

    query = query.sort("priority")

#### Custom Sort Order

You can also specify a non-standard sort order; like sorting on a named option, or a metafield, if you've specified it in the Spot control panel.

    query = query.sort({"option":"Size"})

    query = query.sort({"product-metafield":{"namespace":"key"}})


### Variant-Level Querying

Variant-level functionality is a significant advantage that Spot has over other search engines on Shopify. From the get-go Spot was built to work
with Shopify's variant system, so you have a number of extra operators open to you that are specifically designed to make your life easier.

By default, resultsets are returned the same way Shopify normally returns things; as products. For example, if you ask for a "Red T-Shirt", and
there's a T-Shirt product, that has at least one variant that's red, we'll return the whole product, and all its variants. However, if you
use the allVariants property, like so, you'll receive a product cotaining ONLY the variants that match.

    query.option("Color", "Red").product_type("T-Shirt").allVariants(false).e().done(function(products) {
      console.log(products);
    });

If you want to narrow your search/query/filter to include ONLY products in which all variants match your query, you can do the following,
much as with and/or:

    spotAPI.s().all(query.option("Color", "Red").product_type("T-Shirt")).allVariants(false).e().done(function(products) {
      console.log(products);
    });

The above would only return you T-Shirts that have "Red" as the only color option.

In addition, Spot also lets you specify what's known as an "index-split", using the "split" property, like so.

    query.split("my-color-split").e().done(function(products) {
      console.log(products);
    });

By default, the split value is "none", which is always valid. Other splits must be pre-defined in the Spot back-end, but can do things like
break out the variants of each product by a named option, or a metafield. So, for example, if you set up a split on "Color" as an option, in
the back-end of Spot, and then activate it as above, what'll happen is your catalog will segment into one "product" per group of variants that have
a disctinct value of the particular option. For example, if you have a T-Shirt that is Red, Green, or Blue in Color, and has sizes from XS, S, M, L, XL,
for a total of 15 variants; specifying a color split will split this into 3 separate products, with 5 variants each.

You can also, simply split across all options, meaning that it'll split your catalog into one variant, one product; allowing you to see everything
at the variant-level.

## ResultSet Basics

### ResultSet Counting

To see the count included as part of the results, you can do:

    query = query.count(true)

By default, this will return the count how many products there are in a resultset. Normally, Spot will do an *approximate* count. This is significantly faster
that doing an actual count. For example, if your resultset is 10,000 products long; an approximate count allows us to really only grab the first hundred or so
products then extrapolate what an approximation of what the count is likely to be. This is usually pretty accurate, and very fast.

However, we recognize that under certain circumstances, it can be desirable to retrieve the *exact* amount of results. This takes longer, and necessitates more
computational power being devoted to your store (and a corresponding increase in cost), but it is possible, via the following call:

    query = query.count(true, "exact")

This will return the count as a second argument when you complete a query:

    query.e().done(function(products, count) {
      console.log(count);
    });


### ResultSet Faceting

#### Simple Faceting

This can be done via the .options query. In this, you can do something like:

    query = query.options(["product_type"])

Which will show you all the product types, as well as their counts. This information can be found in the third argument to "done", the full response body:

    query.e().done(function(products, count, resposne) {
      console.log(response);
    });

You can also facet on more than one facet at a time.

    query = query.options(["product_type", "vendor", {"option":"Size"}])

You can also be more specific, if you want only a subset of facets.

    query = query.options([{"product_type":["Dress", "Shoes"]}, "vendor", {"option":"Size"}])

#### Disjunctive Facet Counts

Now, when you get options back, usually you'll present these to the uesr as clickable facets. Frequently, you'll want to display counts next to the facets as well.
Normally, counts are simply the numbers of each facet in the resultset. However, there's usually an exception in the case of counts dispalyed for facets that are in the same category
as a facet that has been selected; that facet is usually stripped when computing the counts.

As an example, let's say you're faceting on Color and Product Type. For color we return the following result: `{"option":{"Color":{"Red":10,"Blue":"20","Green":15}}`.
If you're not clicking any of these facets, the counts are correct. Let's say the user then clicks on your "Red" facet. This of course reduces the resultset to the following: `{"option":{"Color":{"Red":10}}`.
This however, is not desirable. In traditional faceting schemes, the user is expecting the facet counts to be represented *as if there was no facet applied in the category in question*. The actual
result the user is expecting is still `{"option":{"Color":{"Red":10,"Blue":"20","Green":15}}`, despite having the facet selected.

This can be achieved by specifying the conditions that you apply are located under an `or` array, inside a `facets` array. For example, instead of the following to represent someone
clicking the "Red" facet:

    query.option("Color", "Red").options([{"option":"Color"}, "product_type"])

You want to do this:

    query.facets(spotAPI.s().option("Color", "Red"), spotAPI.s()).options([{"option":"Color"},"product_type"])

Likewise, if you wanted to use a product type facet, you'd do this:

    query.facets(spotAPI.s(), spotAPI.s().product_type("Jeans")).options([{"option":"Color"},"product_type"])

This is all handled for you if you use the SpotDOM SDK; but if you're writing your own DOM module, you'll need to wrap your options like that. Not only will this let spot know
that you explicitly want to have a particular query parameter be part of a facet, but it will also inform Spot's back-end analytics engine about your facet use.

#### Facet Grouping

In addition to faceting normally; you can also group facet values together, into a single facet. This is useful for stuff like
groups of product types, or colors. You can also do the same thing for groups of product prices.

##### Qualitative Groups

As an example for grouping together lists of items:

    query = query.options([
      {"product_type":[{"name":"Dresses","value":["Dress","Knit Dress","Jupe"]},{"name":"Coats","value":["Winter Jacket","Pea Coat"]}]}
      {"option":{"Color":[{"name":"Red","value":["Red","Magenta","Purple"]},{"name":"Blue","value":["Blue","Aqua","Cyan"]}]}}
    ])

##### Quantitative Groups

Here's an example for grouping things together based on an item's price.

    query = query.options([
      {"type":"price","name":"Price","values":[
        {"name":"Under 10$","value":"-10"},
        {"name":"10-20 $","value":"10-20"},
        {"name":"20-30 $","value":"20-30"},
        {"name":"30-40 $","value":"30-40"},
        {"name":"40-50 $","value":"40-50"},
        {"name":"50-60 $","value":"50-60"},
        {"name":"Over 60$","value":"60+"}
      ]}
    ])

### Multi-Target Search

A search or query can be targeted towards other things than `products`, like `pages`, `blogs`, `articles`, `collections` and `popularSearches`. 

The targets for a search can be specified like so

    query = query.targets(["products", "collections", "pages", "popularSearches"]).e().done(function(products, count, results) { })
  
Whatever the first target is, is listed as the *primary target*. By default, this is set to products, and only products are searched. If you add more than
one target, they can be accessed in the options paramater of the done function, as shown above, under the variables `results.collections`, `results.pages`, etc.. 

## Examples

All the following examples below can be run in the Chrome debugger console, on any page in a Shopify store which includes this file, and instantiates
the SpotAPI. Try them out, to get a feel of exactly what happens!

Gets all products.

    spotAPI.s().e(function(products, count) {
      console.log(products);
    });

Gets all products in collection "my-collection-handle", over 10$ and under 20$, paginated by 50, on page 2, sorted by vendor.

    spotAPI.s().collection("my-collection-handle").price(">=", 10).price("<", 20).paginate(50).page(2).sort("price").e().done(function(products, count) {
      console.log(products);
    });

All products in collection "my-collections-handle" NOT over 10$ and under 20$, all with the vendor "My Vendor" that are available for purchase.

    spotAPI.s().collection("my-collection-handle").vendor("My Vendor").or(spotAPI.s().price("<", 10), spotAPI.s().price(">=", 20)).available(true).paginate(50).page(2).e(function(products, count) {
      console.log(products);
    });

Gets the first 50 results of a search page, for "Gold" performing a spelling correction if no results were found.,

    spotAPI.s().search("Gold").autoCorrect(true).paginate(50).e(function(products, count, options) {
      console.log(products);
    });

Uses JSONP to get the first 5 products in the store, sorted by the store owner's preference.

    spotAPI.s().jsonp(1).sort("priority").paginate(5).e(function(products) {
      console.log(products);
    });

Set a default for all queries to be 48 products, and only show things that have the tag "Showing", and always sort by bestselling.

    spotAPI.defaultQuery(spotAPI.s().paginate(48).tag("Showing").sort("bestselling"));
    spotAPI.s().page(4).e(function(products) {
      console.log(products);
    });

Filters based on options

    spotAPI.s().option("Color", "Red").paginate(48).e(function(products) {
      console.log(products);
    });
  
Searches through other targets than just products:

    spotAPI.s().targets(["products", "pages", "popularSearches"]).search("my search string").paginate(48).e(function(products, count, results) {
      console.log(products);
      console.log(results.pages);
      console.log(results.popularSearches);
    });
  

****************************************************************/


window.SpotAPI = window.SpotAPI || function(clusters, silenceErrors) {
  // ========== BEGIN INTERNALS =============
  // These are mostly internals, and can be ignored.
  var spotAPI = this;
  this._silenceErrors = silenceErrors || 0;
  this._defaultQuery = null;
  this._jsStyle = true; // set false to get Shopify backend object style
  this._fakeSessionStorage = {};
  this.clone = function(obj) {
    return new queryObject([], {}).merge(obj);
  };

  this.getStorage = function(key) {
    var item = null;
    try {
      item = localStorage.getItem(key)
    } catch(error) {
      item = spotAPI._fakeSessionStorage[key];
    }
    if (!item)
      return null;
    var json = JSON.parse(item);
    if (!json['expiry'] || json['expiry'] > new Date().getTime())
      return json['value'];
    return null;
  };
  this.setStorage = function(key, value, expiry) {
    var json = { "value": value };
    if (expiry)
      json['expiry'] = (new Date().getTime())+(expiry*1000);
    try {
      localStorage.setItem(key, JSON.stringify(json));
    } catch(error) {
      spotAPI._fakeSessionStorage[key] = JSON.stringify(json);
    }
  };

  this.baseHostnames = [];
  this.successfulHostname = null;
  this.basePath = "/";
  this.baseHeaders = {};
  this._sessionId = this.getStorage("spotSessionId");


  // Customer identifier, can be cart token, or some other unique identifier. If no identifier is specified, the system will
  // attempt to use IP to disambiguage in a single session. This will allow for things like personalized recommendations, event tracking, and the like.
  // By default this should probably be the Shopify session ID. If you do not specify one, you will be assigned one via a response header.
  // Generally, PII should not be transmitted here for privacy reasons, so this should be kept to things like IDs, and other non-identifiable
  // information.
  this.sessionId = function(sessionId) {
    if (sessionId) {
      this._sessionId = sessionId;
      this.setStorage("spotSessionId", sessionId);
      return this;
    } else {
      return this._sessionId;
    }
  };

  this.clusters = function(clusters) {
    this.baseHostnames = clusters;
    return this.baseHostnames;
  };
  if (clusters)
    this.clusters(clusters);
  this.path = function(path) {
    this.basePath = path;
    return this.basePath;
  };
  // This should generally be used in situations where query params need to be injected *outside* of the normal search parameters.
  // Things like tokens, sessions, etc..
  this.headers = function(defaults) {
    this.baseHeaders = defaults;
    return this;
  }


  this.encodeUrlVars = function(hash) {
    var query = "";
    var keys = Object.keys(hash).sort();
    for (var keyIdx = 0; keyIdx < keys.length; ++keyIdx) {
      var key = keys[keyIdx];
      if (typeof hash[key] == "object") {
        for (var i in hash[key])
          query += (query == "" ? "" : "&") + key + "=" + encodeURIComponent(hash[key][i]);
      }
      else
        query += (query == "" ? "" : "&") + key + "=" + encodeURIComponent(hash[key]);
    }
    return query;
  };

  var DeferredObject = function() {
    // true is success, false is fail, null is pending.
    var deferred = this;
    this.state = null;
    this.payload = null;

    this._doneHandlers = [];
    this._failHandlers = [];
    this._alwaysHandlers = [];

    this.resolve = function() {
      deferred.payload = arguments;
      deferred.state = true;
      while (deferred._doneHandlers.length > 0) {
        var handler = deferred._doneHandlers.shift();
        handler.apply(deferred, deferred.payload);
      }
      return deferred;
    };
    this.reject = function() {
      deferred.payload = arguments;
      deferred.state = false;
      while (deferred._failHandlers.length > 0) {
        var handler = deferred._failHandlers.shift();
        handler.apply(deferred, deferred.payload);
      }
      return deferred;
    };
    this.done = function(handler) {
      if (deferred.state === true)
        handler.apply(deferred, deferred.payload);
      else
        deferred._doneHandlers.push(handler);
      return deferred;
    };
    this.fail = function(handler) {
      if (this.state === false)
        handler.apply(deferred, deferred.payload);
      else
        deferred._failHandlers.push(handler);
      return deferred;
    };
    this.always = function(handler) {
      if (this.state != null) {
        handler.apply(deferred, deferred.payload);
      } else {
        deferred._doneHandlers.push(handler);
        deferred._failHandlers.push(handler);
      }
      return deferred;
    };
    this.then = function(doneHandler, failHandler) {
      if (doneHandler)
        this.done(doneHandler);
      if (failHandler)
        this.fail(failHandler);
      return this;
    };
  };

  this.Deferred = function() {
    return new DeferredObject();
  };

  // Boiler-plate.
  this.ajax = function(url, options, baseHostnames, deferred, attempt) {
    var i;
    var spotAPI = this;
    if (!baseHostnames) {
      baseHostnames = this.baseHostnames;
      // Go through, and insert the successful hostname at the front, if we succeeded.
      if (this.successfulHostname) {
        for (i = 1; i < baseHostnames.length; ++i) {
          if (baseHostnames[i] == this.successfulHostname) {
            var swap = baseHostnames[0];
            baseHostnames[0] = baseHostnames[i];
            baseHostnames[i] = swap;
            break;
          }
        }
      }
    }
    if (!baseHostnames[0]) {
      deferred = deferred || this.Deferred();
      deferred.reject();
      return deferred;
    }
    if (!options)
      options = {};
    if (!options['dataType'])
      options['dataType'] = 'json';
    var method = options['type'] || "GET";
    if (options['data'] && options['contentType'] == 'json' && typeof(options.data) == "object" && options['type'] && options['type'] != "GET")
      options['data'] = JSON.stringify(options.data);
    // We are careful with this. If contentType is anything other than text/plan, it'll trigger a pre-flight request. So always specify a content-type of text. The server will know what we mean.
    options['contentType'] = 'text/plain';
    if (!options['headers'])
      options['headers'] = {}
    Object.keys(this.baseHeaders).filter(function(e) { return !options['headers'][e]; }).forEach(function(e) { options['headers'][e] = spotAPI.baseHeaders[e]; });
    if (url.charAt(0) != '/') {
      if (baseHostnames[0] != "/")
        options['url'] = (baseHostnames[0].indexOf('localhost') == 0 ? "http:" : "") + "//" + baseHostnames[0] + this.basePath + url;
      else
        options['url'] = this.basePath + url;
    } else {
      options['url'] = url;
    }

    if (!options['headers']['Content-Type'] && options['contentType'] && method != "GET") {
      if (options['contentType'] == "json") {
        options['headers']['Content-Type'] = "application/json; charset=UTF-8";
      } else {
        options['headers']['Content-Type'] = options['contentType'];
      }
    }

    if (!deferred)
      deferred = this.Deferred();

    var xhttp = new XMLHttpRequest();
    var internalDeferred = this.Deferred();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4) {
        if (this.status >= 200 && this.status <= 299) {
          var sessionId = xhttp.getResponseHeader("X-Session-Id");
          if (sessionId)
            spotAPI.sessionId(sessionId);
          if (options['dataType'] == "json") {
            var data = null;
            try {
              data = JSON.parse(this.responseText)
            }
            catch (e) {
              internalDeferred.reject(this, "" + e, e);
            }
            internalDeferred.resolve(data);
          }
          else
            internalDeferred.resolve(this.responseText);
        } else
          internalDeferred.reject(this, this.responseText, null);
      }
    };
    url = options['url'];
    if ((options['type'] || "GET") == "GET") {
      if (url.indexOf("?") == url.length - 1)
        url += this.encodeUrlVars(options['data']);
      else if (url.indexOf("?") != -1)
        url += "&" + this.encodeUrlVars(options['data']);
      else
        url += "?" + this.encodeUrlVars(options['data']);
    }
    // We keep this as a query variable because otherwise we'll trigger a CORS preflight request.
    if (this._sessionId)
      url += (url.indexOf("?") == -1 ? "?" : "&") + "sessionId=" + encodeURIComponent(this._sessionId);
    xhttp.open(method, url, options['async'] == null ? true : options['async']);
    Object.keys(options['headers']).forEach(function(i) {
      xhttp.setRequestHeader(i, options['headers'][i]);
    });
    internalDeferred.done(function() {
      spotAPI.successfulHostname = baseHostnames[0];
      deferred.resolve.apply(this, arguments);
    }).fail(function(xhr) {
      if (!xhr.status || (xhr.status >= 500 || xhr.status == 408)) {
        // Execute the query a second time, 200ms later, in case there's some
        // odd transient fault. This should be rare, but if it occurs, will
        // keep them using the system normally. It should also not trigger on
        // window unload in Safari; hopefully.
        if (!attempt || attempt == 1) {
          setTimeout(function() {
            spotAPI.ajax(url, options, baseHostnames, deferred, 2);
          }, 200);
        } else {
          if (baseHostnames.length > 1) {
            baseHostnames.shift();
            spotAPI.ajax(url, options, baseHostnames, deferred, 1);
          } else {
            deferred.reject.apply(this, arguments);
          }
        }
      } else {
        deferred.reject.apply(this, arguments);
        spotAPI.successfulHostname = baseHostnames[0];
      }
    });

    xhttp.send(options['data']);

    return deferred;
  };

  this.map = function(items, func) {
    return Array.prototype.slice.call(items).map(func);
  };
  this.flatMap = function(items, func) {
    return Array.prototype.slice.call(items).flatMap(func);
  };
  this.forEach = function(items, func) {
    return Array.prototype.slice.call(items).forEach(func);
  };
  this.grep = function(items, func) {
    return Array.prototype.slice.call(items).filter(func);
  };
  // ============== END INTERNALS ==============


  // If false, will throw out errors as alerts. If true, will silently fail. Default is true.
  this.silenceErrors = function(silence) {
    this._silenceErrors = silence;
  };

  // This can be used to set the default query that comes out when you call .s() to start a query.
  this.defaultQuery = function(query) {
    if (arguments.length == 1)
      this._defaultQuery = this.clone(query);
    return this._defaultQuery;
  };


  // QUERY INTERFACE.
  function generateQualitativeQuery(field, operator, text, boost) {
    if (!operator)
      operator = "==";
    var hash = {};
    hash[field] = { };
    hash[field][operator] = text;
    if (boost)
      hash[typeof(boost) == "object" ? "boost" : "weight"] = boost;
    return new queryObject(hash);
  }
  function generateQuantitativeQuery(field, operator, text, boost) {
    if (!operator)
      operator = "==";
    var hash = {};
    hash[field] = { };
    hash[field][operator] = text;
    if (boost)
      hash[typeof(boost) == "object" ? "boost" : "weight"] = boost;
    return new queryObject(hash);
  }

  var queryObject = function(query, attributes) {
    var i;
    if (query && typeof(query) == "object" && !Array.isArray(query))
      query = [query];
    this.innerQuery = query || [];
    this.innerAttributes = attributes || {};
    this.innerJSONP = 0;
    this.innerHostname = null;
    this.innerMethod = "GET";
    this.innerCache = null;
    this.innerSessionId = null;

    // Used for analytics.
    this.category = function(category) {
      return this.merge(new queryObject(null, { category: category }));
    };

    // Internal.
    this.merge = function(otherQuery) {
      if (Array.isArray(otherQuery)) {
        this.innerQuery = this.innerQuery.concat(otherQuery);
        return this;
      }
      if (otherQuery.innerQuery)
        this.innerQuery = this.innerQuery.concat(otherQuery.innerQuery);
      for (var i in otherQuery.innerAttributes) {
        //if (this.innerAttributes[i] && !spotAPI._silenceErrors)
        //	alert("Query is overwriting " + i + " during merge.");
        this.innerAttributes[i] = otherQuery.innerAttributes[i];
      }
      this.innerJSONP = this.innerJSONP || otherQuery.innerJSONP;
      this.innerHostname = this.innerHostname || otherQuery.innerHostname;
      if (otherQuery.innerCache != null)
        this.innerCache = otherQuery.innerCache;
      return this;
    };

    var quantitativeFields = ["id", "price", "grams", "compare_at_price", "inventory_quantity", "priority"];
    var qualitativeFields = ["handle", "title", "option1", "option2", "option3", "product_type", "vendor", "tag", "tags", "sku"];
    var booleanFields = ["available"];

    // Performs a free-form text search; triggers spellcheck if autoCorrect or spellCheck has been set to true.
    this.search = function(text) {
      return this.merge(new queryObject(null, { search: { query: text } }));
    };

    // Puts this query into "collection mode", changing the query slightly. Will make it so that it'll only return products in that collection.
    // If given no sort order, will default the collection's default sort order. Can also give the extra, special sort order, "manual" to use
    // the collection's manual sorting, if present.
    this.collection = function(collection_handle) {
      return this.merge(new queryObject(null, { collection: collection_handle }));
    };

    // Acts as a filter; doesn't do anything with sort orders; simply helps pare down the resultset to things in a particular collection.
    // Allows you to do cool things, like collection unions/intersections.
    this.in_collection = function(operator, handle, weight) {
      if (arguments.length == 1) {
        handle = operator;
        operator = "==";
      }
      return this.merge(generateQualitativeQuery("collection", operator, handle, weight));
    };
    // Acts as a filter; doesn't do anything with sort orders; simply helps pare down the resultset to things matching this particular search term.
    this.in_search = function(operator, handle, weight) {
      if (arguments.length == 1) {
        handle = operator;
        operator = "==";
      }
      return this.merge(generateQualitativeQuery("search", operator, handle, weight));
    };


    this.isEmptyQuery = function() {
      return this.innerQuery.length == 0;
    };

    this.hostname = function(hostname) {
      this.innerHostname = hostname;
      return this;
    }
    this.cache = function(cache) {
      this.innerCache = cache;
      return this;
    }
    this.omitExtraneousResults = function(value) {
      this.innerAttributes["omitExtraneousResults"] = value;
      return this;
    }
    this.popular = function(popular) {
      this.innerPopular = popular;
      return this;
    };
    this.boost = function(boost) {
      this.innerAttributes["boost"] = Array.isArray(boost) ? boost : boost.innerQuery;
      return this;
    };
    this.targets = function(targets) {
      this.innerAttributes["targets"] = targets;
      return this;
    };

    // operators are <, >, ==, !=, >=, <=, in, not_in. == is assumed by default.
    for (i = 0; i < quantitativeFields.length; ++i) {
      var closure = function(i) {
        return function(operator, operand, boost) {
          if (!spotAPI._silenceErrors && arguments.length < 1)
            alert("Requires an operator and operand, or just an operand if assuming ==.");
          if (arguments.length == 1) {
            operator = "==";
            operand = operator;
          }
          return this.merge(generateQuantitativeQuery(quantitativeFields[i], operator, operand, boost));
        };
      };
      this[quantitativeFields[i]] = closure(i);
    }
    // operators are  ==, !=, in, =~, ^, $, sub, in, not_in
    for (i = 0; i < qualitativeFields.length; ++i) {
      this[qualitativeFields[i]] = (function(i) {
        return function(operator, operand, boost) {
          if (arguments.length == 1) {
            operand = operator;
            operator = "==";
          }
          return this.merge(generateQualitativeQuery(qualitativeFields[i], operator, operand, boost));
        };
      })(i);
    }

    // operators are ==, !=
    for (i = 0; i < booleanFields.length; ++i) {
      this[booleanFields[i]] = (function(i) {
        return function(operator, bool, boost) {
          if (!spotAPI._silenceErrors && arguments.length < 1)
            alert("Requires an operator and operand, or just an operand if assuming ==.");
          if (arguments.length == 1) {
            bool = operator;
            operator = "==";
          }
          return this.merge(generateQualitativeQuery(booleanFields[i], operator, bool, boost));
        };
      })(i);
    }

    this.singularly_qualified_field = function(field_name, name, operator, operand, boost) {
      var hash = {};
      hash[name] = {};
      if (arguments.length == 3) {
        operand = operator;
        operator = "==";
      }
      if (!operator)
        operator = "==";
      hash[name][operator] = operand;
      var top_level = {}
      top_level[field_name] = hash;
      if (boost)
        top_level[typeof(boost) == "object" ? "boost" : "weight"] = boost;
      return this.merge(new queryObject(top_level));
    };

    this.option = function(name, operator, operand, boost) { return arguments.length == 2 ? this.singularly_qualified_field("option", name, operator) : this.singularly_qualified_field("option", name, operator, operand, boost); }
    this.product_custom_field = function(name, operator, operand, boost) { return arguments.length == 2 ? this.singularly_qualified_field("product-custom-field", name, operator) : this.singularly_qualified_field("product-custom-field", name, operator, operand, boost); }
    this.variant_custom_field = function(name, operator, operand, boost) { return arguments.length == 2 ? this.singularly_qualified_field("variant-custom-field", name, operator) : this.singularly_qualified_field("variant-custom-field", name, operator, operand, boost); }

    this.product_metafield = function(namespace, key, operator, operand, boost) {
      var hash = {};
      hash[namespace] = {};
      hash[namespace][key] = {};
      if (arguments.length == 3) {
        operand = operator;
        operator = "==";
      }
      if (!operator)
        operator = "==";
      hash[namespace][key][operator] = operand;
      if (boost)
        hash[typeof(boost) == "object" ? "boost" : "weight"] = boost;
      return this.merge(new queryObject({ "product-metafield": hash }));
    };
    this['product-metafield'] = this.product_metafield;

    this.variant_metafield = function(namespace, key, operator, operand, boost) {
      var hash = {};
      hash[namespace] = {};
      hash[namespace][key] = {};
      if (arguments.length == 3) {
        operand = operator;
        operator = "==";
      }
      if (!operator)
        operator = "==";
      hash[namespace][key][operator] = operand;
      if (boost)
        hash[typeof(boost) == "object" ? "boost" : "weight"] = boost;
      return this.merge(new queryObject({ "variant-metafield": hash }));
    };
    this['variant-metafield'] = this.variant_metafield;

    // This is used internally by the faceting system; in terms of filtering, this is a no-op.
    this.facets = function() {
      if (arguments.length >= 1 && !Array.isArray(arguments[0])) {
        if (arguments.length > 1)
          return this.merge(new queryObject({ "facets": spotAPI.map(arguments, function (e) { return e.innerQuery; }) }));
        else
          return this.merge(new queryObject({ "facets": arguments[0].innerQuery }));
      }
      else if (Array.isArray(arguments[0])) {
        return this.facets.apply(this, arguments[0]);
      }
      return this;
    };
    
    // This is used internally by the faceting system; in terms of filtering, this is a no-op.
    this.boundaries = function() {
      if (arguments.length >= 1 && !Array.isArray(arguments[0])) {
        if (arguments.length > 1)
          return this.merge(new queryObject({ "boundaries": spotAPI.map(arguments, function (e) { return e.innerQuery; }) }));
        else
          return this.merge(new queryObject({ "boundaries": arguments[0].innerQuery }));
      }
      else if (Array.isArray(arguments[0])) {
        return this.facets.apply(this, arguments[0]);
      }
      return this;
    };


    // Possibly some more optimizations can take place here.
    this.or = function() {
      if (arguments.length >= 1 && !Array.isArray(arguments[0])) {
        if (arguments.length > 1)
          return this.merge(new queryObject({ "or": spotAPI.map(arguments, function (e) { return e.innerQuery; }).flat() }));
        else
          return this.merge(new queryObject({ "or": arguments[0].innerQuery }));
      }
      else if (Array.isArray(arguments[0])) {
        return this.or.apply(this, arguments[0]);
      }
      else if (arguments.length == 0) { // Now that we're specifying facets as part of the query sometimes we need to pass in empty ors instead of ignoring empty facet groups
        return this.merge(new queryObject({ "or": spotAPI.map(arguments, function (e) { return e.innerQuery; }) }));
      }
      return this;
    };

    this.and = function() {
      if (arguments.length >= 1) {
        if (arguments.length > 1)
          return this.merge(new queryObject({ "and": spotAPI.map(arguments, function (e) { return e.innerQuery; }) }));
        else
          return this.merge(arguments[0]);
      }
      else if (Array.isArray(arguments[0]))
        return this.and.apply(this, arguments[0]);
      return this;
    };

    // Makes it so that this subquery must match EVERY variant instead of at >= 1 variant.
    this.all = function() {
      return this.merge(new queryObject({ "all": spotAPI.map(arguments, function (e) { return e.innerQuery; }) }));
    };

    // Valid fields for sorting are: "bestselling", "title", "price", "created", "priority".
    this.sort = function(field) {
      if (typeof(field) == "string") {
        var groups = /(\w+)-(ascending|descending)/.exec(field);
        if (groups && groups.length > 1) {
          if (groups[2] == "descending") {
            field = { desc: groups[1] };
          } else {
            field = { asc: groups[1] };
          }
        }
      }
      return this.merge(new queryObject(null, { sort: field }));
    };

    // Valid values here are "none", "auto", or an explicitly created split in the admin panel.
    // "none" will return an unsplit resultset; "auto" will return a split if it's appropriate based
    // on which facets have been selected, and an explicit split will always return that split.
    this.split = function(splitHandle) {
      return this.merge(new queryObject(null, { split: splitHandle }));
    };

    // If set to true, will return the total count of objects in the resultset.
    // You can also set whether you want to get an exact count, or an approximate count.
    // Be warned, that setting an exact count can significantly slow down your search times,
    // as well as drive up your costs, as the server may have to do significantly more work
    // to determine the exact size of a resultset.
    this.count = function(field, behavior) {
      if (behavior)
        return this.merge(new queryObject(null, { count: field, countBehavior: behavior }));
      return this.merge(new queryObject(null, { count: field }));
    };

    // Sets how many results you'd like in your resulset. .rows and .limit are aliases of htis.
    this.paginate = function(pageAmount) {
      pageAmount = parseInt(pageAmount);
      if (pageAmount < 0 || pageAmount > 1000)
        alert("Must be a number between 0 and 1000");
      return this.merge(new queryObject(null, { rows: pageAmount }));
    };
    this.rows = this.paginate;
    this.limit = this.paginate;

    // Using this will skip over CORS headers for compatibility reasons; shouldn't really ever have to be used.
    this.jsonp = function(jsonp) {
      this.innerJSONP = jsonp;
      return this;
    }

    // Specifies which page you'd like; starts from 1; default 1.
    this.page = function(page) {
      return this.merge(new queryObject(null, { page: page }));
    };

    // Specifies which locale you'd like. If not specified, assumes the store's primary locale.
    this.locale = function(locale) {
      return this.merge(new queryObject(null, { locale: locale }));
    };

    // Specifies which currency you'd like. If not specified, assumes store default currency.
    // Note, this will *only* affect your input. (i.e. your desired price filters, and facets). It will
    // *not*, affect pricing. That should be converted after the fact to whatever is required.
    this.currency = function(currency) {
      return this.merge(new queryObject(null, { currency: currency }));
    };

    // If set to true, when a .search is made, will check to see if any results are found on the input string; and if not, will report
    // a better match in the "spellCheck" attribute of the returned object, based on a heuristic.
    this.spellCheck = function(spellCheck) {
      return this.merge(new queryObject(null, { spellCheck: spellCheck }));
    };

    // If set to true, when a .search is made, will check to see if any results are found on the input string; and if not, will select
    // a better match, as well as report this info in the "spellCheck" attribute based on a heuristic, and search on that instead.
    this.autoCorrect = function(autoCorrect) {
      return this.merge(new queryObject(null, { autoCorrect: autoCorrect }));
    };

    // This is kept in for legacy reasons; doesn't do anything.
    this.index = function(index) {
      return this.merge(new queryObject(null, { index: index }));
    };

    // By default this is true; if set to false will make it so that ONLY variants match the query will be returned, rather than the entire variantset of any matching product.
    this.allVariants = function(allVariants) {
      return this.merge(new queryObject(null, { allVariants: allVariants }));
    };


    // Options can be passed like this ["product_type", "vendor", {"option":"Color"}, {"option":"Size"}, {"price": ["-10","10-20","20-40","40+"]}, {"tag": ["tag1", "tag2"]}, {"tag":{"^":"beginwtithis:"}}]
    // Likewise, you can also specify if you want the counts to ignore conditions on their counts.
    // I.E. If you have a product type condition, and are looking at product type, setting ignoreOptionConditions
    // to true will cause the system to ignore that condition while calculating the counts.
    // Price will go from 0-10, 10-20, 30-40, 40+
    // Disjunctive, by default is true, and refers to whether or not the system should recalculate the resultset per faceting group, if relevant (i.e. if you've selected "Red" as a color, it shouldn't affect the other color options.
    // Behaviour, by default is "approximate".
    this.facetOptions = function(options, disjunctive, behaviour) {
      var hash = { options: options };
      if (behaviour != null)
        hash['optionBehavior'] = behaviour;
      if (disjunctive != null)
        hash['optionDisjunctive'] = disjunctive;
      return this.merge(new queryObject(null, hash));
    };
    this.options = this.facetOptions;
    
    // Boundaries can be passed like this: [{"max":"price"},{"min":"price"}].
    this.boundaryOptions = function(boundaries) {
      return this.merge(new queryObject(null, { boundaries: boundaries }));
    };

    // Can restrict fields in the following manner. ["id", "handle"]
    // Useful for reducing the amount of time spent downloading the search results, which can be quite a while.
    // Processing time will be longer, though.
    this.fields = function(fieldListing) {
      return this.merge(new queryObject(null, { fields: fieldListing }));
    };

    // Chooses whether or not to make a GET or a POST call. Sites with larger queries may have to set this to true.
    // Eventually you'll be able to supply "auto" here, which will be the default, which will have the system choose based
    // on payload length which to use.
    this.post = function(post) {
      if (post)
        this.innerMethod = "POST";
      else
        this.innerMethod = "GET";
    };

    // Convenience function to request 0 rows, and only get options.
    this.optionsOnly = function(doneFunc) {
      return this.paginate(0).end(doneFunc);
    }

    // When done constructing the query, this should be called to actually make the query; the result is contianed in the deferred.
    this.end = function(doneFunc) {
      var deferred = spotAPI.Deferred();
      if (doneFunc)
        deferred.done(doneFunc);

      if (this.innerPopular && this.innerAttributes.search)
        this.innerAttributes.search.popular_searches = this.innerPopular;
      var stringified = JSON.stringify({ query: this.innerQuery, attributes: this.innerAttributes });
      // If we're more than 8k, switch this to a POST so that the server doesn't spew out a "header too large" error. Also, Safari seems to have trouble with GETs, pushing them to POST.
      var method = this.innerMethod != "GET" || (stringified.length >= 3*1024) || /^((?!chrome|android).)*safari/i.test(navigator.userAgent) ? "POST" : "GET";
      var hash = method == "POST" ? stringified : {"q": stringified };

      var queryHash = {};
      if (this.innerHostname)
        queryHash['hostname'] = this.innerHostname;
      else if (window.Shopify)
        queryHash['hostname'] = window.Shopify.shop;
      if (this.innerCache)
        queryHash['cache'] = this.innerCache;

      var query = spotAPI.map(Object.keys(queryHash), function(e) { return e + "=" + encodeURIComponent(queryHash[e]) }).join("&");

      // Make this easier to flip over to POST.
      spotAPI.ajax((query || (!this.innerCache && this.innerCache != null) ? "?" + query : "") + (!this.innerCache && this.innerCache != null ? "cache=false" : ""), {
        type: method,
        dataType: (this.innerJSONP && method != "POST" ? "jsonp" : "json"),
        contentType: "application/json",
        data: hash
      }).done(function(results) {
        if (results['products'])
          deferred.resolve((spotAPI._jsStyle ? spotAPI.map(results.products, spotAPI.convertProduct ) : results.products), results.count, results);
        else if (results['collections'])
          deferred.resolve((spotAPI._jsStyle ? spotAPI.map(results.collections, spotAPI.convertCollection ) : results.collections), results.count, results);
        else if (results['blogs'])
          deferred.resolve(results.blogs, results.count, results);
        else if (results['articles'])
          deferred.resolve(results.articles, results.count, results);
        else if (results['pages'])
          deferred.resolve(results.pages, results.count, results);
      }).fail(function(xhr) {
        deferred.reject(xhr);
      });
      return deferred;
    };
    this.e = this.end;
  };

  this.start = function() {
    if (this._defaultQuery)
      return this.clone(this._defaultQuery);
    return new queryObject();
  };
  this.startEmpty = function() {
    return new queryObject();
  };
  this.s = function() {
    return this.start();
  };
  this.se = function() {
    return this.startEmpty();
  };

  this.spellCheck = function(phrase) {
    var deferred = spotAPI.Deferred();
    spotAPI.ajax("/spell-check", {
      type: "GET",
      dataType: "json",
      contentType: "json",
      data: { "phrase": phrase }
    }).done(function(result) {
      deferred.resolve(result.words, result.original, result.corrected);
    }).fail(function() {
      deferred.reject();
    });
  }

  this.getFeaturedImage = function(product) {
    if (product.images && product.images.length > 0) {
      var i;
      var extantImages = {};
      var extantVariants = {};
      for (i = 0; i < product.images.length; ++i)
        extantImages[product.images[i].id] = product.images[i];
      var relevant = false;
      for (i = 0; i < product.variants.length; ++i) {
        if (product.variants[i].relevant)
          relevant = true;
      }

      for (i = 0; i < product.variants.length; ++i) {
        if (!relevant || product.variants[i].relevant)
          extantVariants[product.variants[i].id] = product.variants[i];
      }
      var validFeatured = false;
      // var presumablyAllVariants = true;
      for (i = 0; i < product.images[0].variant_ids.length; ++i) {
        if (!extantVariants[product.images[0].variant_ids[i]]) {
          // presumablyAllVariants = false;
        } else {
          validFeatured = true;
        }
      }
      if (!validFeatured) {
        for (i = 0; i < product.variants.length; ++i) {
          if ((!relevant || product.variants[i].relevant) && extantImages[product.variants[i].image_id])
            return extantImages[product.variants[i].image_id];
        }
      }
      return product.images[0];
    }
    return null;
  };

  this.convertCollection = function(collection) {
    return collection;
  };

  // Converts the incoming product to .js format from .json format.
  this.convertProduct = function(product) {
    var feproduct = {}, o, i, v;
    feproduct['id'] = product.id ? product.id : product.variant[0].product_id ;
    feproduct['title'] = product.title;
    feproduct['handle'] = product.handle;
    feproduct['description'] = product.body_html;
    feproduct['published_at'] = product.published_at;
    feproduct['created_at'] = product.created_at;
    feproduct['vendor'] = product.vendor;
    feproduct['type'] = product.product_type;
    if (product.tags)
      feproduct['tags'] = product.tags.split(", ");
    feproduct['images'] = product.images ? spotAPI.map(product.images, function(e) { return e.src }) : [];
    feproduct['featured_image'] = spotAPI.getFeaturedImage(product);
    if (feproduct['featured_image'])
      feproduct['featured_image'] = feproduct['featured_image'].src;
    feproduct['options'] = null;
    if (product.images.length > 0)
      feproduct['url'] = product.handle ? ("/products/" + product.handle + (feproduct['featured_image'] != product.images[0].src ? "?variant=" + product.variants[0].id  : "")) : null;
    else
      feproduct['url'] = product.handle ? "/products/" + product.handle : null;
    feproduct['available'] = false;
    feproduct['price_min'] = null;
    feproduct['price_max'] = null;
    feproduct['compare_at_price_min'] = null;
    feproduct['compare_at_price_max'] = null;
    feproduct['metafields'] = {};
    if (product.metafields) {
      for (i = 0; i < product.metafields.length; ++i){
        var metafield = product.metafields[i];
        if (!feproduct['metafields'][metafield.namespace])
          feproduct['metafields'][metafield.namespace] = {}
        feproduct['metafields'][metafield.namespace][metafield.key] = metafield.value;
      }
    }

    if (product.options) {
      feproduct['options'] = [];
      for (o in product.options) {
        feproduct['options'].push({
          "name": product.options[o].name,
          "position": product.options[o].position,
          "values": product.options[o].values
        });
      }
    }

    var varimages = {};
    if (product.images) {
      for (i = 0; i < product.images.length; ++i)
        varimages[product.images[i].id] = product.images[i];
    }


    if (product.variants) {
      var variants = [];
      feproduct['variants'] = [];
      for (v in product.variants) {
        var convert_price = function(s) {
          if (s == null)
            return null;
          return Number(s.replace(".", ""));
        };

        var myoptions = [];
        if (product.variants[v].option1) {
          myoptions.push(product.variants[v].option1);
        }
        if (product.variants[v].option2) {
          myoptions.push(product.variants[v].option2);
        }
        if (product.variants[v].option3) {
          myoptions.push(product.variants[v].option3);
        }

        var vprice = convert_price(product.variants[v].price);
        var vcompare_at = convert_price(product.variants[v].compare_at_price);

        var imageid = null;
        if (product.variants[v].image_id) {
          imageid = varimages[product.variants[v].image_id];
        }

        if (feproduct['price_min'] == null || feproduct['price_min'] > vprice) {
          feproduct['price_min'] = vprice;
        }

        if (feproduct['price_max']== null || feproduct['price_max']< vprice) {
          feproduct['price_max']= vprice;
        }
        if (feproduct['compare_at_price_min'] == null || feproduct['compare_at_price_min'] > vcompare_at) {
          feproduct['compare_at_price_min'] = vcompare_at;
        }

        if (feproduct['compare_at_price_max']== null || feproduct['compare_at_price_max'] < vcompare_at) {
          feproduct['compare_at_price_max'] = vcompare_at;
        }
        if (product.variants[v].inventory_policy == "continue" || product.variants[v].inventory_quantity > 0 || product.variants[v].inventory_management != "shopify") {
          feproduct['available'] = true;
        }

        var variant = {
          "id": product.variants[v].id,
          "title": product.variants[v].title,
          "option1": product.variants[v].option1,
          "option2": product.variants[v].option2,
          "option3": product.variants[v].option3,
          "sku": product.variants[v].sku,
          "requires_shipping": product.variants[v].requires_shipping,
          "taxable": product.variants[v].taxable,
          "featured_image": imageid,
          "available": true,
          "name": product.title + " - " + product.variants[v].title,
          "public_title": product.variants[v].title,
          "options": myoptions,
          "price": vprice,
          "weight": product.variants[v].weight,
          "compare_at_price": vcompare_at,
          "inventory_quantity": product.variants[v].inventory_quantity,
          "inventory_management": product.variants[v].inventory_management,
          "inventory_policy": product.variants[v].inventory_policy,
          "barcode": product.variants[v].barcode
        };

        if (product.variants[v].relevant)
          variant['relevant'] = product.variants[v].relevant;

        variants.push(variant);
      } //endfor variants
      feproduct['variants'] = variants;
    }

    feproduct['compare_at_price_varies'] = true;
    if (feproduct['compare_at_price_max'] == feproduct['compare_at_price_min']) {
      feproduct['compare_at_price_varies'] = false;
    }

    feproduct['price_varies'] = true;
    if (feproduct['price_min'] == feproduct['price_max']) {
      feproduct['price_varies'] = false;
    }

    feproduct['price'] = feproduct['price_min'];
    feproduct['compare_at_price'] = feproduct['compare_at_price_min'];

    return feproduct;
  };

  this.EventObject = function(type, arg1, arg2, arg3) {
    this.type = type;
    this.arg1 = arg1;
    this.arg2 = arg2;
    this.arg3 = arg3;

    this.name = function(){
      switch(this.type) {
        case 1:
          return "New Session";
        case 2:
          return "Logged In";
        case 3:
          return "Clicked Product";
        case 4:
          return "Added Product To Cart";
        case 5:
          return "Completed Order";
        default:
          return "unknown";
      }
    }
  };


  this._eventSink = null;

  this.eventSink = function(value) {
    if (arguments.length == 1) {
      this._eventSink = value;
      return this;
    }
    return this._eventSink;
  };

  this.sendEvents = function(events) {
    if (this.eventSink() == "spot") {
      var args = Object.values(events.arg1);
      // Don't send off search events (those are logged automatically).
      return this.ajax("/events", { type: "POST", dataType: "json", contentType: "json", data: { "events": [this.map(this.grep(events, function(e) { return e.type; }), function(e) { return { type: e.type, arg1: args[0], arg2: args[1], arg3: args[2] } })] } }).fail(function(xhr){
        if (xhr.status == 400)
          this.eventSink(null);
      });
    } else if (this.eventSink() == "ga") {
      for (var i = 0; i < events.length; ++i) {
        var event = events[i];
        var params = event.arg1;
        if(params == null)
          params = {}
        if (typeof(window.gtag) != "undefined") {
          window.gtag('event', event.name(), params);
        } else if (typeof(window.ga) != "undefined") {
          var data = {
            'eventCategory': 'search',
            'eventAction': event.name(),
            'eventLabel': "" + Object.keys(params)[0] + ": " + Object.values(params)[0]
          }
          window.ga('send', 'event', data);
        }
      }
      return this.Deferred().resolve(null);
    } else {
      return this.Deferred().resolve(null);
    }
  };

  this.sendEvent = function(event) {
    this.sendEvents([event]);
  };
};

/***

SpotDOM Documentation
=====================

## Overview

### Who should use this class?

You should *not* use this class directly, most of the time; use `SpotDefault`. You should use this class only if you need to directly query or hook the internal state of Spot.

### What does this class do?

SpotDOM is a class that facilitates cleanly keeping *state* on a website using Spot. Whereas SpotAPI is a low-level querying interace that simply assists in constructing ajax requests,
SpotDOM helps assemble DOM elements, and maintain the state of what the user's looking at as they navigate through a product catalog. It intelligently keeps track of things like
page, active facets, current search, current sort order, stuff like that. It also provides easy ways to hook into it, and then render whatever DOM elements you think are appropriate.

### How do I use it? Give me a quickstart!

SpotDOM primarily uses the publisher-observer pattern to provide a layered architecutre. Ideally, most Spot-enhanced websites will have a 3-layered JS implementation. The first layer,
is the SpotAPI layer. This is the low level API. Above it, SpotDOM will sit, providing state, and helper functions. Above that, your own JS implementation will be sitting.
Primarily, what your implementation will do is register callback handlers with SpotDOM, which, depending on what's changing, will let you then render whatever HTML you'd like to render, or
affect the browser in whatever way you want. By default, SpotDOM does *not* affect the DOM, or the user's browser in *any* way; all this is done through callback handlers.

Essentially you'll want to instantiate this object like so:

    // Filters Integration
    window.spotAPI = window.spotAPI || new SpotAPI({{ shop.metafields.esafilters.clusters | json }});
    // Useful if multiple domains/domain switches occur.
    spotAPI.defaultQuery(spotAPI.s().hostname("{{ shop.permanent_domain }}"));
    window.spotDOM = window.spotDOM || new SpotDOM(spotAPI);

Below that, you can provide a number of options to the system; the easiest way to get started, is to ask for a basic facet pane, with the facets based on options that have been set up by the Spot back-end control panel.

    var options = {
      {% if template contains 'search' %}
        sections: {% if shop.metafields.esafilters.search-faceting %}{{ shop.metafields.esafilters.search-faceting | json }}{% else %}{% if shop.metafields.esafilters.general-faceting %}{{ shop.metafields.esafilters.general-faceting | json  }}{% else %}[]{% endif %}{% endif %}
      {% else %}
        sections: {% if collection and collection.metafields.esafilters.collections-faceting %}{{ collection.metafields.esafilters.collections-faceting | json  }}{% else %}{% if shop.metafields.esafilters.general-faceting %}{{ shop.metafields.esafilters.general-faceting | json  }}{% else %}[]{% endif %}{% endif %}
      {% endif %}
    };

    var sampleFacetPane = new window.spotDefault.FacetPane();
    for (var i = 0; i < sections.length; ++i) {
      if (sections[i].active)
        window.spotDOM.addFacet(new spotDOM.Facet(sections[i])).init();
    }
    document.body.appendChild(sampleFacetPane.element);

This will pop a facet pane onto your page, with generic HTML. You should inspect this function in this file if you really want to create your own facet pane with fancy functionality; this function doesn't do any magic, and only
uses the normal callback interface.

Alternatively, if you want to just test with how things COULD be, you can simply populates the facets with something static:

    options = {
      sections: [{"type":"tag","name":"Gender",values:[{"name":"Men","value":"Man"},{"name":"Women","value":"Woman"}]}, "Product Type", "Size",{"type":"vendor","name":"Vendor"},{"type":"price","name":"Price","values":[{"name":"Under 10$","value":"-10"},{"name":"10-20 $","value":"10-20"},{"name":"20-30 $","value":"20-30"},{"name":"30-40 $","value":"30-40"},{"name":"40-50 $","value":"40-50"},{"name":"50-60 $","value":"50-60"},{"name":"Over 60$","value":"60+"}]}]
    };

You also need to tell Spot how you'd want to render your products, so you'll want to register the 'products' callback handler. Here's a sample implementation.

    window.spotDOM.products(function(products) {
      $('.productgrid--items').empty();
      for (var i = 0; i < products.length; ++i) {
        var product = products[i];
        var productElement = $("<article class='productgrid--item imagestyle--natural productitem--emphasis' data-product-item tabindex='1'>\
        <div class='productitem' data-product-item-content>\
          <a class='productitem--image-link' href='" + product.url + "'>\
          <figure class='productitem--image'>\
          " + (product.featured_image ? "<img src='" + this.getSizedImage(product.featured_image, "275x275") + "'/>" : '<svg class="placeholder--image" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 525.5 525.5"><path d="M324.5 212.7H203c-1.6 0-2.8 1.3-2.8 2.8V308c0 1.6 1.3 2.8 2.8 2.8h121.6c1.6 0 2.8-1.3 2.8-2.8v-92.5c0-1.6-1.3-2.8-2.9-2.8zm1.1 95.3c0 .6-.5 1.1-1.1 1.1H203c-.6 0-1.1-.5-1.1-1.1v-92.5c0-.6.5-1.1 1.1-1.1h121.6c.6 0 1.1.5 1.1 1.1V308z"></path><path d="M210.4 299.5H240v.1s.1 0 .2-.1h75.2v-76.2h-105v76.2zm1.8-7.2l20-20c1.6-1.6 3.8-2.5 6.1-2.5s4.5.9 6.1 2.5l1.5 1.5 16.8 16.8c-12.9 3.3-20.7 6.3-22.8 7.2h-27.7v-5.5zm101.5-10.1c-20.1 1.7-36.7 4.8-49.1 7.9l-16.9-16.9 26.3-26.3c1.6-1.6 3.8-2.5 6.1-2.5s4.5.9 6.1 2.5l27.5 27.5v7.8zm-68.9 15.5c9.7-3.5 33.9-10.9 68.9-13.8v13.8h-68.9zm68.9-72.7v46.8l-26.2-26.2c-1.9-1.9-4.5-3-7.3-3s-5.4 1.1-7.3 3l-26.3 26.3-.9-.9c-1.9-1.9-4.5-3-7.3-3s-5.4 1.1-7.3 3l-18.8 18.8V225h101.4z"></path><path d="M232.8 254c4.6 0 8.3-3.7 8.3-8.3s-3.7-8.3-8.3-8.3-8.3 3.7-8.3 8.3 3.7 8.3 8.3 8.3zm0-14.9c3.6 0 6.6 2.9 6.6 6.6s-2.9 6.6-6.6 6.6-6.6-2.9-6.6-6.6 3-6.6 6.6-6.6z"></path></svg>') + "\
          </figure>\
        </a>\
        <div class='productitem--info'>\
          <div class='productitem--price'>\
          <div class='price--compare-at visible' data-price-compare-at=''>\
          <span class='price--spacer'></span>\
          </div>\
          <div class='price--main' data-price=''>\
          <span class='money' data-currency-usd='" + this.formatMoney(product.price/100) + "' data-currency='USD'>" + this.formatMoney(product.price/100) + "</span>\
          </div>\
          </div>\
          <h2 class='productitem--title'>\
          <a href='" + product.url + "' tabindex='1'>\
          " + (options['split'] && options['split'] == "none" ? product.title : this.getProductTitle(product)) + "\
          </a>\
          </h2>\
          <div class='productitem--description'>\
          <p>" + product.description + "</p>\
          <a href='" + product.url + "' class='productitem--link'>\
          View full details\
          </a>\
          </div>\
        </div>\
        </div>\
        </article>");
        $('.productgrid--items').append(productElement);
      }
    })

This function is called whenever a query is made. As you can see from the sample above, an array of products is given, and then turned into HTML. Speaking of, if you're using paging as your pagination mechanism, you'll
probably want change the pagination listing whenever query count/page changes. For that, you simply hook whenver the count is refreshed, and redraw pagination.

    window.spotDOM.count(function(count) {
      var elements = this.pagedPaginationHelper({ count: count });
      $('.pagination--inner').empty();
      for (var i = 0; i < elements.length; ++i)
        $('.pagination--inner').append(elements[i]);
    })

You can also write out a "we're searching for X" if you're using spellcheck; this can be rendered like so: (TODO: this regex shouldn't be necessary).

    window.spotDOM.spellCheck(function(spellCheck){
      if (spellCheck.original.replace(/(^\s+|\s+$|[^A-Za-z0-9]+)/g, "").toLowerCase() != spellCheck.corrected.replace(/(^\s+|\s+$|[^A-Za-z0-9]+)/g, "").toLowerCase()) {
        $('#spelling-correction').show();
        $('#spelling-correction').html("<p class='corrected'>Showing results for <a href='/search?q=" + encodeURIComponent(spellCheck.corrected) + "'>" + $.map(spellCheck.words, function(e) { if (e.corrected != e.original) { return "<b>" + e.corrected + "</b>"; } return e.corrected; }).join(" ") + "</a>.</p>");
      } else {
        $('#spelling-correction').hide();
      }
    })

You'll also probably want to keep the query string up to date so that it can be interpreted by the system. If you want to do that, all you need to do is the following:

    window.spotDOM.query(function() {
      window.spotDOM.updateQueryString();
    });

That will update the query string for you. Most implementation of Spot will also generally want to make a new query every time any propertry of the search changes, like sort, page, etc... In those cases, all you need
to do is do something like the following:

    window.spotDOM.sort(function(sortOrder) {
      this.query();
    }).collection(function(collection) {
      this.query();
    }).search(function(search) {
      this.query();
    }).split(function(split) {
      this.query();
    }).page(function(page) {
      this.query();
    }).paginate(function(resultsPerPage) {
      this.query();
    });

This will make it so whenever any property changes, we automatically re-perform a query. The automatic facet panel does this automatically by default, whenever you click a facet. However, if you wanted to make an "apply" button
where things would only apply when you clicked that button; you'd simply remove these declarations, and in your facet pane, also remove any handler that calls .query(), and you'd suddenly have a facet panel/page that only queries
when *you* want it to.

There are probably also a few other things you want to do, like hook up a select dropdown that handles sort order (can easily be done by something like):

    var sortDropdown = $('#product_grid_sort');
    sortDropdown.empty();
    window.spotDOM.addSortOrder(function(sortOrder) {
      sortDropdown.append("<option id='" + sortOrder.getUniqueId() + "' value='" + sortOrder.getUniqueId() + "'>" + sortOrder.getName() + "</option>");
      if (sortDropdown.find("option").length > 0)
        sortDropdown.show();
    }).removeSortOrder(function(sortOrder) {
      $('#' + sortOrder.getUniqueId()).remove();
      if (sortDropdown.find("option").length == 0)
        sortDropdown.hide();
    });
    sortDropdown.unbind('change');
    sortDropdown.change(function() { window.spotDOM.sort($(this).val() == "best" ? "bestselling" : $(this).val()); });
    window.spotDOM.initDefaultSortOrders();
    window.spotDOM.sort(sortDropdown.val(), false);

You can see a more exhaustive list of individual methods below.

**/

window.SpotDOM = window.SpotDOM || function(spotAPI) {
  var spotDOM = this;
  this.spotAPI = spotAPI;
  if (!spotAPI)
    throw "Requires SpotAPI. Please pass a copy of the API to SpotDOM's constructor.";
  this.log = function(message) { if (console != undefined) console.log(message); };
  this.map = spotAPI.map;
  this.grep = spotAPI.grep;
  this.getStorage = spotAPI.getStorage;
  this.setStorage = spotAPI.setStorage;

  this.getUrlVars = function() {
    var vars = {}, hash;
    var href = window.location.href;
    href = href.replace(/#.*?$/, '');
    if (href.indexOf('?') == -1 || href.indexOf('?') == href.length-1)
      return {};
    var hashes = href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++) {
      hash = hashes[i].split('=');
      if (vars[hash[0]] == null)
        vars[hash[0]] = decodeURIComponent(hash[1] != null ? hash[1].replace(/\+/g, ' ') : '');
      else {
        if(typeof vars[hash[0]] == "string")
          vars[hash[0]] = [vars[hash[0]]];
        vars[hash[0]].push(decodeURIComponent(hash[1] != null ? hash[1].replace(/\+/g, ' ') : ''));
      }

    }
    return vars;
  };

  this.encodeUrlVars = function(hash) { return "?" + spotAPI.encodeUrlVars(hash); }


  this.defaultDiacriticsRemovalMap = [
    {'base':'a', 'letters':'\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250'},
    {'base':'aa','letters':'\uA733'},
    {'base':'ae','letters':'\u00E6\u01FD\u01E3'},
    {'base':'ao','letters':'\uA735'},
    {'base':'au','letters':'\uA737'},
    {'base':'av','letters':'\uA739\uA73B'},
    {'base':'ay','letters':'\uA73D'},
    {'base':'b', 'letters':'\u0062\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253'},
    {'base':'c', 'letters':'\u0063\u24D2\uFF43\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184'},
    {'base':'d', 'letters':'\u0064\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\uA77A'},
    {'base':'dz','letters':'\u01F3\u01C6'},
    {'base':'e', 'letters':'\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD'},
    {'base':'f', 'letters':'\u0066\u24D5\uFF46\u1E1F\u0192\uA77C'},
    {'base':'g', 'letters':'\u0067\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\u1D79\uA77F'},
    {'base':'h', 'letters':'\u0068\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265'},
    {'base':'hv','letters':'\u0195'},
    {'base':'i', 'letters':'\u0069\u24D8\uFF49\u00EC\u00ED\u00EE\u0129\u012B\u012D\u00EF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131'},
    {'base':'j', 'letters':'\u006A\u24D9\uFF4A\u0135\u01F0\u0249'},
    {'base':'k', 'letters':'\u006B\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3'},
    {'base':'l', 'letters':'\u006C\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747'},
    {'base':'lj','letters':'\u01C9'},
    {'base':'m', 'letters':'\u006D\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F'},
    {'base':'n', 'letters':'\u006E\u24DD\uFF4E\u01F9\u0144\u00F1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5'},
    {'base':'nj','letters':'\u01CC'},
    {'base':'o', 'letters':'\u006F\u24DE\uFF4F\u00F2\u00F3\u00F4\u1ED3\u1ED1\u1ED7\u1ED5\u00F5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\u00F6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\u00F8\u01FF\u0254\uA74B\uA74D\u0275'},
    {'base':'oi','letters':'\u01A3'},
    {'base':'ou','letters':'\u0223'},
    {'base':'oo','letters':'\uA74F'},
    {'base':'p','letters':'\u0070\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755'},
    {'base':'q','letters':'\u0071\u24E0\uFF51\u024B\uA757\uA759'},
    {'base':'r','letters':'\u0072\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783'},
    {'base':'s','letters':'\u0073\u24E2\uFF53\u00DF\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B'},
    {'base':'t','letters':'\u0074\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787'},
    {'base':'tz','letters':'\uA729'},
    {'base':'u','letters': '\u0075\u24E4\uFF55\u00F9\u00FA\u00FB\u0169\u1E79\u016B\u1E7B\u016D\u00FC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289'},
    {'base':'v','letters':'\u0076\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C'},
    {'base':'vy','letters':'\uA761'},
    {'base':'w','letters':'\u0077\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73'},
    {'base':'x','letters':'\u0078\u24E7\uFF58\u1E8B\u1E8D'},
    {'base':'y','letters':'\u0079\u24E8\uFF59\u1EF3\u00FD\u0177\u1EF9\u0233\u1E8F\u00FF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF'},
    {'base':'z','letters':'\u007A\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763'}
  ];
  this.diacriticsMap = {};
  for (var i = 0; i < this.defaultDiacriticsRemovalMap.length; i++) {
    var letters = this.defaultDiacriticsRemovalMap[i].letters;
    for (var j = 0; j < letters.length ; j++){
      this.diacriticsMap[letters[j]] = this.defaultDiacriticsRemovalMap[i].base;
    }
  }

  this.removeDiacritics = function(str) {
    return str.replace(/[^\u0020-\u007E]/g, function(a){
      return spotDOM.diacriticsMap[a] || a;
    });
  };

  this.handleize = function(handle) {
    if (handle != null)
      return this.removeDiacritics(handle.toLowerCase()).replace(/\s+/g, '-').replace(/[^a-z0-9_]+/g, '-');
    return null;
  };

  this.normalizeSearch = function(search) {
    return spotDOM.removeDiacritics(search.toLowerCase().replace(/^\s+|\s+$/, ""));
  };

  this.scalarField = function(object, field, defaultValue, options) {
    object['_' + field + "Listeners"] = [];
    object[field] = function(variable, callHandlers) {
      if (typeof(variable) == 'function') {
        object['_' + field + "Listeners"].push(variable);
        if (callHandlers)
          variable.call(object, object['_' + field]);
        return object;
      } else {
        if (arguments.length > 0) {
          if (arguments.length == 1)
            callHandlers = true;
          if (options && options['preset'])
            variable = options['preset'].call(object, variable);
          object['_' + field] = variable;
          if (callHandlers) {
            for (var i = 0; i < object['_' + field + "Listeners"].length; ++i)
              object['_' + field + "Listeners"][i].call(object, variable);
          }
          return object;
        }
        return object['_' + field];
      }
    };
    object['_' + field] = (options && options['preset']) ? options['preset'].call(object, defaultValue) : defaultValue;
  };

  this.arrayField = function(object, field, defaultValue, defaultPlural) {
    var plural = defaultPlural || field + "s";
    object['_' + plural] = defaultValue || [];
    var methods = [
      "add" + field.charAt(0).toUpperCase() + field.slice(1),
      "add" + plural.charAt(0).toUpperCase() + plural.slice(1),
      "remove" + field.charAt(0).toUpperCase() + field.slice(1),
      "remove" + plural.charAt(0).toUpperCase() + plural.slice(1)
    ];
    for (var idx = 0; idx < methods.length; ++idx) {
      var method = methods[idx];
      object['_' + method + "Listeners"] = [];
      object[method] = (function(method, idx) { return function(variable, callListeners) {
        var i, j, targetedMethod;
        if (typeof(variable) == 'function') {
          object['_' + method + "Listeners"].push(variable);
          if (callListeners) {
            if (idx == 0) {
              for (i = 0; i < object['_' + plural].length; ++i)
                variable.call(object, object['_' + plural][i]);
            } else
              variable.call(object, object['_' + plural]);
          }
          return object;
        } else {
          if (arguments.length == 0)
            throw "Requires an argument.";
          if (idx == 0 || idx == 1) {
            if (idx == 1)
              object['_' + plural] = object['_' + plural].concat(variable);
            else
              object['_' + plural].push(variable);
          } else {
            if (idx == 2)
              object['_' + plural] = object['_' + plural].filter(function(e) { return e != variable; });
            else {
              object['_' + plural] = object['_' + plural].filter(function(e) { return !variable.includes(e); });
            }
          }
          for (i = 0; i < object['_' + method + "Listeners"].length; ++i)
            object['_' + method + "Listeners"][i].call(object, variable);
          if (idx == 1 || idx == 3) {
            targetedMethod = methods[idx - 1];
            for (i = 0; i < object['_' + targetedMethod + "Listeners"].length; ++i) {
              for (j = 0; j < variable.length; ++j)
                object['_' + targetedMethod + "Listeners"][i].call(object, variable[j]);
            }
          } else {
            targetedMethod = methods[idx + 1];
            for (i = 0; i < object['_' + targetedMethod + "Listeners"].length; ++i)
              object['_' + targetedMethod + "Listeners"][i].call(object, [variable]);
          }
          return variable;
        }
      } })(method, idx);
    }
    object['_' + plural + "Listeners"] = [];
    object[plural] = function(variable, callListeners) {
      if (typeof(variable) == 'function') {
        object['_' + field + "sListeners"].push(variable);
        if (callListeners)
          variable.call(object, object['_' + plural]);
        return object;
      } else if (arguments.length > 0) {
        object['_' + plural] = variable;
        if (callListeners) {
          for (var i = 0; i < object['_' + plural + "Listeners"].length; ++i)
            object['_' + plural + "Listeners"][i].call(object, variable);
        }
        return object;
      }
      return object['_' + plural];
    };
  };

  this.removeFieldListener = function(object, field, listener) {
    var fields = [
      '_' + field + 'Listeners',
      "add" + field.charAt(0).toUpperCase() + field.slice(1) + "Listeners",
      "add" + field.charAt(0).toUpperCase() + field.slice(1) + "sListeners",
      "remove" + field.charAt(0).toUpperCase() + field.slice(1) + "Listeners",
      "remove" + field.charAt(0).toUpperCase() + field.slice(1) + "sListeners"
    ];
    for (var i = 0; i < fields.length; ++i) {
      if (object[fields[i]])
        object[fields[i]] = object[fields[i]].filter(function(e) { return e != listener; });
    }
  };

  this.listeners = function(object, method) {
    object['_' + method + "Listeners"] = [];
    object[method] = function(variable) {
      if (typeof(variable) == 'function') {
        object['_' + method + "Listeners"].push(variable);
        return object;
      } else {
        var results = [];
        for (var i = 0; i < object['_' + method + "Listeners"].length; ++i)
          results.push(object['_' + method + "Listeners"][i].apply(object, arguments));
        return results;
      }
    };
  };
  this.listener = function(object, method, defaultFunction) {
    object['_' + method + "Listener"] = defaultFunction;
    object[method] = function(variable) {
      if (typeof(variable) == 'function') {
        object['_' + method + "Listener"] = variable;
        return object;
      } else if (object['_' + method + "Listener"]) {
        return object['_' + method + "Listener"].apply(object, arguments);
      }
    };
  };


  this["_queryListeners"] = [];
  this["_queryWaiter"] = null;
  this["_queryRequests"] = 0;

  this.query = function(callback) {
    var deferred;
    if (callback && typeof(callback) == 'function') {
      this['_' + "queryListeners"].push(callback);
      return this;
    }

    // Set debug mode to true, if we make a query with the debugger open, and debugMode is not explicitly set to false.
    if (this.debugMode() == null && this.isDebuggerOpen())
      this.debugMode(true);

    ++this["_queryRequests"];
    if (this["_queryWaiter"])
      return this["_queryWaiter"];
    this["_queryWaiter"] = spotAPI.Deferred();

    this.beginQuery();
    var query = this.generateQuery();
    this.queryCount(this.queryCount() + 1);
    if (this.shopifyMode()) {
      // Examine the inner attributes here, and try to finagle a URL that'll work.
      var search;
      var fieldParse, recursiveParse;
      var collection = query.innerAttributes['collection'];
      if (query.innerAttributes['search']) {
        if (typeof(query.innerAttributes['search']) == "object") {
          search = query.innerAttributes['search']["query"];
        } else {
          search = query.innerAttributes['search'];
        }
      }
      var tags = [];
      // var vendor = null;
      // var product_type = null;
      var page = parseInt(query.innerAttributes['page'] || 1);
      var sort = query.innerAttributes['sort'];

      var url;
      var vars = spotDOM.generateQueryVariables();
      if (!collection) {
        url = "/search/"

        fieldParse = function(type, field, value) {
          var actualValue;
          if (typeof(value) == "object") {
            var keys = Object.keys(value);
            if (keys.length > 0) {
              if (keys[0] != "==")
                return;
              actualValue = value[keys[0]];
            }
          } else {
            actualValue = value;
          }
          if (field == "product_type")
            return "product_type:\"" + actualValue + "\""
          if (field == "vendor")
            return "vendor:\"" + actualValue + "\""
          if (field == "tag" || field == "tags")
            return "tag:\"" + actualValue + "\""
          if (field == "sku")
            return "variants.sku:\"" + actualValue + "\""
          if (field == "barcode")
            return "variants.barcode:\"" + actualValue + "\""
        }

        recursiveParse = function(type, query) {
          var results = [];
          for (var i = 0; i < query.length; ++i) {
            if (typeof(query[i]) == "object") {
              var keys = Object.keys(query[i]);
              if (keys.length > 0) {
                if (keys[0] == "and" || keys[0] == "or")
                  results.push(spotDOM.grep(recursiveParse(keys[0], query[i][keys[0]]), function(e) { return e && e != ''; }).join(" " + keys[0].toUpperCase() + " "));
                else if (keys[0] == "facets")
                  results.push(spotDOM.grep(recursiveParse("and", query[i][keys[0]]), function(e) { return e && e != ''; }).join(" AND "));
                else if (keys[0] == "product_type" || keys[0] == "vendor" || keys[0] == "tag" || keys[0] == "tags" || keys[0] == "sku" || keys[0] == "barcode")
                  results.push(fieldParse(type, keys[0], query[i][keys[0]]));
              }
            }
          }
          return results;
        }
        var searchQuery = spotAPI.map(spotAPI.grep(recursiveParse("AND", query.innerQuery), function(e) { return e && e != ""; }), function(e) { return "(" + e + ")"; }).join(" AND ");
        // This is a double parentheses on purpose, to distinguish from legitimate search groupings.
        vars['q'] = (search ? search : "") + (searchQuery && searchQuery != "()" ? (search ? " AND (" : "(") + searchQuery + ")" : "");
        if (page > 1)
          vars['page'] = page;
        if (sort)
          vars['sort_by'] = sort;
      } else {
        url = "/collections/" + collection;


        fieldParse = function(field, value) {
          var actualValue;
          if (typeof(value) == "object") {
            var keys = Object.keys(value);
            if (keys.length > 0) {
              if (keys[0] != "==")
                return;
              actualValue = value[keys[0]];
            }
          } else {
            actualValue = value;
          }
          /* if (field == "product_type")
            product_type = actualValue;
          if (field == "vendor")
            vendor = actualValue; */
          if (field == "tag" || field == "tags")
            tags.push(actualValue);
          return actualValue;
        }

        recursiveParse = function(type, query) {
          for (var i = 0; i < query.length; ++i) {
            if (typeof(query[i]) == "object") {
              var keys = Object.keys(query[i]);
              if (keys.length > 0) {
                if (keys[0] == "and" || keys[0] == "or")
                  recursiveParse(keys[0], query[i][keys[0]]);
                else if (keys[0] == "facets")
                  recursiveParse("and", query[i][keys[0]]);
                else if (/*keys[0] == "product_type" || keys[0] == "vendor" || */keys[0] == "tag" || keys[0] == "tags") {
                  if (fieldParse(keys[0], query[i][keys[0]]))
                    break;
                }
              }
            }
          }
        }
        recursiveParse("AND", query.innerQuery);
        if (tags.length > 0)
          url += "/" + spotAPI.map(tags, function(e) { return encodeURI(spotDOM.handleize(e)) }).join("+");
        /* if (vendor)
          vars['vendor'] = vendor;
        if (product_type)
          vars['type'] = product_type;*/
      }

      if (this.sort() && this.sort().getShopifySortOrder())
        vars['sort_by'] = this.sort().getShopifySortOrder();

      var queryString = spotAPI.encodeUrlVars(vars);
      if (queryString.length > 0)
        queryString = "?" + queryString;
      var target = window.location.origin + url + queryString;
      if (window.location.href != target) {
        window.location = target;
        this.endQuery();
        return spotAPI.Deferred();
      } else {
        deferred = this["_queryWaiter"];
        this["_queryWaiter"] = null;
        this.endQuery();
        deferred.resolve();
        return deferred;
      }
    } else {
      deferred = spotAPI.Deferred();
              
      query.e().done(function(products, count, options) {
        if (count != null)
          spotDOM.count(count);
        if (options['options'])
          spotDOM.updateFacets(options['options'], options['boundaries']);
        spotDOM.products(products);
        if (options.spellCheck)
          spotDOM.spellCheck(options['spellCheck']);
        else
          spotDOM.spellCheck(null);
        if (options['warnings'] && options['warnings'].length > 0) {
          for (var i = 0; i < options['warnings'].length; ++i)
            console.log("Spot Warning: " + options['warnings'][i]);
          if (spotDOM.debugMode())
            deferred.reject({ status: 400, responseText: options['warnings'].join("\n") });
        }
        deferred.resolve(products, count, options);
      }).fail(function(xhr) {
        deferred.reject(xhr);				
      });
      
      for (i = 0; i < spotDOM["_queryListeners"].length; ++i) {
        var internal = i;
        deferred.done((function(internal) { return function() {
          spotDOM["_queryListeners"][internal].apply(spotDOM, arguments);
        } })(internal));
      }
      var queryWaiter = spotDOM["_queryWaiter"];
      deferred.done(function() {
        spotDOM.endQuery();
        var deferred = spotDOM["_queryWaiter"];
        var requests = spotDOM["_queryRequests"];
        spotDOM["_queryWaiter"] = null;
        spotDOM["_queryRequests"] = 0;
        if (requests == 1)
          deferred.resolve.apply(deferred, arguments);
        else
          spotDOM.query().done(function() { deferred.resolve.apply(deferred, arguments); }).fail(function() { deferred.reject.apply(deferred, arguments); });
      }).fail(function(xhr) {
        if (spotDOM.failBehavior() && spotDOM.failBehavior() == "shopify" && xhr.status != 400) {
          spotDOM.shopifyMode(true);
          spotDOM["_queryWaiter"] = null;
          spotDOM["_queryRequests"] = 0;
          spotDOM.query();
        } else {
          spotDOM["_queryWaiter"].reject();
        }
      });
      return queryWaiter;
    }
  };



  var vars = this.getUrlVars();



  /**

  ## Sub-Classes

  The SpotDOM class uses several sub-classes to keep track of everything; the three primary things that are complex enough to warrant classes are [Facets](#facets), [Facet Values](#facet-values), and [Sort Orders](#sort-orders).

  ### Facets

  Facets are objects that represent a particular category of values. As an example, a Facet would be "Color". A facet, when instantiated can take either a simple string, or an object describing what it represents. It can be in one of the following forms:

  #### new

      new Facet("product_type")

      new Facet("Color")

      new Facet({"option": "Color"})
      
      new Facet({"type": "price", "boundary": [null, null] })

      new Facet({"product-metafield": {"mynamespace":"mykey"}})

      new Facet({"type": "option", "option": "Color", "values": ["Red", "Blue"]})

      new Facet({"type": "option", "option": "Color", "values": [{"name": "Reddish", "value": "Red"},{"name": "Blueish", "value": "Blue"}]})

      new Facet({"type": "option", "option": "Color", "values": [{"name": "Reddish", "value": ["Red", "Magenta"]},{"name": "Blueish", "value": ["Blue", "Cyan"]}]})


  Once constructed, these are generally passed to `.addFacet` on the full DOM object, so that the system will keep track of which facets you'd like to use. After being added for the first time, `.init` should be called on the facet to initialize it. See the [SpotDefault](#spotdefault-documentation) for an example.
  
  There are two types of facets, option facets, and boundary facets. 
  
  Option facets are lists of values that can retrieve a count of products. These are usually represented by checkboxes with labels for hte options, and a count next to them. These are the vast majority of facets.
  
  Boundary facets are a minimum and maximum value; and are usually represented by a range slider.

  **/
  this.Facet = function(spec) {
    var facet = this;
    this.spotDOM = spotDOM;

    var facetValueHash = {};
    // for option facets
    spotDOM.arrayField(this, 'facetValue');
    // for boundary facets
    spotDOM.scalarField(this, 'boundaryValues');
    spotDOM.scalarField(this, 'boundaryEdges');

    this.isValidLocale = function(locale) {
      return !locale || !spec.locales || spec.locales.length == 0 || spec.locales.indexOf(locale) != -1;
    };
    
    this.getBoundary = function() {
      return spec["boundary"];
    };

    this.getName = function(locale) {
      if (!locale)
        locale = this.spotDOM.locale();
      if (typeof(spec) == 'object') {
        if (spec['name']) {
          if (typeof(spec['name']) == 'object')
            return spec['name'][locale] || Object.values(spec['name'])[0];
          return spec['name'];
        }
        return Object.keys(spec)[0];
      }
      return spec;
    };

    this.smartTypeConversion = function() {
      var lower;
      if (typeof(spec) == 'object') {
        if (spec['type']) {
          if (spec['type'] == "option")
            return { "option": spec['option'] };
          else if (spec['type'] == "product-custom-field" || spec['type'] == "variant-custom-field") {
            var hash = {};
            hash[spec['type']] = spec['field'];
            return hash;
          } else if (spec['type'] == "product-metafield" || spec['type'] == "variant-metafield") {
            var hash = {};
            hash[spec['type']] = { }
            hash[spec['type']][spec['namespace']] = spec['key']
            return hash;
          }
          return spec['type'];
        }
        lower = this.getName().toLowerCase();
      } else
        lower = spec.toLowerCase();
      if (lower == 'type' || lower == 'product type' || lower == 'category')
        return "product_type";
      else if (lower == 'vendor' || lower == 'seller')
        return "vendor";
      else if (lower == 'price')
        return "price";
      else if (lower == 'compare_at_price')
        return "compare_at_price";
      else if (lower == 'grams')
        return "grams";
      else if (lower == 'inventory_quantity')
        return "inventory_quantity";
      else if (lower == 'tags')
        return "tags";
      else if (lower == 'option1' || lower == 'option2' || lower == 'option3' || lower == "collection")
        return lower;
      else {
        return {"option":spec};
      }
    };
    this.smartType = this.smartTypeConversion();
    if (typeof(this.smartType) == 'object')
      this.smartTypeName = this.smartType['name'] || this.smartType['option'] || this.smartType['key'] || this.smartType['variant-custom-field'] || this.smartType['product-custom-field'];
    else
      this.smartTypeName = this.smartType;



    this.isQuantitative = function() { return typeof(this.smartType) != "object" && (this.smartType == 'price' || this.smartType == 'compare_at_price' || this.smartType == 'grams' || this.smartType == 'inventory_quantity') };
    this.isMonetary = function() { return typeof(this.smartType) != "object" && (this.smartType == 'price' || this.smartType == 'compare_at_price'); };
    this.isQualitative = function() { return !this.isQuantitative() && !this.isBoolean(); }
    this.isBoolean = function() { return spec['level'] && spec['level'] == "bool"; }
    this.isOption = function() { return typeof(this.smartType) == "object" && this.smartType['option']; }
    this.isCustomField = function() { return typeof(this.smartType) == "object" && (this.smartType['product-custom-field'] || this.smartType['variant-custom-field']); }
    this.isMetafield = function() { return typeof(this.smartType) == "object" && (this.smartType['product-metafield'] || this.smartType['variant-metafield']); }
    this.isProductMetafield = function() { return typeof(this.smartType) == "object" && this.smartType['product-metafield']; }
    this.isVariantMetafield = function() { return typeof(this.smartType) == "object" && this.smartType['variant-metafield']; }
    this.isProductCustomField = function() { return typeof(this.smartType) == "object" && this.smartType['product-custom-field']; }
    this.isVariantCustomField = function() { return typeof(this.smartType) == "object" && this.smartType['variant-custom-field']; }
    this.getNamespace = function() { return typeof(this.smartType) == "object" && Object.keys((this.smartType['product-metafield'] || this.smartType['variant-metafield']))[0]; }
    this.getKey = function() { return typeof(this.smartType) == "object" && Object.values((this.smartType['product-metafield'] || this.smartType['variant-metafield']))[0]; }
    this.getField = function() { return typeof(this.smartType) == "object" && (this.smartType['product-custom-field'] || this.smartType['variant-custom-field']); }
    // Becuase Shopify doesn't support ORing things, normally.
    this.singleSelection = function() { return spotDOM.shopifyMode() || spec['single']; };

    // Specifies the sorting algorithm for the inner facetValues.
    this.sortValuesFunction = this.isQualitative() ? function(facetValueA, facetValueB) {
      return facetValueA.getName().localeCompare(facetValueB.getName());
    } : function(facetValueA, facetValueB) {
      var halvesA = facetValueA.value.split("-");
      var halvesB = facetValueB.value.split("-");
      return (parseFloat(halvesA[0] || 0) < parseFloat(halvesB[0] || 0));
    };

    this.getOptionValue = function() {
      if (typeof(spec) == 'object') {
        if (spec['values']) {
          var values = spotDOM.map(spec['values'], function(e) {
            if (typeof(e) == "object") {
              if (e.name && facet.isQualitative())
                return { name: (typeof(e.name) == 'object' ? (e.name[spotDOM.locale()] || Object.values(e.name)[0]) : e.name), value: e.value };
              else if (facet.isBoolean())
                return { name: (typeof(e.name) == 'object' ? (e.name[spotDOM.locale()] || Object.values(e.name)[0]) : e.name), value: e.value == "true"};
              if (typeof(e.value) == "object" && e.value["*"])
                return {"value": {"*":e.value["*"]}};
              return e.value;
            }
            return e;
          });
          var hash = {};
          if (this.isOption()) {
            hash['option'] = { };
            hash.option[this.smartTypeName] = values;
            return hash;
          } else if (this.isMetafield()) {
            var field = this.isProductMetafield() ? 'product-metafield' : 'variant-metafield';
            hash[field] = { };
            hash[field][spec['namespace']] = { }
            hash[field][spec['namespace']][spec['key']] = { }
            hash[field][spec['namespace']][spec['key']] = values;
            return hash;
          } else if (this.isCustomField()) {
            var field = this.isProductCustomField() ? 'product-custom-field' : 'variant-custom-field';
            hash[field] = { };
            hash[field][this.smartTypeName] = values;
            return hash;
          }
          hash[this.smartTypeName] = values;
          return hash;
        }
      }
      return this.smartType;
    };

    this.getUniqueId = function() {
      if (this.getName())
        return "f_" + spotDOM.handleize(this.getName());
      return "f_" + this.smartTypeName;
    };

    this.composeQuery = function(query) {
      if (this.getBoundary()) { 
        var values = this.boundaryValues();
        if (values && (values[0] != null || values[1] != null)) {
          var internalQuery = spotDOM.spotAPI.se();
          if (values[0] != null)
            internalQuery = internalQuery[this.smartType](">=", values[0]);
          if (values[1] != null)
            internalQuery = internalQuery[this.smartType]("<=", values[1]);
          return internalQuery;
        }
        return query;
      }
      return query.or(spotDOM.map(this.facetValues(), function(e) { return e.composeQuery(spotDOM.spotAPI.se()); }).filter(function(e) { return !e.isEmptyQuery(); }));
    };


    this.composeQueryString = function(vars) {
      var array = this.facetValues().filter(function(e) { return e.enabled(); });
      if (array.length > 0)
        vars[this.getUniqueId()] = spotDOM.map(array, function(e) { return e.getName(); });
      return vars;
    };

    this.init = function(option) {
      var values = [];
      var valueEnabled = false;
      if (spec.values) {
        values = spotDOM.map(spec.values, function(e) {
          if (typeof(e) == "object")
            return { "value": e.value, enabled: false, name: e.name };
          return { "value": e, enabled: false, name: e };
        });
      } else if (spec.boundary && spec.boundary[0] != null && spec.boundary[1] != null) {
        var hash = [{ min: {} }, { max: {} }];
        hash[0].min[this.smartType] = parseFloat(spec.boundary[0]);
        hash[1].max[this.smartType] = parseFloat(spec.boundary[1]);
        values = hash;
      }
        
      var vars = option || spotDOM.getUrlVars();
      var facetsSelected = Object.keys(vars).filter(function(e) { return /^f_/.test(e); })
      if (facetsSelected.includes(facet.getUniqueId()) ){
        valueEnabled = true;
        var selectedValues = vars[facet.getUniqueId()];
        if (typeof selectedValues == "string")
          selectedValues = [selectedValues];
        var unhandledValues = [];
        if (values.length > 0) {
          for (var j = 0; j < selectedValues.length; ++j) {
            var hasOne = false;
            for (var i = 0; i < values.length; ++i ){
              var name = typeof(values[i].name) == "object" ? values[i].name[spotDOM.locale()] : values[i].name;
              if (name == selectedValues[j]) {
                values[i].enabled = true;
                hasOne = true;
              }
            }
            if (!hasOne) {
              // If we're a wildcard value only, push the wildcard prefix onto the unhandledValue.
              if (values.length == 1 && values[0] && values[0].value["*"])
                unhandledValues.push({ enabled: true, name: selectedValues[j], value: values[0].value["*"].replace(/\*$/, "") + selectedValues[j] });
              else
                unhandledValues.push(selectedValues[j]);
            }
          }
        } else {
          unhandledValues = selectedValues;
        }
        values = spotDOM.map(unhandledValues, function(e) { return typeof(e) == 'object' ? e : { "value": e, enabled: true }; }).concat(values);
      }
      if (spotDOM.shopifyMode()) {
        if (
          values.length > 0 && (
            ((spotDOM.isCollectionPage() || spotDOM.isSearchPage()) && (typeof(this.smartType) != "object" && (this.smartType == "tag" || this.smartType == "tags"))) ||
            ((spotDOM.isVendorCollectionPage() || spotDOM.isSearchPage()) && (typeof(this.smartType) != "object" && this.smartType == "vendor")) ||
            ((spotDOM.isProductTypeCollectionPage() || spotDOM.isSearchPage()) && (typeof(this.smartType) != "object" && this.smartType == "product_type"))
          )
        )
          this.update(values, true);
        else
          spotDOM.removeFacet(this);
      } else {
        this.update(values, true);
      }
      return valueEnabled;
    };

    this.update = function(option, init) {
      var values = [];
      var mergeValues = {};
      if (spec.values) {
        for (var i = 0; i < spec.values.length; ++i)
          mergeValues[spec.values[i].name] = spec.values[i].value;
      }
      if (option && !Array.isArray(option)) {
        var actualType = this.smartTypeName;
        if (actualType == "tags" && option["tag"])
          actualType = "tag";
        var keys = option[actualType] ? Object.keys(option[actualType]) : [];
        var currentOption = option[actualType] ? option[actualType] : {}
        if (keys.length == 0 && option["option"]) {
          // To handle those cases where we're case insensitive.
          keys = option["option"][actualType] ? Object.keys(option["option"][actualType]) : (option["option"][actualType.toLowerCase()] ? Object.keys(option["option"][actualType.toLowerCase()]) : []);
          currentOption = option["option"][actualType] ? option["option"][actualType] : (option["option"][actualType.toLowerCase()] ? option["option"][actualType.toLowerCase()] : {})
        } else if (keys.length == 0 && (option["product-metafield"] || option["variant-metafield"])) {
          var key = option["product-metafield"] ? 'product-metafield' : 'variant-metafield';
          currentOption = Object.values(Object.values(option[key])[0])[0];
          keys = Object.keys(currentOption);
        } else if (keys.length == 0 && (option["product-custom-field"] || option["variant-custom-field"])) {
          var key = option["product-custom-field"] ? 'product-custom-field' : 'variant-custom-field';
          currentOption = Object.values(option[key])[0];
          keys = Object.keys(currentOption);
        }
        for (i = 0; i < keys.length; ++i)
          values.push({ "name": keys[i], "value": mergeValues[keys[i]] || keys[i], "count": currentOption[keys[i]] });
      } else if (option) {
        values = option;
      }

      if (this.getBoundary()) {
        var min, max;
        for (i = 0; i < values.length; ++i) {
          if (values[i].min)
            min = values[i].min[this.smartTypeName];
          else if (values[i].max)
            max = values[i].max[this.smartTypeName];
        }
        if (min != null && max != null)
          this.boundaryEdges([min, max]);
      } else {
        var extantFacets = {};
        var newFacets = [];
        var wildcards = Object.values(facetValueHash).filter(function(e) { return e.isUnnamedWildcard(); });
        for (i = 0; i < values.length; ++i) {
          var value = values[i];
          var wildcard = wildcards.filter(function(e) { return value["name"].indexOf(e.value["*"].replace(/\*$/, "")) == 0; });
          if (wildcard.length > 0)
            value["name"] = value["name"].slice(wildcard[0].value["*"].length - 1);
          var facetValue = new spotDOM.FacetValue(this, value);
          var id = facetValue.getUniqueId();
          if (!facetValueHash[id]) {
            newFacets.push(facetValue);
          } else {
            facetValue = facetValueHash[id];
          }
          extantFacets[id] = true;
          facetValue.update(value);
        }
        if (!init)
          newFacets.sort(this.sortValuesFunction);
        this.addFacetValues(newFacets);
        Object.keys(facetValueHash).forEach(function(i) {
          if (!extantFacets[i])
            facetValueHash[i].count(0);
        });
        this.initValues = null;
      }
    };

    this.addFacetValue(function(facetValue) {
      var id = facetValue.getUniqueId();
      facetValueHash[id] = facetValue;
      return facetValue;
    });

    this.removeFacetValue(function(facetValue) {
      var id = facetValue.getUniqueId();
      delete facetValueHash[id];
    });

    this.getFacetValue = function(id) {
      return facetValueHash[id];
    };
  };


  /**

  ### FacetValues

  FacetValues are objects that represent an individual value that's part of a composing facet. An example here would be "Red", under the Facet "Color".

  FacetValues can be either "simple", or "composite". A simple FacetValue only comprises a single underlying value, whereas a composite FacetValue comprises more
  than one value, or a rule that describes a set of values. An example here would be "Red" simply referring to "Red" in the underlying catalog, vs. "Red" referring
  to a series of values like "Magenta", "Pink", "Red", etc.. in the underlying catalog.

  These are genereally not instantiated directly, but instead are instantiated as part of the values coming back from the filtering system. They do have a number of
  scalar variables, that, like the SpotDOM object as a whole, can be listened to by passing a function to them. Generally, these listeners are applied under an
  `addFacet` listener, which will trigger whenever a facet is added to the SpotDOM system. You can look at the [SpotDefault implementation](#spotdefault-documentation)
  for an example.

  **/
  this.FacetValue = function(facet, value) {
    this.facet = facet;
    this.name = value['name'];
    this.value = value['value'];

    /**

    #### Variables

    ##### count

    This variable is changed when a filtering resultset comes back with a number that represents how many products lie under this facet. Generally used
    to update a faceting pane.

    **/
    spotDOM.scalarField(this, 'count', value['count']);
    /**

    ##### enabled

    Used to determine whether or not a particular facet value has been applied to the query. Generally used to check a checkbox, or provide some other
    indication to the user that the FacetValue is being used.

    **/
    spotDOM.scalarField(this, 'enabled', value['enabled'] != null ? value['enabled'] : false);
    /**


    #### Getters

    ##### getUniqueId

    Returns an ID that is unique to this facet. Usually is descriptive of the facet as well. Suitable for direct insertion into a query string, or
    for use as a DOM node id.

    **/


    this.getUniqueId = function() {
      if (this.isUnnamedWildcard())
        return this.facet.getUniqueId() + "_wildcard";
      if (this.facet.isQualitative() || this.facet.isBoolean())
        return this.facet.getUniqueId() + "_" + (typeof(this.getName()) == "object" ? "wildcard" : spotDOM.handleize(this.getName()));
      return this.facet.getUniqueId() + "_" + spotDOM.handleize(this.value);
    };

    /**

    ##### getName

    Returns a nice-looking name for this facet, given the information you've supplied, for the specified, or default locale.

    **/
    this.getName = function(locale) {
      if (!locale)
        locale = this.facet.spotDOM.locale();
      if (this.name) {
        if (typeof(this.name) == 'object')
          return this.name[locale];
        return this.name;
      }
      if (this.facet.isQuantitative()) {
        if (this.value.charAt(0) == "-") {
          return "Under " + this.formatValue(this.value.slice(1));
        } else if (this.value.charAt(this.value.length-1) == "+") {
          return "Over " + this.formatValue(this.value.slice(0, this.value.length-1));
        } else {
          var groups = this.value.split(/\s*-\s*/);
          return this.formatValue(groups[0]) + " - " + this.formatValue(groups[1]);
        }
      }
      return typeof(this.value) != "object" ? this.value : null;
    };
    /**

    ##### getValue

    Returns the value of this facet; i.e. something that can be directly passed to Spot.

    **/
    this.getValue = function() { return this.value; };

    this.numericalList = null;
    this.getNumericalList = function() {
      if (this.numericalList)
        return this.numericalList;
      var names = [];
      for (var i in this.facet.values) {
        names.push(this.facet.values[i]);
      }
      names.sort(function(a,b) {
        var convertedA = parseInt(a.value);
        var convertedB = parseInt(b.value);
        if (isNaN(convertedA) && !isNaN(convertedB))
          return 1;
        if (!isNaN(convertedA) && isNaN(convertedB))
          return -1;
        if (isNaN(convertedA) && isNaN(convertedB))
          return 0;
        if (convertedA < convertedB)
          return -1;
        if (convertedA == convertedB)
          return 0;
        return 1;
      });
      this.numericalList = names;
      return names;
    };

    this.getNumericalIndex = function() {
      var names = this.getNumericalList();
      for (var i = 0; i < names.length && names[i] != this; ++i);
      return i;
    };

    this.formatValue = function(value) {
      value = value.replace(/[^0-9.]+/g, '');
      if (this.facet.smartType.indexOf("price") != -1)
        return spotDOM.formatMoney(value);
      return value;
    };

    this.isUnnamedWildcard = function() {
      return typeof(this.value) == "object" && this.value["*"] && this.getName() == null;
    };

    this.enable = function() {
      this.enabled(true);
    };

    this.disable = function() {
      this.enabled(false);
    };

    this.toggle = function() {
      if (this.enabled())
        this.disable();
      else
        this.enable();
    };

    this.update = function(value) {
      if (this.count() != value.count)
        this.count(value.count);
    };

    // Compose this into the query, if active.
    this.composeQuery = function(query) {
      var i, queries = [], value;
      if (this.enabled()) {
        if (this.facet.isOption()) {
          if (Array.isArray(this.value)) {
            for (i = 0; i < this.value.length; ++i) {
              if (typeof(this.value[i]) == "object") {
                Object.keys(this.value[i]).forEach(function(j) {
                  queries.push(spotDOM.spotAPI.se().option(this.facet.smartType['option'], j, this.value[i][j]));
                });
              } else {
                queries.push(spotDOM.spotAPI.se().option(this.facet.smartType['option'], this.value[i]));
              }
            }
            if (queries.length == 1)
              return query.merge(queries[0]);
            return query.or(queries);
          } else {
            if (typeof(this.value) == "object") {
              Object.keys(this.value).forEach(function(j) {
                query = query.option(this.facet.smartType['option'], j, this.value[j]);
              });
            } else {
              query = query.option(this.facet.smartType['option'], this.value);
            }
            return query;
          }
        } else if (this.facet.isMetafield()) {
          var target = this.facet.isProductMetafield() ? "product_metafield" : "variant_metafield";
          value = this.value;
          if (!Array.isArray(value))
            value = [value];
          for (i = 0; i < value.length; ++i) {
            if (typeof(value[i]) == "object") {
              Object.keys(value[i]).forEach(function(j) {
                queries.push(spotDOM.spotAPI.se()[target](this.facet.getNamespace(), this.facet.getKey(), value[i][j]));
              });
            } else {
              queries.push(spotDOM.spotAPI.se()[target](this.facet.getNamespace(), this.facet.getKey(), value[i]));
            }
          }
          if (queries.length == 1)
            return query.merge(queries[0]);
          return query.or(queries);
        } else if (this.facet.isCustomField()) {
          var target = this.facet.isProductCustomField() ? "product_custom_field" : "variant_custom_field";
          value = this.value;
          if (!Array.isArray(value))
            value = [value];
          for (i = 0; i < value.length; ++i) {
            if (typeof(value[i]) == "object") {
              Object.keys(value[i]).forEach(function(j) {
                queries.push(spotDOM.spotAPI.se()[target](this.facet.getField(), value[i][j]));
              });
            } else {
              queries.push(spotDOM.spotAPI.se()[target](this.facet.getField(), value[i]));
            }
          }
          if (queries.length == 1)
            return query.merge(queries[0]);
          return query.or(queries);
        } else if (this.facet.isQuantitative()) { // "0-99", "-1000-1000", "
          if (this.value.charAt(0) == "-")
            return query[this.facet.smartType]("<", this.value.slice(1));
          else if (this.value.charAt(this.value.length-1) == "+")
            return query[this.facet.smartType](">=", this.value.slice(0, this.value.length-1));
          else {
            var groups = this.value.split(/\s*-\s*/);
            return query[this.facet.smartType]("between", [groups[0], groups[1]]);
          }

        }

        value = this.value;
        if (!Array.isArray(value))
          value = [value];
        var apiField = this.facet.smartType;
        if (apiField == "collection")
          apiField = "in_collection";
        if (apiField == "search")
          apiField = "in_search";
        for (i = 0; i < value.length; ++i) {
          if (typeof(value[i]) == "object") {
            Object.keys(this.value[i]).forEach(function(j) {
              queries.push(spotDOM.spotAPI.se()[apiField], j, value[i][j]);
            });
          } else {
            queries.push(spotDOM.spotAPI.se()[apiField](value[i]));
          }
        }
        if (queries.length == 1)
          return query.merge(queries[0]);
        return query.or(queries);
      }
      return query;
    };
  };
  
  
  
  this.BoostRule = function(boostRule) {
    this.rules = boostRule.rules;

    // Determining whether or not we require a product returned from Spot in order to actually 
    // render this boost rule correctly. 
    this.requiresAdditionalGet = function() {
      return this.rules.filter(function(r) {
        return r.source == "product" && (r.source_field['product-metafield'] || r.source_field['variant-metafield'])
      }).length > 0;
    };
    
    this.getQuery = function(context) {
      var boostQuery = spotDOM.spotAPI.se();
      function flattenField(field, should_split) {
        var list = [];
        var target = field;
        while (true) {
          if (typeof(target) != "object" || Array.isArray(target)) {
            if (should_split)
              target = target.split(/\s*,\s*/)
            list.push(target);
            break;
          }
          var key = Object.keys(target)[0];
          list.push(key);
          target = target[key];
        }
        return list;
      }
      function intersectArrays(arr1, arr2) {
        if (!Array.isArray(arr1))
          arr1 = [arr1];
        if (!Array.isArray(arr2))
          arr2 = [arr2];
        var hash = {};
        arr2.forEach(function(e) { hash[e] = 1; });
        return arr1.filter(function(e) { return hash[e] != null; });
      }
      

      // A rule looks like the following:
      // { "source_field": { "tag": "tag1, tag2" }, "target_field": { "tag": "tag3, tag4" } }
      // { "source_field": { "tag": "prefix*" } }
      // { "source_field": { "product_type" } }
      this.rules.forEach(function(rule, idx) {
        var source = rule.source;
        var operator = rule.mapping.indexOf("no") == 0 ? "!=" : "==";
        var isMapping = rule.mapping.indexOf("map") != -1;
        if (source == "product" && context.product) {
          var field = typeof(rule.source_field) == "object" ? Object.keys(rule.source_field)[0] : rule.source_field;
          if (field == "collection") {
            if (context.collection && (!isMapping || context.collection.handle == rule.source_field.collection))
              boostQuery = boostQuery.in_collection(operator, isMapping ? rule.target_field.collection : context.collection.handle, rule.weight);
          } else if (field == "tag" && !isMapping) {
            // Check for wildcards.
            rule.source_field.tag.split(/\s*,\s*/).forEach(function(tag) {
              var target = new RegExp("^" + tag.replace(/\*/g, ".*").replace(/\|/g, "\\|") + "$");
              var tags = typeof(context.product.tags) == 'string' ? context.product.tags.split(/\s*,\s*/) : context.product.tags;
              var matchedTags = tags.filter(function(e) { return target.test(e) });
              matchedTags.slice(0, 19).forEach(function(e) {
                boostQuery = boostQuery.tag(operator, e, rule.weight / matchedTags.length);
              });
            });
          } else if (field == "title" && !isMapping) {
            var words = context.product.title.split(/\s+/).filter(function(t) { return t.length >= 2; });
            words.forEach(function(word) {
              boostQuery = boostQuery.in_search(operator, word, rule.weight / words.length);
            });
          } else {
            var values = null;
            var isVariant = field == "variant-metafield" || field == "option1" || field == "option2" || field == "option3" || field == "option";
            function iterateObject(field, object) {
              while (field != null && object != null) {
                if (typeof(field) == "object" && typeof(object) == "object" && !Array.isArray(object)) {
                  var key = Object.keys(field)[0];
                  if (key == "option") {
                    var optionName = typeof(field.option) == "object" ? Object.keys(field.option)[0] : field.option;
                    var optionIdx = context.product.options.filter(function(e) { return e == optionName; }).map(function(e, idx) { return idx + 1; })[0];
                    if (!optionIdx)
                      return null;
                    object = object["option" + optionIdx];
                    field = field[key];
                  } else if (key == "product-metafield") {
                    var namespace = Object.keys(field[key])[0];
                    var mkey = field[key][namespace];
                    return object.metafields && object.metafields.filter(function(e) { return e.namespace == namespace && e.key == mkey }).map(function(e) { return e.value; });
                  } else if (key == "variant-metafield") {
                    var namespace = Object.keys(field[key])[0];
                    var mkey = field[namespace][key];
                    return object.metafields && object.metafields.filter(function(e) { return e.namespace == namespace && e.key == mkey }).map(function(e) { return e.value; });
                  } else {
                    var objectField = key == "tag" ? "tags" : (key == "type" ? "product_type" : key);
                    object = object[objectField];
                    field = field[key];
                    if (key != "title") {
                      if (typeof(field) != 'object')
                        field = field.split(/\s*,\s*/);
                      if (typeof(object) != 'object')
                        object = object.split(/\s*,\s*/);
                    }
                  }
                } else {
                  return intersectArrays(object, field);
                }
              }
              return null;
            }
            if (isVariant) {
              var variantId = spotDOM.variantId();
              var variant = context.product.variants.filter(function(v) { return v.id == variantId })[0];
              if (variant && variantId) {
                values = iterateObject(rule.source_field, variant);
              } else {
                values = {};
                for (var i = 0; i < context.product.variants.length; ++i) {
                  var valid = iterateObject(rule.source_field, context.product.variants[i]);
                  if (valid)
                    values[valid] = 1;
                }
                values = Object.keys(values);
                if (values.length == 0)
                  values = null;
                else if (values.length == 1)
                  values = values[0];
              }
            } else
              values = iterateObject(typeof(rule.source_field) == "object" ? rule.source_field : [rule.source_field], context.product);
            if (values && (!Array.isArray(values) || values.length > 0)) {
              var argList = flattenField(rule.target_field || rule.source_field, rule.target_field && !rule.target_field.title);
              var key = argList.shift();
              if (rule.target_field) {
                argList.splice(argList.length - 1, 0, Array.isArray(argList[argList.length-1]) ? (operator == "==" ? "in" : "not_in") : operator)
                argList.push(rule.weight);
              } else {
                argList.push(Array.isArray(values) ? (operator == "==" ? "in" : "not_in") : operator)
                argList.push(values);
                argList.push(rule.weight);
              }
              boostQuery = boostQuery[key].apply(boostQuery, argList);
            }
          }
        } else if (source == "static") {
          var argList = flattenField(rule.source_field, !rule.source_field.title);
          var key = argList.shift();
          if (Array.isArray(argList[argList.length-1]))
            operator = operator == "==" ? "in" : "not_in";
          argList.splice(argList.length - 1, 0, operator);
          argList.push(rule.weight);
          boostQuery = boostQuery[key].apply(boostQuery, argList);
        } else if (source == "session") {
          if (rule.source_field[0] == "url_param") {
            var has = context.params[rule.source_field[1]].filter(function(e) { return e == rule.source_field[1] })[0];
            if (has) {
              var argList = flattenField(rule.target_field || rule.source_field);
              var key = argList.shift();
              argList.splice(argList.length - 1, 0, operator)
              argList.push(rule.weight);
              boostQuery = boostQuery[key].apply(boostQuery, argList);
            }
          }
        } else if (source == "customer" && context.customer) {
          if (rule.source_field[0] == "tag") {
            if (isMapping) {
              var has = context.customer.tags.filter(function(e) { return e == rule.source_field[1] })[0];
              if (has) {
                var argList = flattenField(rule.target_field || rule.source_field);
                var key = argList.shift();
                argList.splice(argList.length - 1, 0, operator)
                argList.push(rule.weight);
                boostQuery = boostQuery[key].apply(boostQuery, argList);
              }
            } else {
              var target = new RegExp("^" + rule.source_field["tag"].replace(/\*/, ".*") + "$");
              context.customer.tags.filter(function(e) { return target.test(e) }).forEach(function(e) {
                boostQuery = boostQuery.tag(operator, e, rule.weight);
              });
            }
          } else if (rule.source_field[0] == "country" && context.customer.default_address && context.customer.default_address.country_code == rule.source_field[1]) {
            var argList = flattenField(rule.target_field);
            var key = argList.shift();
            argList.splice(argList.length - 1, 0, operator)
            argList.push(rule.weight);
            boostQuery = boostQuery[key].apply(boostQuery, argList);
          }
        }
      });
      return boostQuery;
    };
  };
  /**
  
  ### Personalization
  
  Personalizations are objects that represent a tied boost rule with a set options for how that boost rule should be applied and accumulated.
  
  #### Variables
  
  **/
  this.Personalization = function(options, boostRule, context) {
    var personalization = this;
    
    /**
    
    ##### duration
    
    An underlying list of boosts which are currently extant.
    
    **/
    spotDOM.scalarField(this, 'duration', options.duration);
    /**
    
    ##### appliedBoosts
    
    An underlying list of boosts which are currently extant.
    
    **/
    spotDOM.scalarField(this, 'appliedBoosts', []);
    /**
    
    ##### boostRule
    
    The boost rule that the personalization is based on.
    
    **/
    spotDOM.scalarField(this, 'boostRule', boostRule);
    
    spotDOM.listener(this, 'apply', function(query) {
      return query.boost((query.innerAttributes["boost"] || []).concat(this.appliedBoosts()));
    });
    
    function deepCompareField(a, b) {
      if (typeof(a) != typeof(b))
        return false;
      if (typeof(a) == "object") {
        if ((Array.isArray(a) && !Array.isArray(b)) || (!Array.isArray(a) && Array.isArray(b)))
          return false;
        if (Array.isArray(a)) {
          if (a.length != b.length)
            return false;
          for (var i = 0; i < a.length; ++i) {
            if (!deepCompareField(a[i], b[i]))
              return false;
          }
        } else {
          var keysA = Object.keys(a).filter(function(e) { return e != "weight"; }), 
            keysB = Object.keys(b).filter(function(e) { return e != "weight"; });
          if (keysA.length != keysB.length)
            return false;
          if (keysA[0] == keysB[0])
            return deepCompareField(a[keysA[0]], b[keysB[0]]);
        }
      }
      return a == b;
    }
    
    this.mergeAppliedBoost = function(boosts) {
      boosts.forEach(function(boost) {
        var applied = personalization.appliedBoosts().filter(function(applied) {
          return deepCompareField(applied, boost);
        });
        if (applied.length > 0)
          applied[0].weight += boost.weight;
        else if (personalization.appliedBoosts().length < 20 && boost.weight != 0)
          personalization.appliedBoosts().push(boost);
      });
      if (this.duration()) {
        spotDOM.setStorage("spotPersonalization", this.appliedBoosts(), this.duration() == "storage" ? new Date(new Date().getTime() + 86400 * 90 * 1000) : null);
      }
    };
    
    this.checkProductAgainstBoostRule = function(context) {
     	var boostQuery = this.boostRule().getQuery(context);
     	return boostQuery.innerQuery;
    };
    
    /**
    
    ##### enabledFacet
    
    Adds boosts whenever a facet is enabled. 
    
    **/
    spotDOM.listener(this, 'enableFacet', function(facet) {
      
    });
    /**
    
    ##### viewedSearch
    
    Adds boosts whenever a search occurs. 
    
    **/
    spotDOM.listener(this, 'viewSearch', function(products) {
      products.forEach(function(product) { 
        var boosts = personalization.checkProductAgainstBoostRule({ product: product });
        if (boosts.length > 0) {
          boosts.forEach(function(e) {
            e.weight *= options.view_search_weight / products.length;
          });
        }
        personalization.mergeAppliedBoost(boosts);
      });
    });
    /**
    
    ##### viewedCollection
    
    Adds boosts whenever a list of products on a collection are viewed. 
    
    **/
    spotDOM.listener(this, 'viewCollection', function(products) {
      products.forEach(function(product) { 
        var boosts = personalization.checkProductAgainstBoostRule({ product: product });
        boosts.forEach(function(e) { e.weight *= options.view_collection_weight / products.length; });
        personalization.mergeAppliedBoost(boosts);
      });
    });
    /**
    
    ##### viewedProduct
    
    Adds boosts whenever a prodcut page is viewed.
    
    **/
    spotDOM.listener(this, 'viewProduct', function(product) {
      var boosts = personalization.checkProductAgainstBoostRule({ product: product });
      boosts.forEach(function(e) { e.weight *= options.view_product_weight; });
      personalization.mergeAppliedBoost(boosts);
    });
    /**
    
    ##### viewedVariant
    
    Adds boosts whenever a variant is selected, either when a product page is visited with a particular variant id, or when a variant is choen in the variant selector.
    
    **/
    spotDOM.listener(this, 'viewVariant', function(product, variant) {
      var boosts = personalization.checkProductAgainstBoostRule({ product: product, variant: variant});
      boosts.forEach(function(e) { e.weight *= options.view_variant_weight; });
      personalization.mergeAppliedBoost(boosts);
    });
    /**
    
    ##### addedProductToCart
    
    Adds boosts whenever a variant is added to cart.
    
    **/
    spotDOM.listener(this, 'addProductToCart', function(product, variant) {
      var boosts = personalization.checkProductAgainstBoostRule({ product: product, variant: variant});
      boosts.forEach(function(e) { e.weight *= options.add_product_to_cart_weight; });
      personalization.mergeAppliedBoost(boosts);
    });
    
    var savedWeights = spotDOM.getStorage("spotPersonalization");
    if (savedWeights)
      this.appliedBoosts(savedWeights);
        
  };


  /**

  ### Recommendation

  Recommendations are objects that represent an individual set of recommendations that are relevant to a particular product.

  #### Variables

  **/
  this.Recommendation = function(options, boostRule, context, sortOrder) {
    var recommendation = this;

    /**

    ##### name

    The name of the plain text name of the recommendation. Localized.

    **/
    spotDOM.scalarField(this, 'name', options.name);
    /**
    
    ##### boostRule
    
    The boost rule that the recommendation is based on.
    
    **/
    spotDOM.scalarField(this, 'boostRule', boostRule);
    /**
    
    ##### sortOrder
    
    The sort order that the recommendation is based on.
    
    **/
    spotDOM.scalarField(this, 'sortOrder', sortOrder);
    /**

    ##### mode

    The mode under which the recommendation will operate. Can be either `"spot"` or `"shopify"`. Will default to `"shopify"` if
    spotDOM.shopifyMode() is true.

    **/
    spotDOM.scalarField(this, 'mode', !boostRule ? "shopify" : "spot");
    /**

    ##### limit

    The amount of products to retrieve for this recommendation. Default 4.

    **/
    spotDOM.scalarField(this, 'limit', options.limit || 4);
    /**

    ##### product

    The product to use as a base for recommendations. Should be the product on the current page, if we're on the product page.
    Must be supplied. This function assumes that it is in Shopify front-end format, as that's the format that `{{ product | json }}` comes out in,
    which is generally where this comes from. Could also be retrieved via Spot, or Shopify's ajax API.

    **/
    spotDOM.scalarField(this, 'product', context.product);
    /**

    ##### variantId

    The variant id to reference when looking at recommendations. By default, will pull this from the `variant` variable in the query string.
    Can be null.

    **/
    spotDOM.scalarField(this, 'variantId', context.variant || spotDOM.getUrlVars()['variant']);
    /**

    ##### collection

    The collection object that should be the context for recommendations. By default, will pull this from the address structure.

    **/
    spotDOM.scalarField(this, 'collection', context.collection || (spotDOM.getCollectionPage() && { handle: spotDOM.getCollectionPage() }));
    /**

    ##### customer

    The customer object, to be used for personalized recommendations.

    **/
    spotDOM.scalarField(this, 'customer', context.customer);
    /**

    ##### products

    The array of products that have been recommended for this objecft.

    **/
    spotDOM.arrayField(this, 'product');

    /**

    #### Getters

    ##### getName

    Returns the localized name for this recommendation set.

    **/
    this.getName = function(locale) {
      return typeof(this.name()) == 'object' ? this.name()[locale || this.facet.spotDOM.locale()] : this.name();
    };
    
    /**

    ##### getQuery

    Returns the Spot query that represents this recommendation. Returns `null` if in Shopify mode.

    **/
    this.getQuery = function() {
      var query = spotDOM.spotAPI.s().rows(this.limit()).category("Recommendation");
      if (this.product())
         query = query.id("!=", this.product().id);
      var sortOrder = this.sortOrder() ? this.sortOrder().getUniqueId() : "bestselling";
      if (boostRule) {
        query = query.boost(this.boostRule().getQuery({ product: this.product(), collection: this.collection(), customer: this.customer() })).sort(sortOrder);
      } else {
        query = query.search(recommendation.product().tags.splice(0,5).join(" ")).sort(sortOrder);
      }
      return query;
    };
    /**

    #### Functions

    ##### init

    Initializes the object, performing the query using the specified context, and then adds the products to the list.

    **/
    this.init = function() {
      this.query().done(function(products) {
        recommendation.removeProducts(recommendation.products());
        recommendation.addProducts(products);
      });
      return this;
    };
    /**

    ##### query

    Returns a promise that resolves with the list of products that represent the recommendation.

    **/
    var alreadyGrabbed = false;
    this.query = function() {
      var deferred = spotDOM.spotAPI.Deferred();
      if (recommendation.mode == "shopify" || spotDOM.shopifyMode()) {
        spotDOM.spotAPI.ajax('/recommendations/products.json', { data: { product_id: this.product().id, limit: this.limit() } }).done(function(data) {
          deferred.resolve(data.products);
        }).fail(function() {
          deferred.reject.apply(deferred, arguments);
        });  
      } else {
        // Check to see if we require us to grab product metafields with our boost rule.
        var internalDeferred = spotDOM.spotAPI.Deferred();
        if (!alreadyGrabbed && this.boostRule() && this.product() && !this.product().metafields && this.boostRule().requiresAdditionalGet()) {
          alreadyGrabbed = true;
          spotDOM.spotAPI.s().id("==", this.product().id).e().done(function(products, count, options) {
            recommendation.product(options.products[0]);
            internalDeferred.resolve();
          }).fail(function() { internalDeferred.resolve(); });
        } else
          internalDeferred.resolve();
        internalDeferred.done(function() {
          recommendation.getQuery().e().done(function(products) {
            deferred.resolve(products);
          }).fail(function() {
            deferred.reject.apply(deferred, arguments);
          });
        });
      }
      return deferred;
    };
  };

  /**

  ### SortOrders

  Sort orders are objects which represent a potential sort order on the Shopify store. There are number of default ones. Generally, this is populated from the Spot control panel, but can also be manually populated.


  #### new

  Takes in the field string, the direction, as well as an optional name. Also takes in JSON format as passed in from the Spot-controlled metafields.

      new spotDOM.SortOrder(field)

      new spotDOM.SortOrder("created-desc")

      new spotDOM.SortOrder("created-descending")

      new spotDOM.SortOrder(field, direction)

      new spotDOM.SortOrder("created", "desc")

      new spotDOM.SortOrder(field, direction, name)

      new spotDOM.SortOrder("created", "desc", "My Created Order")

      new spotDOM.SortOrder({"option":"Size"}, "desc", "My Sizes")

      new spotDOM.SortOrder({"product-metafield":{"mynamespace":"mykey"}}, "asc", "My Metafield Ordering")

      new spotDOM.SortOrder(json)

      new spotDOM.SortOrder({"name":"Best Match","property":"search","direction":"desc","type":"special","active":true})

      new spotDOM.SortOrder({"name":"My Metafield Ordering","property":"product-metafield","direction":"desc","type":"numeric","active":true,"namespace":"mynamespace","key":"mykey"})

  **/
  this.SortOrder = function(field, direction, name) {
    this.spotDOM = spotDOM;
    this.simple = false;


    this.isShopifySortOrder = function() {
      if (typeof(this.field) == "object")
        return false;
      return this.field == "search" || this.field == "manual" || this.field == "created" || this.field == "title" || this.field == "price" || this.field == "best-selling";
    };

    if (typeof(field) == "object" && (field['label'] || field['name'])) {
      this.name = field['label'] || field['name'];
      if (field.property == "option") {
        this.field = {"option": field.option};
      } else if (field.property == "product-custom-field" || field.property == "variant-custom-field") {
        this.field = { };
        this.field[field.property] = field.field;
      } else if (field.property == "product-metafield" || field.property == "variant-metafield") {
        this.field = { };
        this.field[field.property] = { }
        this.field[field.property][field.namespace] = field.key;
      } else {
        this.field = field.property;
      }
      this.direction = field.direction;
    } else {
      if (!direction && typeof(field) == "string") {
        var groups = /^(.*?)-(asc|desc)(ending)?$/.exec(field);
        if (groups) {
          field = groups[1];
          direction = groups[2];
        }
      }

      this.field = field;
      this.direction = direction;
      this.name = name;
      if (!this.isShopifySortOrder())
        this.simple = true;
    }
    if (this.field == "manual")
      this.direction = "asc";
    else if (this.field == "best-selling" || this.field == "search")
      this.direction = "desc";
    if (!this.direction)
      this.direction = "asc";

    /**

    #### Getters


    ##### getName

    Returns a nice looking name that represents this sort order. If `name` was specified on construction, uses that. Takes in a locale; otherwises, uses the default one.

    **/

    this.getName = function(locale) {
      if (!locale)
        locale = this.spotDOM.locale();
      if (this.name) {
        if (typeof(this.name) == 'object')
          return this.name[locale];
        return this.name;
      }
      if (this.field == "created" && this.direction == "asc")
        return "Oldest to Newest";
      if (this.field == "created" && this.direction == "desc")
        return "Newest to Oldest";
      if (this.field == "title" && this.direction == "asc")
        return "A-Z";
      if (this.field == "title" && this.direction == "desc")
        return "Z-A";
      if (this.field == "title" && this.direction == "desc")
        return "Z-A";
      if (this.field == "price" && this.direction == "asc")
        return "Price: Low to High";
      if (this.field == "price" && this.direction == "desc")
        return "Price: High to Low";
      if (this.field == "best-selling" && this.direction == "desc")
        return "Best Selling";
      if (this.field == "manual" && this.direction == "asc")
        return "Featured";
      if (this.field == "search" && this.direction == "desc")
        return "Best Match";

      var internalField = this.field;
      if (typeof(this.field) == "object")
        internalField = this.field['option'] || (this.field['product-metafield'] ? Object.values(this.field['product-metafield'])[0] : null) || (this.field['variant-metafield'] ? Object.values(this.field['variant-metafield'])[0] : null);
      return (internalField.charAt(0).toUpperCase() + internalField.slice(1) + " " + (this.direction == "asc" ? "Ascending" : "Descending")).replace(/_/g, " ");
    };

    /**

    ##### getUniqueId

    Returns an ID that is unique to this sort order. Usually is descriptive of the facet as well. Suitable for direct insertion into a query string, or
    for use as a DOM node id. Should ideally match Shopify's *front-end* sort order values identically, in most cases. (Back-end sort orders are called
    completely different things for some reason.)

    **/
    this.getUniqueId = function() {
      if (this.simple)
        return this.field;
      if (typeof(this.field) == "object")
        return spotDOM.handleize(this.getName());
      if (this.field == "best-selling" || (this.field == "sales" && this.direction == "desc"))
        return "best-selling";
      if ((this.field == "manual" && this.direction == "asc") || (this.field == "search" && this.direction == "desc"))
        return this.field;
      return this.field + "-" + this.direction + "ending";
    };

    /**

    ##### getShopifySortOrder

    Returns what the Shopify sort order value would be for this sort option; used when `shopifyMode` is active.

    **/
    this.getShopifySortOrder = function() {
      return this.getUniqueId();
    };
    
    /**
    
    ##### isShopifySortOrder
    
    Returns whether or not this sort order would be applicable in Shopify, or whether this is a custom sort order.

    **/
    /**

    ##### isRelevant

    Returns true if this sort order is relevant to the current situation (i.e. will ignore things like "best match" if you're not searching).

    **/
    this.isRelevant = function() {
      if (this.field == "search")
        return spotDOM.search() || spotDOM.isSearchPage();
      if (this.field == "manual")
        return spotDOM.collection() || spotDOM.isCollectionPage();
      return true;
    };
  };


  /**

  ## Events

  SpotDOM will fire off certain events which should be handled by your implementation. A detailed list is below. A callback handler can be supplied by simply passing a single function as the argument
  to the listed event.

  ### products

  The **most important** event. A listener which receives the list of products when a query complete. This should be generally used to populate your various DOM elements.

  For example, to simply list all prodcuts returned by a query, you can write the following.

    spotDOM.products(function(products) { console.log(products); });

  **/
  this.scalarField(this, 'products');
  /**

  ### spellCheck

  A listener which receives the result of a spellingCheck, if one was performed. It is called with an object representing the results of the check, which includes the original string, and what
  it was corrected to.

  **/
  this.scalarField(this, 'spellCheck');
  /**

  ### beginQuery

  Called when a query in requested, before any work is done. Can be used to alter the state of the page before things are processed into the query.

  ### query

  Called immediately after results are returned, contains all products, and resultset information. If you need to do any manual processing of the return data, to populate some information about the resultset,
  such as to update facets, or pagination, it's usually done in here.

  **/
  this.listeners(this, 'beginQuery');
  /**

  ### endQuery

  Called when a query has been completed after all work is done, and all handlers are called.

  **/
  this.listeners(this, 'endQuery');
  /**
  ## Variables

  Various variables exist on the SpotDOM object. All variables can be hooked with a listener, which runs whenever the variable is set, in the exact same manner as events listed above.
  This should be your main way of interacting with the SpotDOM object to customize its behaviour.

  ### Array Variables

  Array variables have two functions; .addVariableName and .removeVariableName. Both of these can be hooked, by passing a function to either.

  #### facet

  Contains a list of all facets to be used by the system. The full list can be retrieved with `.facets()`, and individual facets can be added/removed with
  `.addFacet(facet)` or `.removeFacet(facet)`.

  **/
  this.arrayField(this, 'facet');
  /**

  #### condition

  Contans a list of all conditions to be applied to all queries generated from the system. Individual conditiosn can be added/removed with
  `.addCondition` or `.removeCondition`.

  **/  
  this.arrayField(this, 'condition');
  /**

  #### recommendations

  Contains a list of all recommendations to be made by the system. The full list can be retrieved with `.recommendations()`, and individual facets can be added/removed with
  `.addRecommendation(recommendations)` or `.removeRecommendation(recommendation)`.

  **/
  this.arrayField(this, 'recommendation');
  /**

  #### redirects

  Contains a list of all redirects to be made by the system. The full list can be retrieved with `.redirects()`, and individual redirects can be added/removed with
  `.addRedirect(redirect)` or `.removeRedirect(redirect)`.
  
  Redirects will be acted upon when a user decides to search, by either hitting enter, or hitting "Show Results".
  
  A sample redirect looks like: `{"locale":"en","term":"Shoes","type":"exact"}`

  **/
  this.arrayField(this, 'redirect');
  /**

  #### sortOrder

  Contains a list of all possible sort orders for this view. The full list can be retrieved with `.sortOrders()`, and individual orders can be added/removed
  with `.addSortOrder(sortOrder)` or `.removeSortOrder(sortOrder)`.

  **/
  this.arrayField(this, 'sortOrder');
  // If our current sort order is transient, swap it for the one we've just entered, if their IDs are identical.
  this.addSortOrder(function(sortOrder) {
    if (this.sort() && sortOrder.getUniqueId() == this.sort().getUniqueId())
      this.sort(sortOrder, false);
  });
  // This function does magic to retrieve a sort order from amongst the listed array.
  // Takes all sort of stuff. unique ids, original sort order declrations, field descriptors.
  this.getSortOrder = function(magic) {
    return spotDOM.sortOrders().filter(function(e) {
      if (magic.getUniqueId)
        return magic.getUniqueId() == e.getUniqueId();
      if (magic.label)
        return magic.label == e.getName();
    })[0];
  };
  /**

  ### Scalar Variables

  Scalar variables can be hooked by simply calling the name of the variable, and passing a function, like so:

      spotDOM.collection(function(collection) { console.log("The collection I set is: " + collection); })

  #### collection

  Denotes the collection to search in. By default, this is taken from the address bar path. If not present, no collection is used.
  **/
  this.getCollectionPage = function() {
    var groups = /\/collections\/([^#\/?]+)/.exec(window.location.pathname);
    return groups && groups.length > 1 && groups[1] != "vendors" && groups[1] != "types" ? groups[1] : null;
  };
  this.scalarField(this, 'collection', this.getCollectionPage());
  /**

  #### queryCount

  The amount of queries this instance has issued.

  **/
  this.scalarField(this, 'queryCount', 0);
  /**

  #### personalization

  Sets the personalization for this particular DOM instance.

  **/
  this.scalarField(this, 'personalization');
  /**
  
  #### sort

  Denotes the sort order. By default, this is taken from the query paramters. Possible values include all normal Shopify values, for the sorting dropdown, as well as "search", "featured", and any custom sort orders you may have set up in Spot.

  Can also take in a `SortOrder` object from the `sortOrders` array. If the `sort` is set to be a string, it will automaticalliy wrap the incoming string in a `SortOrder` object before setting it. This is known as a transient sort order. This sort order
  is not automatically passed to listeners, and once unset, will be removed from the list.

  **/
  this.scalarField(this, 'sort', vars['sort_by'], {
    "preset": function(value) {
      if (typeof(value) == "string") {
        var orders = spotAPI.grep(this.sortOrders(), function(e) { return e.getUniqueId() == value });
        if (orders.length > 0)
          return orders[0];
        return new this.SortOrder(value);
      }
      return value;
    }
  });
  /**
  
  #### search

  The free-form text search used currently. Taken from the "q" query parameter, by default. If not present, performs no textual search.

  **/
  this.scalarField(this, 'search', vars['q'] && vars['q'].replace(/( AND )?\(\(.*/g, "") ? vars['q'].replace(/( AND )?\(\(.*/g, "") : null);
  /**
  
  #### searchBoost

  A list of boosts to apply on various search terms. This is referred to as "search pins" in the admin control panel.

  **/
  this.arrayField(this, 'searchBoost');
  /**
  #### autoCorrect

  Determines whether queries should be made with autoCorrect. On by default.

  **/
  this.scalarField(this, 'autoCorrect', true);
  /**

  #### pins

  The pins used for this query. Pins are set up in the Spot control panel. By default, there are no pins.
  This is an array of product ids, that will force the products, in the order specified, to always be
  at the top of the returned query. Search pins may or may not appear in this array, even if set up in the
  control panel.

  **/
  this.scalarField(this, 'pins', vars['pins'] || []);
  /**

  #### boosts

  The boosts used for this query. Boosts are set up in the Spot control panel by boost rules. 
  By default, there are no boosts. They can however be applied conditionally on certain resultsets,
  and in certain contexts.
  
  This is a query derived from boost rules that boost certain products and results over others.

  **/
  this.scalarField(this, 'boosts', vars['boosts']);
  /**

  #### split

  The split used for this query. Splits are set up in the Spot control panel. By default, the split is "auto".

  **/
  this.scalarField(this, 'split', vars['split'] || 'auto');
  /**

  #### page

  The page used. By default, this is 1, unless specified in the query string to be different.

  **/
  this.scalarField(this, 'page', parseInt(vars['page']) || 1);
  /**

  #### locale

  The locale used. By default, this is `Shopify.locale`. If no locales are set up on your store, this will be ignored by Spot. Shouldn't be modified after init, generally.
  This is becuase unless the rest of the site is also JS-based, huge amounts of text is also not going to be translated.

  **/
  this.scalarField(this, 'locale', window.Shopify ? window.Shopify.locale : null);
  /**

  #### currency

  The currency used. By default, this is taken from `Shopify.currency`. Takes a hash in the form of { code: "3LC", "rate": 1.0000 }.

  **/
  this.scalarField(this, 'currency', window.Shopify && window.Shopify.currency ? { code: window.Shopify.currency.active, rate: window.Shopify.currency.rate } : null);
  /**

  #### fields

  The fields required of the returned products. By specifying an array here, you can reduce the amount of bandwidth required to retrieve a page of products.
  By default, this is empty, and the query will return the entire product data.

  **/
  this.scalarField(this, 'fields');
  /**

  #### count

  The amount of products in the last resultset queried, as returned by a query.

  **/
  this.scalarField(this, 'count');
  /**

  #### countBehavior

  The type of count that is performed. See the [SpotAPI counting section](#resultset-counting) for details. By default, this is "approximate".

  **/
  this.scalarField(this, 'countBehavior', 'approximate');
  /**

  #### optionBehavior

  The type of count that is performed for facets. The four supported values are `none`, `exists`, `approximate` and `exact`. By default, this is `approximate`. The meanings of this are below, in decreasing order of speed.

  * `none`: Will not pass options to Spot, but will instead simply keep track of facets without counting. Fastest.
  * `exists`: Will return a 1 or 0, depending on whether or not the facet has any values in the resultset. Pretty Fast.
  * `approximate`: What this means varies depending on the situation, but generally it means that if you have a decent amount of facets and/or products returned, the counts displayed next to each facet won't be exact. Semi-Fast.
  * `exact`: Will return the exact amount of products on a particular facet. Slowest.

  **/
  this.scalarField(this, 'optionBehavior', 'approximate');
  /**

  #### maxFacetValuesPerFacet

  The maximum amount of values returned for facets in this query. For performance reasons this number is clamped to 1000, maximum.
  
  **/
  this.scalarField(this, 'maxFacetValuesPerFacet', 100);

  /**

  #### paginate

  The amount of products to be returned in a given page of products. By default, this is taken from the query string, in the `rows`, or `paginate` parameters.
  If neither of these are specified, it's taken from whatever spot's default query is, and if that's not specified, the default is 12.

  **/
  this.scalarField(this, 'paginate', parseInt(vars['rows'] || vars['paginate'] || spotAPI.s().innerAttributes.rows || 12));
  /**

  #### allVariants

  By default, false. Determines whether or not we should return ALL the variants present for a particular product that gets a hit from the query. This property can have
  three values.

  * `false`: Retrieve only variants which match your criteria.
  * `"flag"`: Retrieve all variants for your product resultset, but add a true boolean of "relevant" in the product JSON to denote which variants are relevant for your query.
  * `true`: Retrieve all variants for your product resultset.

  As an example, if this is false, when you query for every "Green" variant that's in stock, you'll get only products who have a green variant that's in stock, and a Red in stock variant on the same product will be omitted.
  If true, you'd get that, Red in stock variant as well. If `"flag"`, you'd get the Red variant, but it wouldn't have `"relevant":true`, whereas the Green variants would.
  
  **NB**: When using `"flag"`, absence of the key `relevant` is considered `false`.


  **/
  this.scalarField(this, 'allVariants', false);
  /**

  #### omitExtraneousResults

  By default, false. Determines whether or not we should omit extraneous results from search that may
  or may not be relevant. If set to true, or a specific number, it will omit results that have a normalized relevancy score below
  the specified threshold (or `0.8` if `true`). Normalized scores are computed via the following formula:

      score = (ln(relevancy) - ln(lowest_relevancy_in_set)) / (ln(highest_relveancy_in_set) - ln(lowest_relevancy_in_set))

  A bit of a sledgehammer, and will not work in all situations, but if a store uses very broad terms that have highly relevant results
  and little relevant results together, can be used to work through the situation in a transparent manner.

  **/
  this.scalarField(this, 'omitExtraneousResults', false);
  /**

  #### debugMode

  A boolean flag. Has three different modes, true, false, and null. By default, the value is the value of the "debugMode" key in session storage.

  If true, the following happens:
  
  * Warnings are promoted to errors, and throw exceptions.
  * `failBehaviour` is set to `null`.

  If false, the following happens:
  
  * Warnings are logged to a console, if present, but otherwise ignored.

  If null, the following happens:
  
  * Upon a request being made, if the debugger is open in at least Chrome, or if Firebug is being used, debugMode is set to true.
  * Warnings are logged to a console, if present, but otherwise ignored.

  **/
  this.scalarField(this, 'debugMode', this.getStorage("spotDebugMode"));
  if (this.debugMode())
    this.log("This instance of Spot has booted in 'Debug Mode'. Warnings are promoted to errors, and failBehaviour has been forced to null.");

  // This is somewhat ill-supported. Consider removing this.
  this.debuggerOpened = false;
  this.isDebuggerOpen = function() {
    /* if (window.console) {
      if (window.console.firebug)
        this.debuggerOpened = true;
      try {
        var devtools = function(){};
        devtools.toString = function() {
          this.debuggerOpened = true;
        };
        console.log('%c', devtools);
      } catch (e) {

      }
    }*/
    return this.debuggerOpened;
  };
  /**
  #### shopifyMode

  If this is set to true, either because of a Spot outage, or other reason, Spot will do its best to serve queries using Shopfy's native system, although it will not be possible to offer
  the full Spot featureset. Should be hooked to enable/disable Spot specific features over and above faceting (if you have any). Related to `failBehavior` below.

  By default, if this is set, its value is stored in sessionStorage. This value will persist until the user quits or restarts their browser,
  or until 10 minutes have passed, whichever is quicker. Whenever a page loads in shopifyMode, a console log will be emitted informing the user of this.

  When set to true, the implementation will remove all facets that cannot be served up by Shopify's native system. This means the following:

  * Anything that is not a tag-based facet will be removed.
  * If the user is on the search page, in addition to tag-based facets, it will also preserve product_type facets, and vendor facets, if the `values` for these are presented to the system as part of its initialization (see [facets](#facets) below).

  **/
  this.scalarField(this, 'shopifyMode', this.getStorage("spotShopifyMode") || false);
  if (this.shopifyMode())
    this.log("This instance of Spot has booted in 'Shopify Mode', due to an error encountered previously. To disable this functionality, make sure you call spotDOM.failBehavior(null) immediately after instantiating. To disable it transiently, call spotDOM.shopifyMode(false) in your console.");
  /**

  #### failBehavior

  By default this is set to `"shopify"`. Other valid values are `null`. When set to `"shopify"`, when a Spot query fails, for whatever reason, Spot will set `shopifyMode`
  to true, and call all listeners. This allows you to gracefully degrade into a shopify-powered version of search and faceting. While nowhere near as powerful,
  or sporting many features, this should enable the site to still serve products and searches, even if most of the powerful functionality is lost while the outage
  occurs. When this is set to `null`, and `shopifyMode()` is true, it will automatically set `shopifyMode(false)`.

  **/
  this.scalarField(this, 'failBehavior', "shopify");
  this.failBehavior(function(behavior) {
    if (behavior == null && this.shopifyMode())
      this.shopifyMode(false);
  });
  this.debugMode(function(debug) {
    this.setStorage("spotDebugMode", debug);
    if (debug != null) {
      if (debug) {
        this.failBehaviour(null);
      }
    }
  }, true);

  /**

  #### moneyFormat

  The format you want to render prices in, by default. By default this is '${{amount}}'.

  **/
  this.scalarField(this, 'moneyFormat', '${{amount}}');


  /**

  #### variantId

  The ID of the selected variant. Only valid on the PDP.

  **/
  var vars = this.getUrlVars();
  this.scalarField(this, 'variantId', vars['variant']);

  /**

  ## Functions

  A number of utility functions which make managing dom elements easier.

  ### getProductTitle

  Takes in a product, and returns an appropriate description, based on returned variants, if `allVariants` is false, and splits. Generally should be preferred over simply using `product.title`.
  Basically, loop through all three options on a product. If all variants share the same value for this option, add the option to our returned string.

  As an example, if the result of a product query returns a product called "T-Shirt" has "Size" and "Color" as options, if our returned variants are ["Red", "Small"], ["Red", "Large"],
  ["Green", "Small], ["Green", "Large"] the title would be output as "T-Shirt".

  If the same query has the result of ["Red", "Small"], ["Red", "Large"], the returned title would be "T-Shirt - Red".

  **/
  this.getProductTitle = function(product) {
    var option1 = {};
    var option2 = {};
    var option3 = {};
    var relevant = false;
    var i;
    for (i = 0; i < product.variants.length; ++i) {
      if (product.variants[i].relevant)
        relevant = true;
    }
    for (i = 0; i < product.variants.length; ++i) {
      if (!relevant || product.variants[i].relevant) {
        if (product.variants[i].option1 != null && product.variants[i].option1 != "")
          option1[product.variants[i].option1] = 1;
        if (product.variants[i].option2 != null && product.variants[i].option2 != "")
          option2[product.variants[i].option2] = 1;
        if (product.variants[i].option3 != null && product.variants[i].option3 != "")
          option3[product.variants[i].option3] = 1;
      }
    }
    var option1keys = Object.keys(option1);
    var option2keys = Object.keys(option2);
    var option3keys = Object.keys(option3);
    var extraElements = [];
    if (option1keys.length == 1 && option1keys[0] != "Default Title")
      extraElements.push(option1keys[0]);
    if (option2keys.length == 1)
      extraElements.push(option2keys[0]);
    if (option3keys.length == 1)
      extraElements.push(option3keys[0]);
    if (extraElements.length > 0)
      return product.title + " - " + extraElements.join(" / ");
    return product.title;
  };
  
  // Returns null if there is no particularly relevant list of variants.
  this.getRelevantVariants = function(product) {
    if (!product.variants)
      return null;
    var relevant = product.variants.filter(function(v) { return v.relevant; }).length > 0;
    var validOptions = [{}, {}, {}];
    var missingVariants = false;
    if (product.options) {
      product.variants.filter(function(v) { return !relevant || v.relevant }).forEach(function(v) {
        validOptions[0][v.option1] = 1;
        if (product.options.length > 1)
          validOptions[1][v.option2] = 1;
        if (product.options.length > 2)
          validOptions[2][v.option3] = 1;
      });
      product.options.forEach(function(option, idx) {
        if (option.values) {
          option.values.filter(function(v) { 
            if (!validOptions[idx][v])
              missingVariants = true;
          });  
        }
      });
    }
    if (!missingVariants)
      return null;
    return product.variants.filter(function(v) { return !relevant || v.relevant });
  };
  this.getRelevantVariant = function(product) { return (this.getRelevantVariants(product) || [])[0]; }
  /**


  ### getProductPrice

  Takes in a product, and returns an appropriate price, based on returned variants, if `allVariants` is false, and splits. 

  **/
  this.getProductPrice = function(product) {
    if (product.price)
      return product.price / 100.0;
    return Math.min.apply(null, (this.getRelevantVariants(product) || product.variants).map(function(e) { return e.price; }));
  };
  
  /**

  ### getProductURL

  Takes in a product, and returns an appropriate URL. Will either return a direct link to the product, or one nestled in a collection, or with a variant if applicable.

  **/	
  this.getProductURL = function(product) {
    var prefix = "";
    if (!this.isPrimaryLocale())
      prefix = "/" + this.locale();
    var variant = this.getRelevantVariant(product);
    var suffix = "";
    if (variant && variant.id)
      suffix = "?variant=" + encodeURIComponent(variant.id);
    if (this.collection())
      return prefix + '/collections/' + this.collection() + '/products/' + product.handle + suffix;
    return prefix + '/products/' + product.handle + suffix;
  };
  /**


  ### getProductImage

  Takes in a product, and returns an appropriate description, based on returned variants, if `allVariants` is false, and splits. Generally should be preferred over simply using `product.image`.

  Allows for the system to remove irrelevant images from results that only return some variants, or results that are using a split.

  **/
  this.getProductImage = function(product) {
    if (product.featured_image)
      return product.featured_image;
    return spotAPI.getFeaturedImage(product);
  };
  /**

  ### formatMoney

  Takes in the value from Spot, converts it to the local currency be used, as well as an optional formatting string, and returns a nicely formatted string. For example, passing "1000", could return "$1,000.00", depending
  on the money format.

  **/
  this.formatMoney = function(money, format, currency) {
    if (!currency)
      currency = this.currency();
    if (currency)
      money *= currency.rate;
    if (!format)
      format = this.moneyFormat() || "{{ amount }}";
    var dollars = "0", cents = "00";
    var result = format;
    if (money > 0) {
      money = "" + Math.round(money * 100);
      dollars = money.slice(0, -2);
      cents = money.slice(-2);
    }
    result = result.replace(/{{\s*amount\s*}}/gi, dollars.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "." + cents );
    result = result.replace(/{{\s*amount_no_decimals\s*}}/gi, dollars);
    result = result.replace(/{{\s*amount_with_comma_separator\s*}}/gi, dollars.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "," + cents);
    result = result.replace(/{{\s*amount_no_decimals_with_comma_separator\s*}}/gi, dollars);
    result = result.replace(/{{\s*amount_with_apostrophe_separator\s*}}/gi, dollars.replace(/\B(?=(\d{3})+(?!\d))/g, "'") + "." + cents);
    return result;
  };
  /**

  ### getSizedImage

  Takes in an image url/object, and a size, and then returns the relevant URL for that image, sized at a particular size, using Shopify's image CDN.

  **/
  this.getSizedImage = function(image, size) {
    if (!image)
      return null;
    if (typeof(image) == "object")
      image = image['src'];
    return image.replace(/(?:_\d*x\d*)?(?=\.[^.]*(?:\?.*)?$)/, '_' + size);
  };
  /**

  ### getSizedImageDimensions

  Takes in an image url/object, and a size, and then returns the relevant dimensions for that image, at that size.

  **/
  this.getSizedImageDimensions = function(image, size) {
    if (!image)
      return null;
    var sizes = size.split("x");
    if (typeof(image) == "object" && sizes.length == 2 && image.width && image.height) {
      var max = Math.max(image.width, image.height);
      return [Math.round(sizes[0] * image.width / max), Math.round(sizes[1] * image.height / max)];
    }
    return null;
  };
  /**

  ### isSearchPage

  Tells you whether or not you're on Shopify's search page.

  **/
  this.isSearchPage = function() {
    return /\/search\b/.test(window.location.pathname);
  };
  /**

  ### isCollectionPage

  Tells you whether or not you're on a collection page.

  **/
  this.isCollectionPage = function() {
    return /\/collections\b/.test(window.location.pathname) && !this.isProductPage();
  };
  /**

  ### isThankYouPage

  Tells you whether or not you're on the order completed "Thank you" page.

  **/
  this.isThankYouPage = function() {
    return /\/orders\b/.test(window.location.pathname);
  };
  /**

  ### getOverrideRuleHandle

  Retrieves the ruleset handle that should be overriding for this page. Comes
  from either the ?rule= query parameter, or, if on a collection page, the
  bit beyond the collection handle.

  **/
  this.getOverrideRuleHandle = function() {
    var vars = this.getUrlVars();
    if (vars['rule'])
      return vars['rule'];
    if (this.isCollectionPage()) {
      var rule = /\/collections\/[^\/]+\/([\-\w]+)/.exec(window.location.pathname);
      if (rule && rule[1])
        return rule[1];
    }
    return null;
  };

  /**

  ### isPrimaryLocale

  Tells you whether or not the currently loaded locale is the primary locale.

  **/
  this.isPrimaryLocale = function() {
    return !window.Shopify || window.location.pathname.indexOf(window.Shopify.locale) != 1;
  };

  /**

  ### getCollectionPage

  Gets the handle of the collection page you're on from the URL.

  **/

  /**
  
  ### hasVariantID
  
  Checks whether or not the page has explicitly selected a variant id in the query string.
  
  **/
  this.hasVariantID = function() {
    if (this.isProductPage())
      return this.getUrlVars()['variant'] != null;
    return false;
  };

  /**

  ### getVariantID

  Gets the selected variant ID from the product PDP.

  **/
  this.getVariantID = function() {
    if (this.isProductPage()) {
      var id = this.getUrlVars()['variant'];
      if (id)
        return id;
      id = document.querySelector("form[action='/cart/add'] input[name='id']")
      return id && id.value;
    }
  };
  /**

  ### isVendorCollectionPage

  Tells you whether or not you're on Shopify's vendor filtration collection.

  **/
  this.isVendorCollectionPage = function() {
    return /\/collections\/vendors\b/.test(window.location.href) && !this.isProductPage();
  };
  /**

  ### getVendorCollectionPage

  Returns the vendor queried on the vendor collection page.

  **/
  this.getVendorCollectionPage = function() {
    return this.isVendorCollectionPage() && this.getUrlVars()['q'];
  };
  /**

  ### isProductTypeCollectionPage

  Tells you whether or not you're on Shopify's product type filtration collection.

  **/
  this.isProductTypeCollectionPage = function() {
    return /\/collections\/types\b/.test(window.location.href) && !this.isProductPage();
  };
  /**

  ### getProductTypeCollectionPage

  Returns the product type quereid on the product type collection page.

  **/
  this.getProductTypeCollectionPage = function() {
    return this.isProductTypeCollectionPage() && this.getUrlVars()['q'];
  };


  /**

  ### getCollectionPageTags

  Returns a list of tags that the system is currently filtering by, Shopify style. (present at the end of the path on a collection, separated by '+')

  **/
  this.getCollectionPageTags = function() {
    var groups = /\/collections\/[^/]+\/(.*)/.exec(window.location.pathname);
    if (groups && groups[1])
      return spotAPI.map(groups[1].split("+"), function(e) { return decodeURI(e); });
    return [];
  };
  /**

  ### isProductPage

  Tells you whether or not you're on a product page.

  **/
  this.isProductPage = function() {
    return /\/products/.test(window.location.href);
  };
  
  /**

  ### getProductPage

  Gets the handle of the product who's page you're on.

  **/
  this.getProductPage = function() {
    var groups = /\/products\/([^#\/?]+)/.exec(window.location.pathname);
    return groups && groups.length > 1 ? groups[1] : null;
  };
  
  /**

  ### generateQueryVariables

  Given the existing facets, sort order, page and search, generates a hash that represents the variables that should be placed into the query string.

  **/
  this.generateQueryVariables = function() {
    var vars = this.getUrlVars();
    for (var i in vars) {
      if (/^f_/.test(i) || i == "page" || i == "q" || i == "sort_by")
        delete vars[i];
    }
    this.composeFacetQueryString(vars);
    if (this.page() > 1)
      vars['page'] = this.page();
    if (this.sort())
      vars['sort_by'] = this.sort().getUniqueId();
    if (this.search())
      vars['q'] = this.search();
    return vars;
  };
  /**

  ### generateQueryString

  Optionally takes in a hash. Calls `generateQueryVariables`, and merges it with the provided hash, then URL-encodes everything to produce the query string that should be placed
  into the browser's query string.

  **/
  this.generateQueryString = function(mergeHash) {
    var vars = this.generateQueryVariables();
    if (mergeHash) {
      for (var i in mergeHash)
        vars[i] = mergeHash[i];
    }
    return this.encodeUrlVars(vars);
  };
  /**

  ### updateQueryString

  Optionally takes in a hash. Calls `generateQueryString`, and places it into the browser's address bar, `using window.history.pushState`, if applicable.

  **/
  this.updateQueryString = function(mergeHash) {
    var url = window.location.protocol + "//" + window.location.host + window.location.pathname;
    var str = this.generateQueryString(mergeHash);
    if (str != "?")
      url += this.generateQueryString(mergeHash);
    if (window.history && url != window.location.href)
      window.history.pushState({}, document.title, url);
  };

  /**

  ### generateQuery

  Generates a query object from spotAPI that takes into account all the selected facets, various behaviour modifiers, sorting, search, spell check,
  split, and everything like that, and returns the actual spotAPI object that does the work, and can be `.e()`'d to retrieve the desired resultset.

  **/
  this.generateQuery = function() {
    var query = this.spotAPI.s().count(true, this.countBehavior()).allVariants(this.allVariants()).paginate(this.paginate()).page(this.page());
    if (this.sort())
      query = query.sort(this.sort().direction == "asc" ? {"asc": this.sort().field } : { "desc": this.sort().field });
    if (this.collection())
      query = query.collection(this.collection());
    if (this.getVendorCollectionPage())
      query = query.vendor(this.getVendorCollectionPage());
    else if (this.getProductTypeCollectionPage())
      query = query.product_type(this.getProductTypeCollectionPage());
    if (this.conditions() && this.conditions().length > 0)
      query = query.merge(this.conditions());
    query = this.composeFacetQuery(query);
    if (this.search() != null)
      query = query.search(this.search()).autoCorrect(this.autoCorrect()).omitExtraneousResults(this.omitExtraneousResults());
    if (this.fields())
      query = query.fields(this.fields());
    if (this.split())
      query = query.split(this.split());
    if (this.currency())
      query = query.currency(this.currency());
    if (this.locale())
      query = query.locale(this.locale());
    var pinQuery = this.spotAPI.se();
    if (this.pins() && this.pins().length > 0) {
      var len = this.pins().length;
      this.pins().forEach(function(e, idx) { pinQuery = pinQuery.id("==", e, len - idx); });
    }
    if (this.search() && this.searchBoosts().length > 0) {
      var search = this.normalizeSearch(this.search());
      this.searchBoosts().filter(function(e) {
        var term = this.normalizeSearch(e.term);
        var idx = search.indexOf(term);
        return idx != -1 && (
          (e.type == "substring") ||
          (e.type == "exact" && idx == 0 && search == term.length) ||
          (e.type == "word" && (idx == 0 || /\w/.test(search.charAt(idx-1))) && (idx == search.length || /\w/.test(search.charAt(idx+1)))));
      }).flatMap(function(e) { return e.products.forEach(function(p) { pinQuery = pinQuery.id("==", p[0], p[1]); }); });
    }
    if (this.boosts())
      query = query.boost(this.boosts().merge(pinQuery));
    if (this.personalization())
      query = this.personalization().apply(query);
    return query;
  };
  /**

  ### initDefaultSortOrders

  Initializes the system with the default set of Shopify sort options.

  * Featured (if on collections page)
  * Best Match (if on search page)
  * Price: Low to High
  * Price: High to Low
  * A-Z
  * Z-A
  * Oldest to Newest
  * Newest to Oldest
  * Best Selling

  **/
  this.initDefaultSortOrders = function() {
    if (this.isCollectionPage())
      this.addSortOrder(new this.SortOrder("manual", "asc"));
    else if (this.isSearchPage())
      this.addSortOrder(new this.SortOrder("search", "desc"));
    this.addSortOrder(new this.SortOrder("price", "asc"));
    this.addSortOrder(new this.SortOrder("price", "desc"));
    this.addSortOrder(new this.SortOrder("title", "asc"));
    this.addSortOrder(new this.SortOrder("title", "desc"));
    this.addSortOrder(new this.SortOrder("created", "asc"));
    this.addSortOrder(new this.SortOrder("created", "desc"));
    this.addSortOrder(new this.SortOrder("best-selling", "desc"));
  };
  /**

  ### queryGuard

  Ensures that only one query is run within this block, at the end, if .query() was ever called. If it's never called, then no query is run. Useful for things like initailizations where one might
  have queries triggered in multiple places on changing things. Returns a deferred that contains the query payload if one occurred, or one that resolves with an empty argument list if no query was
  run.

  As an example:

      spotDOM.queryGuard(function() {
        spotDOM.query();
        spotDOM.query();
        spotDOM.query();
      });

  In the above example, only one query would be run.

      spotDOM.queryGuard(function() {
      });

  In this example, no queries are run.

  These can also be nested, but only the query will only ever be run on the outer-most block.

      spotDOM.queryGuard(function() {
        spotDOM.query();
        spotDOM.queryGuard(function() {
          spotDOM.query();
        });
        spotDOM.query();
        spotDOM.query();
      });
      // Query will run here.

  In the above example, a query will only run when the comment is reached.

  **/
  this.queryGuard = function(block) {
    if (this["_queryWaiter"]) {
      block();
      return this["_queryWaiter"];
    }
    this["_queryWaiter"] = spotAPI.Deferred();
    block();
    var deferred = this["_queryWaiter"];
    this["_queryWaiter"] = null;
    if (this["_queryRequests"]) {
      this["_queryRequests"] = 0;
      this.query().done(function() {
        deferred.resolve.apply(deferred, arguments);
      }).fail(function() {
        deferred.reject.apply(deferred, arguments);
      });
    } else {
      deferred.resolve();
    }
    return deferred;
  };


  /**

  ## Tying it Together

  A great way to get an idea of how all this works together is to look at SpotDefault's sample implementation of a panel. It gives a concise overall view
  of how to build a faceting panel using the above techniques. You can see it [here](#pane).

  **/

  this.updateFacets = function(options, boundaries) {
    var facets = this.facets();
    var optionIdx = 0;
    var boundaryIdx = 0;
    for (var i = 0; i < facets.length; ++i) {
      if (facets[i].isValidLocale(spotDOM.locale())) {
        var boundary = facets[i].getBoundary();
        if (boundary) {
          if (boundaries && boundaries[boundaryIdx]) {
            var boundaryArray = [];
            boundaryArray[0] = (boundary[0] == null ? boundaries[boundaryIdx++] : boundary[0]);
            boundaryArray[1] = (boundary[1] == null ? boundaries[boundaryIdx++] : boundary[1]);
            facets[i].update(boundaryArray);
          }
        } else {
          facets[i].update(options[optionIdx++]);
        }
      }
    }
  };


  this.composeFacetQuery = function(query) {
    var facetArray = [];
    var boundaryArray = [];
    var facetingQuery = spotDOM.spotAPI.se();
    var boundaryQuery = spotDOM.spotAPI.se();
    var facets = this.facets();
    for (var i = 0; i < facets.length; ++i) {
      if (facets[i].isValidLocale(spotDOM.locale())) {
        var boundary = facets[i].getBoundary();
        if (boundary) {
          if (boundary[0] == null)
            boundaryArray.push({ "min": facets[i].getOptionValue() });
          if (boundary[1] == null)
            boundaryArray.push({ "max": facets[i].getOptionValue() });
          boundaryQuery = facets[i].composeQuery(boundaryQuery);
        } else {
          facetArray.push(facets[i].getOptionValue());
          facetingQuery = facets[i].composeQuery(facetingQuery);
        }
      }
    }
    query = query.facets(facetingQuery);
    if (this.optionBehavior() != "none")
      query = query.facetOptions(facetArray, true, this.optionBehavior());
    if (boundaryArray.length > 0) {
      query = query.boundaries(boundaryQuery)
      query = query.boundaryOptions(boundaryArray);
    }
    return query;
  };
  this.composeFacetQueryString = function(vars) {
    var facets = this.facets();
    for (var i in facets) {
      if (facets[i].isValidLocale(spotDOM.locale()))
        facets[i].composeQueryString(vars);
    }
    return vars;
  };

  // Persist this across sessions.
  this.shopifyMode(function(mode) {
    this.setStorage("spotShopifyMode", mode, 10*60);
  });
};

/***

SpotEvent Documentation
=======================

## Overview

`SpotEvent` is a class that provides an easy way to send common events via the API to Spot, or alternatively, to your google analytics account. It is used by `SpotDefault`, the default implementation.

**/


window.SpotEvent = window.SpotEvent || function(spotAPI, target) {
  this.target = target;
  this.spotAPI = spotAPI;

  /**

  ### beginSession

  Allows for tracking a user the second they get on the page, rather than when they engage with the search system.

  **/
  this.beginSession = function() {
    return this.spotAPI.sendEvent(new this.spotAPI.EventObject(1));
  };

  /**

  ### loggedIn(customerId)

  If you want to identify a session to a particular customer, you can use this to tie a custoemr ID to a session.

  **/
  this.loggedIn = function(customerId) {
    return this.spotAPI.sendEvent(new this.spotAPI.EventObject(2, { customerId: customerId}));
  };
  /**

  ### clickedProduct(productId, position)

  Logs when a product is clicked on, and what position it was in, in a particular collection. Useful for personalizing the user's results, and figuring out the user's likes.

  **/
  this.clickedProduct = function(productId, position) {
    return this.spotAPI.sendEvent(new this.spotAPI.EventObject(3, { productId: productId, position: position }));
  };


  /**

  ### addedProductToCart(variantId, quantity)

  Logs when a proudct is added to cart, and how much of it.

  **/
  this.addedProductToCart = function(variantId, quantity) {
    return this.spotAPI.sendEvent(new this.spotAPI.EventObject(4, { variantId:variantId, quantity: quantity }));
  };

  /**

  ### completedOrder(orderId)

  Logs when a user completes an order, allowing conversion to be tracked alongside search engagement.

  **/
  this.completedOrder = function(orderId) {
    return this.spotAPI.sendEvent(new this.spotAPI.EventObject(5, { orderId: orderId }));
  };
}

/***

SpotDefault Documentation
=========================

## Overview

`SpotDefault` is a class that provides a sample implementation of spot, using `SpotDOM`, and `SpotAPI`. Allows you to use out of the box pagination, and pane construction. The individual components are detailed below. 

**If you are going to change SpotDefault's code**, copy the entire object to your own snippet, rename it (to `MyShopSpot`, or something similar), and make the changes there.

### Who should use this class?

`SpotDefault` *should* be the way you use Spot. It's generally pretty configurable, and almost any stylistic elements can be overidden or changed with CSS, or a different initialization call. This should be preferred way
to change look and feel, or affect functionality.

### Sample Usage

The minimal way to initialize the `SpotDefault` class in your Shopify store is the following liquid snippet.

```html
  {{ "spot.js" | asset_url | script_tag }}
  <script type='text/javascript'>
    SpotDefault.init({
      clusters: {{ shop.metafields.esafilters.clusters | json }},
      settings: {% assign general_settings_theme_id = "general-settings-" | append: theme.id %}{% assign settings = shop.metafields.esafilters[general_settings_theme_id] | default: shop.metafields.esafilters.general-settings %}{% if settings %}{{ settings | json }}{% else %}{}{% endif %},
      rule: {% assign collection_ruleset_theme_id = "collection-ruleset-" | append: theme.id %}{{ collection.metafields.esafilters[collection_ruleset_theme_id] | default: collection.metafields.esafilters.collection-ruleset | json }},
      moneyFormat: "{{ shop.money_format }}"
    });
  </script>
```

This will initialize all the normal components of spot automatically. If you want to use each component individually, read on.

## Components

**/
window.SpotDefault = window.SpotDefault || function(spotDOM, spotEvent, language) {
  if (!spotDOM)
    throw "Requires SpotDOM. Please pass a copy of the API to SpotDefault's constructor.";

  var spotDefault = this;
  this.spotDOM = spotDOM;
  this.spotEvent = spotEvent;
  spotDOM.arrayField(this, 'recentSearch', spotDOM.spotAPI.getStorage("spotRecentSearches") || [], "recentSearches");
  this.addRecentSearch(function(search) {
    spotDOM.spotAPI.setStorage("spotRecentSearches", this.recentSearches());
  });
  spotDOM.arrayField(this, 'recentProduct', spotDOM.spotAPI.getStorage("spotRecentProducts") || []);
  this.addRecentProduct(function(product) {
    spotDOM.spotAPI.setStorage("spotRecentProducts", this.recentProducts());
  });
  spotDOM.arrayField(this, 'ruleset', []);

  this.language = language || {
    "filter": {
      "en": "Filter",
      "fr": "Filtrer"
    },
    "load-more": {
      "en": "Load More Products",
      "fr": "Télécharger plus de Produits",
    },
    "show-all": {
      "en": "Show All Results",
      "fr": "Afficher tous les résultats"
    },
    "show-count": {
      "en": "Show {{ count }} Results",
      "fr": "Afficher {{ count }} résultats"
    },
    "view-details": {
      "en": "View full details",
      "fr": "Voir détails complète"
    },
    "showing-results-for": {
      "en": "Showing results for",
      "fr": "Affichage des résultats pour"
    },
    "popular-searches": {
      "en": "Popular Searches",
      "fr": "Recherches populaires"
    },
    "show-more": {
      "en": "Show More",
      "fr": "Voir plus"
    },
    "show-less": {
      "en": "Show Less",
      "fr": "Voir moins"
    },
    "clear-all": {
      "en": "Clear All",
      "fr": "Tout effacer"
    },
    "sort": {
      "en": "Sort",
      "fr": "Trier"
    },
    "search-title": {
      "en": "Search: {{ count }} results found for \"{{ search }}\"",
      "fr": "Recherche: {{ count }} resultats trouvés pour \"{{ search }}\""
    },
    "results-status": {
      "en": "{{ start }} - {{ end }} of {{ count }} products",
      "fr": "{{ start }} - {{ end }} de {{ count }} produits"
    },
    "results-status-search": {
      "en": "{{ start }} - {{ end }} of {{ count }} products for \"{{ search }}\"",
      "fr": "{{ start }} - {{ end }} de {{ count }} produits pour \"{{ search }}\""
    }
  };
  
  this.template = function(template, values) {
    return template.replaceAll(/{{\s*([^}]+?)\s*}}/g, function(m, v) {
      var parts = v.split(/\./);
      var current = values;
      for (var i = 0; i < parts.length; ++i)
        current = current[parts[i]];
      return current != null ? current + "" : "";
    });
  };

  this.templateExplicitLocale = function(key, locale, values) {
    if (!this.language[key])
      throw "Can't find template " + key;
    return this.template(this.language[key][locale || spotDOM.locale()] || this.language[key]["en"], values || {});
  };
  this.templateLocale = function(key, values) {
    return this.templateExplicitLocale(key, null, values);
  };

  /**

  ### PagedPaginationHelper

  This is a small helper function that returns a set of elements based on your inputs that represents a pagination control for `SpotDOM`.

  The pagination helper can be used like so:

      var paginationHelper = window.spotDefault.pagedPaginationHelper({ count: totalProductCount });
      $('body').append(paginationHelper.element);

  Below is the implementation of the helper:

  %{PagedPaginationHelper}

  **/

  /** %+{PagedPaginationHelper} **/
  this.pagedPaginationHelper = function(options) {
    var count = options['count'];
    var page = options['page'] || spotDOM.page();
    var pageInterval = options['interval'] || 2;
    var containerElement = options['containerElement'] || this.createElement("<ul class='pagination-container'></ul>");
    var prevElement = options['prevElement'] || this.createElement("<li class='prev'>&larr;</li>");
    var nextElement = options['nextElement'] || this.createElement("<li class='next'>&rarr;</li>");
    var pageElement = options['pageElement'] || this.createElement("<li></li>");
    var maxElement = options['maxElement'] ||  options['pageElement']  || this.createElement("<li class='max'></li>")
    var minElement = options['minElement'] ||  options['pageElement']  || this.createElement("<li class='min'></li>")
    var activePageElement = options['activePageElement'] || options['pageElement'] || this.createElement("<li class='active'></li>");
    var elipsisElement = options['elipsisElement'] || this.createElement("<li class='disabled'>...</li>");

    var resultsPerPage = options['paginate'] || spotDOM.paginate();
    var maxPages = Math.ceil(count / resultsPerPage);
    var min = Math.max(1, page - pageInterval);
    var max = Math.min(page + pageInterval, maxPages);

    var elements = [];
    if (min != 1 || max != 1) {
      if (page > 1) {
        elements.push(prevElement.cloneNode(true));
        elements[elements.length-1].addEventListener("click", function(e) { spotDOM.page(spotDOM.page()-1); e.preventDefault(); });
      }
      if (min > 1) {
        elements.push(minElement.cloneNode(true));
        elements[elements.length-1].innerText = 1;
        elements[elements.length-1].addEventListener("click", function(e) { spotDOM.page(1); e.preventDefault(); });
        if (min > 2 && elipsisElement)
          elements.push(elipsisElement.cloneNode(true));
      }

      for (var i = min; i <= max; ++i) {
        elements.push((i == page ? activePageElement : pageElement).cloneNode(true));
        elements[elements.length-1].innerText = i;
        elements[elements.length-1].addEventListener("click", function(e) { spotDOM.page(parseInt(this.innerText)); e.preventDefault(); });
      }

      if (max < maxPages) {
        if (max < maxPages - 1)
          elements.push(elipsisElement.cloneNode(true));

        elements.push(maxElement.cloneNode(true));
        elements[elements.length-1].innerText = maxPages;
        elements[elements.length-1].addEventListener("click", function(e) { spotDOM.page(maxPages); e.preventDefault(); });
      }

      if (page < maxPages) {
        elements.push(nextElement.cloneNode(true));
        elements[elements.length-1].addEventListener("click", function(e) { spotDOM.page(spotDOM.page()+1);  e.preventDefault(); });
      }
    }
    spotDOM.page(function() { window.scrollTo(0,0); });
    spotDOM.spotAPI.forEach(elements, function(e) { containerElement.appendChild(e); });
    return containerElement;
  };
  /** %-{PagedPaginationHelper} **/


  this.getDocHeight = function() {
    var D = document;
    return Math.max(D.body.scrollHeight, D.documentElement.scrollHeight, D.body.offsetHeight, D.documentElement.offsetHeight, D.body.clientHeight, D.documentElement.clientHeight);
  };

  this.getWindowOffset = function() {
    return window.pageYOffset || window.scrollY;
  };

  this.getWindowHeight = function() {
    return window.innerHeight;
  };
  
  this.getNoImageHTML = function() {
    return '<svg class="placeholder--image" width="275" height="275" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 525.5 525.5"><path d="M324.5 212.7H203c-1.6 0-2.8 1.3-2.8 2.8V308c0 1.6 1.3 2.8 2.8 2.8h121.6c1.6 0 2.8-1.3 2.8-2.8v-92.5c0-1.6-1.3-2.8-2.9-2.8zm1.1 95.3c0 .6-.5 1.1-1.1 1.1H203c-.6 0-1.1-.5-1.1-1.1v-92.5c0-.6.5-1.1 1.1-1.1h121.6c.6 0 1.1.5 1.1 1.1V308z"></path><path d="M210.4 299.5H240v.1s.1 0 .2-.1h75.2v-76.2h-105v76.2zm1.8-7.2l20-20c1.6-1.6 3.8-2.5 6.1-2.5s4.5.9 6.1 2.5l1.5 1.5 16.8 16.8c-12.9 3.3-20.7 6.3-22.8 7.2h-27.7v-5.5zm101.5-10.1c-20.1 1.7-36.7 4.8-49.1 7.9l-16.9-16.9 26.3-26.3c1.6-1.6 3.8-2.5 6.1-2.5s4.5.9 6.1 2.5l27.5 27.5v7.8zm-68.9 15.5c9.7-3.5 33.9-10.9 68.9-13.8v13.8h-68.9zm68.9-72.7v46.8l-26.2-26.2c-1.9-1.9-4.5-3-7.3-3s-5.4 1.1-7.3 3l-26.3 26.3-.9-.9c-1.9-1.9-4.5-3-7.3-3s-5.4 1.1-7.3 3l-18.8 18.8V225h101.4z"></path><path d="M232.8 254c4.6 0 8.3-3.7 8.3-8.3s-3.7-8.3-8.3-8.3-8.3 3.7-8.3 8.3 3.7 8.3 8.3 8.3zm0-14.9c3.6 0 6.6 2.9 6.6 6.6s-2.9 6.6-6.6 6.6-6.6-2.9-6.6-6.6 3-6.6 6.6-6.6z"></path></svg>';
  };
  
  this.defaultProductRenderer = function(product) {
    var image = spotDOM.getProductImage(product);
    var dimensions = spotDOM.getSizedImageDimensions(image, "275x275");
    var possibleToHaveSplit = spotDOM.facets().flatMap(function(e) { return e.facetValues(); }).filter(function(e) { return e.enabled(); }).length > 0;
    var title = ((!spotDOM.split() || spotDOM.split() == "auto") && !possibleToHaveSplit) || spotDOM.split() == "none" ? product.title : spotDOM.getProductTitle(product);
    var price = spotDefault.spotDOM.getProductPrice(product);
    var imageHTML = spotDefault.getNoImageHTML();
    if (image)
      imageHTML = "<img width='" + (dimensions ? dimensions[0] : "") + "' height='" + (dimensions ? dimensions[1] : "") + "' src='" + spotDOM.getSizedImage(image, "275x275") + "'/>";
    var element = spotDefault.createElement("<div class='product " + (spotDOM.pins().indexOf(product.id) != -1 ? "pin" : "") + "'>\
      <a class='product--image' href='" + spotDOM.getProductURL(product) + "'>\
        " + imageHTML + "\
      </a>\
      <div class='product--info'>\
        <h4 class='product--info--title'>\
          <a href='" + spotDOM.getProductURL(product) + "' tabindex='0'>\
            " + title + "\
          </a>\
        </h4>\
        <div class='product--info--price'>\
          <span class='money' data-currency-usd='" + spotDOM.formatMoney(price) + "' data-currency='USD'>" + spotDOM.formatMoney(price) + "</span>\
        </div>\
      </div>\
    </div>");
    element.querySelector('img, svg').setAttribute('alt', title);
    return element;
  };
  
  this.generateImage = function(image, styles, klass) {
    var element = this.createElement(image ? "<img src='" + image + "'/>" : this.getNoImageHTML());
    if (klass)
      element.classList.add(klass);
    Object.keys(styles).forEach(function(key) {
      element.style[key] = styles[key];
    });
    return element;
  }

  /**

  ### ScrollPaginationHelper

  This is a small helper class that sets up a listener to auto-retrieve a new set of products when the bottom
  of the page is reached. Used for "infinite scrolling" implementations.

  The pagination helper can be used like so:

      new window.spotDefault.ScrollPaginationHelper().attach();

  Below is the implementation of the helper:

  %{ScrollPaginationHelper}

  **/

  /** %+{ScrollPaginationHelper} **/
  this.ScrollPaginationHelper = function(options) {
    var scroll = this;
    if (!options)
      options = {}
    this.reachedProductEnd = false;
    this.triggerHeight = options['triggerHeight'] || 300;
    this.shouldTrigger = true;

    this.productListener = function(products) {
      scroll.reachedProductEnd = products.length < spotDOM.paginate();
      setTimeout(function() {
        scroll.shouldTrigger = true;
      }, 500);
    };

    this.scrollListener = function() {
      if (scroll.shouldTrigger && !scroll.reachedProductEnd && spotDefault.getWindowOffset() + spotDefault.getWindowHeight() >= (spotDefault.getDocHeight() - scroll.triggerHeight)) {
        scroll.shouldTrigger = false;
        spotDOM.page(spotDOM.page()+1);
      }
    };

    this.attach = function() {
      spotDOM.products(this.productListener);
      window.addEventListener("scroll", this.scrollListener);
      return this;
    };
    this.detach = function() {
      spotDOM.removeFieldListener(spotDOM, 'products', this.productListener);
      window.removeEventListener("scroll", this.scrollListener);
      return this;
    };
  };
  /** %-{ScrollPaginationHelper} **/

  /**

  ### FacetPane

  The Spot default pane is a great example of how to use the SpotDOM system. This single subclass provides a fully featured pane, built off the SpotDOM module. It can be dropped into most themes, and work
  with a minimal amount of extra styling.

  The pane can be instantiated by simply calling new:

      var facetPane = new window.spotDefault.FacetPane();
      document.body.appendChild(facetPane.paneElement);

  Below is the implementation of the pane:

  %{Pane}
  
  #### DoubleRangeSlider
  
  Spot also provides a double-ended range slider, that is used for certain facets (like price), in order to set the minimum and maximum prices.
  
  Its implementation is as follows:
  
  %{DoubleRangeSlider}

  The double range slider can be easily styled with CSS, or, alternatively, you can provide an override by simply assigning `DoubleRangeSlider` in `SpotDefault`, after 
  initialization, before Pane creation.

  **/
  
  /** %+{DoubleRangeSlider} **/
  this.DoubleRangeSlider = function(options) {
    if (!options)
      options = {};
    var slider = this;
    spotDOM.listener(this, 'change');
    spotDOM.listener(this, 'drag');
    var css = "\
      bar { border-radius: 4px;  background-color: #ddd; border-top: 1px solid #aaa; border-bottom: 1px solid #aaa; display: inline-block; padding: 3px 0; width: 33%; position: relative; vertical-align: top; top: 7px; }\
      drange bar.fill { border-left: 0; border-right: 0; border-radius: 0; background: #07f; }\
      drange { display: inline-block; position: relative; width: 100px; height: 20px; margin: 5px 12px 5px 0; }\
      drange handle { position: absolute; padding: 7px; background: #fff; top: 2.5px; border: 1px solid #ccc; border-radius: 10px; cursor: pointer; z-index: 10; }\
      drange handle:hover, drange handle.active { background: #ccc; }\
      drange handle:hover, drange handle.active, drange handle.last-active { z-index: 100; }\
      drange:hover bar, drange.active bar { background-color: #ccc; }\
      drange:hover bar.fill, drange.active bar.fill { background-color: #05d; }\
    ";
    
    this.element = spotDefault.createElement('<drange><style type="text/css">' + css + '</style><input type="hidden" name="min"/><input type="hidden" name="max"/><handle></handle><bar></bar><bar class="fill"></bar><bar></bar><handle></handle></drange>');
    var inputs = this.element.querySelectorAll('input')
    this.values = function(values) {
      inputs[0].value = values[0];
      inputs[1].value = values[1];
    };
    spotDOM.scalarField(this, 'step', options.step || 0.01);
    var handles = this.element.querySelectorAll('handle');
    this.updateBar = function() {
      var bars = this.element.querySelectorAll('bar');
      inputs.forEach((b, i) => { handles[i].style.left = "calc(" + b.value*100 + "% - 8px)"; });
      bars[0].style.width = inputs[0].value*100 + "%";
      bars[1].style.width = (inputs[1].value - inputs[0].value)*100 + "%";
      bars[2].style.width = ((1.0 - inputs[1].value)*100) + "%";
    };
    var drag = function(x, i) {
      var p = (x - slider.element.getBoundingClientRect().x) / slider.element.offsetWidth;
      if (i == 0 && p < 0)
        inputs[i].value = 0;
      else if (i == 1 && p > 1)
        inputs[i].value = 1;
      else if (i == 0 && p > inputs[1].value)
        inputs[i].value = inputs[1].value;
      else if (i == 1 && p < inputs[0].value)
        inputs[i].value = inputs[0].value;
      else
        inputs[i].value = Math.round(p / slider.step()) * slider.step();
      slider.updateBar();
      slider.drag(inputs[0].value, inputs[1].value);
    };
    handles.forEach(function(h, i) {
      var endEvent = null;
      var dragEvent = function(e) { drag((e.changedTouches ? e.changedTouches[0].clientX : e.clientX), i); e.preventDefault(); };
      var startEvent = function(e) {
        e.preventDefault();
        handles.forEach(function(e) { e.classList.remove('last-active'); });
        [slider.element, h].forEach(function (e) { e.classList.add('active', 'last-active') });
        ['mousemove', 'touchmove'].forEach(function(e) { document.addEventListener(e, dragEvent); });
        endEvent = function(e) {
          [slider.element, h].forEach(function(e) { e.classList.remove('active') });
          ['mousemove', 'touchmove'].forEach(function(e) { document.removeEventListener(e, dragEvent); });
          ['mouseup', 'touchend'].forEach(function(e) { document.removeEventListener(e, endEvent); });
          slider.change(inputs[0].value, inputs[1].value);
        };
        ['mouseup', 'touchend'].forEach(function(e) { document.addEventListener(e, endEvent); });
      };
      ['mousedown','touchstart'].forEach(function(e) { h.addEventListener(e, startEvent); });
    });
    this.values(options.value ? options.value : [0.0, 1.0]);
    this.updateBar();
  };
  /** %-{DoubleRangeSlider} **/

  /** %+{Pane} **/
  this.FacetPane = function(options) {
    if (!options)
      options = {};
    // Basic default integration of the Spot pane; this can be easily replaced with one's own implementation.
    var pane = this;
    this.paneId = options['id'] || "spot-default-pane";
    this.paneElement = spotDefault.createElement("<div class='pane facet-pane'></div>");
    this.closePane = spotDefault.createElement("<div class='facet-pane-close'></div>");
    if (options['classes'])
      spotDOM.spotAPI.forEach(options['classes'], function(e) { pane.paneElement.classList.add(e); });
    var breadcrumbsEnabled = options['breadcrumbs'] === undefined || options['breadcrumbs'];
    this.paneElement.appendChild(this.closePane);
    this.facetsElement = spotDefault.createElement("<div class='facets'></div>");
    this.paneElement.appendChild(this.facetsElement);

    spotDOM.arrayField(this, 'facet');
    spotDOM.arrayField(this, 'breadcrumb');
    
    this.getFacetValueName = options['getFacetValueName'] || function(facetValue) { return facetValue.getName() };
    this.showMoreLimit = options['showMoreLimit'];
    this.inactiveLimit = options['inactiveLimit'] != null ? options['inactiveLimit'] : 1;
    this.hideInactiveFacetValues = (options['hideInactiveFacetValues'] === undefined || options['hideInactiveFacetValues']);
    this.hideInactiveFacets = options['hideInactiveFacets'];
    this.hideEmptyValues = options['hideEmptyValues'] != null ? options['hideEmptyValues'] : true;
    this.facetClasses = options['facetClasses'] || [];
    this.facetValueClasses = options['facetValueClasses'] || [];
    
    this.closePane.addEventListener('click', function(e) { pane.paneElement.classList.remove('expanded'); });

    if (breadcrumbsEnabled) {
      this.breadcrumbsElement = options['breadcrumbs'] || spotDefault.createElement("<div class='breadcrumbs'></div>");
      if (!options['breadcrumbs'])
        this.paneElement.prepend(this.breadcrumbsElement);
      // Every time a breadcrumb is added, add breadcrumbs to the breadcrumb element.
      // Also add in a "Clear All" button; this is more sensible as a default, because it's easily hidden with CSS, if unwanted,
      // rather than forcing the integrator to write one on their own.
      // Ideally most of this should be controllable with CSS, rather than JS, for ease of debugging.
      this.clearBreadcrumbsElement = spotDefault.createElement("<button class='clear-breadcrumbs btn button'><span class='name'>" + spotDefault.templateLocale("clear-all") + "</span> <span class='remove'>&times;</span></div>");
      this.clearBreadcrumbsElement.addEventListener("click", function(e) {
        spotDOM.queryGuard(function() { spotDOM.spotAPI.forEach(pane.breadcrumbs(), function(e) { e.enabled(false); }); });
        e.preventDefault();
      });
      this.addBreadcrumb(function(facetValue) {
        if (!facetValue.breadcrumbElement) {
          facetValue.breadcrumbElement = spotDefault.createElement("<div class='breadcrumb breadcrumb-" + facetValue.facet.getUniqueId() + " breadcrumb-" + facetValue.getUniqueId() + "' role='button' id='" + pane.paneId + "-breadcrumb-" + facetValue.getUniqueId() + "'><span class='name'>" + pane.getFacetValueName(facetValue) + "</span> <span class='remove'>&times;</span></div>");
          facetValue.breadcrumbElement.addEventListener('click', function() { facetValue.enabled(false); });
        }
        pane.breadcrumbsElement.appendChild(facetValue.breadcrumbElement);
        pane.breadcrumbsElement.appendChild(this.clearBreadcrumbsElement);
      }).removeBreadcrumb(function(facetValue) {
        facetValue.breadcrumbElement.remove();
        facetValue.breadcrumbElement = null;
        if (pane.breadcrumbs().length == 0)
          this.clearBreadcrumbsElement.remove();
      });
    }

    // Every time a facet is added, hook up all connectors and insert into the DOM.
    this.addFacet(function(facet) {
      facet.element = spotDefault.createElement("<div id='" + pane.paneId + "-facet-" + facet.getUniqueId() + "' class='facet inactive facet-" + facet.getUniqueId() + "' role='listbox'><div class='facet-title'>" + facet.getName() + "</div><div class='facet-values' title='List of " + facet.getName() + " options. Click an option to filter the the products shown.'><div class='facet-organizer'></div></div></div>");
      pane.facetClasses.forEach(function(cl) { facet.element.classList.add(cl); })
      facet.element.setAttribute('title', facet.getName());
      facet.showMoreElement = pane.showMoreLimit != null ? spotDefault.createElement("<div class='facet-value-show-more'></div>") : null;
      facet.showingAll = pane.showMoreLimit == null;
      
      // The show more element button; not required, but can make the list smaller if a threshold is specified.
      if (facet.showMoreElement) {
        facet.updateShowMoreElements = function() {
          facet.showMoreElement.innerText = facet.showingAll ? ("- " + spotDefault.templateLocale("show-less")) : ("+ " + spotDefault.templateLocale("show-more"));
          var activeFacetValues = facet.facetValues().filter(function(e) { return !pane.hideInactiveFacetValues || !e.inactive });
          if (!facet.showingAll) {
            facet.facetValues().forEach(function(e) { spotDefault.hideElementQuick(e.element); });
            activeFacetValues.filter(function(e,idx) { return idx < pane.showMoreLimit; }).forEach(function(e) { spotDefault.showElementQuick(e.element); });
          } else {
            activeFacetValues.forEach(function(e) { spotDefault.showElementQuick(e.element); });
          }
          spotDefault.toggleElementQuick(facet.showMoreElement, activeFacetValues.length > pane.showMoreLimit);
        };
        facet.updateShowMoreElements();
        facet.showMoreElement.addEventListener('click', function() {
          facet.showingAll = !facet.showingAll;
          facet.updateShowMoreElements();
        });
        spotDOM.endQuery(function() {
          facet.updateShowMoreElements();
        });
      }
      
      // Allow for us to register a click on a facet element; allowing for us to easily "open/close" the facet via CSS if we want to.
      facet.element.querySelector(".facet-title").addEventListener("click", function() {
        if (!facet.element.classList.contains("active")) {
          if (options['singleActive'])
            spotDOM.spotAPI.forEach(spotDOM.facets(), function(f) { f.element.classList.remove("active"); });
          facet.element.classList.add("active");
        } else
          facet.element.classList.remove("active");
      });
      if (options.facetCollapsible == "visible")
        facet.element.classList.add("active");
      
      // Two different types of facets. Boundary facets, which are represented normally by sliders,
      // and option facets, which are represented by a list of options with a checkbox.
      if (facet.getBoundary()) {
        var increment = 1.0;
        facet.slider = new spotDefault.DoubleRangeSlider();
        facet.textElement = spotDefault.createElement("<span></span>");
        facet.updateElements = function(inputValues) {
          var values = inputValues || facet.boundaryValues() || [null, null];
          var edges = facet.boundaryEdges();
          if (edges) {
            values = [
              Math.max(values[0] != null ? values[0] : edges[0], edges[0]),
              Math.min(values[1] != null ? values[1] : edges[1], edges[1])
            ];
            var width = (edges[1] - edges[0]);
            facet.slider.step(increment / width);
            facet.slider.values([
              (values[0] - edges[0]) / width,
              (values[1] - edges[0]) / width
            ]);
            facet.slider.updateBar();
            if (facet.isMonetary())
              values = values.map(function(e) { return spotDOM.formatMoney(e); });
            facet.textElement.innerText = " " + facet.getName() + ": " + values.join(" - ");
          }
        };
        facet.boundaryEdges(function(values) { facet.updateElements(); });
        facet.boundaryValues(function(values) { facet.updateElements(); });
        facet.slider.drag(function(val1, val2) { 
          var edges = facet.boundaryEdges();
          facet.updateElements([
            val1 != 0.0 ? val1 * (edges[1] - edges[0]) + edges[0] : null, 
            val2 != 1.0 ? val2 * (edges[1] - edges[0]) + edges[0] : null
          ]); 
        });
        facet.slider.change(function(val1, val2) {
          var edges = facet.boundaryEdges();
          facet.boundaryValues([
            val1 != 0.0 ? val1 * (edges[1] - edges[0]) + edges[0] : null, 
            val2 != 1.0 ? val2 * (edges[1] - edges[0]) + edges[0] : null
          ]);
          spotDOM.queryGuard(function() {
            spotDOM.page(1);
            spotDOM.query();
          });
        });
        (facet.element.querySelector('.facet-values .facet-organizer') || facet.element.querySelector('.facet-values')).appendChild(facet.slider.element);
        (facet.element.querySelector('.facet-values .facet-organizer') || facet.element.querySelector('.facet-values')).appendChild(facet.textElement);
      } else {
        // Every time we get a value for a facet, add it to the list.
        facet.addFacetValues(function(facetValues) {
          // Ignore unnamed wildcard facets value.
          var newFacetValues = [];
          facetValues.forEach(function(facetValue) {
            if (facetValue.isUnnamedWildcard() || (pane.getFacetValueName(facetValue) == "" && pane.hideEmptyValues))
              return;
              
            // Create a facet value, with a checkbox to indicate whether or not it's active.
            var facetValueElement = pane.paneElement.querySelector("#" + pane.paneId + "-facet-value-" + facetValue.getUniqueId());
            facet.element.classList.remove("inactive");
            var newFacetValue = false;
            if (!facetValueElement) {
              // "name" is present so that the back button functions properly.
              facetValueElement = spotDefault.createElement("<div class='facet-value facet-value-" + facetValue.getUniqueId() + "' role='option' id='" + pane.paneId + "-facet-value-" + facetValue.getUniqueId() + "' data-value-id='" + facetValue.getUniqueId() + "'><input name='" + facetValue.getUniqueId() + "' type='checkbox'/> <span class='name'>" +
                pane.getFacetValueName(facetValue) + "</span> <span class='count'></span></div>");
              pane.facetValueClasses.forEach(function(cl) { facetValueElement.classList.add(cl); })
              facetValueElement.setAttribute("title", pane.getFacetValueName(facetValue));
              newFacetValue = true;
            }
            facetValue.element = facetValueElement;
            if (newFacetValue && !facet.showingAll && facet.facetValues().length > pane.showMoreLimit)
              spotDefault.hideElementQuick(facetValue.element);
    
            // Any time a facetValue's count changes, update what it reads.
            facetValue.count(function(count) {
              facetValueElement.querySelector(".count").innerText = count != null && spotDOM.optionBehavior() != "exists" ? "(" + count + ")" : '';
              if (count != null && count == 0) {
                // When we remove a facetValue, make sure to remove the breadcrumb and hide the dom element (this way the order of the elements doesn't jump around arbitrarily).
                if (pane.hideInactiveFacetValues && !facetValue.enabled()) {
                  spotDefault.hideElementQuick(facetValue.element);
                  if (facetValue.breadcrumbElement) {
                    facetValue.breadcrumbElement.remove();
                    facetValue.breadcrumbElement = null;
                  }
                }
                facetValue.inactive = true;
                facetValue.element.classList.add("inactive");
              } else {
                spotDefault.showElementQuick(facetValue.element);
                facetValue.inactive = false;
                facetValue.element.classList.remove("inactive");
                if (facet.element) {
                  facet.element.classList.remove("inactive");
                  if (facet.isValidLocale(spotDOM.locale()))
                    spotDefault.showElementQuick(facet.element);
                }
              }
              var inactiveCount = facet.facetValues().filter(function(e) { var count = e.count(); return (count == null || count > 0) && !e.isUnnamedWildcard() && !(pane.getFacetValueName(e) == "" && pane.hideEmptyValues) }).length;
              if (inactiveCount <= pane.inactiveLimit && pane.hideInactiveFacets) {
                spotDefault.hideElementQuick(facet.element);
                facet.element.classList.add("inactive");
              }
            }, true).enabled(function(enabled) {
              // If we're in single selection mode (becuase we're in ShopifyMode, or if this is a sorting facet), DISABLE all other facets in this category.
              spotDOM.queryGuard(function() {
                if (facet.singleSelection() && enabled)
                  facet.facetValues().forEach(function(e) { if (e != facetValue) { e.enabled(false); } });
                // If a facet gets enabled, make sure that its checkbox is checked.
                facetValueElement.querySelector("input").checked = enabled;
                facetValueElement.setAttribute("aria-selected", enabled);
                // Add a breadcrumb if enabled, remove its breadcrumb if not, if this facet produces breadcrumbs. This setting is only relevant for panes.
                if (enabled) {
                  facetValueElement.classList.add("active");
                  facet.element.classList.add("active");
                  if (!facet.omitBreadcrumbs && breadcrumbsEnabled)
                    pane.addBreadcrumb(facetValue);
                }
                else {
                  facetValueElement.classList.remove("active");
                  if (facetValue.breadcrumbElement && breadcrumbsEnabled)
                    pane.removeBreadcrumb(facetValue);
                }
                // Any time something changes enability, rerun our query. Also, make sure we're on page 1, because we want to reset pagination whenevr we query a facet.
                spotDOM.page(1);
                spotDOM.query();
              });
            }, facetValue.enabled());
            // If the checkbox is clicked, update the facetValue's enability. Add in a query guard for potential sort facets.
            facetValueElement.addEventListener("click", function() { spotDOM.queryGuard(function() { facetValue.enabled(!facetValue.enabled()); }) });
            if (newFacetValue) {
              newFacetValues.push(facetValue);
            } else {
              if (facetValue.count() != null)
                facetValueElement.querySelector(".count").innerText = "(" + facetValue.count() + ")";
            }
          });
          if (pane.hideInactiveFacets && facet.element) {
            if (facet.facetValues().filter(function(e) { var count = e.count(); return (count == null || count > 0) && !e.isUnnamedWildcard() && !(pane.getFacetValueName(e) == "" && pane.hideEmptyValues) }).length <= pane.inactiveLimit) {
              spotDefault.hideElementQuick(facet.element);
              facet.element.classList.add("inactive");
            } else {
              facet.element.classList.remove("inactive");
              if (facet.isValidLocale(spotDOM.locale()))
                  spotDefault.showElementQuick(facet.element);
            }
          }
          
          var facetValuesElement = (facet.element.querySelector(".facet-values .facet-organizer") || facet.element.querySelector(".facet-values"));
          newFacetValues.forEach(function(facetValue) {
            facetValuesElement.appendChild(facetValue.element);
            if (facet.showMoreElement)
              facetValuesElement.appendChild(facet.showMoreElement);
          });
          if (facet.showMoreElement)
            facetValuesElement.appendChild(facet.showMoreElement);
        }, true).removeFacetValue(function(facetValues) {
          facetValues.forEach(function(facetValue) {
            if (facetValue.element)
              facetValue.element.remove();
            if (facetValue.breadcrumbElement) {
              facetValue.breadcrumbElement.remove();
              facetValue.breadcrumbElement = null;
            }
          });
        });
      }
      // If we have a sorting facet, ensure that we insert before it, rather than after it.
      if (pane.sortingFacet && pane.sortingFacet != facet)
        pane.sortingFacet.element.insertAdjacentElement("beforebegin", facet.element);
      else
        pane.facetsElement.appendChild(facet.element);
      spotDefault.showElement(pane.paneElement);
      
      spotDOM.locale(function(locale) {
        if (facet.element && !facet.isValidLocale(spotDOM.locale()))
          spotDefault.hideElementQuick(facet.element);
      }, true);
    }, true).removeFacet(function(facet) {
      // When we remove a facet, make sure to remove its dom elements. This shouldn't really ever occur,
      // but if you want to remove things programatically, this allows support for it.
      facet.element.remove();
      if (this.facets().length == 0)
        spotDefault.hideElement(pane.paneElement);
    });

    spotDOM.addFacet(function(facet) {
      pane.addFacet(facet);
    }, true).removeFacet(function(facet) {
      pane.removeFacet(facet);
    });

    if (options['includeSorting']) {
      // If we are including sorting, wrap sort orders in facet objects, so we use the entirely same stuff.
      // This is NOT added into the general DOM object, only the pane.
      var SortingFacet = function() {
        this.omitBreadcrumbs = true;
        this.getUniqueId = function() { return 'sort_by'; };
        this.singleSelection = function() { return true; }
        this.getName = function(locale) { return spotDefault.templateExplicitLocale('sort', locale); };
        this.getBoundary = function() { return null; }
        this.isValidLocale = function() { return true; };
        spotDOM.arrayField(this, 'facetValue');
      };
      var SortingFacetValue = function(sortOrder) {
        this.sortOrder = sortOrder;
        this.sortOrder.facetFacade = this;
        this.count = function(func) { if (func == null) return null; return this; };
        this.getUniqueId = function() { return this.sortOrder.getUniqueId(); };
        this.getName = function() { return this.sortOrder.getName(); };
        this.isUnnamedWildcard = function() { return false; }
        spotDOM.scalarField(this, 'enabled', spotDOM.sort() == sortOrder);
      };
      this.sortingFacet = new SortingFacet();
      spotDOM.addSortOrder(function(sortOrder) {
        pane.sortingFacet.addFacetValue(new SortingFacetValue(sortOrder)).enabled(function(enabled) {
          if (!enabled) {
            if (spotDOM.sort() == sortOrder && pane.sortingFacet.facetValues().filter(function(e) { return e.enabled(); }).length == 0)
              spotDOM.sort(null);
          } else
            spotDOM.sort(sortOrder);

        });
      }, true).removeSortOrder(function(sortOrder) {
        pane.sortingFacet.removeFacetValue(sortOrder.facetFacade);
      });
      pane.addFacet(this.sortingFacet);
    }
  };
  this.Pane = this.FacetPane;
  /** %-{Pane} **/

  /**

  **To make a custom pane**, you can simply copy the above code from `spot.js`, and paste it into your theme, renaming the pane's class to something appropriate. From there, you can pass a copy instantiated with
  new (e.g. `new CustomPane(paneOptions)`) in as the `pane` option to `SpotDefault.init`. Or, you can simply attach the pane and hook it up manually, if you're so inclined (in that case, see the SpotDefault
  section for details).

  **/


  /**

  ### RecommendationsPane

  The recommendations pane object provided with SpotDefault is an easy-to-use drop in system for providing recommendations when on a product display page, or potentially as part of a product modal. By default
  the pane will display *all* recommendations sets together that have been set up in the spot admin panel, with a simple header denoting the name of the recommendation.

  **/
  this.RecommendationsPane = function(options, productRenderer) {
    var pane = this;

    this.recommendationsId = options['id'] || "spot-default-recommendations";
    this.paneElement = spotDefault.createElement("<div class='recommendations'></div>");
    if (options['classes'])
      spotDOM.spotAPI.forEach(options['classes'], function(e) { pane.paneElement.classList.add(e); });
    spotDOM.listener(this, 'productRenderer', productRenderer || window.spotDefault.defaultProductRenderer);
    spotDOM.arrayField(this, 'recommendation');

    this.addRecommendation(function(recommendation) {
      recommendation.init();
      recommendation.element = spotDefault.createElement("<div class='recommendation'><span class='name'></span><div class='products'></div></div>");
      recommendation.heading = recommendation.element.querySelector(".name");
      recommendation.productContainer = recommendation.element.querySelector(".products");
      recommendation.name(function(name) {
        recommendation.heading.innerText = recommendation.getName();
      }, true).addProduct(function(product) {
        product.element = pane.productRenderer(product);
        recommendation.productContainer.appendChild(product.element);
      }, true).removeProduct(function(product) {
        product.element.remove();
        product.element = null;
      });
      this.paneElement.appendChild(recommendation.element);
    }, true).removeRecommendation(function(recommendation) {
      recommendation.element.remove();
      recommendation.element = null;
    });
    spotDOM.addRecommendation(function(recommendation) {
      pane.addRecommendation(recommendation);
    }, true).removeRecommendation(function(recommendation) {
      pane.removeRecommendation(recommendation);
    });
  };
  /**

  ### KeyupListener & SearchBar

  This provides an easy way for you to listen when someone is typing into a text box, and feed those search request into Spot, either for a quick-search, or for automatic page refreshing
  on a collections page. KeyupListener provides the bulk of functionality, SearchBar provides an easy way to create a customized search dropdown.

  #### KeyupListener(element)

  A sample way to use this is to hook an input bar into setting the search for SpotDOM, as so:

      new window.spotDefault.KeyupListener(document.querySelector('.productgrid--search-form-field')).doneTyping(function(search) {
        window.spotDOM.search(search);
      });

  Has the following configurable attributes:
  
  * `element`: The input element we're listening on.
  * `minCharacters`: The minimum amount of characters that must be present before engaging. Default: 1.
  * `interval`: The minimal interval we wait before running `doneTyping` normally. Default: 200 miliseconds.
  * `doneTyping`: The primary function; takes in the resulting string. Is called periodically as a user is typing.
  * `submit`: The listener for when the element receives an "enter".
  * `focus`: The listener that fires when the element receives focus.
  * `unfocus`: The listener that fires when the element loses focus.

  The implementation of this is below:

  %{KeyupListener}

  **/

  /** %+{KeyupListener} **/
  this.KeyupListener = function(element) {
    var keyupListener = this;

    spotDOM.scalarField(this, 'element');
    spotDOM.scalarField(this, 'minCharacters', 1);
    spotDOM.scalarField(this, 'interval', 200);
    spotDOM.listener(this, 'doneTyping');
    spotDOM.listener(this, 'submit');
    spotDOM.listener(this, 'focus', function() {
      this.doneTyping(this.element().value);
    });
    spotDOM.listener(this, 'unfocus', function() { });

    if (!element)
      throw "Requires an element to attach to.";

    this.timeout = null;
    this.lastSearch = element.value;
    this.oldElement = null;

    this.handler = function(e) {
      var length = element.value.replace(/\s*/g, "").length;
      if (length > keyupListener.minCharacters()) {
        if (keyupListener.timeout) {
          clearTimeout(keyupListener.timeout);
          keyupListener.timeout = null;
        }
        var timeoutFunction = function() {
          keyupListener.lastSearch = element.value;
          keyupListener.doneTyping(element.value);
        };
        if (keyupListener.lastSearch != element.value)
          keyupListener.timeout = setTimeout(timeoutFunction, keyupListener.interval());
      } else if (length == keyupListener.minCharacters()) {
        if (keyupListener.lastSearch != element.value) {
          keyupListener.lastSearch = element.value;
          keyupListener.doneTyping(element.value);
        }
      } else if (keyupListener.lastSearch != '') {
        keyupListener.lastSearch = '';
        keyupListener.doneTyping('');
      }
      if (e.keyCode === 13)
        keyupListener.submit(element.value);
    };

    this.element(function(element) {
      if (this.oldElement) {
        this.oldElement.removeEventListener('keyup', this.handler);
        this.oldElement.removeEventListener('focus', this.focus);
        this.oldElement.removeEventListener('blur', this.unfocus);
      }
      element.autocomplete = 'off';
      element.addEventListener('keyup', this.handler);
      element.addEventListener('focus', this.focus);
      element.addEventListener('blur', this.unfocus);
      this.oldElement = element;
    });
    this.element(element);
  };
  /** %-{KeyupListener} **/
  /**
    
  #### SearchBar(inputElement, maxProducts, showAll, options)
  
  `SearchBar` uses the `KeyListener` class to hook into an input element and display an "instant-search" display below it.
  
  This class is fairly configurable.
  
  * `maxProducts` refers to the amount of products that are to be retrieved in a dropdown. Default 5.
  * `showAll` determines whether or not a show all button will be rendered that brings you to the search page.
  
  `options` can take the following options. You should specify almost none of these.
  
  * `dropdownContainer` specifies the container in which to put the search results.
  * `popularSearchContainer` specifies the container in which to dump rendered popular search results.
  * `resultsContainer` specifies the container in which to dump renderered results.
  * `imageSize` specifies the size of the image returned. Default: `"64x64"`.
  * `resultRenderer` specifies the function that renders results from either Spot or Shopify, depending.
  * `getQuery` specifies the fucntion that generates the query that returns results from Spot.
  * `results` specifies a custom result rendering function entirely. 
  * `doneTyping` specifies a custom function to pass to the internal keyupListener.
  * `resize` specifies the resize listener.
  * `rule` specifies the ruleset to apply boost rules, conditions, splits and merges from.
    
  The code for this class is below:
    
  **/
  /** %+{SearchBar} **/
  this.SearchBar = function(inputElement, maxProducts, showAll, options) {
    if (showAll === undefined)
      showAll = true;
    var searchBar = this;
    this.keyupListener = new spotDefault.KeyupListener(inputElement);
    spotDOM.scalarField(this, 'maxProducts', maxProducts || 5);
    spotDOM.arrayField(this, 'target', options["targets"] || ["products", "popularSearches"]);
    spotDOM.scalarField(this, 'imageSize', options['imageSize'] || '64x64');
    spotDOM.listener(this, 'resultRenderer', options['resultRenderer'] || function(result, source) {
      if (source == 'spot') {
        if (result.type == 'popular_search') {
          var searchElement = spotDefault.createElement("<a href='/search?q=" + encodeURIComponent(result.term) + "'></a>");
          searchElement.innerText = result.term;
          searchElement.addEventListener('click', function(e) {
            e.preventDefault();
            spotDefault.redirectToSearchPage(result.term);
          });
          return searchElement;
        }
      
        var url = result.url && !result.variants ? result.url : spotDOM.getProductURL(result);
        var image = result.variants ? spotDOM.getSizedImage(spotDOM.getProductImage(result), searchBar.imageSize()) : result.image;
        if (image && typeof(image) == "object")
          image = image.src;
        return spotDefault.createElement("<a href='" + url + "' class='" + result.type + " item'>\
          <div class='image'>\
          " + (image ? "<img src='" + image + "'/>" : '<svg class="placeholder--image" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 525.5 525.5"><path d="M324.5 212.7H203c-1.6 0-2.8 1.3-2.8 2.8V308c0 1.6 1.3 2.8 2.8 2.8h121.6c1.6 0 2.8-1.3 2.8-2.8v-92.5c0-1.6-1.3-2.8-2.9-2.8zm1.1 95.3c0 .6-.5 1.1-1.1 1.1H203c-.6 0-1.1-.5-1.1-1.1v-92.5c0-.6.5-1.1 1.1-1.1h121.6c.6 0 1.1.5 1.1 1.1V308z"></path><path d="M210.4 299.5H240v.1s.1 0 .2-.1h75.2v-76.2h-105v76.2zm1.8-7.2l20-20c1.6-1.6 3.8-2.5 6.1-2.5s4.5.9 6.1 2.5l1.5 1.5 16.8 16.8c-12.9 3.3-20.7 6.3-22.8 7.2h-27.7v-5.5zm101.5-10.1c-20.1 1.7-36.7 4.8-49.1 7.9l-16.9-16.9 26.3-26.3c1.6-1.6 3.8-2.5 6.1-2.5s4.5.9 6.1 2.5l27.5 27.5v7.8zm-68.9 15.5c9.7-3.5 33.9-10.9 68.9-13.8v13.8h-68.9zm68.9-72.7v46.8l-26.2-26.2c-1.9-1.9-4.5-3-7.3-3s-5.4 1.1-7.3 3l-26.3 26.3-.9-.9c-1.9-1.9-4.5-3-7.3-3s-5.4 1.1-7.3 3l-18.8 18.8V225h101.4z"></path><path d="M232.8 254c4.6 0 8.3-3.7 8.3-8.3s-3.7-8.3-8.3-8.3-8.3 3.7-8.3 8.3 3.7 8.3 8.3 8.3zm0-14.9c3.6 0 6.6 2.9 6.6 6.6s-2.9 6.6-6.6 6.6-6.6-2.9-6.6-6.6 3-6.6 6.6-6.6z"></path></svg>') +
          "</div>\
          <div class='info'>\
            <h2 class='title'>"  + (result.variants ? spotDOM.getProductTitle(result) : result.title) + "</h2>" +
            (result.price != null ? "<div class='price'>\
              <span class='money' data-currency-usd='" + spotDOM.formatMoney(result.price/100) + "' data-currency='USD'>" + spotDOM.formatMoney(result.price/100) + "</span>\
            </div>" : "") + 
          "</div>\
        </div>");
      }
      var url = result.url;
      return spotDefault.createElement("<a href='" + url + "' class='product item'>\
        <div class='image'>\
        " + (result.image ? "<img src='" + spotDOM.getSizedImage(result.image, searchBar.imageSize()) + "'/>" : '<svg class="placeholder--image" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 525.5 525.5"><path d="M324.5 212.7H203c-1.6 0-2.8 1.3-2.8 2.8V308c0 1.6 1.3 2.8 2.8 2.8h121.6c1.6 0 2.8-1.3 2.8-2.8v-92.5c0-1.6-1.3-2.8-2.9-2.8zm1.1 95.3c0 .6-.5 1.1-1.1 1.1H203c-.6 0-1.1-.5-1.1-1.1v-92.5c0-.6.5-1.1 1.1-1.1h121.6c.6 0 1.1.5 1.1 1.1V308z"></path><path d="M210.4 299.5H240v.1s.1 0 .2-.1h75.2v-76.2h-105v76.2zm1.8-7.2l20-20c1.6-1.6 3.8-2.5 6.1-2.5s4.5.9 6.1 2.5l1.5 1.5 16.8 16.8c-12.9 3.3-20.7 6.3-22.8 7.2h-27.7v-5.5zm101.5-10.1c-20.1 1.7-36.7 4.8-49.1 7.9l-16.9-16.9 26.3-26.3c1.6-1.6 3.8-2.5 6.1-2.5s4.5.9 6.1 2.5l27.5 27.5v7.8zm-68.9 15.5c9.7-3.5 33.9-10.9 68.9-13.8v13.8h-68.9zm68.9-72.7v46.8l-26.2-26.2c-1.9-1.9-4.5-3-7.3-3s-5.4 1.1-7.3 3l-26.3 26.3-.9-.9c-1.9-1.9-4.5-3-7.3-3s-5.4 1.1-7.3 3l-18.8 18.8V225h101.4z"></path><path d="M232.8 254c4.6 0 8.3-3.7 8.3-8.3s-3.7-8.3-8.3-8.3-8.3 3.7-8.3 8.3 3.7 8.3 8.3 8.3zm0-14.9c3.6 0 6.6 2.9 6.6 6.6s-2.9 6.6-6.6 6.6-6.6-2.9-6.6-6.6 3-6.6 6.6-6.6z"></path></svg>') +
        "</div>\
        <div class='info'>\
          <h2 class='title'>"  + result.title + "</h2>\
          <div class='price'>\
            " + result.type.charAt(0).toUpperCase() + result.type.slice(1) + "\
          </div>\
        </div>\
      </div>");
    });

    this.dropdownContainer = options['dropdownContainer'];
    this.resultsContainer = options['resultsContainer'];
    this.popularSearchContainer = options['popularSearchContainer'];
    
    this.searchNonSpot = false;

    spotDOM.listener(this, 'getQuery', options['getQuery'] || function(search) {
      var query = spotDOM.spotAPI.s().locale(spotDOM.locale()).paginate(this.maxProducts()).targets(this.targets()).search(search).allVariants(spotDOM.allVariants()).autoCorrect(spotDOM.autoCorrect()).category("QuickSearch");
      if (spotDOM.currency())
        query = query.currency(spotDOM.currency());
      if (showAll && showAll == "count")
        query = query.count(true);
      var rules = window.spotDefault.getSearchRules(window.spotDefault.options, search);
    
      if (rules && rules.length > 0) {
        var rule = rules[0];
        var defaultConditions = options.conditions || rule.conditions || [];
        var pins = options.pins || rule.pins || [];
        var boosts = options.boosts || rule.boosts || [];
        
        if (rule.conditions && rule.conditions.length > 0)
          query = query.merge(rule.conditions);    
        if (rule.split)
          query = query.split(rule.split);
        var pinQuery = spotDOM.spotAPI.se();
        if (rule.pins && rule.pins.length > 0) {
          var len = rule.pins.length;
          rule.pins.forEach(function(e, idx) { pinQuery = pinQuery.id("==", e, len - idx); });
        }
        if (search && rule.searchBoosts && rule.searchBoosts.length > 0) {
          var search = spotDOM.normalizeSearch(search);
          rule.searchBoosts.filter(function(e) {
            var term = spotDefault.normalizeSearch(e.term);
            var idx = search.indexOf(term);
            return idx != -1 && (
              (e.type == "substring") ||
              (e.type == "exact" && idx == 0 && search == term.length) ||
              (e.type == "word" && (idx == 0 || /\w/.test(search.charAt(idx-1))) && (idx == search.length || /\w/.test(search.charAt(idx+1)))));
          }).flatMap(function(e) { return e.products.forEach(function(p) { pinQuery = pinQuery.id("==", p[0], p[1]); }); });
        }
        if (rule.boosts && spotDefault.options.settings.boost_rules) {
          var boostQuery = spotDOM.spotAPI.se();
          rule.boosts.filter(function(id) { return spotDefault.options.settings.boost_rules[id]; }).forEach(function(id) { var query = new window.spotDOM.BoostRule(spotDefault.options.settings.boost_rules[id]).getQuery({ }); boostQuery = boostQuery.merge(query); });
          query = query.boost(boostQuery.merge(pinQuery));
        }
      }
      if (spotDOM.personalization())
        query = spotDOM.personalization().apply(query);
      return query;
    });

    this.updateMatchElement = function(inputElement, dropdownContainer) {
      var width = Math.max(inputElement.offsetWidth, 400);
      var absolutePosition = inputElement.getBoundingClientRect();
      var onLeft = absolutePosition.x <= document.body.clientWidth / 2;
      this.dropdownContainer.style.width = width + "px";
      this.dropdownContainer.style.left = onLeft ? inputElement.offsetLeft + "px" : null;
      this.dropdownContainer.style.right = onLeft ? null : inputElement.offsetLeft + "px";
      this.dropdownContainer.style.top = (inputElement.offsetTop + inputElement.offsetHeight) + "px";
    };

    spotDOM.listener(this, 'results', options['results'] || function(search, results, count, nonSpotResults) {
      if (!nonSpotResults)
        nonSpotResults = [];
      if (!this.dropdownContainer) {
        this.dropdownContainer = spotDefault.createElement('<div style="display:none;" class="search-dropdown"></div>');
        inputElement.insertAdjacentElement('afterend', this.dropdownContainer);
      }
      this.updateMatchElement(inputElement, this.dropdownContainer);
      if (!this.resultsContainer) {
        this.resultsContainer = spotDefault.createElement('<div class="results"></div>');
        this.dropdownContainer.appendChild(this.resultsContainer);
      }
      if (!this.popularSearchContainer) {
        this.popularSearchContainer = spotDefault.createElement('<div class="popularSearches"></div>');
        this.dropdownContainer.appendChild(this.popularSearchContainer);
      }
      this.resultsContainer.innerHTML = '';
      this.popularSearchContainer.innerHTML = '';
      var products = results.products;
      var fullResults = results.products ? results.products.map(function(p) { var np = spotDOM.spotAPI.convertProduct(p); np.type = "product"; return np; }) : [];
      if (results.collections)
        fullResults = fullResults.concat(results.collections.map(function(collection) { var nc = spotDOM.spotAPI.convertCollection(collection); nc.type = "collection";  return nc; }));
      if (results.pages)
        fullResults = fullResults.concat(results.pages.map(function(page) { page.type = "page"; page.url = "/pages/" + page.handle; return page; }));
      if (results.blogs)
        fullResults = fullResults.concat(results.blogs.map(function(blog) { blog.type = "blog"; blog.url = "/blogs/" + blog.handle; return blog; }));
      if (results.articles)
        fullResults = fullResults.concat(results.articles.map(function(article) { article.type = "article"; article.url = "/articles/" + article.handle; return article; }));
      fullResults = fullResults.sort(function(a,b) { return b.relevancy < a.relevancy; }).slice(0, this.maxProducts());
      if (fullResults.length > 0 || nonSpotResults.length > 0 || (results.popularSearches && results.popularSearches.length > 0)) {
        nonSpotResults.forEach(function(result) { searchBar.resultsContainer.appendChild(searchBar.resultRenderer(result, 'shopify')); });
        fullResults.forEach(function(result) { searchBar.resultsContainer.appendChild(searchBar.resultRenderer(result, 'spot')); });
        if (results.popularSearches) {
          var element = spotDefault.createElement("<h2 class='heading'></h2>");
          element.innerText = spotDefault.templateLocale("popular-searches");
          this.popularSearchContainer.appendChild(element);
          // Slight hack, for now.
          var alreadyExtant = {};
          results.popularSearches.forEach(function(popularSearch) {
            popularSearch.type = "popular_search";
            if (!alreadyExtant[popularSearch.term]) {
              searchBar.popularSearchContainer.appendChild(searchBar.resultRenderer(popularSearch, 'spot'));
              alreadyExtant[popularSearch.term] = true;
            }
          });
        }
        if (showAll === undefined || showAll) {
          if (!this.showAllButton) {
            this.showAllButton = spotDefault.createElement("<a class='show-all-results'></a>");
            this.showAllButton.textContent = spotDefault.templateLocale(count != null ? 'show-count' : 'show-all', { count: count });
            this.showAllButton.addEventListener('click', function(e) {
              e.preventDefault();
              spotDefault.redirectToSearchPage(inputElement.value);
            });
          }
          this.showAllButton.setAttribute('href', '/search?q=' + encodeURIComponent(search));
          searchBar.dropdownContainer.appendChild(this.showAllButton);
        }
        searchBar.toggleDropdown(!/^\s*$/.test(search));
      } else {
        searchBar.hideDropdown();
      }
    });
    
    this.isShown = false;
    this.clickHandler = function(e) {
      if (!searchBar.dropdownContainer.contains(e.target) && !inputElement.contains(e.target) && e.target != inputElement && e.target != searchBar.dropdownContainer)
        searchBar.toggleDropdown(false);
    };
    this.toggleDropdown = function(show) {
      if (show != this.isShown) {
        spotDefault.toggleElement(this.dropdownContainer, show);
        this.isShown = show;
        if (show)
          document.addEventListener('click', this.clickHandler);
        else
          document.removeEventListener('click', this.clickHandler);
      }
    };
    this.showDropdown = function() { this.toggleDropdown(true); };
    this.hideDropdown = function() { this.toggleDropdown(false); };

    this.keyupListener.doneTyping(options['doneTyping'] || function(search) {
      if (!spotDOM.shopifyMode()) {
        var nonSpotResults = null;
        var spotResults = null;
        if (search != '') {
          searchBar.getQuery(search).e().done(function(products, count, options) {
            spotResults = [products,count,options];
            if (!searchBar.searchNonSpot || nonSpotResults)
              searchBar.results(search, options, count, nonSpotResults);
          });
          if (searchBar.searchNonSpot) {
            var path = '/search';
            if (!spotDOM.isPrimaryLocale())
              path = '/' + spotDOM.locale() + '/search';
            spotDOM.spotAPI.ajax({ url: path, dataType: 'html', data: { q: search, type: "article,page", view: "json" }}).done(function(data) {
              nonSpotResults = JSON.parse(data)['results'];
              if (spotResults)
                searchBar.results(search, spotResults[0], spotResults[1], spotResults[2], nonSpotResults);
            });
          }
        } else {
          searchBar.results(search, {}, 0, {});
        }
      }
    });
    this.keyupListener.submit(options['submit'] || function(search) {
      spotDefault.redirectToSearchPage(search);
    });

    this.highlightWords = function(suppliedWords, targetWords) {
      if (!Array.isArray(suppliedWords))
        suppliedWords = suppliedWords.split(/\s+/);
      if (!Array.isArray(targetWords))
        targetWords = targetWords.split(/\s+/);
      var highlightedSearch = '';
      var highlightedWords = [];
      var i;
      for (i = 0; i < targetWords.length; ++i) {
        highlightedWords[i] = 0;
        for (var j = 0; j < suppliedWords.length; ++j) {
          if (targetWords[i].toLowerCase().indexOf(suppliedWords[j].toLowerCase()) == 0)
            highlightedWords[i] = suppliedWords[j].length;
        }
      }

      for (i = 0; i < targetWords.length; ++i) {
        if (highlightedWords[i]) {
          highlightedSearch += (i != 0 ? " " : "") + "<span class='text-highlight'>" + targetWords[i].slice(0, highlightedWords[i]) + "</span>" + targetWords[i].slice(highlightedWords[i]);
        } else {
          highlightedSearch += (i != 0 ? " " : "") + targetWords[i];
        }
      }
      return highlightedSearch;
    };
    
    window.addEventListener("resize", options['resize'] || function() {
      searchBar.updateMatchElement(inputElement, searchBar.dropdownContainer);
    });
  };
  /** %-{SearchBar} **/

  /**
  
  ## Functions
  

  ### setupQueryOnChange

  Sets up listeners equivalent to the following, so that new queries are issued when significant attributes change. Normally called by `SpotDefault.init`.

  %{setupQueryOnChange}

  This is useful in most setups, though may be omitted if you want to have an 'apply' button that triggers queries. Can be used by simply typing:

      window.spotDefault.setupQueryOnChange();

  **/
  this.setupQueryOnChange = function() {
    /** %+{setupQueryOnChange} **/
    this.spotDOM.sort(function() {
      this.page(1);
    }).collection(function() {
      this.page(1);
    }).search(function() {
      this.page(1);
    }).split(function() {
      this.page(1);
    }).paginate(function() {
      this.page(1);
    }).currency(function() {
      this.page(1);
    }).locale(function() {
      this.page(1);
    }).page(function() {
      this.query();
    }).addCondition(function() {
      this.query();
    }).removeCondition(function() {
      this.query();
    });
    /** %-{setupQueryOnChange} **/
  };
  
  /**

  ### getMatchingSearchRule(locale, list, search)

  Gets the URL that should be redirected to, given a particular search.  Will check to see if there's any terms in the redirect hierarchy that should redirect somewhere other than the search page.
  
  **/	
  this.getMatchingSearchRule = function(locale, list, search) {
    var normalizedSearch = this.spotDOM.normalizeSearch(search);
    var candidate = list.filter(function(e) {
      if (e.locale && locale && e.locale != locale)
        return false;
      var term = spotDefault.spotDOM.removeDiacritics(e.term.toLowerCase());
      var i = normalizedSearch.indexOf(term);
      return (
          i != -1 && (
          e.type == "substring" ||
          e.type == "exact" && (i == 0 && normalizedSearch.length == term.length) ||
          e.type == "word" && (i + e.term.length == normalizedSearch.length || /\W/.test(normalizedSearch.charAt(i+e.term.length)))
        ));
    })[0];
    if (candidate)
      return candidate;
    return null;
  };
  this.getSearchPageRedirect = function(locale, search) {
    var candidate = this.getMatchingSearchRule(locale, this.spotDOM.redirects(), search);
    if (candidate)
      return candidate.url;
    return null;
  }
  /**
  
  ### redirectToSearchPage(search)

  A function that redirects you to wherever `getSearchPageRedirect` tells you to redirect, given the specified search, in the current locale.
  
  **/
  this.redirectToSearchPage = function(search) {
    window.location = this.getSearchPageRedirect(this.spotDOM.locale(), search) || ("/search?q=" + encodeURIComponent(search));
  }
  /**
  
  ### canUseInitialProducts
  
  Checks to see whether we can use the initial set of products for this particular collection, given the URL.
  
  **/
  this.canUseInitialProducts = function() {
    return !(spotDOM.sort() || spotDOM.collection() != spotDOM.getCollectionPage() || spotDOM.isSearchPage() || spotDOM.search() || spotDOM.spotAPI.grep(spotDOM.spotAPI.flatMap(spotDOM.facets(), function(f) { return f.facetValues(); }), function(fv) { return fv.enabled(); }).length > 0);
  };
  /**

  ### needsInitialQuery

  Checks to see whether we're searching anything, have any sort of facets require getting any facets, or do anything
  that needs to be done before showing products to the user. If false, then Spot does not need to be queried to correctly
  render the list of products for this particular collection.

  %{needsInitialQuery}


  **/
  this.needsInitialQuery = function() {
    /** %+{needsInitialQuery} **/
    return this.canUseInitialProducts() || (spotDOM.facets().length > 0 && spotDOM.optionBehavior() != "none");
    /** %-{needsInitialQuery} **/
  };

  /**

  ### createElement(html)

  A helper simple function that takes in a string, and returns an HTML element.

  **/
  this.createElement = function(text) {
    return document.createRange().createContextualFragment(text).children[0];
  };


  /**

  ### toggleElement(element, show)

  A helper simple function that takes in a dom element, and either hides or shows it.

  **/
  this.toggleElement = function(element, show) {
    if (element) {
      if (show) {
        var currentDisplay = element.ownerDocument && element.ownerDocument.defaultView.getComputedStyle(element)['display'];
        if (currentDisplay == "none")
          element.style.display = element.dataset.initial_display || 'block';
      } else {
        var currentDisplay = element.ownerDocument && element.ownerDocument.defaultView.getComputedStyle(element)['display'];
        if (currentDisplay != "none") {
          element.dataset.initial_display = element.dataset.initial_display || currentDisplay || 'block';
          element.style.display = 'none';
        }
      }
      return element;
    }
  };
  this.toggleElementQuick = function(element, show) {
    if (element)
      element.style.display = show ? 'block' : 'none';
  };

  /**

  ### showElement(element)

  A helper simple function that takes in a dom element, and shows it.

  **/
  this.showElement = function(element) { return this.toggleElement(element, true); };
  this.showElementQuick = function(element) { return this.toggleElementQuick(element, true); };
  /**

  ### hideElement(element)

  A helper simple function that takes in a dom element, and hides it.

  **/
  this.hideElement = function(element) { return this.toggleElement(element, false); };
  this.hideElementQuick = function(element) { return this.toggleElementQuick(element, false); };
  /**

  ### setupProductRender(productContainer, productRenderer, shouldImmediatelyRenderProducts)

  A helper function that renders products as specified by the productRenderer. Normally called by `SpotDefault.init`.

  * `productContainer` is a querySelector for a div that will be cleared, and contain the received products.
  * `productRenderer` is a function that takes in a product, and returns an element that
  * `shouldImmediatelyRenderProducts` determines whether or not we should render the products immediately onto the page, or wait one query. This allows for grabbing of facets, without affecting the actual loaded products.

  **/
  this.setupProductRender = function(productContainer, productRenderer, shouldImmediatelyRenderProducts) {
    if (shouldImmediatelyRenderProducts === undefined)
      shouldImmediatelyRenderProducts = false;
    var renderer = productRenderer || this.defaultProductRenderer;
    if (typeof(renderer) == 'string') {
      var rendererString = renderer;
      renderer = function(product) {
        product.url = spotDOM.getProductURL(product);
        product.image = spotDOM.getProductImage(product);
        product.title = spotDOM.getProductTitle(product);
        product.price = product.price / 100.0;
        return spotDefault.createElement(spotDefault.template(rendererString, { product: product }));
      };
    }
    this.productContainer = productContainer;
    this.spotDOM.products(function(products) {
      if (products && shouldImmediatelyRenderProducts) {
        if (spotDefault.paginationType() == "paged" || spotDefault.spotDOM.page() == 1)
          productContainer.innerHTML = '';
        var productFragment = document.createDocumentFragment();
        for (var i = 0; i < products.length; ++i) {
          var child = renderer.call(spotDefault, products[i]);
          if (typeof(child) == 'string')
            child = spotDefault.createElement(child);
          child.addEventListener('click', (function(i) { return function() { spotEvent.clickedProduct(products[i].id, i); } })(i));
          productFragment.appendChild(child);
        }
        productContainer.appendChild(productFragment);
      }
    }, shouldImmediatelyRenderProducts);
    this.spotDOM.query(function() {
      shouldImmediatelyRenderProducts = true;
    });
  };

  /**

  ### setupFacets(facets)

  A helper function that sets up facets in a default manner. Normally called by `SpotDefault.init`.

  **/
  this.setupFacets = function(facets) {
    var appliedFacet = false;
    for (var i = 0; i < facets.length; ++i)
      appliedFacet = window.spotDOM.addFacet(new window.spotDOM.Facet(facets[i])).init() || appliedFacet;
    return appliedFacet;
  };
  /**

  ### setupRecommendations(recommendations, boostRules, sortOrders, context)

  A helper function that sets up recommendations in a default manner with the specified context. Normally called by `SpotDefault.init`.

  **/
  this.setupRecommendations = function(recommendations, boostRules, sortOrders, context) {
    spotDOM.addRecommendations(recommendations.map(function(recommendation) { 
      var sortOrder = spotDOM.getSortOrder(sortOrders && recommendation.sort_order_id ? sortOrders[recommendation.sort_order_id] : null);
      return new window.spotDOM.Recommendation(recommendation, new window.spotDOM.BoostRule(boostRules[recommendation.boost_rule_id]), context, sortOrder) 
    }));
    return this;
  };
  /**

  ### setupPersonalization(personalization, boostRules, context)

  A helper function that sets up personalization in a default manner with the specified context. Normally called by `SpotDefault.init`.

  **/
  this.setupPersonalization = function(personalization, boostRules, context) {
    if (!personalization.boost_rule_id)
      return this;
    var personalization = new window.spotDOM.Personalization(personalization, new window.spotDOM.BoostRule(boostRules[personalization.boost_rule_id]), context);
    spotDOM.personalization(personalization);
    spotDOM.query(function(products, count, options) {
      if (spotDOM.search()) {
        personalization.viewSearch(products);
      } else if (spotDOM.collection()) {
        personalization.viewCollection(products);
      }
    });
    if (context.product && spotDOM.isProductPage()) {
      if (spotDOM.hasVariantID()) {
        var variantId = spotDOM.getVariantID();
        personalization.viewVariant(context.product, context.product.variants.filter(function(v) { return v.id == variantId })[0]);
      } else {
        personalization.viewProduct(context.product);
      }
    }
    return this;
  };
  /**

  ### setupBoosts(boosts, boostRules, searchBoosts, context)

  A helper function that sets up boosts in a default manner with the specified context. Normally called by `SpotDefault.init`.

  **/
  this.setupBoosts = function(boosts, boostRules, searchBoosts, context) {
    var boostQuery = spotDOM.spotAPI.se();
    boosts.forEach(function(id) { var query = new window.spotDOM.BoostRule(boostRules[id]).getQuery(context); boostQuery = boostQuery.merge(query); });
    spotDOM.boosts(boostQuery);
    if (searchBoosts)
      spotDOM.addSearchBoosts(searchBoosts);
    return this;
  };
  
  /**

  ### setupSortOrderDropdown(sortDropdown)

  A helper function that sets up sort orders in the specified `<select>` element. Normally called by `setupSortOrders`.

  **/
  this.setupSortOrderDropdown = function(sortDropdown) {
    spotDOM.addSortOrder(function(sortOrder) {
      sortOrder.element = sortDropdown.querySelector('option[value="' + sortOrder.getUniqueId() + '"]');
      if (sortOrder && !sortOrder.element) {
        sortOrder.element = spotDefault.createElement("<option value='" + sortOrder.getUniqueId() + "'>" + sortOrder.getName() + "</option>");
        sortDropdown.appendChild(sortOrder.element);
      }
    }, true).removeSortOrder(function(sortOrder) {
      sortOrder.element.remove();
    });
    spotDOM.sort(function(sortOrder) {
      sortDropdown.querySelectorAll('option').forEach(function(e) { e.removeAttribute('selected'); });
      if (sortOrder && sortOrder.element)
        sortOrder.element.selected = true;
    }, spotDOM.sort() != null);
    sortDropdown.addEventListener("change", function(e) {
      spotDOM.sort(this.value);
      e.preventDefault();
    });
  };
  
  /**

  ### setupSortOrders(sortDropdown, sortOrders, selectedSortOrder)

  A helper function that sets up sort orders in a default manner. Normally called by `SpotDefault.init`.
  
  * `sortDropdown` is the `<select>` DOM element that should house the sort orders.
  * `sortOrders` is a list of sort orders relevant for this particular page.
  * `selectedSortOrder` is the sort order that should be active from among `sortOrders`

  **/
  this.setupSortOrders = function(sortDropdown, sortOrders, selectedSortOrder) {
    var selectedObjectSortOrder = null;
    if (sortOrders) {
      spotDOM.spotAPI.forEach(spotDOM.spotAPI.grep(spotDOM.spotAPI.map(spotDOM.spotAPI.grep(sortOrders, function(e) { return e['active'] !== false; }), function(e) { 
        var so = new spotDOM.SortOrder(e); 
        if (selectedSortOrder && (e == selectedSortOrder || (selectedSortOrder.simple && so.getUniqueId() == selectedSortOrder.getUniqueId())))
          selectedObjectSortOrder = so;
        return so;
      }), function(e) { return e.isRelevant(); }), function(order) { spotDOM.addSortOrder(order) })
    } else
      spotDOM.initDefaultSortOrders();
    // For our sort dropdown, we're going to populate it with all the default Shopify sort orders, or hook them up to already existing values.
    if (sortDropdown) 
      this.setupSortOrderDropdown(sortDropdown);
    if (!selectedObjectSortOrder) {
      if (!spotDOM.sort() && spotDOM.isSearchPage()) {
        var searchSortOrder = spotDOM.sortOrders().filter(function(so) { return so.getUniqueId() == "search" })[0];
        if (searchSortOrder)
          spotDOM.sort(searchSortOrder);
      }
    } else {
      spotDOM.sort(selectedObjectSortOrder);
    }
  };

  /**

  ### paginationType

  A property that determines the type of pagination that's currently occurring.

  **/
  spotDOM.scalarField(this, 'paginationType');
  /**

  ### setupPagination(paginationType, paginationContainers, currentCount, options)

  A helper function that sets up pagination in a default manner. Normally called by `SpotDefault.init`.

  * `paginationType` can be either 'infinite', 'paged', 'load', or null.
  * `paginationContainers` is valid for `paged`; will fill the specified containers with pagination elements.
  * `currentCount` takes in current amount of products on the page; only valid for `load`. Optional.
  * `options` can contain the following options: 
      * Any instantiation options for `ScrollPaginationHelper`.
      * `noBackfillHeight` which will prevent Spot from keeping track of the page height, and backfilling the result container height if it knows what it should be based on previous queries.
  
  In order to assure that a user always returns to the same height upon product loading, the minHeight of the productContainer should
  be set in CSS to be high enough so that it encompasses the largest resultset. Spot will then pare this down as it has more information.

  **/
  this.setupPagination = function(paginationType, paginationContainers, currentCount, options) {
    if (!options)
      options = {};
    this.countListener = null;
    this.productListener = null;
    if (!paginationContainers)
      paginationContainers = [];
    this.scrollPaginationHelper = new spotDefault.ScrollPaginationHelper(options);
    spotDOM.count(function(count) {
      if (spotDefault.countListener)
        spotDefault.countListener(count);
    });
    spotDOM.products(function(products) {
      if (spotDefault.productListener)
        spotDefault.productListener(products);
    });
    this.paginationType(function(paginationType) {
      if (paginationType != 'infinite')
        spotDefault.scrollPaginationHelper.detach();
      if (paginationType == 'paged') {
        var child = spotDefault.createElement("<div></div>");
        spotDefault.countListener = function(count) {
          // If we're using paged pagination, render pagination.
          paginationContainers.forEach(function(paginationContainer) {
            paginationContainer.innerHTML = '';
            paginationContainer.appendChild(spotDefault.pagedPaginationHelper({ count: count }))
          });
        };
      } else if (paginationType == 'load') {
        var createButton = function() {
          var button = spotDefault.createElement("<button class='spot-load-more button btn'></button>");
          button.textContent = spotDefault.templateLocale('load-more');
          button.addEventListener("click", function(e) { spotDOM.page(spotDOM.page()+1); e.preventDefault(); });
          return button;
        };
        var appendButton = function() {
          paginationContainers.forEach(function(paginationContainer) {
            paginationContainer.innerHTML = '';
            paginationContainer.appendChild(createButton());
          });
        };
        spotDefault.productListener = function(products) {
          document.querySelectorAll('.spot-load-more').forEach(function(e) { e.remove(); });
          if (products.length == spotDOM.paginate())
            appendButton();
        };
        if (currentCount && currentCount > spotDOM.paginate())
          appendButton();
      }
    });
    this.paginationType(paginationType);
    this.paginationType(function() { spotDOM.page(1); });
    // In the case where we load things up; we're required to progress through the various pages in order to
    // load our position correctly, previously.
    if (paginationType == 'load' || paginationType == 'infinite') {
      // Fix the instance where when we hit the back button, make sure that we've saved the productContainer height, and
      // back-fill a min-height into the container. This allows for much less jumping, and will also have the browser
      // stay at the same place on the page.
      var currentPage = spotDOM.page();
      if (this.productContainer && !options['noBackfillHeight']) {
        spotDOM.endQuery(function() {
          if (currentPage == spotDOM.page())
            spotDefault.productContainer.style.removeProperty('min-height');
          spotDOM.spotAPI.setStorage("spotBackfillHeight", { page: spotDOM.page(), url: window.location.href, height: spotDefault.productContainer.offsetHeight, windowWidth: window.offsetWidth });
        });
        var heightInformation = spotDOM.spotAPI.getStorage("spotBackfillHeight");
        if (heightInformation && window.location.href == heightInformation.url && currentPage == heightInformation.page && heightInformation.windowWidth == window.offsetWidth)
          this.productContainer.style.minHeight = heightInformation.height + "px";
      }
      if (currentPage > 1) {
        var countUp = function(page) {
          if (page <= currentPage) {
            spotDOM.queryGuard(function() {
              spotDOM.page(page);
            }).done(function(products) {
              if (products.length > 0)
                countUp(page+1);
            });
          } else if (paginationType == 'infinite')
            spotDefault.scrollPaginationHelper.attach();
        };
        countUp(1);
      } else if (paginationType == 'infinite')
        this.scrollPaginationHelper.attach();
    }
  };

  /**

  ### setupSearchBars(searchBars, localSearch, options, defer)

  A helper function that sets up search bars in a default manner. Normally called by `SpotDefault.init`.

  * `searchBars` is a node list representing the set of search bars you want to apply the behaviour to. Should be input boxes.
  * `localSearch`  determines whether or not the search bar should apply to the current view, or as a dropdown. Defaults to false.
  * `backfillSearchBars` determines whether or not we should backfill all search bars as searches are made anywhere on the page (or from the address bar)
  * `options` will be passed direclty to the `options` argument for the `SearchBar` class.
  * `defer` will only apply the search bar after the page has been fully loaded.

  **/
  this.setupSearchBars = function(searchBars, localSearch, backfillSearchBars, options, defer) {
    if (!options)
      options = {};
    if (backfillSearchBars) {
      this.spotDOM.search(function() {
        // Update the search bars if we make a search query, and do it immediately.
        spotDOM.spotAPI.forEach(searchBars, function(e) { e.value = spotDefault.spotDOM.search(); });
      }, true);
    }
    var internalSetup = function() {
      window.spotSearchBars = spotDefault.spotDOM.spotAPI.map(searchBars, function(e) {
        if (!localSearch) {
          return new spotDefault.SearchBar(e, options.maxProducts, options.showAll, options);
        } else {
          return new spotDefault.KeyupListener(e).doneTyping(function(search) {
            spotDefault.spotDOM.search(search);
          });
        }
      });
    };
    if (defer)
      window.addEventListener('load', internalSetup);
    else
      internalSetup();
  };

  /**

  ### setupEvents(customerId, orderId)

  A helper function that sets up basic events. Normally called by `SpotDefault.init`.

  * customerId is the id of the current customer. This will tag this session as belonging to this particular customer.
  * orderId is the id of the current order, if this is a thank you page. Tags the order as belonging to this particular session.

  **/
  this.setupEvents = function(customerId, orderId) {
    if (this.spotEvent) {
      if (this.spotDOM.isThankYouPage()) {
        if (this.spotDOM.spotAPI.sessionId())
          this.spotEvent.completedOrder(orderId);
      } else if (!this.spotDOM.spotAPI.sessionId() && !this.spotDOM.spotAPI.getStorage("spotBegunSession")) {
        this.spotEvent.beginSession();
        this.spotDOM.spotAPI.setStorage("spotBegunSession", true);
      }
      if (!this.spotDOM.spotAPI.getStorage("spotLoggedIn") && customerId) {
        this.spotEvent.loggedIn(customerId);
        this.spotDOM.spotAPI.setStorage("spotLoggedIn", true);
      }
    }
  };
  
  
  this.setupShopifyModeFallback = function(products, all_tags) {
    // Manually feed in the prodcut listing if we're in Shopify mode and we have a listing
    if (products) {
      var runOnce = false;
      spotDOM.endQuery(function() {
        if (window.spotDOM.shopifyMode()) {
          if (!runOnce) {
            window.spotDOM.products(products); 
            runOnce = true;
          }
        }
      });
    }
    if (all_tags && all_tags.length < 1000) {
      var hash = {};
      for (var i = 0; i < all_tags.length; ++i)
        hash[all_tags[i]] = true;
      spotDOM.addFacet(function(facet) {
        if (facet.smartType == "tags" || facet.smartType == "tag") {
          facet.addFacetValue(function(facetValue) {
            var values = facetValue.getValue();
            if ((typeof(values) == 'object' && Array.isArray(values) ? values : [values]).filter(function(e) { return hash[e]; }).length == 0)
              facetValue.count(0);
          }, true);
        }
      }, true);
    }
  };

  // Gets the matching rule given a search.
  this.getSearchRules = function(options, search) {
    var rules = [];
    var override = window.spotDOM.getOverrideRuleHandle();
    if (options.rule && typeof(options.rule) == "object")
      rules.push(options.rule);
    else if (options.rule && options.settings.rules[options.rule])
      rules.push(options.settings.rules[options.rule]);
    if (search && options.settings.search_overrides) {
      var rule = this.getMatchingSearchRule(window.spotDOM.locale(), options.settings.search_overrides, search);
      if (rule && options.settings.rules[rule.rule]) {
        rules.push(options.settings.rules[rule.rule]);
      }
    }
    if (override && options.settings.rules[override])
      rules.push(options.settings.rules[override]);
    if (search != null && options.settings.search_rule)
      rules.push(options.settings.rules[options.settings.search_rule]);
    if (options.settings.general_rule)
      rules.push(options.settings.rules[options.settings.general_rule]);
    return rules;
  };
};


/**

### init(options)

The default initailization method. Pass in a bunch of functions, get functional filters in seconds. Takes the following options:

#### clusters

Required. The list of clusters that Spot is present on. Retrieved from `{{ shop.metafields.esafilters.clusters | json }}`

#### sortOrders

The list of sort orders that Spot is supposed to used.

Overrides the list specified by the currently active display rule. Should not generally be used; mostly deprecated.

#### facets

The list of facets that Spot is supposed to use in this context.

Overrides the list specified by the currently active display rule. Should not generally be used; mostly deprecated.

#### split

The product split to use.

Overrides the split specified by the currentlay active display rule.

#### settings

The full list of all facet groups, sort orders, splits, and rulesets, that could ever be relevant. Display rules will apply these facets, sort orders, and splits.

Retrieved from `{% assign settings_theme_id = "settings-" | append: theme.id %}{% assign settings = shop.metafields.esafilters[settings_theme_id] | default: shop.metafields.esafilters.settings %}{% if settings %}{{ settings | json }}{% else %}{}{% endif %}`

#### rule

The contextual display rule. Specifies the facet group to use, the sort order, the split, and the query filters to default to, as well as any pins.

Retrieved using `{% if collection %}{% assign settings_theme_id = "settings-" | append: theme.id %}{% assign settings = collection.metafields.esafilters[settings_theme_id] | default: collection.metafields.esafilters.settings %}{% endif %}{% unless settings %}{% assign settings_theme_id = "settings-" | append: theme.id %}{% assign settings = shop.metafields.esafilters[settings_theme_id] | default: shop.metafields.esafilters.settings %}{% if settings %}{{ settings.general_rule_id }}{% else %}null{% endif %}{% endif %}`

Can be overridden by the URL, either by the query parameter `rule`, or by specifying as part of the path. Below
are examples of URLs which would override the rule specified here:

* https://yoursite.myshopify.com/collections/my-collection-handle?rule=my-rule-handle
* https://yoursite.myshopify.com/collections/my-collection-handle/my-rule-handle
* https://yoursite.myshopify.com/search?rule=my-rule-handle
* https://yoursite.myshopify.com/search/my-rule-handle

Can either be a JSON object in the case of a global rule override, or can be a simple refernece by ID to one of the global resultsets in `settings`.

#### productContainer

The container that should display products.

#### productRenderer

A function that returns the DOM element for a product in the productContainer.

#### noInitialProductRender

When true is passed, for the initial call, products are not loaded onto the page; this is only done for subsequent calls to filtration, pagination, and the like. Only valid if no search is occurring.
This can be useful if merchandising orders are very important and are updated very frequently, and the merchant wants changes to be "instant".

#### forceInitialQuery

When true is passed, will *always* make a query upon page load. Shouldn't be used, unless there's a good reason for it.

#### paginationType

The type of pagination to use. Values are as follows:

* `null`: Uses no pagination out of the box.
* `"load"`: Adds a button into paginationConatiners (or the productContainer, if no pagination containers are specified), that loads more products on click.
* `"infinite"`: Upon reaching the bottom of the page, more products are loaded.
* `"paged"`: Fills the paginationContainers with a set of page numbers, and a next and prev button.

#### paginationContainers

The list of containers in which to use pagination. Only valid for `paged` and `load` modes.

#### sortDropdown

The select box that contains your sort orders.

#### searchBars

The search bars. By default, this is hooked into any input that has the name 'q'.

#### searchBarOptions

Options fed to the search bars. Takes a hash, details below.

##### maxProducts

Determines how many products are retrieved by the search bar for instant search. Default is 5.

##### showAllButton

Determines if a "showAllButton" should be added to the search results. Default is false.

##### alwaysDropdown

If set to true, a search dropdown will always pop out regardless of what page the user is on.

If set to false, a search dropdown won't pop out on collection or search pages; instead, searches will refind the existing resultset already being shown. This is the default.

##### deferHookUntilLoad

Defers hooking the search bar until the page is fully loaded. Default false.

#### facetPane

The facet pane to use. If unspecified, will use the default spot pane. This is where you'd pass in a custom pane (see the pane section for details), if you wanted to use one.

#### facetPaneContainer

The facet pane container to place the pane into. Should be something like an empty div, or larger container that can have elements placed into it. If not specified, no pane is initialized.

#### facetPaneContainerSelectorPosition

Where the facet pane should be placed relative to the container. Default is "beforeend". Uses the enum of values present on insertAdjacentElement.

#### facetPaneOptions

A hash contains that can conatain the following attributes.

##### classes

An array of classes to add to the pane as it's created.

##### facetClasses

An array of classes to add to the facet divs as they're created.

##### facetValueClasses

An array of classes to add to the facet value divs as they're created.

##### singleActive

Ensures that when a user tries to open a facet, all other facets are closed. Useful in horizontal-style facet panes.

##### breadcrumbs

A boolean, determines whether breadcrumbs are used.

##### includeSorting

A boolean; determiens whether or not to include the sort orders as "facets" in the pane. Will not produce breadcrumbs, nor will allow more than one to be selected at any one time.

##### hideInactiveFacetValues

A boolean. Default true. In situations where the countBehaviour is not `none`, if this is true, if a facet value doesn't exist for this resultset, it will be hidden from the display.

##### hideInactiveFacets

A boolean. Default false. In situations where the countBehaviour is not `none`, if this is true, if a facet has no valid facet values for this resultset, it will be hidden from the display.

##### noSearchResultsContainer

A container that should be shown or hidden if not results are found/not found. Can be passed a function which will be called instead.

##### resultsStatusContainer

A container to contain the status of the current page of results (i.e. start - end of count products for "search")

## FAQ

### How do I make the faceting pane instantiated be horizontal?

This can be achieved entirely with CSS styling, like the following, which will lay out your facet headings to take the entire container, and allow the facet value listing to pop down into its own box that takes up the entire
width of the paneContainer.

```css
  .pane.horizontal .facet.active .facet-values {
    position: absolute;
    background: #fff;
    z-index: 1000;
    left: 0;
    padding: 16px;
    width: 100%;
    text-align: left;
  }
  .pane.horizontal .facet.active .facet-values .facet-value {
    margin-right: 24px;
    margin-bottom: 4px;
    display: inline-block;
  }
  .pane.horizontal .facets {
    display: flex;
    margin: 12px 0;
    position: relative;
  }
  .pane.horizontal .facet-title {
    margin-top: 0;
  }
  .pane.horizontal .facets .facet {flex-grow: 1;
    margin: 0 4px;
  }
```

**/
/** %+{SpotDefaultInit} **/
window.SpotDefault.init = function(options) {
  if (!options)
    options = {};
  // ================= STEP 1 =========================
  // Instantiating the APIs and tossing approriate settings on there.
  window.spotAPI = window.spotAPI || new window.SpotAPI(options.clusters);
  if (options['eventSink'] && options['eventSink'] != "none")
    window.spotAPI.eventSink(options['eventSink']);
  var deferred = window.spotAPI.Deferred();
  var ready = function() {
    if (!options['clusters'])
      throw "Requires cluster listing from {{ shop.metafields.esafilters.clusters | json }}.";
    window.spotDOM = window.spotDOM || new window.SpotDOM(window.spotAPI);
    // If we want to use default HTML/pagination implementations, we do this. For this example, we'll use it.
    window.spotEvent = window.spotEvent || new window.SpotEvent(window.spotAPI);
    window.spotDefault = window.spotDefault || new window.SpotDefault(window.spotDOM, window.spotEvent, options["language"]);
    window.spotDefault.options = options;

    // Useful if multiple domains/domain switches occur.
    if (window.Shopify && window.Shopify.shop)
      window.spotAPI.defaultQuery(window.spotAPI.s().hostname(window.Shopify.shop));
    if (options['moneyFormat'])
      window.spotDOM.moneyFormat(options['moneyFormat']);
    if (options['omitExtraneousResults'])
      window.spotDOM.omitExtraneousResults(options['omitExtraneousResults']);

    if (options['init'])
      options['init'](window.spotAPI, window.spotDOM, window.spotDefault);
    window.spotDefault.setupEvents(options['customerId'], options['orderId']);
    if (options.settings['redirects'])
      window.spotDOM.addRedirects(options.settings['redirects']);

    var personalization = options.settings && options.settings.personalization;
    var context = { product: options.product, customer: options.customer, collection: options.collection, params: window.spotDOM.getUrlVars() };

    if (options.settings) {
      window.spotDOM.search(function(search) {
        var rules = window.spotDefault.getSearchRules(options, !window.spotDOM.isSearchPage() && !search ? null : search);
        if (window.spotDefault.rulesets().length != rules.length || window.spotDefault.rulesets().filter(function(r, idx) { return rules[idx] != r; }).length > 0) {
          window.spotDefault.removeRulesets(window.spotDefault.rulesets());
          window.spotDefault.addRulesets(rules);
        }
      }, true);
    }

    if (personalization)
      window.spotDefault.setupPersonalization(personalization, options.settings.boost_rules, context);
    
    
    window.spotDOM.queryGuard(function() {
      // ================= STEP 6 =========================
      // Initialize with our default sort orders on a per shop, or per collection basis, or if not present, use defaults.
      // Initialized outside outside isSearchPage because of recommendations, which may use sortOrders.
      var sortOrders = options.sortOrders || (options.settings ? options.settings.sort_orders : null);
      var selectedSortOrder = (window.spotDOM.isSearchPage() || window.spotDOM.isCollectionPage()) && (window.spotDOM.sort() || window.spotDefault.rulesets().reduce(function(value, rule) { return value != null ? value : options.settings.sort_orders[rule.sort_order_id]; }, null) || options.defaultSortOrder);
      window.spotDefault.setupSortOrders(options['sortDropdown'] || document.querySelector('select[name="sort_by"]'), sortOrders, selectedSortOrder);
      // Only proceed in integrating things if we're actually on a relevant page; i.e. a collection or search page.
      if (window.spotDOM.isSearchPage() || window.spotDOM.isCollectionPage()) {
        // Issue a query guard directive; ensure that within this block, only a single query is run at the end of the block.
        // This is used so that setup can happen, checkboxes can be ticked, without actually triggering unecessary filtration.
        var currentPage = window.spotDOM.page();
        // ================= STEP 2 =========================
        // Choosing how to render products onto a page when we get them.
        if (options['productContainer']) 
          window.spotDefault.setupProductRender(options['productContainer'], options['productRenderer'], !options['noInitialProductRender'] || personalization || options['forceInitialQuery']);
        // ================= STEP 3 =========================
        if (options['facetPaneContainer'] || options['paneContainer']) {
          // Getting a pane HTML element, and attaching it to your page.
          window.spotFacetPane = options['pane'] || options['facetPane'] || new window.spotDefault.Pane(options['paneOptions'] || options['facetPaneOptions']);
          // Legacy.
          window.spotPane = window.spotFacetPane;
          var showMobileFlyout = window.spotDefault.createElement("<button class='facet-pane-mobile-show'>" + window.spotDefault.templateLocale("filter") + "</button>");
          showMobileFlyout.addEventListener('click', function() { window.spotPane.paneElement.classList.add('expanded'); });
          (options['facetPaneContainer'] || options['paneContainer']).insertAdjacentElement(options['facetPaneContainerSelectorPosition'] || options['paneContainerSelectorPosition'] || "beforeend", showMobileFlyout);
          (options['facetPaneContainer'] || options['paneContainer']).insertAdjacentElement(options['facetPaneContainerSelectorPosition'] || options['paneContainerSelectorPosition'] || "beforeend", window.spotPane.paneElement);
        }
        // ================= STEP 4 =========================
        // This will pull facets from the Spot control panel.
        // Here we actually add these facets to our DOM module so that it knows what it should be looking for.        
        var facet_group_id = window.spotDefault.rulesets().reduce(function(value, rule) { return value != null ? value : rule.facet_group_id }, null);
        var facets = options.facets || (options.settings.facet_groups[facet_group_id] && options.settings.facet_groups[facet_group_id].map(function(id) { return options.settings.facets[id] }));
        if (facets && window.spotDefault.setupFacets(facets))
          window.spotDOM.page(currentPage);
        // ================= STEP 5 =========================
        // Here's an easy way to write pagination to the page when a query changes/is made for the first time.
        if (options['paginationType'] !== "none")
          window.spotDefault.setupPagination(options['paginationType'] !== undefined ? options['paginationType'] : "infinite", options['paginationContainers'], options['currentCount'], {  noBackfillHeight: options['noBackfillHeight'], triggerHeight: options['scrollTriggerHeight'] });
        // ================= STEP 7 =========================
        // If we have a spellcheck that occurs, display it in the appropriate DOM element.
        if (options['spellcheckContainers']) {
          window.spotDOM.spellCheck(function(spellCheck){
            options['spellcheckContainers'].forEach(function(spellcheckContainer) {
              window.spotDefault.toggleElement(spellcheckContainer, spellCheck);
              if (spellCheck)
                spellcheckContainer.innerHTML = "<p class='corrected'>" + window.spotDefault.templateLocale("showing-results-for") + " <a href='/search?q=" + encodeURIComponent(spellCheck.corrected) + "'>" + window.spotAPI.map(spellCheck.words, function(e) { if (e.corrected != e.original) { return "<b>" + e.corrected + "</b>"; } return e.corrected; }).join(" ") + "</a>.</p>";
            });
          });
        }
        // Ensure that we update the query string whenever a query is made.
        window.spotDOM.query(function() { window.spotDOM.updateQueryString({}); });
        // Ensure that whenever something changes about the page (page change, collection change, etc..), we force a refresh.
        window.spotDefault.setupQueryOnChange();
        window.spotDefault.setupShopifyModeFallback(options["products"], options["all_tags"]);
        
        // Minor polish details.
        if (options['noSearchResultsContainer']) {
          window.spotDOM.query(function(products, count) {
            window.spotDefault.toggleElement(options['noSearchResultsContainer'], window.spotDOM.page() == 1 && window.spotDOM.search() && count === 0);
          });
        }
        if (options['resultsStatusContainer']) {
          window.spotDOM.query(function(products, count, _options) {
            var start = options['paginationType'] && options['paginationType'] != "infinite" ? (window.spotDOM.page() - 1) * window.spotDOM.paginate() + 1 : 1;
            var end = Math.min(window.spotDOM.page() * window.spotDOM.paginate(), count);
            options['resultsStatusContainer'].innerText = window.spotDefault.templateLocale(window.spotDOM.search() ? "results-status-search" : "results-status", { start: start, end: end, count: count, search: (_options.spellCheck ? _options.spellCheck.corrected : window.spotDOM.search()) });
          });
        }
        if (window.spotDOM.isSearchPage()) {
          window.spotDOM.query(function(products, count, _options) {
            window.document.title = window.spotDefault.templateLocale("search-title", { count: (count != null ? (count + " results") : "Results"), search: (_options.spellCheck ? _options.spellCheck.corrected : window.spotDOM.search()) });
          });
          window.spotDefault.addRecentSearch(window.spotDOM.search());
        }
      } else if (window.spotDOM.isProductPage()) {
        var handle = window.spotDOM.getProductPage();
        var duplicate = window.spotDefault.recentProducts().filter(function(e) { return e.handle == handle })[0];
        if (duplicate)
          window.spotDefault.removeRecentProduct(duplicate);
        if (window.spotDefault.recentProducts().length > (options['maxRecentProducts'] || 7))
          window.spotDefault.removeRecentProduct(window.spotDefault.recentProducts()[0]);
        window.spotDefault.addRecentProduct({ handle: handle, product: options.product });
      }
  
      // ================= OPTIONAL STEP 1+2 =========================
      // Deal with searching; in this case, let's hook up the search bar, if we're on a collections page to search the actual collection.
      // If we're on the search page, it'll simply search as normal.
      window.spotDefault.setupSearchBars(
        options['searchBars'] || (options['searchBars'] === undefined ? document.querySelectorAll('input[name="q"]') : []),
        (options['searchBarOptions'] && !options['searchBarOptions']['alwaysDropdown']) && (window.spotDOM.isSearchPage() || window.spotDOM.isCollectionPage()),
        (options['searchBarBackfill'] != null ? options['searchBarBackfill'] : false),
        options['searchBarOptions'],
        options['searchBarOptions'] && options['searchBarOptions']['deferHookUntilLoad']
      );
      if (options['product'] && options['recommendationsPaneOptions']) {
        // =================== OPTIONAL STEP 3 =========================
        // Set up our recommendations pane, ready to receive recommendations, and then set up our actual recommendations.
        if (options['recommendationsPaneContainer']) {
          window.spotRecommendationsPane = options['recommendationsPane'] || new window.spotDefault.RecommendationsPane(options['recommendationsPaneOptions'], options['recommendationsPaneRenderer'] || options['productRenderer']);
          if ((options['recommendationsPaneContainerSelectorPosition'] || 'replace') == 'replace') {
            options['recommendationsPaneContainer'].innerHTML = '';
            options['recommendationsPaneContainer'].appendChild(window.spotRecommendationsPane.paneElement);
          } else
            options['recommendationsPaneContainer'].insertAdjacentElement(options['recommendationsPaneContainerSelectorPosition'], window.spotRecommendationsPane.paneElement);
        }
      }
        
      // Every time the rules change (be it through a search override, or some other mechanism), re-run pins, boosts, recommendations.
      window.spotDefault.addRulesets(function(rules) {
        var rule = rules[0] || {};
        var split_id = rules.reduce(function(value, rule) { return value != null ? value : rule.split_id; }, options.split);
        window.spotDOM.split(split_id != null ? split_id : "auto");
        var defaultConditions = options.conditions || rule.conditions || [];
        var pins = options.pins || rule.pins || [];
        var boosts = options.boosts || rule.boosts || [];
      
        window.spotDOM.queryGuard(function() {
          if (defaultConditions.length > 0) {
            if (window.spotDOM.conditions().length > 0)
              window.spotDOM.removeConditions(window.spotDOM.conditions());
            window.spotDOM.addConditions(defaultConditions);
            // If we can use the inital product set, use it.
            if (window.spotDOM.queryCount() == 0 && window.spotDefault.canUseInitialProducts() && (!defaultConditions || defaultConditions.length == 0)  && !options['forceInitialQuery']) {
              if (options['count'])
                window.spotDOM.count(options.count);
              if (options['products'])
                window.spotDOM.products(options['products']);
            }
          }
          window.spotDOM.pins(pins);
          var recommendations = options.settings && rule.recommendation_ids && rule.recommendation_ids.map(function(id) { return options.settings.recommendations[id] });
          if (recommendations && (window.spotDOM.isProductPage() || options['forceRecommendations']))
            window.spotDefault.setupRecommendations(recommendations, options.settings.boost_rules, options.settings.sort_orders, context);  
          window.spotDefault.setupBoosts(boosts, options.settings.boost_rules, options.settings.search_boosts, context);
          // If there are reasons to trigger an initial query, trigger one.
          if ((window.spotDOM.isCollectionPage() || window.spotDOM.isSearchPage()) && (window.spotDefault.needsInitialQuery() || (rule.conditions && rule.conditions.length > 0) || personalization || options['forceInitialQuery']))
            window.spotDOM.query();
        });
      }, true);
      
      deferred.resolve(window.spotAPI, window.spotDOM, window.spotDefault);
      var event = new CustomEvent('SpotInit', { detail: { spotAPI: window.spotAPI, spotDOM: window.spotDOM, spotDefault: window.spotDefault, rule: window.spotDefault.rulesets()[0], context: context } });
      document.dispatchEvent(event);
    });
  };
  if (document.readyState === "complete" || document.readyState === "loaded" || document.readyState === "interactive")
    ready();
  else
    document.addEventListener('DOMContentLoaded', ready);
  return deferred;
};
window.spotLoaded = window.spotLoaded || (function() {
  var event = new CustomEvent('SpotLoaded', { detail: { } });
  document.dispatchEvent(event);
  return true;
})();
/** %-{SpotDefaultInit} **/

/**

## Implementation Checklist / Sample Implementation

This is probably where you want to start if you're looking to hit the ground runnning if you're looking to do a custom implemetnation. Before you dive in, you should choose how to structure your Spot code.
Normally, the standard way to do this is to stick all of your code in a snippet, and include that snippet just before the closing body tag of your `theme.liquid` file.
Inside this snippet, you'll write your javascript as single function block, and then have that block run only after document ready. This is the suggested method
of inclusion, but there is no hard requirement, you may call it how you like.

Adding the code below will throw together a default implementation of Spot onto the site. When you implement Spot, the following issues are what you should be tackling, roughly, in order.
The sample code illustrates how each of these is handled; there are corresponding step indicators in the sample code.

### Checklist

1. Instantitate a copy of `SpotAPI`, `SpotDOM` and `SpotDefault`, with the appropriate credentials, by calling `new` on each in order. Ensure that you point Spot to your results container, sort dropdown, and pagination container.
2. Provide a function to `SpotDOM` which takes a JSON representation of the store's products using `.products`, and renders that onto your collections/search results page.
3. Determine where, and how you're going to attach the faceting pane to your collections/search page, and do so by creating it with `new spotDefault.Pane()`.
4. Instantiate what facets you're going to want to show, and register them with `SpotDOM`.
5. Implement how you're going to paginate your results (with infinite scrolling, or with page numbers), generally by hooking the `.count` scalar.
6. Determine how, if at all, you're going to let the user change the sort order, and populate/set the list of sort orders using the array adders, or `spotDOM.initDefaultSortOptions()`.
7. Add in polishing elements. A generic list of things to look out for is below.
  * After each query, make sure the query string is up to date.
  * If you're using spelling correction (and you should most of the time; `.autoCorrect(true)`), consider displaying the result of what the user's search query was corrected to, through the `SpotDOM.spellCheck` hook.
  * Make the filtering/faceting "snappy", by ensure that a new query runs after most filtering changes. (See the sample implementation below).
  * Make sure that when you link any product, that if you're not specifying `allVariants(true)`, that you link to the first relevant variant, as a direct link to the product page may link to a variant the user isn't looking at.
  * When implementing a quick search bar, if you're doing search-as-you-go, ensure that you have some mechanism to either throttle the user's queries, so the user's screend doesn't thrash around (you can use `SpotDefault.keyupListener`). If this is desired behavior, then you'll need to make sure instead that you handle queries in the order in which they were made, not the order which they return. If you do not, when a user stops typing, they could have results for something that wasn't their last search. For example, if a user has typed "shi", and then "shirt", and "shirt" returns before "shi" (likely because shi contains lots more product data then shirt), when the user stops typing, they'll see results for "shi", instead of "shirt", which isn't what the user wants.
  * If you want to only show things that are in stock, simply add `.available(true)`, to your default query.
8. Style everything.

### Optional Steps

1. Test with `.shopifyMode(true)` (see [here](#shopifymode) for details), and seeing if the system still works satisfactorily with Spot disabled.
2. Determine if/how you're going to have the search bar of the site interact with your collections page, and tying in a quick-search box, with search-as-you-go functionality.
3. Ensure that you've hooked up Spot to display your product recommendations.

Your implementation for all of this should ideally be no more than a few hundred lines of javascript.

You can see an example of this implementation in the normal initialization function, called by the Spot section. See above.

%{SpotDefaultInit}

**/


/***

Spot Endpoint Documentation
===========================

## Overview

This SDK serves as layer of abstraction infront of an endpoint.

To contact Spot directly, all you need to do is send HTTP(S) requests to a particular server. Exactly what servers hold your shop's data is listed in the shop-based metafield that has a namespace of `esafilters` and
a key of `clusters`. This metafield contains an array of at least one hostname. Requests made to the Spot endpoint are load-balanced behind these hostnames.

Spot requests can be served plain, but is encouraged to pass `Accept-Encoding: deflate` as a header in order to take advantage of Spot's zipping capability to make responses smaller, and to take advantage of more aggressive caching.

## Endpoint

Spot queries can be either `POST`s or `GET`s. In a `GET`, Spot will accept the query body in the `q` parameter, or as the body of a `POST` request. Spot supports a maximum of ~8kb in terms of header size, so any apps that have the potential
to submit long queries should be using `POST`, rather than `GET`.

The following query parameters are applicable to both `GET` and `POST` requests:

* `hostname`: Can be used to specify the .myshopify.com hostname of the shop you're looking to query. If not supplied, is inferred from the `Referrer` header.

## Query Structure

Queries are submitted in JSON (RFC8259). Each query consists of a dictionary with exactly two keys, `query`, and `attributes`.

### Query

An array. Contains all expressions that are to be AND'd together. Query expressions come in two flavours, compound or simple.

#### Simple Expressions

Take the form of a dictionary that specifies the field to be filtered as a key, an operator, and the desired operand to be checked against. The operator is optional, and can be omitted for simple equality. If the operator is present,
it forms an additional dictionary object to be passed as the sole value of field key.

    {"inventory_quantity":{">":0}}

    {"price":{"<=":10}}

    {"title":"Exactly This Product Title"}
    {"title":{"==":"Exactly This Product Title"}}

    {"tag":"red"}
    {"tag":{"==":"red"}}

    {"option1":{"!=":"Large"}}

Some fields are *specified* fields, which means that they require additional specification to determine what field you're talking about. This is done by recursively nesting dictionaries, like so:

    {"option":{"Color":{"==":"Red"}}}

    {"product-metafield":{"mynamespace":{"mykey":{">":0}}}}

    {"variant-metafield":{"mynamespace":{"mykey":{">":0}}}}

#### Compound Expressions

These expressions can contain other expressions. There are a number of these.

##### or

OR's together the various sub-expressions.

    {"or":[{"option":{"Color":"Red"}},{"product_type":"Shirt"}]}

##### and

AND's together the various sub-expressions. Implied in the opening array, but useful if ANDs and ORs are nested.

    {"and":[{"price":{"<":20},{"price":{">":10}]}

##### facets

Specifies which of your filters apply to your facets. Enables the use of disjuctive facets.

    {"facets":[{"or":[]},{"or":[]},{"or":[{"option":{"Color":"Red"}}]}]}

##### all

Specifies that only products that have *all* variants present as a result of the subquery should be returned.

    {"all":[{"option":{"Color":"Red"}}]}

##### not

Specifies that only products that do not match the subquery sould be returned.

    {"not":[{"option":{"Color":"Red"}}]}

##### any

Reverts the behaviour of `all` back to the default `any` inside an `all` subexpression.

#### Query Fields

There are many of these. This list is *non-exhaustive*. It includes every relevant property on Product or Variant, as they are named in Shopify's REST api.

##### Product Fields

* `product_type`
* `vendor`
* `title`
* `handle`
* `collection`
* `product-metafield` (qualified; *can be treated as numeric*)

##### Variant Fields

###### Numeric Fields

* `inventory_quantity`
* `price`

###### String Fields

* `available` (Definition is exactly as in Shopify's liquid reference; this should be used over `inventory_quantity > 0` to determine availability of a product).
* `option1`
* `option2`
* `option3`
* `option` (qualified)
* `variant-metafield` (qualified; *can be treated as numeric*)

#### Query Operators

Query operators come in two flavours, numeric operators, or string operators.

##### String Operators

* `==` : Equality.
* `!=` : Inequality.
* `^` : Starts With
* `in` : Checks if within a specified array.
* `not_in`: Checks if not within a specified array.

##### Numeric Operators

* `<`
* `>`
* `>=`
* `<=`
* `==`
* `!=`

### Attributes

Attributes are meta-information about the query that affect the query, and the results returned. The following is a non-exhaustive list of all attributes.

#### count (boolean, default: false)

Determines whether or not Spot should return the total amount of products in the resultset. Can result in longer query times if enabled.

#### countBehavior (string, default: 'approximate')

[See here](#countbehavior).

#### options (array, default: [])

Provides the list of facets you'd like to facet on. Facets are specified as in the Query Fields section. If you'd like to specify a list of particular facets of a given type (say, a list of tags instead of all tags on the store), you can specify this in the form of an array.

    {"options":["product_type","vendor",{"option":"Color"},{"option":"Size"},{"tag":["sale","merch","spring","summer","fall","winter"]}]

The order of these options is relevant, as it will affect your `facets` compound specifier if you use one.

In addition to simple specifiers, one can be more descriptive and group values together into single facets.

    {"options":[{"tag":["sale","merch",{"name":"seasonal","value":["spring","summer","fall","winter"]}]]}}

#### optionBehavior (string, default: 'approximate')

[See here](#optionbehavior).

#### optionDisjunctive (bool, default: true)

Determine whether your facets are disjuntive or conjunctive. [See the entry on disjucntive facet counts for details](#disjunctive-facet-counts).

#### search (string, default: null)

A free-form search string to search through the entire object; all query fields, as well as the body_html. Intelligently performs stemming based on locale. If not empty string or null, can be used with the `search` sort order,
as well as with the `autoCorrect` and `spellCheck` attributes.

#### collection (string, default: null)

A string representing a collection handle, for which this query should operate in the context of. Will only show products relevant to the desired collection, and will fill if not set the `sort` as being whatever the collection's
default is. If a collection does not exist, a warning will be generated, but a full resultset for the entire store will be returned. Also allows for the `manual` sort order, if applicable.

#### sort (string/object, default: null)

A string or object representing the order you'd like to sort the resultset by. In addition to custom sort orders, we support all Shopify sort orders, in all the myriad ways they're spelled, and defined.

If a string, the following strings, in addition to any named sort orders specified in the Spot backend are accepted:

* `created`
* `created-asc`
* `created-desc`
* `title`
* `title-asc`
* `title-desc`
* `alpha`
* `alpha-asc`
* `alpha-desc`
* `bestselling` (If order-reading is enabled in the Spot backend)
* `manual` (If sorting through a collection).
* `search` (If searching, orders by search relevancy).
* `price`
* `price-asc`
* `price-desc`
* Identifier for any custom sort order you've defined.

If an object, you can specify a sort direction (asc/desc), followed the field name.

    {"asc":"price"}

    {"desc":"title"}

In addition, you can also specify complex sort orders that you've defined on the Spot back-end this way.

    {"desc":{"product-metafield":{"mynamespace":"mykey"}}}

#### autoCorrect (boolean, default: false)

If true, will return a spellcheck in the response, based on the search string, as well as automatically correct the search to this spellcheck if there are no results with the initial search.

#### spellCheck (boolean, default: false)

If true, will return a spellcheck in the response, based on the search string.

#### rows (int, default: 12)

Specifies the amount of results to retrieve. Maximum of 100. (1000 is currently supported, but may be revoked depending on performance characteristics).

#### page (int, default: 1)

Specifies the page of results to retrieve.

#### fields (array[string], default: null)

Specifies the field list to retrieve. If not specified, will return the entire object. As an example:

    {"fields":["title","product_type","images"]}

#### split (string, default: "none")

Specifies the product split.

* `none`: Returns products as Shopify has them.
* `auto`: Returns the most appropriate split, given what you have set up in the Spot control panel, and your query.
* `<id>`: Returns the specifier split by identifier from the Spot control panel.

#### allVariants (bool/string, default: true)

[See here](#allvariants).

#### locale (string, default: shop default)

Specifies the locale to return products in if they're using Shopify's official translation system. Under construction; unstable.

#### currency (object, default: null)

Specifies the currency. Translates the incoming query to use prices converted by the specifies currenc. Under construction; unstable.

#### popularSearches (int, default: 0)

Specifies the amount of popular searches to return. Under construction; unstable.

## Examples

The following are sample full requests, and response pairs.

Simple request to grab "id" and "title" of two products.

    {"query":[],"attributes":{"fields":["id","title"],"rows":2}}

Request

    > GET /?q=%7B%22query%22%3A%5B%5D%2C%22attributes%22%3A%7B%22fields%22%3A%5B%22id%22%2C%22title%22%5D%2C%22rows%22%3A2%7D%7D%0A HTTP/1.1
    > Host: spot-cluster-ca-0.moddapps.com
    > User-Agent: curl/7.47.0
    > Accept: application/json
    > Accept-Encoding: deflate, gzip
    > Referer: https://spot-development.myshopify.com

Response

    < HTTP/1.1 200 OK
    < Content-Length: 135
    < Access-Control-Expose-Headers: X-Session-Id
    < Access-Control-Allow-Headers: X-Shopify-Shop-Domain,Content-Type,Accept,X-Requested-With,X-Session-Id
    < Access-Control-Allow-Credentials: true
    < Access-Control-Allow-Method: GET,POST
    < Access-Control-Allow-Origin: https://spot-development.myshopify.com
    < Content-Type: application/json; charset=UTF-8
    < X-Session-Id: 8b187da44afe7c04e1bc0d0d537e2abd
    < Content-Encoding: deflate
    < Date: Thu, 13 Aug 2020 01:33:10 GMT
    < Via: 1.1 google
    < Alt-Svc: clear
    {"products":[{"title":"Zoo York Zombie Skateboard 8\"","id":"4434463326319"},{"id":"4434463195247","title":"Zoo York Womens Unbreakable Chenille Cropped T-Shirt"}]}

Get the first page of 2 available products, and none of the irrelevant variants, that have the tag "language_en", and correspond to the search "hat", as well as have the Size "O/S". Get an exact count returned.

    {"query":[{"available":{"==":true}},{"tag":{"==":"language_en"}},{"option":{"Size":"O/S"}}],"attributes":{"count":true,"countBehavior":"exact","allVariants":false,"fields":["id","handle","title","product_type","vendor","tags","images","options","variants","metafields"],"rows":2,"page":1,"options":[],"optionDisjunctive":true,"search":"hat"}}

Request

    > GET /?q=%7B%22query%22%3A%5B%7B%22available%22%3A%7B%22%3D%3D%22%3Atrue%7D%7D%2C%7B%22tag%22%3A%7B%22%3D%3D%22%3A%22language_en%22%7D%7D%2C%7B%22option%22%3A%7B%22Size%22%3A%22O%2FS%22%7D%7D%5D%2C%22attributes%22%3A%7B%22count%22%3Atrue%2C%22countBehavior%22%3A%22exact%22%2C%22allVariants%22%3Afalse%2C%22fields%22%3A%5B%22id%22%2C%22handle%22%2C%22title%22%2C%22product_type%22%2C%22vendor%22%2C%22tags%22%2C%22images%22%2C%22options%22%2C%22variants%22%2C%22metafields%22%5D%2C%22rows%22%3A2%2C%22page%22%3A1%2C%22options%22%3A%5B%5D%2C%22optionDisjunctive%22%3Atrue%2C%22search%22%3A%22hat%22%7D%7D%0A HTTP/1.1
    > Host: spot-cluster-ca-0.moddapps.com
    > User-Agent: curl/7.47.0
    > Accept: application/json
    > Accept-Encoding: deflate, gzip
    > Referer: https://spot-development.myshopify.com

Response

    < HTTP/1.1 200 OK
    < Content-Length: 1642
    < Access-Control-Expose-Headers: X-Session-Id
    < Access-Control-Allow-Headers: X-Shopify-Shop-Domain,Content-Type,Accept,X-Requested-With,X-Session-Id
    < Access-Control-Allow-Credentials: true
    < Access-Control-Allow-Method: GET,POST
    < Access-Control-Allow-Origin: https://spot-development.myshopify.com
    < Content-Type: application/json; charset=UTF-8
    < X-Session-Id: b57219253b5961a953f6ed12567d462a
    < Content-Encoding: deflate
    < Date: Thu, 13 Aug 2020 01:43:37 GMT
    < Via: 1.1 google
    < Alt-Svc: clear

    {"products":[{"handle":"1648-18958383-zoo-york-mens-graphic-trucker-hat","images":[{"position":1,"updated_at":"2020-04-28T00:41:14-04:00","id":13932966969455,"alt":null,"height":2000,"width":1333,"product_id":4433605230703,"created_at":"2020-04-28T00:41:14-04:00","src":"https://cdn.shopify.com/s/files/1/0271/5952/7535/products/164818958383-69-0.jpg?v=1588048874","admin_graphql_api_id":"gid://shopify/ProductImage/13932966969455","variant_ids":[31478042198127]},{"updated_at":"2020-04-28T00:41:16-04:00","position":2,"id":13932967559279,"alt":null,"height":2000,"admin_graphql_api_id":"gid://shopify/ProductImage/13932967559279","variant_ids":[],"product_id":4433605230703,"created_at":"2020-04-28T00:41:16-04:00","width":1333,"src":"https://cdn.shopify.com/s/files/1/0271/5952/7535/products/164818958383-69-1.jpg?v=1588048876"},{"admin_graphql_api_id":"gid://shopify/ProductImage/13932967592047","variant_ids":[31478042230895],"width":1333,"product_id":4433605230703,"created_at":"2020-04-28T00:41:18-04:00","src":"https://cdn.shopify.com/s/files/1/0271/5952/7535/products/164818958383-40.jpg?v=1588048878","updated_at":"2020-04-28T00:41:18-04:00","position":3,"id":13932967592047,"alt":null,"height":2000},{"admin_graphql_api_id":"gid://shopify/ProductImage/13932967624815","variant_ids":[],"src":"https://cdn.shopify.com/s/files/1/0271/5952/7535/products/164818958383-40-1.jpg?v=1588048880","width":1333,"product_id":4433605230703,"created_at":"2020-04-28T00:41:20-04:00","id":13932967624815,"position":4,"updated_at":"2020-04-28T00:41:20-04:00","height":2000,"alt":null}],"metafields":[],"variants":[{"grams":0,"id":"31478042230895","position":2,"inventory_policy":"deny","admin_graphql_api_id":"gid://shopify/ProductVariant/31478042230895","image_id":13932967592047,"option3":null,"created_at":"2020-04-28T00:41:13-04:00","fulfillment_service":"manual","inventory_quantity":16,"barcode":"61953923","compare_at_price":"11.99","requires_shipping":true,"option2":"O/S","inventory_item_id":33129781821551,"option1":"Blue","updated_at":"2020-04-28T00:41:18-04:00","weight_unit":"lb","weight":0,"title":"Blue / O/S","metafields":[],"taxable":true,"sku":"1648-18958383-401010","product_id":4433605230703,"old_inventory_quantity":16,"price":"11.99","inventory_management":"shopify"}],"title":"Zoo York Mens Graphic Trucker Hat","vendor":"Zoo York","options":[{"position":1,"name":"Color","product_id":4433605230703,"id":5769550102639,"values":["Coral","Blue"]},{"values":["O/S"],"id":5769550135407,"position":2,"product_id":4433605230703,"name":"Size"}],"id":"4433605230703","tags":"brand amnesia, brand west49, gender mens, language_en, locale_ca, mar10, new, private label, promo 50off, promo bogo5, spring, style flamingo, style palm tree, subtype hats, type accessories","product_type":"Mens Hats"},{"metafields":[],"variants":[{"price":"11.99","inventory_management":"shopify","old_inventory_quantity":13,"product_id":4433517772911,"taxable":true,"sku":"2748-18958383-401010","metafields":[],"title":"Blue / O/S","weight_unit":"lb","weight":0,"option1":"Blue","updated_at":"2020-04-27T23:01:52-04:00","inventory_item_id":33129115254895,"requires_shipping":true,"option2":"O/S","fulfillment_service":"manual","inventory_quantity":13,"compare_at_price":"11.99","barcode":"61959516","option3":null,"created_at":"2020-04-27T23:01:50-04:00","admin_graphql_api_id":"gid://shopify/ProductVariant/31477430812783","image_id":13932622250095,"inventory_policy":"deny","id":"31477430812783","position":1,"grams":0},{"inventory_policy":"deny","grams":0,"position":2,"id":"31477430845551","compare_at_price":"11.99","barcode":"61957270","fulfillment_service":"manual","inventory_quantity":16,"option2":"O/S","requires_shipping":true,"image_id":13932622348399,"admin_graphql_api_id":"gid://shopify/ProductVariant/31477430845551","created_at":"2020-04-27T23:01:50-04:00","option3":null,"title":"Coral / O/S","weight":0,"weight_unit":"lb","metafields":[],"inventory_item_id":33129115287663,"updated_at":"2020-04-27T23:01:56-04:00","option1":"Coral","inventory_management":"shopify","price":"11.99","sku":"2748-18958383-691010","taxable":true,"old_inventory_quantity":16,"product_id":4433517772911}],"vendor":"Zoo York","title":"Zoo York Boys Graphic Trucker Hat","handle":"2748-18958383-zoo-york-boys-graphic-trucker-hat","images":[{"admin_graphql_api_id":"gid://shopify/ProductImage/13932622250095","variant_ids":[31477430812783],"src":"https://cdn.shopify.com/s/files/1/0271/5952/7535/products/274818958383-40-0.jpg?v=1588042912","width":1333,"product_id":4433517772911,"created_at":"2020-04-27T23:01:52-04:00","id":13932622250095,"updated_at":"2020-04-27T23:01:52-04:00","position":1,"height":2000,"alt":null},{"id":13932622315631,"updated_at":"2020-04-27T23:01:54-04:00","position":2,"alt":null,"height":2000,"variant_ids":[],"admin_graphql_api_id":"gid://shopify/ProductImage/13932622315631","src":"https://cdn.shopify.com/s/files/1/0271/5952/7535/products/274818958383-40-1.jpg?v=1588042914","width":1333,"product_id":4433517772911,"created_at":"2020-04-27T23:01:54-04:00"},{"id":13932622348399,"updated_at":"2020-04-27T23:01:56-04:00","position":3,"height":2000,"alt":null,"admin_graphql_api_id":"gid://shopify/ProductImage/13932622348399","variant_ids":[31477430845551],"src":"https://cdn.shopify.com/s/files/1/0271/5952/7535/products/274818958383-69.jpg?v=1588042916","width":1333,"created_at":"2020-04-27T23:01:56-04:00","product_id":4433517772911},{"height":2000,"alt":null,"position":4,"updated_at":"2020-04-27T23:01:58-04:00","id":13932622381167,"variant_ids":[],"admin_graphql_api_id":"gid://shopify/ProductImage/13932622381167","width":1333,"product_id":4433517772911,"created_at":"2020-04-27T23:01:58-04:00","src":"https://cdn.shopify.com/s/files/1/0271/5952/7535/products/274818958383-69-1.jpg?v=1588042918"}],"options":[{"values":["Blue","Coral"],"name":"Color","product_id":4433517772911,"position":1,"id":5769436135535},{"id":5769436168303,"position":2,"product_id":4433517772911,"name":"Size","values":["O/S"]}],"product_type":"Boys Hats","id":"4433517772911","tags":"brand amnesia, brand west49, gender boys, language_en, locale_ca, mar10, new, private label, promo 50off, promo bogo5, spring, style flamingo, style palm tree, subtype hats, type accessories"}],"count":22,"spellCheck":{"original":"hat","corrected":"hat","words":[{"original":"hat","corrected":"hat"}]}}

Ask for the first two products that are either "Baby Blue","Blue","Dark Blue","Denim Blue","Grey Blue","Light Blue","Light Denim Blue","Medium Blue","Medium Denim Blue","Midnight Blue","Ocean Blue","Royal Blue","Sky Blue","Navy","Turquoise","Aqua" or "Teal". Get an exact count, as well as a list of facets with their counts, that are "Color", "Size"," Price", english/french tags, as well as "subtype". "Color" groups together many colors into one, as does size. Price lists an array of ranges, english and french are two specific tags, and subtypes are another specific group of tags. All counts are approximate. Asking for the currency in Canadian dollars. Ask for whatever split is most appropriate to this query.

Request

    > POST / HTTP/1.1
    > Host: spot-cluster-ca-0.moddapps.com
    > User-Agent: curl/7.47.0
    > Accept: application/json
    > Accept-Encoding: deflate, gzip
    > Referer: https://spot-development.myshopify.com
    > Content-Length: 2921
    > Content-Type: application/json; charset=UTF-8

    {"query":[{"facets":[{"or":[{"or":[{"option":{"Color":{"==":"Baby Blue"}}},{"option":{"Color":{"==":"Blue"}}},{"option":{"Color":{"==":"Dark Blue"}}},{"option":{"Color":{"==":"Denim Blue"}}},{"option":{"Color":{"==":"Grey Blue"}}},{"option":{"Color":{"==":"Light Blue"}}},{"option":{"Color":{"==":"Light Denim Blue"}}},{"option":{"Color":{"==":"Medium Blue"}}},{"option":{"Color":{"==":"Medium Denim Blue"}}},{"option":{"Color":{"==":"Midnight Blue"}}},{"option":{"Color":{"==":"Ocean Blue"}}},{"option":{"Color":{"==":"Royal Blue"}}},{"option":{"Color":{"==":"Sky Blue"}}},{"option":{"Color":{"==":"Navy"}}},{"option":{"Color":{"==":"Turquoise"}}},{"option":{"Color":{"==":"Aqua"}}},{"option":{"Color":{"==":"Teal"}}}]}]},{"or":[]},{"or":[]},{"or":[]},{"or":[]}]}],"attributes":{"count":true,"countBehavior":"approximate","allVariants":false,"rows":2,"page":1,"collection":"all","options":[{"option":{"Color":[{"name":"Black","value":["Black","Black With White","Black with White","Black with white","Pure Black","Solid Black"]},{"name":"Blue","value":["Baby Blue","Blue","Dark Blue","Denim Blue","Grey Blue","Light Blue","Light Denim Blue","Medium Blue","Medium Denim Blue","Midnight Blue","Ocean Blue","Royal Blue","Sky Blue","Navy","Turquoise","Aqua","Teal"]},{"name":"Brown","value":["Brown","Copper","Tan"]},{"name":"Beige","value":["Beige","Natural","Camel","Oatmeal","Sand"]},{"name":"Red","value":["Red","Burgundy","Wine"]},{"name":"Green","value":["Green","Dark Green","Hunter Green","Camouflage","Jade","Khaki","Sage","Neon Green"]},{"name":"Grey","value":["Dark Grey","Grey","Heather Grey","Light Grey","Charcoal","Silver"]},{"name":"Orange","value":["Coral","Dark Orange","Neon Orange","Orange","Peach"]},{"name":"Pink","value":["Dark Pink","Light Pink","Neon Pink","Pink","Dusty Rose","Rose"]},{"name":"Purple","value":["Lilac","Magenta","Dark Purple","Eggplant","Fuchsia","Purple"]},{"name":"Yellow","value":["Neon Yellow","Pale Yellow","Yellow","Mustard","Gold"]},{"name":"Plaid","value":["Plaid","Gingham"]},{"name":"Multi","value":["Assorted","Multi"]},{"name":"Neon","value":["Neon Orange","Neon Pink","Neon Yellow","Neon Green"]},{"name":"Camouflage","value":["Camouflage"]}]}},{"option":{"Size":[{"name":"One Size","value":["One Size","O/S"]},{"name":"S (7/8)","value":["S (7/8)","7/8"]},{"name":"XS (6)","value":["XS (6)"]},{"name":"M (10/12)","value":["M (10/12)","9/10","11/12"]},{"name":"L (14/16)","value":["L (14/16)","L (14)","15/16","13/14"]},{"name":"XL (16)","value":["XL (16)"]}]}},{"price":["-10","10-25","25-50","50-75","75-100","100+"]},{"tags":[{"name":"English","value":"language_en"},{"name":"French","value":"language_fr"}]},{"tags":["subtype joggers","subtype lanyards","subtype leggings","subtype long sleeves","subtype longboard","subtype longboards"]}],"optionBehavior":"approximate","optionDisjunctive":true,"split":"auto","currency":{"code":"CAD","rate":"1.0"},"locale":"en"}}

Response

    < HTTP/1.1 200 OK
    < Content-Length: 2182
    < Access-Control-Expose-Headers: X-Session-Id
    < Access-Control-Allow-Headers: X-Shopify-Shop-Domain,Content-Type,Accept,X-Requested-With,X-Session-Id
    < Access-Control-Allow-Credentials: true
    < Access-Control-Allow-Method: GET,POST
    < Access-Control-Allow-Origin: https://spot-development.myshopify.com
    < Content-Type: application/json; charset=UTF-8
    < X-Session-Id: 25506ca4fd234c8af63e1952be1f60ea
    < Content-Encoding: deflate
    < Date: Thu, 13 Aug 2020 01:58:20 GMT
    < Via: 1.1 google
    < Alt-Svc: clear

    {"products":[],"options":[{"product_id":4429644300399,"name":"Color","position":1,"values":["Teal"],"id":5764571103343},{"id":5764571136111,"values":["8"],"product_id":4429644300399,"position":2,"name":"Size"}]}],"options":[{"option":{"Color":{"Black":919,"Blue":456,"Brown":33,"Beige":69,"Red":194,"Green":344,"Grey":314,"Orange":131,"Pink":158,"Purple":149,"Yellow":132,"Plaid":30,"Multi":249,"Neon":48,"Camouflage":109}}},{"option":{"Size":{"One Size":82,"S (7/8)":88,"XS (6)":2,"M (10/12)":88,"L (14/16)":88,"XL (16)":96}}},{"price":{"-10":9,"10-25":153,"25-50":116,"50-75":28,"75-100":28,"100+":11}},{"tag":{"English":392}},{"tag":{"subtype joggers":11,"subtype lanyards":1,"subtype long sleeves":18,"subtype longboards":8}}],"count":456,"currency":{"code":"CAD","rate":1.000000}}

***/