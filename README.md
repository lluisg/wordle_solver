# Wordle Solver

[![Node.js](https://img.shields.io/badge/Node.js-v18-green)](https://nodejs.org/) [![MongoDB](https://img.shields.io/badge/MongoDB-v6-blue)](https://www.mongodb.com/) [![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

This project was originally created in **February 2022** along with the [Paraulogic Solver](https://github.com/lluisg/paraulogic_solver)

In **February 2026**, it was updated for more efficient processing and an improved interface. The original version is preserved in the *old_version* folder.

**Wordle** is a popular web-based word game where you try to guess the correct 5-letter word. After each guess, you receive feedback on each letter: whether it is correct, present but in the wrong position, or not in the word at all. This project is a **solver** that helps you efficiently find the solution word.

Try the live version [**here**](https://wordle-solver.onrender.com).


## Table of Contents

- [Features](#features)
- [Data Sources](#data-sources)
- [Installation](#installation)
- [Usage](#usage)
- [Extras](#extras)
- [Contributing](#contributing)
- [License](#license)


## Features

- Solver built with **Node.js** and **HTML**
- Local or live web usage
- Based on the Catalan word datasets
- Easy to modify and extend


## Data Sources

Finding a comprehensive Catalan word dataset was challenging. After cleaning and merging, the following datasets were used:

<details>
<summary>Click to expand data sources</summary>

- [**Zipf's Laws of Meaning in Catalan**](https://zenodo.org/record/4120887#.YhafMuj0m3D) – Main dataset
- [**Wikicorpus v1.0: Catalan, Spanish, English Wikipedia**](https://www.cs.upc.edu/~nlp/wikicorpus/) – Light fine-tuning
- [**Corpus textual informatitzat de la llengua catalana (CTILC)**](https://ctilc.iec.cat/) – Supplementary

**Note:** Some words may still be missing (e.g., *filla*).

</details>


## Installation

### Requirements

- [Node.js](https://nodejs.org/) ≥ 18
- [MongoDB](https://www.mongodb.com/) ≥ 6

### Steps

1. Clone the repository `git clone https://github.com/lluisg/paraulogic_solver.git`

2. Access the folder `cd wordle-solver`

3. Create a `.env` file in the root directory containing: `CONNECTION_URL=<your_mongodb_connection_string>`

4. Install dependencies `npm install`

5. Start the server `npm start`

6. Open your browser and go to `http://localhost:3000`


## Usage

- Modify the solver or interface as needed
- Refresh your browser to see changes in real-time
- Use the solver to input required and optional letters for word suggestions


## Extras

- All databases and related Python scripts used for this project are available in [**this repository**](https://github.com/lluisg/catalan_database_wordle)


## Contributing

Contributions are welcome! You can:

- Add missing words to the dataset
- Optimize the solver algorithm
- Improve the web interface

Please give credit if you use or modify the project.


## License

This project is licensed under the MIT License – see [LICENSE](LICENSE) for details.
