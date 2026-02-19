import sys, os
from csv import reader
import math
from tqdm import tqdm

def demanar_input():

    paraula_valida = False
    resultat_valid = False
    while not paraula_valida or not resultat_valid:
        paraula_valida = False
        resultat_valid = False

        # we ask for the word
        paraula = input("Quina paraula has introduit?:")
        paraula = paraula.upper()
        if len(paraula) == 5 and paraula.isalpha():
            paraula_valida = True
        else:
            print('Paraula introduida no valida')

            # we ask for the results
        resultats = input("Com ha resultat cada lletra?\n(C: lletra posicio correcte, M: moguda, I:incorecte):")
        resultats = resultats.upper()
        if len(resultats) == 5 and paraula.isalpha():
            for lletra in resultats:
                if lletra != 'C' and lletra != 'M' and lletra != 'I':
                    break
            else:
                resultat_valid = True
        else:
            print('Resultats no valids. Siusplau fixat en la llegenda.')

    return paraula, resultats

def calcular_paraules_possibles(ind, resultat, inds_disponibles, paraules_resultat, info_ind2words):

    futures = paraules_resultat[ind][resultat]

    diccionari_possibles_new = []
    for ind_fut in futures:
        ind_fut = str(ind_fut)
        if ind_fut in inds_disponibles:
            diccionari_possibles_new.append(ind_fut)
            # diccionari_possibles_new[ind_fut] = info_ind2words[ind_fut]['freq']

    # print('futures', ind, resultat, ':', len(futures), '->', len(diccionari_possibles_new))
    return diccionari_possibles_new

def entropia_value(prob):
    return -1 * prob * math.log2(prob) if prob > 0 else 0

def get_combinations(posibilities, lenn):

    to_return = []
    for i in posibilities:
        if lenn > 1:
            lowers = get_combinations(posibilities, lenn-1)
            for lower in lowers:
                to_return.append(i+lower)
        else:
            to_return.append(i)

    return to_return

def diccionary_frequencies(inds_disponibles, info_ind2words):
    total_prob = 0
    for ind in inds_disponibles:
        total_prob += int(info_ind2words[ind]['freq'])

    dicc_prob = {}
    for k in inds_disponibles:
        dicc_prob[k] = int(info_ind2words[k]['freq'])/total_prob
    return dicc_prob

def calculate_entropia_probabilidad(inds_disponibles, paraules_resultat, info_ind2words):
    resultats_entropia = {}
    resultats = get_combinations(['I', 'M', 'C'], 5)


    print('calculant entropia')
    for ind in tqdm(sorted(inds_disponibles)):
        # print('paraula:', ind)
        entropia_paraula = 0
        for resultat in resultats:

            futures_paraules = calcular_paraules_possibles(ind, resultat, inds_disponibles, paraules_resultat, info_ind2words)
            prob = float(len(futures_paraules))/float(len(inds_disponibles))
            entropia = entropia_value(prob)
            entropia_paraula += entropia
            # print(resultat, ':', futures_paraules, '--', inds_disponibles, ':', prob, entropia, entropia_paraula)

        resultats_entropia[ind] = entropia_paraula
        # print('entropia:', resultats_entropia[ind])

    qualitat_paraula = {}
    diccionari_prob = diccionary_frequencies(inds_disponibles, info_ind2words)
    for ind in inds_disponibles:
        entropia = resultats_entropia[ind]
        prob = diccionari_prob[ind]
        print(ind, info_ind2words[ind]['word'], entropia, prob)
        qualitat_paraula[ind] = entropia+prob*2

    return qualitat_paraula
    # return max(qualitat_paraula, key=qualitat_paraula.get)

