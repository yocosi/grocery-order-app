//-------------------------------------------------------------------- State ---
// État de l'application avant affichage
//
const initialState = {

  filteredArticles: {    // articles filtrés
    values: [],
    hasChanged: true,
    representation: '',   // représentation pour ne pas avoir à la recalculer si n'a pas changé
  },

  filters: {
    categories: {
      booleans: {},  // avec une propriété 'toutes' en plus qui vaut true si toutes les autres sont 'true'
      hasChanged: true,
      representation: '',
    },
    origins: {
      booleans: {},  // avec une propriété 'toutes' aussi
      hasChanged: true,
      representation: '',
    },
    search: {
      global: false,
      text: '',
      hasChanged: true,
      representation: '',
    },
  },
  display: {
    cartView: {
      value: true,
      hasChanged: true,
    },
    articlesView: {
      value: '',
      hasChanged: true,
    },
  },
  pagination: {  // Toutes ces valeurs sont calculées dans updatePagination()
    grid: {
      currentPage: undefined,
      linesPerPage: undefined,
      linesPerPageOptions: undefined,

      maxArticlesPerLine: undefined,
      numberOfPages: undefined,
      hasPrevPage: undefined,
      hasNextPage: undefined,
    },
    list: {
      currentPage: undefined,
      linesPerPage: undefined,
      linesPerPageOptions: undefined,

      maxArticlesPerLine: undefined,
      numberOfPages: undefined,
      hasPrevPage: undefined,
      hasNextPage: undefined,
    },
  },

  cart: {
    values: [],    // le panier rassemble tous les articles dont inCart==true
    total: 0,     // valeur totale du panier
    hasChanged: true,
    representation: '',
  },
  cartSort: {     // pour le tri des articles du panier
    property: 'name',
    ascending: {
      name: true,
      quantity: true,
      total: true,
    },
    hasChanged: true,
  },

};

