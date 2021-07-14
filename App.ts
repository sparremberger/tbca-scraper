// Request é uma biblioteca para fazer requests http (get, post, etc). Similar ao axios.
const request = require("request-promise");
// Cheerio é basicamente um jQuery que roda no node. Facilitará nosso trabalho.
const cheerio = require("cheerio");
// Módulo padrão do node para acessar o filesystem do sistema operacional
var fs = require("fs");

import Downloader from './Downloader';
import Data from './Data';
const dl = new Downloader();
const dt = new Data();

const DIRETORIO_SAVE = "data";
const DIRETORIO_LOAD = "pages";

// script run
async function run() {
    let numeroDePaginas = 54;
    let food : any = [];
    await dl.downloadPages(numeroDePaginas, `ts-test`); // check, mudar pra const DIRETORIO_SAVE dps
    for (let i = 1; i < 55; i++) { //check!
        food = food.concat(dt.getDataFromPage(i)); // o método é executado para cada uma das páginas e no final ele nos salva tudo num arquivo JSON
    }
    dl.saveFile(food, `./ts-test/valid.json`); // check
    await dl.downloadComplimentaryPages(food); // check
    for (let i = 0; i < food.length; i++) {
        dt.getDataFromEachFood(food[i].codigo);
    } // check!
    for (let i = 0; i < food.length; i++) { // check!
        dt.joinAndCreate(i, food);
    }

    console.log("Nothing else to do!");
}

run();
