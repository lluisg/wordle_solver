// CARREGAR DATASETS EN GENERAL ------------------------------------------------
var inds_disponibles = [];
var info_ind2words = [];
var info_words2ind = [];
var all_words5 = [];
var paraules_resultat = [];
var all_loaded = false;

async function getWords5(){
  document.getElementById("loading").style.visibility="visible";
  try{
    const data = {};
    const options = {
      method: 'POST',
      body: JSON.stringify(data),
      headers:{'Content-Type': 'application/json'}
    };
    const response = await fetch('/load_InfoWords5', options);
    const words_info = await response.json();
    console.log('DB received:');
    console.log(words_info);
    if(words_info == 'error'){
      ErrorLoadingInfo()
    }
    info_ind2words = words_info.info_ind2words
    info_words2ind = words_info.info_words2ind
    // console.log(info_ind2words);
    // console.log(info_words2ind);
    inds_disponibles = []
    all_words5 = []
    for (const [key, value] of Object.entries(info_ind2words)) {
      inds_disponibles.push(key)
      all_words5.push(key)
    }
    InformacioRebuda();
  }catch(err){
    ErrorLoadingInfo()
  }
}

async function getFuturaX(ind_paraules){
  try{
    paraules_not_in = []
    ind_paraules.forEach((paraula, i) => {
        if(!(ind_paraules in paraules_resultat)){
            paraules_not_in.push(paraula);
        };
    });

    if(paraules_not_in.length > 0){
        document.getElementById("loading").style.visibility="visible";
        const data = {paraules_not_in};
        const options = {
          method: 'POST',
          body: JSON.stringify(data),
          headers:{'Content-Type': 'application/json'}
        };
        console.log('asking for futures')
        const response = await fetch('/load_ResultatParaulaX', options);
        const futures_info = await response.json();

        text_intro = 'Resultats: '+futures_info.paraules_resultat.length+' paraules trobades';
        for (const [key, value] of Object.entries(futures_info.paraules_resultat)) {
          paraules_resultat[key] = value;
        }

        if(futures_info == 'error'){
          ErrorLoadingInfo()
        }
        console.log('DB received:');
        console.log(futures_info);
    }
    InformacioRebuda();
  }catch(err){
    ErrorLoadingInfo()
  }
}

function InformacioRebuda(){
  document.getElementById("loading").style.visibility="hidden";
  if(!all_loaded){
      document.getElementById("best_suggerencia").innerHTML = "ARRIA";
      document.getElementById("other_suggerencia").innerHTML = "AIRAR, TARAR, RASAR, ARNAR";
  }
  all_loaded = true;
}

function ErrorLoadingInfo(){
  document.getElementById("loading").innerHTML = "Hi ha hagut un error rebent la informació.<br>Siusplau reinicia la pàgina.";
  document.getElementById("loading").classList.remove('bg-warning')
  document.getElementById("loading").classList.add('bg-danger')

}


// FUNCIONAMENT DE LA WEB ------------------------------------------------------
var torn_general = 1

function nextInput(pos){
  pos_next = parseInt(pos)+1;
  id_current = "lletra"+pos.toString()
  value_lletra = document.getElementById(id_current).value;

  if(value_lletra.length >= 1){
    id_next = "lletra"+pos_next.toString();
    col = id_next.slice(-1)
    row = id_next.slice(-2, -1)

    if(col == '6' && torn_general == row){
      document.getElementById('seguent'+row).style.visibility = "visible";
    }else if(col != '6'){
      document.getElementById(id_next).focus();
    };
  };
};

function ResultatLletra(lletra, res){
  id_lletra = 'lletra'+lletra
  if(res == 'C'){
    document.getElementById(id_lletra).classList.add('bg-success')
    document.getElementById(id_lletra).classList.remove('bg-warning')
    document.getElementById(id_lletra).classList.remove('bg-secondary')
    document.getElementById(id_lletra).classList.remove('text-info')
  }else if(res == 'M') {
    document.getElementById(id_lletra).classList.remove('bg-success')
    document.getElementById(id_lletra).classList.add('bg-warning')
    document.getElementById(id_lletra).classList.remove('bg-secondary')
    document.getElementById(id_lletra).classList.remove('text-info')
  }else if(res == 'I'){
    document.getElementById(id_lletra).classList.remove('bg-success')
    document.getElementById(id_lletra).classList.remove('bg-warning')
    document.getElementById(id_lletra).classList.add('bg-secondary')
    document.getElementById(id_lletra).classList.remove('text-info')
  }
}

