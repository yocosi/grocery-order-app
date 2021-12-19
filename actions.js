'use strict';

window.addEventListener('load', go);

// SAM Design Pattern : http://sam.js.org/
let samActions, samModel, samState, samView;

function go() {
  console.info('Go!');

  samActions.exec({ do: 'init', artiPart1: artiPart1Data, artiPart2: artiPart2Data });

  // pour un nombre de lignes pleines d'articles quelque soit la largeur du navigateur
  window.addEventListener('resize', () => { samActions.exec({ do: 'updatePagination' }) });
}


//----------------------------------------------------------------- Actions ---
// Actions appelées dans le code HTML quand des événements surviennent
//
samActions = {

  exec(data) {
    let enableAnimation = true; // pour les animations sur l'interface graphique
    let proposal;
    switch (data.do) {
      case 'init': {
        console.log('samActions.init');
        proposal = { do: data.do, artiPart1: data.artiPart1, artiPart2: data.artiPart2 };
        enableAnimation = false;
      } break;
      // Display
      case 'viewCartToggle':
      case 'gridListView':
      // Filters
      case 'handleFilter': proposal = data; break;
      case 'globalSearch': proposal = data; break;
      case 'search': proposal = data; break;
      case 'removeSearch': proposal = data; break;
      // Settings
      case 'imagesToggle':
      case 'animationsToggle':
      // Pagination
      case 'changePage': proposal = data; break;
      case 'changeLinesPerPage': proposal = data; break;
      // Cart
      case 'changeQuantity': proposal = data; break;
      case 'pushToCart': proposal = data; break;
      case 'deleteCheckbox': proposal = data; break;
      case 'deleteFromCart': proposal = data; break;
      case 'sortCart': proposal = data; break;

      case 'with animation': proposal = data; break;

      case 'darkThemeToggle':
      case 'updatePagination':

      case 'without animation': enableAnimation = false; proposal = data; break;

      default:
        console.error('samActions - Action non prise en compte : ', data);
        return;
    }
    if (enableAnimation && samModel.model.settings.animations)
      setTimeout(() => samModel.samPresent(proposal), 200);
    else samModel.samPresent(proposal);
  },

};