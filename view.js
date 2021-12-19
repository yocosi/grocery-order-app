
//--------------------------------------------------------------------- View ---
// Génération de portions en HTML et affichage
//
samView = {

  // Injecte le HTML dans une balise de la page Web.
  samDisplay: function (representation) {
    const app = document.getElementById('app');
    app.innerHTML = representation;
  },

  html([str, ...strs], ...vals) {
    return strs.reduce((acc, v, i) => acc + vals[i] + v, str);
  },

  mainUI(model, state) {

    this.darkThemeUI(model);

    const cartClass = model.display.cartView ? 'border' : '';

    return this.html`
      <div class="row small-margin">
      <!-- ___________________________________________________________ Entête -->
      <div class="row middle-align no-margin">
        <div class="col s8 m9 l10">
          <h4 class="center-align"> Commande de fruits et légumes</h4>
        </div>
        <div class="col s4 m3 l2">
          <nav class="right-align small-margin">
            <button onclick="samActions.exec({do:'viewCartToggle'})" class="no-marin ${cartClass}">
              <i class="large">shopping_basket</i>
            </button>
            <button class="no-margin" data-ui="#dropdown3_">
              <i class="large">account_circle</i>
              <div id="dropdown3_" data-ui="#dropdown3_" class="dropdown left no-wrap">
                <a>Auteurs : <b>${initialModel.authors.join('')}</b></a>
              </div>
            </button>
          </nav>
        </div>
      </div>
      <div class="row">
        <div class="col s3 m2 l2" style="position:sticky; top: 10px;">
          <!-- ______________________________________________________ Filtres -->

          <aside>
            <h5>Filtres</h5>
            <h6>Catégories</h6>
            <div>
              ${state.filters.categories.representation}
            </div>
            <div class="small-space"></div>
            <h6>Origines</h6>
            <div>
              ${state.filters.origins.representation}
            </div>
            <div class="small-space"></div>
            <h6>Recherche</h6>
            ${state.filters.search.representation}
            <div class="small-space"></div>
            <h5>Paramètres</h5>
            ${this.settingsUI(model, state)}

          </aside>

        </div>
        <div class=" col s9 m10 l10">
          <!-- ___________________________________ Récap filtres et recherche -->


          <div class="row top-align no-margin">
            <nav class="col s8 wrap no-margin">
              ${this.filtersSearchTagsUI(model, state)}
              <!-- ${state.filteredArticles.representation}   -->
            </nav>
            <nav class="col s4 right-align no-margin">
              ${this.articlesViewUI(model, state)}
            </nav>
          </div>

          ${state.filteredArticles.values.length > 0 ? `
          <!-- _____________________________________________________ Articles -->

          ${state.filteredArticles.representation}

          <!-- ___________________________________________________ Pagination -->
          ${this.paginationUI(model, state)}
          ` : `
          ${this.articlesEmptyUI(model, state)}
          `}



        </div>
      </div>
    </div>
    <!-- ______________________________________________________________Panier -->
    ${state.cart.representation}
    `;
  },

  darkThemeUI(model) {
    const bodyclass = document.body.classList;
    if (model.settings.darkTheme) bodyclass.add('is-dark');
    else bodyclass.remove('is-dark');
  },

  filterUI(model, state, filterName) {
    const isChecked = state.filters[filterName].booleans;

    if (filterName === 'categories') {
      let allCount = 0;
      Object.entries(model.filters.categories.count).forEach(([key, value]) => { allCount += value });
      return this.html`
        <div>
          <label class="checkbox">
            <input type="checkbox" onclick="samActions.exec({ do: 'handleFilter', filterName: '${filterName}', name: 'toutes', e: event })" ${isChecked['toutes'] ? "checked=\"checked\"" : ""}/>
            <span class="capitalize">toutes</span>
            <a><span class="badge circle right color-2-text color-2a">${allCount}</span></a>
          </label>
        </div>

        ${model.categories.map((v) => {
        return `<div>
          <label class="checkbox">
            <input type="checkbox" onclick="samActions.exec({ do: 'handleFilter', filterName: '${filterName}', name: '${v}', e: event })" ${isChecked[v] ? "checked=\"checked\"" : ""}/>
            <span class="capitalize">${v}</span>
            <a><span class="badge circle right color-2-text color-2a">${model.filters.categories.count[v]}</span></a>
          </label>
        </div>`
      }).join('')}
      `;
    }

    if (filterName === 'origins') {
      let allCount = 0;
      Object.entries(model.filters.origins.count).forEach(([key, value]) => { allCount += value });
      return this.html`
        <div>
          <label class="checkbox">
            <input type="checkbox" onclick="samActions.exec({ do: 'handleFilter', filterName: '${filterName}', name: 'toutes', e: event })" ${isChecked['toutes'] ? "checked=\"checked\"" : ""}/>
            <span class="capitalize">toutes</span>
            <a><span class="badge circle right color-2-text color-2a">${allCount}</span></a>
          </label>
        </div>

        ${model.origins.map((v) => {
        return `<div>
          <label class="checkbox">
            <input type="checkbox" onclick="samActions.exec({ do: 'handleFilter', filterName: '${filterName}', name: '${v}', e: event })" ${isChecked[v] ? "checked=\"checked\"" : ""}/>
            <span class="capitalize">${v}</span>
            <a><span class="badge circle right color-2-text color-2a">${model.filters.origins.count[v]}</span></a>
          </label>
        </div>`
      }).join('')}
      `;
    }


  },

  searchUI(model, state) {

    const isChecked = state.filters.search.global;

    return this.html`
        <div class="middle-align small-margin">
          <label class="switch">
            <input type="checkbox" onclick="samActions.exec({do: 'globalSearch'})" ${isChecked ? "checked=\"checked\"" : ""}/>
            <span>globale</span>
          </label>
        </div>
        <div class="field prefix round fill border small">
          <i>search</i>
          <input type="text" class="align-middle" onchange="samActions.exec({do:'search', e:event})" value="${state.filters.search.text}" />
        </div>
      `;
  },

  settingsUI(model, state) {
    const withImageChecked = model.settings.articleImages ? 'checked="checked"' : '';
    const darkThemeChecked = model.settings.darkTheme ? 'checked="checked"' : '';
    const animationsChecked = model.settings.animations ? 'checked="checked"' : '';

    return this.html`
        <div class="middle-align small-margin">
          <label class="switch">
            <input type="checkbox" onclick="samActions.exec({do:'imagesToggle'})" ${withImageChecked} />
            <span>Articles <br />avec images</span>
          </label>
        </div>
        <div class="middle-align small-margin">
          <label class="switch">
            <input type="checkbox" onclick="samActions.exec({do:'animationsToggle'})" ${animationsChecked} />
            <span>Animations</span>
          </label>
        </div>
        <div class="middle-align small-margin">
          <label class="switch">
            <input type="checkbox" onclick="samActions.exec({do:'darkThemeToggle'})" ${darkThemeChecked} />
            <span>Thème <br /> sombre</span>
          </label>
        </div>
            `;
  },

  filtersSearchTagsUI(model, state) {

    let allCount = 0;
    state.filteredArticles.values.forEach(v => allCount++);

    let tabCat = [];
    Object.entries(state.filters.categories.booleans).forEach(([key, value]) => {
      if (value && key !== 'toutes') {
        tabCat.push(key);
      }
    })
    tabCat = tabCat.sort();

    let tabOr = [];
    Object.entries(state.filters.origins.booleans).forEach(([key, value]) => {
      if (value && key !== 'toutes') {
        tabOr.push(key);
      }
    })
    tabOr = tabOr.sort();

    return this.html`
        <label  class="medium-text color-2-text">${allCount} articles -</label>

        ${tabCat.map((v) => {
      return `<span class="chip small no-margin capitalize ${state.filters.search.global ? "color-2b-text" : ""}" onclick="samActions.exec({ do: 'handleFilter', filterName: 'categories', name: '${v}', e: event })">
            ${v}<i class="small">close</i>
          </span>`
    }).join(' ')}

        ${tabOr.map((v) => {
      return `<span class="chip small no-margin capitalize ${state.filters.search.global ? "color-2b-text" : ""}" onclick="samActions.exec({ do: 'handleFilter', filterName: 'origins', name: '${v}', e: event })">
            ${v}<i class="small">close</i>
          </span>`
    }).join(' ')}

        ${state.filters.search.text != "" ? `
        <span onclick="samActions.exec({do: 'removeSearch'})" class="chip small no-margin">
          Rech : ${state.filters.search.text}<i class="small">close</i>
        </span>`
        : ""}
      `;
  },

  articlesViewUI(model, state) {

    const gridOn = state.display.articlesView.value == 'grid';
    const gridViewClass = gridOn ? 'disabled' : '';
    const gridViewDisabled = gridOn ? 'disabled="disabled"' : '';
    const listViewClass = gridOn ? '' : 'disabled';
    const listViewDisabled = gridOn ? '' : 'disabled="disabled"';

    return this.html`
        <button onclick="samActions.exec({do:'gridListView', view:'list'})" class="small no-margin ${listViewClass}" ${listViewDisabled}>
          <i>view_list</i></button>
        <button onclick="samActions.exec({do:'gridListView', view:'grid'})" class="small           ${gridViewClass}" ${gridViewDisabled}>
          <i>grid_view</i></button>
      `;
  },

  inEuro(number) {
    const numString = (number + 0.0001) + '';
    const dotIndex = numString.indexOf('.');
    return numString.substring(0, dotIndex + 3) + ' €';
  },

  articlesGridUI(model, state) {

    let itemsOnCurrentPage;
    let itemsOnNextPages;

    if (state.pagination.grid.currentPage > state.pagination.grid.numberOfPages) {
      itemsOnCurrentPage = state.pagination.grid.maxArticlesPerLine * state.pagination.grid.linesPerPage * state.pagination.grid.numberOfPages;
      itemsOnNextPages = state.pagination.grid.maxArticlesPerLine * state.pagination.grid.linesPerPage * (state.pagination.grid.numberOfPages - 1);
    } else {
      itemsOnCurrentPage = state.pagination.grid.maxArticlesPerLine * state.pagination.grid.linesPerPage * state.pagination.grid.currentPage;
      itemsOnNextPages = state.pagination.grid.maxArticlesPerLine * state.pagination.grid.linesPerPage * (state.pagination.grid.currentPage - 1);
    }

    return this.html`
        <article class="small-margin grid-view">

        ${state.filteredArticles.values.map((v, i, a) => {
      if (i < itemsOnCurrentPage && i >= itemsOnNextPages) {
        return `
              <div  class="card no-padding small-margin">
              ${model.settings.articleImages ?
            `<div class="card-image center-align">
                <img src="./images/${v.pictures[0]}" />
              </div>` : ""
          }
              <div class="small-padding">
                <h6 class="no-margin">${v.name}</h6>
                <div class="small-margin"><label>Origine : </label>${v.origin}</div>
                <div class="chip large">
                  <label>Prix: </label><span class="large-text">${v.price} € / <span class="avoidwrap">${v.unit}</span> </span>
                </div>
                <div class="row no-margin">
                  <div class="col s8 field round fill border center-align">
                    <input type="text" class="center-align ${v.inCart ? '' : 'color-1a'}" onchange="samActions.exec({do:'changeQuantity', id:'${v.id}', index: ${i}, e:event})" value="${v.quantity == 0 ? '' : v.quantity}" />
                    <label>Quantité</label>
                  </div>
                  <div class=" col s4">
                    <button class="circle no-margin ${v.quantity == 0 ? 'disabled' : ''}" ${v.inCart ? `onchange="samActions.exec({do:'changeQuantity', id:'${v.id}', index: ${i}, e:event})"` : `onclick="samActions.exec({do:'pushToCart', id:'${v.id}', index: ${i}, quantity:'${v.quantity}'})"`} ${v.quantity == 0 ? 'disabled="disabled"' : ''}>
                      <i>${v.inCart ? 'edit' : 'add'}</i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          `
      }

    }).join('')}
        </article>
      `;
  },

  articlesListUI(model, state) {

    let itemsOnCurrentPage = state.pagination.list.linesPerPage * state.pagination.list.currentPage;
    let itemsOnNextPages = state.pagination.list.linesPerPage * (state.pagination.list.currentPage - 1);

    return this.html`
        <article class="large-margin list-view">

        ${state.filteredArticles.values.map((v, i) => {
      if (i < itemsOnCurrentPage && i >= itemsOnNextPages) {
        return `
              <nav  class="row card divider no-wrap">
              ${model.settings.articleImages ?
            `<div class="col min">
                <img src="./images/${v.pictures[0]}" class="circle tiny" />
              </div>` : ""
          }
              <div class="col">
                <h6>${v.name}</h6>
                <label>${v.origin}</label>
              </div>
              <div class="col min chip no-margin">
                <label>Prix : </label><span class="large-text">${v.price} € / ${v.unit}</span>
              </div>
              <div class="col min field round fill small border center-align no-margin">
                <label>Qté : </label>
                <input type="text" onchange="samActions.exec({do:'changeQuantity', id:'${v.id}', index: ${i}, e:event})" value="${v.quantity == 0 ? '' : v.quantity}" class="center-align ${v.inCart ? '' : 'color-1a'}" />
              </div>
              <div class="col min no-margin"></div>
              <div class="col min">
                <button class="circle no-margin ${v.quantity == 0 ? 'disabled' : ''}" onclick="samActions.exec({do:'pushToCart', id:'${v.id}', index: ${i}, quantity:'${v.quantity}'})" ${v.quantity == 0 ? 'disabled="disabled"' : ''}>
                  <i>${v.inCart ? 'edit' : 'add'}</i>
                </button>
              </div>
            </nav>
          `
      }

    }).join('')}
        </article>
      `;
  },

  articlesEmptyUI(model, state) {

    return this.html`
        <div class="row">
          <div class="col s12 medium-padding fond">
            <img src="./images/fond.png" class="responsive" />
          </div>
        </div>
      `;
  },

  paginationUI(model, state) {

    let i;
    let disabledPrev;
    let disabledNext;
    let pagesButtons = [];
    for (i = 0; i < state.pagination[state.display.articlesView.value].numberOfPages; i++) {
      pagesButtons.push(`<button class=${state.pagination[state.display.articlesView.value].currentPage == i + 1 ? '"square no-margin border"' : '"square no-margin"'} onclick="samActions.exec({do:'changePage', direction:'${i + 1}', view:'${state.display.articlesView.value}'})">${i + 1}</button>`);
    }

    if (state.pagination[state.display.articlesView.value].currentPage == 1) {
      if (i == 1) {
        disabledNext = "disabled";
        disabledPrev = "disabled";
      } else {
        disabledPrev = "disabled";
        disabledNext = "";
      }
    } else if (state.pagination[state.display.articlesView.value].currentPage == i) {
      disabledPrev = "";
      disabledNext = "disabled";
    } else {
      disabledNext = "";
      disabledPrev = "";
    }

    return this.html`
        <nav class="center-align">
          <button onclick="samActions.exec({do:'changePage', direction:'prev', view:'${state.display.articlesView.value}'})" class="square ${disabledPrev}" ${disabledPrev != "" ? `disabled="${disabledPrev}"` : ""}>
            <i>navigate_before</i>
          </button>
          ${pagesButtons.map((v) => v)}
          <button onclick="samActions.exec({do:'changePage', direction:'next', view:'${state.display.articlesView.value}'})" class="square ${disabledNext}" ${disabledNext != "" ? `disabled="${disabledNext}"` : ""}>
            <i>navigate_next</i>
          </button>
          <div class="field suffix small">
            <select onchange="samActions.exec({do:'changeLinesPerPage', view:'${state.display.articlesView.value}', e:event})">
            ${state.pagination[state.display.articlesView.value].linesPerPageOptions.map((v) => { return `<option value="${v}" ${state.pagination[state.display.articlesView.value].linesPerPage == v ? 'selected="selected"' : ""}>${v} ${v > 1 ? 'lignes' : 'ligne'} par page</option>` })}
            </select>
            <i>arrow_drop_down</i>
          </div>
        </nav>
      `;
  },

  cartUI(model, state) {

    if (!model.display.cartView) return '';

    let cpt = 0;
    state.cart.values.forEach((v) => {
      if (v.isChecked) {
        cpt++;
      }
    })

    return this.html`
        <div class="panier row small-margin">
      <div class="col s0 m1 l2"></div>
      <section class="col s12 m10 l8">
        <div class="card ">
          <h4>Panier</h4>
          <div>
            <table border="0" class="right-align large-text">
              <thead>
                <th class="center-align"><a onclick="samActions.exec({do:'sortCart',property:'name'})">
                  Articles <i class="small">unfold_more</i></a></th>
                <th class="center-align"><a onclick="samActions.exec({do:'sortCart',property:'quantity'})">
                  Qté<i class="small">unfold_more</i></a></th>
                <th class="center-align">Unit</th>
                <th class="center-align">P.U.</th>
                <th class="center-align"><a onclick="samActions.exec({do:'sortCart',property:'total'})">
                  Prix<i class="small">unfold_more</i></a></th>
                <th>
                </th>
              </thead>
              ${state.cart.values.map((v, i) => {
      return `<tr class="${i % 2 == 0 ? 'ligne-paire' : 'ligne-impaire'}">
                <td class="left-align">${v.name}</td>
                <td class="quantite">
                  <div class="field fill small">
                    <input type="text" class="right-align" value="${v.quantity}" />
                  </div>
                </td>
                <td class="left-align">${v.unit}</td>
                <td>${v.price} €</td>
                <td>${v.price * v.quantity} €</td>
                <td class="center-align">
                  <label class="checkbox">
                    <input type="checkbox" onclick="samActions.exec({do:'deleteCheckbox', id:${v.id}, e:event})" ${state.cart.values[i].isChecked ? 'checked="checked"' : ""}/>
                    <span></span>
                  </label>
                </td>
              </tr>`
    }).join('')}
              <tfoot class="orange-light-3">
                <th colspan="4">Total :</th>
                <th>${state.cart.total} €</th>
                <th class="center-align">
                  <button type="button" onclick="samActions.exec({do:'deleteFromCart'})"
                    class="small ${cpt !== 0 ? '' : 'disabled'}" ${cpt !== 0 ? '' : 'disabled="disabled"'}><i>delete</i></button>
                </th>
              </tfoot>
            </table>
          </div>
          <div class="medium-margin right-align">
            <button
              onclick="envoyerCommande('${model.authors}', samState.state.cart.values, ${state.cart.total})"><i class="small-margin">send</i> Envoyer la commande</button>
          </div>
        </div>
      </section>
    </div>

      `;

  },

};

function envoyerCommande(client, articles, total) {

  let email = 'commandes@fruits-legumes.com';
  let sujet = 'Commande de ' + client;
  let corps = `
  Commande de fruits et légumes

  Voici les articles commandés pour un montant de ${samView.inEuro(total)} :

  ${articles.map((v) => {
    return `- ${v.name} (${v.quantity} ${v.unit})\n`
  }).join('')}

    `;
  email = encodeURIComponent(email);
  sujet = encodeURIComponent(sujet);
  corps = encodeURIComponent(corps);
  const uri = "mailto:" + email + "?subject=" + sujet + "&body=" + corps;
  window.open(uri);
}