async function makeNextSuggerencia(torn){
  if(all_loaded){
    var checked = await CheckWordInput(torn)
    console.log('es correcte?', checked)

    if(checked){
      var paraula = GetParaula(torn)
      var resultat = GetResultat(torn)

      if(resultat.length == 5 && paraula.length == 5){
        var ind = info_words2ind[paraula]['ind']
        console.log('infoo', paraula, ind, resultat)
        console.log('Queden', inds_disponibles.length, 'paraules possibles')

        if(!(ind in paraules_resultat)){
          await getFuturaX([ind])
        };

        inds_disponibles = CalcularParaulesPossibles(ind, resultat, inds_disponibles, paraules_resultat, info_ind2words);
        console.log('Queden', inds_disponibles.length, 'paraules possibles')

        if(inds_disponibles.length == 0){
            console.log('No hi ha cap paraula que compleixi aquestes condicions...\n')
            GameEnded('lost');
            CanviarParaulaSuggerida('-----', [''])

        }else if(torn_general == 6 && resultat != 'CCCCC'){
          GameEnded('lost');
          CanviarParaulaSuggerida('-----', [''])

        }else if(inds_disponibles.length == 1){
          seguent_ind = inds_disponibles[0]
          seguent_paraula = info_ind2words[seguent_ind]['word']
          console.log('Hem guanyat!\nParaula guanyadora: ', '--'+seguent_paraula+'--', '\n')
          CanviarParaulaSuggerida(seguent_paraula, [''])
          GameEnded('won');

        }else{
            best_inds = await CalculateBestWords(inds_disponibles, paraules_resultat, info_ind2words)
            seguent_ind = best_inds['best']
            other4_inds = best_inds['other']
            console.log('suggerencia:', seguent_ind, other4_inds)

            seguent_paraula = info_ind2words[seguent_ind]['word']
            other4_words = []
            other4_inds.forEach((x, i) => {
              other4_words.push(info_ind2words[x]['word']);
            });
            console.log('proxima paraula: ', '--'+seguent_paraula+'---- (', other4_words, ')\n')

            CanviarParaulaSuggerida(seguent_paraula, other4_words)
            torn_general += 1;
        }

        document.getElementById('seguent'+torn).style.visibility = "hidden";

      }else{
        document.getElementById("seguent"+torn).classList.remove('bg-success')
        document.getElementById("seguent"+torn).classList.add('bg-danger')
        document.getElementById("seguent"+torn).classList.remove('bg-warning')
        document.getElementById("seguent"+torn).textContent = "Falta Informació"
        console.log('No resultats', 'seguent'+torn)
      }

    }else{
      document.getElementById("seguent"+torn).classList.remove('bg-success')
      document.getElementById("seguent"+torn).classList.add('bg-danger')
      document.getElementById("seguent"+torn).classList.remove('bg-warning')
      document.getElementById("seguent"+torn).textContent = "Paraula Invàlida"
      console.log('Paraula no valida', 'seguent'+torn)
    }

  }else{
    document.getElementById("seguent"+torn).classList.remove('bg-success')
    document.getElementById("seguent"+torn).classList.remove('bg-danger')
    document.getElementById("seguent"+torn).classList.add('bg-warning')
    document.getElementById("seguent"+torn).textContent = "Carregant Info"
    console.log('Estem carregant Info')
  }
}

async function CheckWordInput(torn){
  // console.log('listall5', all_words5.length);
  var paraula_valida = true;
  var paraula = GetParaula(torn);
  try {
    var ind_paraula = info_words2ind[paraula]['ind']
  }catch(err){
    // si la palabra no existe en nuestra lista dara error
    paraula_valida = false
  }
  console.log('paraula input', paraula, ind_paraula, 'exists-', paraula_valida);

  if(paraula_valida){
    paraula_valida = false;
    all_words5.forEach((item, i) => {
      if(ind_paraula == item){
        paraula_valida = true;
      };
    });
  }

  return paraula_valida
}

function GetParaula(torn){
  var paraula = '';
  for(let i=1; i<=5; i++){
    inputname = "lletra"+torn+i;
    let lletra = document.getElementById(inputname).value;
    if(/^[a-zA-Z]+$/.test(lletra)){
      paraula += lletra;
    }else{
      paraula_valida = false;
      break;
    }
  }
  paraula = paraula.toUpperCase();
  return paraula;
}

function GetResultat(torn){
  var resultat = ''

  for(let i = 1; i <= 5; i++){
    var id_lletra = 'lletra'+torn.toString()+i.toString()
    if(document.getElementById(id_lletra).classList.contains('bg-success')){
      resultat += "C"
    }else if(document.getElementById(id_lletra).classList.contains('bg-warning')) {
      resultat += "M"
    }else if(document.getElementById(id_lletra).classList.contains('bg-secondary')) {
      resultat += "I"
    }
  }
  return resultat
}

