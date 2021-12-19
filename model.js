//-------------------------------------------------------------------- Model ---
// Unique source de vérité de l'application
//
const initialModel = {
  authors: ['Amari Pierre'],

  artiPart1: [],
  artiPart2: [],
  articles: {
    values: [],
    hasChanged: true,
  },
  categories: [],
  origins: [],

  filters: {
    categories: {
      booleans: {}, // filtre actif ou non pour chaque catégorie
      count: {}, // nombre d'articles de chaque catégorie
    },
    origins: {
      booleans: {},
      count: {},
    },
    search: {
      global: false, // recherche sur tous les articles ou seulement les articles filtrés
      text: 'a',   // texte recherché
    },
  },
  settings: {
    articleImages: true,
    animations: true,
    darkTheme: false,
  },
  display: {
    cartView: true,   // panier visible ou non
    articlesView: 'grid', // affichage en 'grid' ou 'list'
  },
  pagination: {
    grid: {
      currentPage: 1,
      linesPerPage: 1,
      linesPerPageOptions: [1, 2, 3],
    },
    list: {
      currentPage: 1,
      linesPerPage: 6,
      linesPerPageOptions: [3, 6, 9],
    },
  },

  cartSort: {
    property: 'name',   // tri du panier selon cette propriété
    ascending: {         // ordre du tri pour chaque propriété
      name: true,
      quantity: true,
      total: true,
    },
    hasChanged: true,
  },
};