samState = {

  state: initialState,

  samUpdate(model) {
    this.updateFilter(model.filters.categories, this.state.filters.categories);
    this.updateFilter(model.filters.origins, this.state.filters.origins);
    this.updateSearch(model.filters.search);
    this.filterArticles(model.articles, this.state.filters);
    this.updateDisplay(model.display);
    this.updatePagination(model.pagination);
    this.updateCartSort(model.cartSort);
    this.updateCart(model);

    this.samRepresent(model);

    // Nothing more to change
    this.state.filteredArticles.hasChanged = false;
    this.state.filters.categories.hasChanged = false;
    this.state.filters.origins.hasChanged = false;
    this.state.filters.search.hasChanged = false;
    this.state.display.cartView.hasChanged = false;
    this.state.display.articlesView.hasChanged = false;
    this.state.cartSort.hasChanged = false;
    this.state.cart.hasChanged = false;
  },

  /**
   * recopie les filtres du model dans le state
   * ajoute la propriété 'toutes' au tableau booleans
   */
  updateFilter(modelFilter, stateFilter) {

    stateFilter.booleans = modelFilter.booleans;
    stateFilter.booleans['toutes'] = true;

    Object.entries(stateFilter.booleans).forEach(([key, value]) => {
      if (stateFilter.booleans[key] === false) {
        stateFilter.booleans['toutes'] = false
      }
    })

    stateFilter.hasChanged = true;
  },

  updateSearch(modelSearch) {
    const stateSearch = this.state.filters.search;
    const globalHasChanged = modelSearch.global != stateSearch.global;
    const textHasChanged = modelSearch.text != stateSearch.text;
    stateSearch.hasChanged = globalHasChanged || textHasChanged;
    stateSearch.global = modelSearch.global;
    stateSearch.text = modelSearch.text;
  },

  filterArticles(articles, filters) {
    if (articles.hasChanged ||
      filters.categories.hasChanged ||
      filters.origins.hasChanged ||
      filters.search.hasChanged) {

      let filteredValues = articles.values.filter((v) => {
        if (!filters.search.global) {
          if (filters.categories.booleans[v.category] && filters.origins.booleans[v.origin] && v.name.toUpperCase().includes(filters.search.text.toUpperCase())) {
            return true;
          }
        } else {
          if (filters.search.text != '' && v.name.toUpperCase().includes(filters.search.text.toUpperCase())) {
            return true;
          }
        }
      });

      this.state.filteredArticles.values = filteredValues;
      this.state.filteredArticles.hasChanged = true;
    }
  },

  updateDisplay(display) {
    const cartView = this.state.display.cartView;
    if (cartView.value != display.cartView) {
      cartView.value = display.cartView;
      cartView.hasChanged = true;
    }
    const articlesView = this.state.display.articlesView;
    if (articlesView.value != display.articlesView) {
      articlesView.value = display.articlesView;
      articlesView.hasChanged = true;
    }

  },

  updatePagination(pagination) {
    const statePagination = this.state.pagination;

    const articleGrid = document.getElementById('articleWidth');
    const articleWidth = articleGrid.clientWidth;
    const minCardWidth = 200;
    const articlesView = this.state.display.articlesView.value;
    const maxArticlesPerLine = (articlesView == 'grid') ? Math.floor(articleWidth / minCardWidth) : 1;
    const linesPerPage = pagination[articlesView].linesPerPage;
    const numberOfArticles = this.state.filteredArticles.values.length;
    const numberOfPages = Math.ceil(numberOfArticles / (maxArticlesPerLine * linesPerPage));

    statePagination[articlesView].currentPage = pagination[articlesView].currentPage;
    statePagination[articlesView].linesPerPage = linesPerPage;
    statePagination[articlesView].linesPerPageOptions = pagination[articlesView].linesPerPageOptions;
    statePagination[articlesView].maxArticlesPerLine = maxArticlesPerLine;
    statePagination[articlesView].numberOfPages = numberOfPages;
    statePagination[articlesView].hasPrevPage = pagination[articlesView].currentPage > 1;
    statePagination[articlesView].hasNextPage = pagination[articlesView].currentPage < numberOfPages;

    this.state.display.articlesView.hasChanged = true;
  },

  updateCartSort(cartSort) {
    if (cartSort.hasChanged) {
      this.state.cartSort.property = cartSort.property;
      this.state.cartSort.ascending = cartSort.ascending;
      this.state.cartSort.hasChanged = true;
    }
  },

  /**
   * Remplit le panier avec tous les articles dont inCart == true
   * et calcule le prix total du panier
   */
  updateCart(model) {
    const articles = model.articles;

    if (articles.hasChanged) {

      this.state.cart.values = articles.values.filter((v, i) => {
        if (v.inCart && v.quantity != 0) {
          return v;
        }
      });

      this.state.cart.total = 0;
      this.state.cart.values.forEach((v) => {
        this.state.cart.total += (v.price * v.quantity);
      });
      this.state.cart.hasChanged = true;
    }

    if (this.state.cartSort.hasChanged) {
      if (this.state.cartSort.property === 'name') {
        this.state.cart.values.sort((a, b) => {
          return this.state.cartSort.ascending.name ? a.name > b.name : a.name < b.name;
        })

      }

      if (this.state.cartSort.property === 'quantity') {
        this.state.cart.values.sort((a, b) => {
          return this.state.cartSort.ascending.quantity ? a.quantity > b.quantity : a.quantity < b.quantity;
        })
      }

      if (this.state.cartSort.property === 'total') {
        this.state.cart.values.sort((a, b) => {
          return this.state.cartSort.ascending.total ? (a.quantity * a.price) > (b.quantity * b.price) : (a.quantity * a.price) < (b.quantity * b.price);
        })
      }
    }
  },

  // Met à jour l'état de l'application, construit le code HTML correspondant,
  // et demande son affichage.
  samRepresent(model) {

    this.updateFilterUI(model, this.state, 'categories');
    this.updateFilterUI(model, this.state, 'origins');
    this.updateSearchUI(model, this.state);
    this.updateArticlesUI(model, this.state);
    this.updateCartUI(model, this.state);

    //Settings

    const representation = samView.mainUI(model, this.state);

    //Appel l'affichage du HTML généré.
    samView.samDisplay(representation);
  },

  updateFilterUI(model, state, filterName) {
    const filter = state.filters[filterName];
    if (filter.hasChanged) {
      filter.representation = samView.filterUI(model, state, filterName)
      filter.hasChanged = false;
    }
  },

  updateSearchUI(model, state) {
    const filter = state.filters.search;
    if (filter.hasChanged) {
      filter.representation = samView.searchUI(model, state);
      filter.hasChanged = false;
    }
  },

  updateArticlesUI(model, state) {
    const filteredArticles = state.filteredArticles;
    const articlesView = state.display.articlesView;
    if (filteredArticles.hasChanged || articlesView.hasChanged) {
      filteredArticles.representation = articlesView.value == 'grid' ? samView.articlesGridUI(model, state) : samView.articlesListUI(model, state);
      filteredArticles.hasChanged = false;
      articlesView.hasChanged = false;
    }
  },

  updateCartUI(model, state) {
    const cart = state.cart;
    const cartView = state.display.cartView;
    const cartSort = state.cartSort;
    if (cart.hasChanged || cartView.hasChanged || cartSort.hasChanged) {
      cart.representation = samView.cartUI(model, state);
      cart.hasChanged = false;
      cartView.hasChanged = false;
      cartSort.hasChanged = false;
    }
  },

  updateThemeUI(model, state) {
    const settings = state.settings;
    if (settings.darkThemeHasChanged) {
      samView.darkThemeUI(state);
      settings.darkThemeHasChanged = false;
    }
  },

};