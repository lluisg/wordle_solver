const Express = require("express");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;

var app = Express();
app.use(Express.static(__dirname + '/public'));
app.use(Express.json());

require('dotenv').config()
var favicon = require('serve-favicon');
var path = require('path');
app.use(favicon(path.join(__dirname,'public','images','wordle.ico')));
var _ = require('underscore');

const CONNECTION_URL = process.env.CONNECTION_URL;
const DATABASE_NAME = "wordleDB";


// CONNECT MONGODB DATABASE
const port = process.env.PORT || 3000;
var server = app.listen(port, () => {
    console.log('listening at '+port)
    MongoClient.connect(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {
        if(error) {
            throw error;
        }
        db = client.db(DATABASE_NAME);
        console.log("Connected to `" + DATABASE_NAME + "`!");
    });
});

// PART PARAULOGIC -------------------------------------------------------------
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

app.post('/getWords', async (request, response) => {

    const lletra = request.body.lletra;
    const lletraM = lletra.toUpperCase()
    const lletres = request.body.lletres+lletra;
    const lletresM = lletres.toUpperCase()
    var list_words = []

    db.collection("wordsCatalan").find({}).project({_id:0, word:1}).toArray(function(err, result) {

        if (err) response.json('error');

        result.forEach(function (item, index) {
            list_words.push(item['word'])
        });
        console.log(lletraM, lletresM, list_words.length)

        var poss_words = FilterPossibleWords(lletraM, lletresM, list_words)

        console.log(poss_words)
        console.log('retornem', poss_words.length, 'paraules')
        response.json({poss_words});
    });
});

function FilterPossibleWords(lletra, lletres, paraules) {
  var words_lletra = [];
  var words_lletres = [];
  paraules.forEach(validarLletra);
  words_lletra.forEach(validarLletres);

  function validarLletra(word) {
    // mira que la paraula contingui la lletra
    if(word.includes(lletra)){
      words_lletra.push(word);
    }
  }

  function validarLletres(word) {
    // mira que totes les lletres de la paraula siguin valides
    let valid = true;
    for (var i = 0; i < word.length; i++) {
      let letter = word.charAt(i);
      if(!lletres.includes(letter)){
        valid = false;
      }
    }
    if(valid){
      words_lletres.push(word)
    }
  }

  return words_lletres.sort()
}

// PART WORDLE -----------------------------------------------------------------
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

app.post('/load_InfoWords5', async (request, response) => {

    db.collection("wordsCatalan5").find({}).project({_id:0, word:1, freq:1, ind:1}).toArray(function(err, result) {

        if (err) response.json('error');

        var info_ind2words = {}
        var info_words2ind = {}
        result.forEach(function (item, index) {
            info_ind2words[item['ind']] = {}
            info_ind2words[item['ind']]['freq'] = item['freq']
            info_ind2words[item['ind']]['word'] = item['word']
            info_words2ind[item['word']] = {}
            info_words2ind[item['word']]['freq'] = item['freq']
            info_words2ind[item['word']]['ind'] = item['ind']
        });
        // console.log(info_ind2words)
        console.log('Returning info load_InfoWords5')
        response.json({info_ind2words, info_words2ind});
    });
});

app.post('/load_ParaulesResultat', async (request, response) => {

    db.collection("wordsFuturesTotal").find({}).project({_id:0, ind_word:1, resultat:1, ind_possibles:1}).toArray(function(err, result) {

        if (err) response.json('error');
        console.log('recieved db Futures')

        var paraules_resultat = {}
        result.forEach(function (item, index) {
            ind_word = item['ind_word'].toString()
            resultat = item['resultat'].toString()
            ind_possibles = item['ind_possibles']
            // console.log('---')
            // console.log(ind_word, resultat, ind_possibles)

            var keys = Object.keys(paraules_resultat);
            // console.log(keys, keys.includes(ind_word))
            if (!keys.includes(ind_word)){
                paraules_resultat[ind_word] = {}
            }

            if(hasNumber(ind_possibles)){
              array_inds = ind_possibles.replace('[', '').replace(']', '').replace(' ', '').replace(/\s+/g,'').split(',')
              paraules_resultat[ind_word][resultat] = array_inds
            }else{
              paraules_resultat[ind_word][resultat] = []
            }
        });
        // console.log(paraules_resultat)
        console.log('Returning info load_ParaulesResultat')
        response.json({paraules_resultat});
    });
});

app.post('/load_ResultatParaulaX', async (request, response) => {

    const paraules = request.body.paraules_not_in;
    console.log('Condition:', paraules)

    db.collection("wordsFuturesTotal").find({ ind_word: {$in: paraules} }).project({_id:0, ind_word:1, resultat:1, ind_possibles:1}).toArray(function(err, result) {

        if (err) response.json('error');
        console.log('recieved db futuraX')
        console.log(result)

        var paraules_resultat = {}
        result.forEach(function (item, index) {
            ind_word = item['ind_word'].toString()
            resultat = item['resultat'].toString()
            ind_possibles = item['ind_possibles']
            // console.log('---')
            // console.log(ind_word, resultat, ind_possibles)

            var keys = Object.keys(paraules_resultat);
            // console.log(keys, keys.includes(ind_word))
            if (!keys.includes(ind_word)){
                paraules_resultat[ind_word] = {}
            }

            if(hasNumber(ind_possibles)){
              array_inds = ind_possibles.replace('[', '').replace(']', '').replace(' ', '').replace(/\s+/g,'').split(',')
              paraules_resultat[ind_word][resultat] = array_inds
            }else{
              paraules_resultat[ind_word][resultat] = []
            }
        });
        // console.log(paraules_resultat)
        console.log('Returning info load_ResultatParaulaX')
        response.json({paraules_resultat});
    });
});

function hasNumber(myString) {
  return /\d/.test(myString);
}