samModel = {

  model: initialModel,

  // Demande au modèle de se mettre à jour en fonction des données qu'on
  // lui présente.
  // l'argument data est un objet confectionné dans les actions.
  // Les propriétés de data désignent la modification à faire sur le modèle.
  samPresent(data) {
    switch (data.do) {
      case 'init': {
        console.log('samModel.init');
        this.modelAssign('artiPart1', data.artiPart1);
        this.modelAssign('artiPart2', data.artiPart2);
        this.createArticles();
        this.extractCategories();
        this.extractOrigins();
      } break;

      case 'viewCartToggle': this.modelToggle('display.cartView'); break;
      case 'imagesToggle': this.modelToggle('settings.articleImages'); break;
      case 'animationsToggle': this.modelToggle('settings.animations'); break;
      case 'darkThemeToggle': this.modelToggle('settings.darkTheme'); break;
      case 'gridListView': this.modelAssign('display.articlesView', data.view); break;

      case 'updatePagination': break;
      case 'handleFilter':
        if (data.name === 'toutes') {
          if (data.e.target.checked) {
            Object.entries(this.model.filters[data.filterName].booleans).forEach(([key, value]) => {
              this.model.filters[data.filterName].booleans[key] = true;
            })
          } else {
            Object.entries(this.model.filters[data.filterName].booleans).forEach(([key, value]) => {
              this.model.filters[data.filterName].booleans[key] = false;
            })
          }
        } else {
          this.modelToggle(`filters.${data.filterName}.booleans.${data.name}`);
        }
        break;

      case 'globalSearch':
        this.modelToggle(`filters.search.global`);
        break;

      case 'search':
        this.modelAssign('filters.search.text', data.e.target.value)
        break;

      case 'removeSearch':
        this.modelAssign('filters.search.text', "")
        break;

      case 'changePage':
        if (data.direction === 'prev') {
          this.model.pagination[data.view].currentPage--;
        }
        if (data.direction === 'next') {
          this.model.pagination[data.view].currentPage++;
        }
        if (!isNaN(data.direction)) {
          this.model.pagination[data.view].currentPage = data.direction;
        }
        break;

      case 'changeLinesPerPage':
        this.model.pagination[data.view].linesPerPage = data.e.target.value;
        break;

      case 'changeQuantity':
        if (isNaN(data.e.target.value)) {
          data.e.target.value = this.model.articles.values[data.index].quantity;
        } else {
          this.model.articles.values[data.index].quantity = data.e.target.value;
        }
        this.model.articles.values[data.index].quantity == 0 ? this.model.articles.values[data.index].inCart = false : '';
        this.model.articles.hasChanged = true;
        this.model.cartSort.hasChanged = true;
        break;

      case 'pushToCart':
        this.model.articles.values[data.index].inCart = true;
        this.model.articles.hasChanged = true;
        this.model.cartSort.hasChanged = true;
        break;

      case 'deleteCheckbox':
        this.model.articles.values.forEach((v) => {
          if (v.id == data.id) {
            v.isChecked = data.e.target.checked;
          }
        })
        this.model.articles.hasChanged = true;
        break;

      case 'deleteFromCart':
        this.model.articles.values.forEach((v) => {
          if (v.isChecked) {
            v.suppress = true;
            v.quantity = 0;
            v.inCart = false;
            v.isChecked = false;
          }
        })
        this.model.articles.hasChanged = true;
        this.model.cartSort.hasChanged = true;
        break;

      case 'sortCart':
        this.modelAssign('cartSort.property', data.property);
        this.model.cartSort.prev === data.property ? this.modelToggle(`cartSort.ascending.${data.property}`) : '';
        this.model.cartSort.prev = data.property;
        this.model.cartSort.hasChanged = true;
        break;

      default:
        console.error('samPresent() - proposition non prise en compte : ', data);
        return;
    }


    // Demande à l'état de l'application de prendre en compte la modification
    // du modèle
    samState.samUpdate(this.model);

    this.model.articles.hasChanged = false;
    this.model.cartSort.hasChanged = false;
  },

  /**
   * Transforme une propriété booléenne en son opposée (true -> false, false -> true)
   * Intérêt : plus compact et un message d'erreur est envoyé si le nom de la proprité est incorrecte
   * ou si les types sont différents.
   *
   * @param {string} propertyStr
   * @param {any}    value
   */
  modelToggle(propertyStr) {
    const root = 'model';
    const path = propertyStr.split('.');
    let val = this[root];
    let pathNames = ['this', root];
    path.some((v, i, a) => {
      pathNames.push(v);
      if (val[v] === undefined) {
        console.error(`modelToggle(${propertyStr}) : ${pathNames.join('.')} is undefined`);
        return true;
      }
      if (i < a.length - 1) {
        val = val[v];
      } else {
        if (typeof val[v] != undefined && typeof val[v] != 'boolean') {
          console.error(`modelToggle(${propertyStr}) : ${pathNames.join('.')} is not a boolean`);
          return true;
        };
        val[v] = !val[v];
      }
    });
  },
  /**
   * Cadeau : Affecte value à la propriété propertyStr
   * Intérêt : un message d'erreur est envoyé si le nom de la proprité est incorrecte
   * ou si elle n'est pas de type booléen.
   *
   * @param {string} propertyStr
   */
  modelAssign(propertyStr, value) {
    const root = 'model';
    const path = propertyStr.split('.');
    let val = this[root];
    let pathNames = ['this', root];
    path.some((v, i, a) => {
      pathNames.push(v);
      if (val[v] === undefined) {
        console.error(`modelToggle(${propertyStr}) : ${pathNames.join('.')} is undefined`);
        return true;
      }
      if (i < a.length - 1) {
        val = val[v];
      } else {
        if (typeof val[v] != undefined && typeof val[v] !== typeof value) {
          console.error(`modelToggle(${propertyStr}) : ${pathNames.join('.')} (${typeof val[v]}) is not of the same type of ${value} (${typeof value})`);
          return true;
        };
        val[v] = value;
      }
    });
  },

  /**
   * fonction à passer en paramete à Array.sort() pour trier un tableau d'objets
   * selon leur nom, et leur prix s'il ont le même nom.
   *
   * @param {Object} a
   * @param {Object} b
   * @returns -1 or 0 or 1
   */
  articlesSort(a, b) {
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    if (a.price < b.price) return -1;
    if (a.price > b.price) return 1;
    return 0;

  },

  /**
   * Création des articles à partir des deux fichiers de données (ArtiPart1 et ArtiPart2).
   *
   * Ce sont ces articles que l'interface graphique va représenter.
   */
  createArticles() {
    const artiPart1 = this.model.artiPart1;
    const artiPart2 = this.model.artiPart2;

    let articleId = 0;

    const articles = artiPart1.map((a1) => {

      const articlesTmp = artiPart2.filter((a) => a.id == a1.id).map((a2) => {

        const article = {
          id: articleId,  // création d'un identifiant unique pour chaque article
          // from artiPart2
          name: a2.name,
          category: a2.category,
          pictures: a2.pictures,
          // from artiPart1
          origin: a1.origin,
          price: a1.price,
          unit: a1.unit,
          quantity: a1.quantity,
          inCart: a1.inCart,
        };
        articleId++;

        return article;
      });
      return articlesTmp[0];
    });
    this.model.articles.values = articles.sort(this.articlesSort);  // articles triés
    this.model.articles.hasChanged = true;
  },

  /**
   * Pour un tri par ordre alphabétique
   *
   */

  /**
   * Extraction :
   * - des catégories présentes dans la liste d'articles    --> model.categories
   * - du nombre d'articles appartenant à chaque catégories --> model.filters.categories.count
   *      model.filters.categories.count['fruits'] === 5
   * - du tableau de booléens pour l'état du filtre sur les catégories --> model.filters.categories.booleans
   *      model.filters.categories.booleans['fruits'] === true
   *
   * Les catégories sont triées par ordre alphabétique
   */
  extractCategories() {
    const articles = this.model.articles.values;
    const categories = this.model.categories;
    const catsCount = this.model.filters.categories.count;
    const catsFilter = this.model.filters.categories.booleans;

    articles.forEach((v) => {
      if (!categories.includes(v.category)) {
        categories.push(v.category);
        catsCount[v.category] = 0;
        catsFilter[v.category] = true;
      }
      catsCount[v.category]++;
    })

    categories.sort((a, b) => {
      return a.localeCompare(b);
    });
  },

  extractOrigins() {
    const articles = this.model.artiPart1;
    const origins = this.model.origins;
    const orCount = this.model.filters.origins.count;
    const orFilter = this.model.filters.origins.booleans;

    articles.forEach((v) => {
      if (!origins.includes(v.origin)) {
        origins.push(v.origin);
        orCount[v.origin] = 0;
        orFilter[v.origin] = true;
      }
      orCount[v.origin]++;
    })

    origins.sort((a, b) => {
      return a.localeCompare(b);
    });
  },
};