def CalculateBestWords(inds_disponibles, paraules_resultat, info_ind2words):
    '''
    word_ind: paraula input
    resultat: resultat input
    inds_disponibles: paraules que encara no han estat descartades de la llista
    paraules_resultat: diccionari amb les paraules possibles segons la paraula input i el resultat input (especific començat amb una lletra)
    info_ind2words: diccionari de la informaciod de ind, paraula i freq amb el index com a key
    '''

    valors_paraules = calculate_entropia_probabilidad(inds_disponibles, paraules_resultat, info_ind2words)
    print('vp', valors_paraules)


    ordered_list = [(k, valors_paraules[k]) for k in sorted(valors_paraules, key=valors_paraules.get, reverse=True)]
    ordered_list_value = [x[0] for x in ordered_list]

    return ordered_list_value[0], ordered_list_value[1:5]

if __name__ == "__main__":

    with open('wordsFuturesTotal.csv', 'r') as read_obj:
        csv_reader = reader(read_obj)
        header = next(csv_reader)
        if header != None:
            paraules_resultat = {}
            for row in csv_reader:
                if row[1] not in paraules_resultat:
                    paraules_resultat[row[1]] = {}
                paraules_resultat[row[1]][row[2]] = row[3]

    for caso, ind in enumerate(paraules_resultat.keys()):
        for resultat in paraules_resultat[ind].keys():
            inds = paraules_resultat[ind][resultat]
            inds = inds.replace('[', '').replace(']', '').replace(' ', '').split(',')
            paraules_resultat[ind][resultat] = inds

    inds_disponibles = []
    with open('wordsCatalan5.csv', 'r') as read_obj:
        csv_reader = reader(read_obj)
        header = next(csv_reader)
        if header != None:
            info_words2ind = {}
            info_ind2words = {}
            for row in csv_reader:
                if row[1] not in info_words2ind:
                    info_words2ind[row[1]] = {}
                info_words2ind[row[1]]['freq'] = row[2]
                info_words2ind[row[1]]['ind'] = row[3]

                if row[3] not in info_ind2words:
                    info_ind2words[row[3]] = {}
                info_ind2words[row[3]]['freq'] = row[2]
                info_ind2words[row[3]]['word'] = row[1]

                inds_disponibles.append(row[3])


    win = False
    tirades = 0
    # inds_disponibles = ['1', '2', '3', '4']
    print(len(inds_disponibles), 'paraules possibles')
    # word_ind = info_words2ind[word]['ind']
    best_ind, others_start = CalculateBestWords(inds_disponibles, paraules_resultat, info_ind2words)
    # best_ind = '1847'
    print(best_ind, others_start)
    best_word = info_ind2words[best_ind]['word']
    print('per començar prova amb:', best_word, best_ind)
    while not win and tirades < 6:
        print('------------------------------------------------------------------------------')
        print('TORN', tirades+1)

        paraula, resultat = demanar_input()
        # paraula, resultats = 'QOECR', 'ICMIC'
        ind = info_words2ind[paraula]['ind']
        inds_disponibles = calcular_paraules_possibles(ind, resultat, inds_disponibles, paraules_resultat, info_ind2words)
        print('Queden', len(inds_disponibles), 'paraules possibles')
        tirades += 1
        print('tirades', tirades)

        if len(inds_disponibles) == 0:
            print('No hi ha cap paraula que compleixi aquestes condicions...\n')
            win = True

        elif tirades >= 6 and resultat != 'CCCCC':
            print('Hem perdut... :(')

        elif len(inds_disponibles) == 1:
            seguent_ind = inds_disponibles[0]
            seguent_paraula = info_ind2words[seguent_ind]['word']
            print('Hem guanyat!\nParaula guanyadora: ', '--'+seguent_paraula+'--', '\n')
            win = True

        else:
            seguent_ind, best5_ind = CalculateBestWords(inds_disponibles, paraules_resultat, info_ind2words)
            seguent_paraula = info_ind2words[seguent_ind]['word']
            best5_word = [info_ind2words[x]['word'] for x in best5_ind]
            # seguent_paraula = seleccionar_seguent_paraula(diccionari_possibles, data, 'prob')
            print('proxima paraula: ', '--'+seguent_paraula+'---- (', best5_word, ')\n')
