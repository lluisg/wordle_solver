var inds_disponibles = [];
var info_ind2words = [];
var info_words2ind = [];
var all_words5 = [];
var paraules_resultat = [];

async function loadWordsSize5(){
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
}

// Loads from MongoDB the list of possible words (index) based on the current word and status
async function getFuturaX(ind_paraules){
  try{
    paraules_not_in = []
    ind_paraules.forEach((paraula, i) => {
        if(!(ind_paraules in paraules_resultat)){
            paraules_not_in.push(paraula);
        };
    });

    if(paraules_not_in.length > 0){
      content_database = 'Obtaining possible words'
      showLoading(content_database);

      const data = {paraules_not_in};
      const options = {
        method: 'POST',
        body: JSON.stringify(data),
        headers:{'Content-Type': 'application/json'}
      };
      console.log('getFuturaX -- Asking for the possibilities of the input list')
      const response = await fetch('/load_ResultatParaulaX', options);
      const futures_info = await response.json();

      if(futures_info == 'error'){
        ErrorLoadingInfo()
      }

      for (const [key, value] of Object.entries(futures_info.paraules_resultat)) {
        paraules_resultat[key] = value;
      }

      console.log('getFuturaX -- Obtained possibilities (DB):', futures_info);
      hideLoading();
      // return paraules_resultat
    }
  }catch(err){
    ErrorLoadingInfo()
  }
}

async function CalculateBestWord(inds_disponibles, paraules_resultat, info_ind2words){
  content_calculate = 'Calculating next word'
  showLoading(content_calculate, 'red');

  valors_paraules = await CalculateEntropiaProbabilidad(inds_disponibles, paraules_resultat, info_ind2words)

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
  return best_ind
}

async function CalculateEntropiaProbabilidad(inds_disponibles, paraules_resultat, info_ind2words){
  var resultats_entropia = {}
  var resultats = GetCombinations(['I', 'M', 'C'], 5)

  inds_disponibles_ints = []
  inds_disponibles.forEach(function (ind, index) {
    inds_disponibles_ints.push(parseInt(ind))
  });
  console.log('CalculateEntropiaProbabilidad -- Get values of options')
  await getFuturaX(inds_disponibles_ints)


  console.log('CalculateEntropiaProbabilidad -- Calculating entropi')
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
      // console.log('CalculateEntropiaProbabilidad -- word:', ind, info_ind2words[ind]['word'], entropia, prob)
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