function GameEnded(result){
  if(result == 'won'){
    document.getElementById("best_suggerencia").classList.add('bg-success')
    document.getElementById("boto_reestart").style.visibility = 'visible';
    console.log('Hem guanyat!')

  }else if(result == 'lost'){
    document.getElementById("best_suggerencia").classList.add('bg-danger')
    document.getElementById("boto_reestart").style.visibility = 'visible';
    console.log('Hem perdut...')

  }else{
    console.log('No se que ha pasao')

  }
}

function CanviarParaulaSuggerida(paraula, altres){
  text_altres = '';
  altres.forEach((item, i) => {
    text_altres += item+', ';
  });
  text_altres = text_altres.slice(0, -2)

  document.getElementById("best_suggerencia").innerHTML = paraula;
  document.getElementById("other_suggerencia").innerHTML = text_altres;
}

// FUNCIONS SUGGERENCIA --------------------------------------------------------

async function CalculateBestWords(inds_disponibles, paraules_resultat, info_ind2words){

  valors_paraules = await CalculateEntropiaProbabilidad(inds_disponibles, paraules_resultat, info_ind2words)
  console.log('vp', valors_paraules)

  // order by value
  var ordered_values = []
  var ordered_inds = []
  for (const [key, value] of Object.entries(valors_paraules)) {
    var found_position = false
    for(let j = 0; j <= ordered_values.length-1; j++){
      if(value > ordered_values[j]){
        ordered_values.splice(j, 0, value)
        ordered_inds.splice(j, 0, key)
        found_position = true
        break;

      }
    }
    if(!found_position){
      ordered_values.push(value)
      ordered_inds.push(key)
    }
  }


  best_ind = ordered_inds.slice(0, 1)
  best5_ind = ordered_inds.slice(1, 5)

  return {'best':best_ind, 'other':best5_ind}
}

async function CalculateEntropiaProbabilidad(inds_disponibles, paraules_resultat, info_ind2words){
  var resultats_entropia = {}
  var resultats = GetCombinations(['I', 'M', 'C'], 5)

  inds_disponibles_ints = []
  inds_disponibles.forEach(function (ind, index) {
    inds_disponibles_ints.push(parseInt(ind))
  });
  await getFuturaX(inds_disponibles_ints)


  console.log('calculant entropia')
  inds_disponibles.forEach(function (ind, index) {
      var entropia_paraula = 0
      resultats.forEach(function (resultat, index) {

            var futures_paraules = CalcularParaulesPossibles(ind, resultat, inds_disponibles, paraules_resultat, info_ind2words)
            var prob = parseFloat(futures_paraules.length)/parseFloat(inds_disponibles.length)
            var entropia = EntropiaValue(prob)
            entropia_paraula += entropia
            // # print(resultat, ':', futures_paraules, '--', inds_disponibles, ':', prob, entropia, entropia_paraula)

        resultats_entropia[ind] = entropia_paraula
        // # print('entropia:', resultats_entropia[ind])
      });
  });

  var qualitat_paraula = {}
  var diccionari_prob = GetDiccionaryFrequencies(inds_disponibles, info_ind2words)
  inds_disponibles.forEach(function (ind, index) {
      var entropia = resultats_entropia[ind]
      var prob = diccionari_prob[ind]
      console.log(ind, info_ind2words[ind]['word'], entropia, prob)
      qualitat_paraula[ind] = entropia+prob*2
  });

  return qualitat_paraula
}

function GetCombinations(posibilities, lenn){

    var to_return = []
    posibilities.forEach(function (i, index) {
        if(lenn > 1){
            var lowers = GetCombinations(posibilities, lenn-1)
            lowers.forEach(function (lower, index) {
                to_return.push(i+lower)
            });
        }else{
          to_return.push(i)
        }

    });

    return to_return
  }

function GetDiccionaryFrequencies(inds_disponibles, info_ind2words){
    var total_prob = 0
    inds_disponibles.forEach(function (ind, index) {
        total_prob += parseInt(info_ind2words[ind]['freq'])
    });

    var dicc_prob = {}
    inds_disponibles.forEach(function (k, index) {
        dicc_prob[k] = parseInt(info_ind2words[k]['freq'])/total_prob
    });

    return dicc_prob
}

function EntropiaValue(prob){
  if(prob > 0){
    return -1 * prob * Math.log2(prob)
  }else{
    return 0
  }
}

function CalcularParaulesPossibles(ind, resultat, inds_disponibles, paraules_resultat, info_ind2words){

    futures = paraules_resultat[ind][resultat]

    diccionari_possibles_new = []
    futures.forEach(function (ind_fut, index) {
        ind_fut = ind_fut.toString()

        if(inds_disponibles.includes(ind_fut)){
          diccionari_possibles_new.push(ind_fut)
        }
    });

    // # print('futures', ind, resultat, ':', len(futures), '->', len(diccionari_possibles_new))
    return diccionari_possibles_new
}
