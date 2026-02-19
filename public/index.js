const colors_class_dict = {
  red: 'bg-danger',
  yellow: 'bg-warning',
  green: 'bg-success',
  gray: 'bg-secondary',
  white: 'bg-light'
}
var current_row = 0;
const letter_states = ["gray", "yellow", "green"];

// Starting function --------------------------------------------------------------------------

window.addEventListener("DOMContentLoaded", async () => {
  // Set all cells to state -1, so its white and change to grey when updated
  document.querySelectorAll(".letter-cell").forEach(el => {
    el.setAttribute("data-state", -1);
    el.classList.remove(colors_class_dict["red"], colors_class_dict["yellow"], colors_class_dict["green"]);
    el.classList.add(colors_class_dict.white);
  });

  const content_loading = `
    Rebent la informació...
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-hourglass-split" viewBox="0 0 16 16">
      <path d="M2.5 15a.5.5 0 1 1 0-1h1v-1a4.5 4.5 0 0 1 2.557-4.06c.29-.139.443-.377.443-.59v-.7c0-.213-.154-.451-.443-.59A4.5 4.5 0 0 1 3.5 3V2h-1a.5.5 0 0 1 0-1h11a.5.5 0 0 1 0 1h-1v1a4.5 4.5 0 0 1-2.557 4.06c-.29.139-.443.377-.443.59v.7c0 .213.154.451.443.59A4.5 4.5 0 0 1 12.5 13v1h1a.5.5 0 0 1 0 1h-11zm2-13v1c0 .537.12 1.045.337 1.5h6.326c.216-.455.337-.963.337-1.5V2h-7zm3 6.35c0 .701-.478 1.236-1.011 1.492A3.5 3.5 0 0 0 4.5 13s.866-1.299 3-1.48V8.35zm1 0v3.17c2.134.181 3 1.48 3 1.48a3.5 3.5 0 0 0-1.989-3.158C8.978 9.586 8.5 9.052 8.5 8.351z"/>
    </svg>
  `;
  showLoading(content_loading)

  // Load the dictionary of words
  try{
    await loadWordsSize5()
    hideLoading()
    canviarParaulaLinea("ARRIA", current_row);
    canviarColorLinea('gray', current_row)

    // Show next suggerencia button
    MostrarSuggerenciaButton(current_row);

    // await getFuturaX(['2439'])
  }catch(err){
    ErrorLoadingInfo()
  }
  console.log('done')
});

// Updating Words -----------------------------------------------------------------------------

async function setNextSuggerencia(){
  // Disable the suggestion button for that line
  disableSuggestButton(current_row);

  // Logic of the next suggested word
  var paraula = GetCurrentParaula()
  var resultat = GetCurrentResultat()

  if (resultat == 'CCCCC'){
    // If marked as all green, we won
    current_row++;
    finishGame(true);
  }else if (current_row == 5){
    // If last line and not marked as all green, we lost
    finishGame(false);
  }else{
    var valid_word = await CheckCurrentWord()
    if(valid_word){
      const [nova_paraula, continue_search] = await getNextSuggerencia(paraula, resultat);

      if (continue_search){
        console.log('setNextSuggerencia -- suggerencia:', nova_paraula)
        current_row++;
        setNewWord(nova_paraula, current_row)

      }else{
        if (nova_paraula.length > 0){
          // Its the end cause only one valid word was found, but needs to be confirmed
          console.log('setNextSuggerencia -- unica suggerencia:', nova_paraula)
          current_row++;
          setNewWord(nova_paraula, current_row)
          canviarColorLinea('green', current_row);
          MostrarSuggerenciaButton(current_row, custom_text='Confirmar')

        }else{
          // Its the end cause NO word was found
          console.log('setNextSuggerencia -- No hi ha cap paraula que compleixi aquestes condicions...\n')
          current_row++;
          finishGame(false);
        }
      }

    }else{
      MostrarSuggerenciaButton(current_row, custom_text='Paraula Invàlida')
      console.log('getNextSuggerencia -- Paraula no valida', 'seguent'+current_row)
    }
  }
}

// Suggest button -------------------------------------------------------------------------------

function MostrarSuggerenciaButton(row, custom_text=null){
  const id = "seguent" + row;
  const el = document.getElementById(id);
  console.log("MostrarSuggerenciaButton -- looking for:", id);

  el.classList.remove("seguent-hide");
  el.classList.add("seguent-show");

  if (custom_text !== null){
    el.innerHTML = custom_text;
  }
}

function disableSuggestButton(row){
  const id = "seguent" + row;
  const el = document.getElementById(id);
  console.log("disableSuggestButton -- looking for:", id);

  el.disabled = true;
}

// Line functionality ------------------------------------------------------------------------

function setNewWord(word, row){
  console.log('setNewWord -- new row:', row);
  canviarParaulaLinea(word, row);
  canviarColorLinea('gray', row);
  MostrarSuggerenciaButton(row);
}

function canviarParaulaLinea(paraula, row){
  for (const [index, char] of [...paraula].entries()) {
    const id = "lletra" + row + index;
    const el = document.getElementById(id);

    // console.log("canviarParaulaLinea -- looking for:", id);
    console.log("canviarParaulaLinea -- looking for:", id, el);

    if (!el) continue;
    el.innerHTML = char;

  }
}

function canviarColorLinea(color, row){

  for(let i = 0; i < 5; i++){
    const id = "lletra" + row + i;
    const el = document.getElementById(id);

    // Remove all possible color classes
    Object.values(colors_class_dict).forEach(cls => {
      el.classList.remove(cls);
    });

    // Add color specified
    el.classList.add(colors_class_dict[color]);

    // Change state to match color
    let stateIndex = letter_states.indexOf(color);
    el.setAttribute("data-state", stateIndex);
  }
}

function cycleLetterState(el){
  // Read current state from a data attribute, default to 0
  let stateIndex = parseInt(el.getAttribute("data-state")) || 0;

  // Move to next state
  stateIndex = (stateIndex + 1) % letter_states.length;

  // Update data attribute
  el.setAttribute("data-state", stateIndex);

  // Replace color classes
  Object.values(colors_class_dict).forEach(cls => {
    el.classList.remove(cls);
  });

  el.classList.add(colors_class_dict[letter_states[stateIndex]]);
}

// Load suggestion -----------------------------------------------------------------------------

async function getNextSuggerencia(paraula, resultat){
  var ind = info_words2ind[paraula]['ind']
  console.log('getNextSuggerencia -- Info', paraula, ind, resultat)
  console.log('getNextSuggerencia -- Hi han', inds_disponibles.length, 'paraules possibles')

  await getFuturaX([ind])

  inds_disponibles = CalcularParaulesPossibles(ind, resultat, inds_disponibles, paraules_resultat, info_ind2words);
  console.log('getNextSuggerencia -- Queden', inds_disponibles.length, 'paraules possibles')

  if(inds_disponibles.length == 0){
    return ['', false]

  }else if(inds_disponibles.length == 1){
    return [info_ind2words[inds_disponibles[0]]['word'], false]

  }else{
      best_ind = await CalculateBestWord(inds_disponibles, paraules_resultat, info_ind2words)
      console.log('getNextSuggerencia -- suggerencia:', best_ind)

      seguent_paraula = info_ind2words[best_ind]['word']
      return [seguent_paraula, true]
  }
}


// Loading current value of word -----------------------------------------------------------------

function CheckCurrentWord(){
  var paraula_valida = true;
  var paraula = GetCurrentParaula();
  console.log('CheckCurrentWord -- paraula input:', paraula);
  if (paraula in info_words2ind){
    var ind_paraula = String(info_words2ind[paraula]['ind']);
    console.log('CheckCurrentWord -- paraula input ind:',ind_paraula, ', exists:', paraula_valida);

    // If the word appears in the list of all loaded words
    if (all_words5.includes(ind_paraula)) {
      return true
    }else{
      return false
    }

  }else{
    return false
  }
}

function GetCurrentParaula(){
  var paraula = '';
  for(let i = 0; i < 5; i++){
    inputname = "lletra"+current_row+i;
    let lletra = document.getElementById(inputname).innerHTML;
    // console.log('GetCurrentParaula -- current lletra (', inputname, '):', lletra)
    if(/^[a-zA-Z]+$/.test(lletra)){
      paraula += lletra;
    }else{
      paraula_valida = false;
      break;
    }
  }
  paraula = paraula.toUpperCase();
  return paraula
}

function GetCurrentResultat(){
  var resultat = ''

  for(let i = 0; i < 5; i++){
    var id_lletra = 'lletra'+current_row.toString()+i.toString()
    if(document.getElementById(id_lletra).classList.contains(colors_class_dict.green)){
      resultat += "C"
    }else if(document.getElementById(id_lletra).classList.contains(colors_class_dict.yellow)) {
      resultat += "M"
    }else if(document.getElementById(id_lletra).classList.contains(colors_class_dict.gray)) {
      resultat += "I"
    }
  }
  return resultat
}


// End game functions -------------------------------------------------------------------------

function finishGame(victory){
  if(victory){
    console.log('finishGame -- Hem guanyat!')
    // Change text to green
    canviarColorLinea('green', current_row);
    // Change restart button to green
    document.getElementById('boto_reestart').classList.add('bg-success');

    // Confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

  }else{
    console.log('finishGame -- Hem perdut...')
    // Change text to red
    canviarColorLinea('red', current_row);
    // Change restart button to red
    document.getElementById('boto_reestart').classList.add('bg-danger');

    confetti({
      particleCount: 80,
      spread: 20,
      gravity: 0.8,
      ticks: 300,
      colors: ['#555555', '#888888', '#bbbbff'],
      origin: { x: 0.5, y: 0 }
    });
  }
}


// Related to the Loading element ------------------------------------------------------------

function showLoading(content, background){
  document.getElementById("loading").style.visibility="visible";
  document.getElementById("loading").classList.add(colors_class_dict[background])
  document.getElementById("loading").innerHTML=content;
}
function hideLoading(){
  document.getElementById("loading").style.visibility="hidden";
  document.getElementById("loading").innerHTML='---';
  Object.values(colors_class_dict).forEach(cls => {
    document.getElementById("loading").classList.remove(cls);
  });
}

function ErrorLoadingInfo(){
  document.getElementById("loading").innerHTML = "Hi ha hagut un error rebent la informació.<br>Siusplau reinicia la pàgina.";
  document.getElementById("loading").classList.remove(colors_class_dict.yellow)
  document.getElementById("loading").classList.add(colors_class_dict.red)
}
