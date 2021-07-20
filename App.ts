import Downloader from "./Downloader";
import Data from "./Data";
const dl = new Downloader();
const dt = new Data();

const DIRETORIO_SAVE = "data";
const DIRETORIO_LOAD = "pages";

// script run
async function run() {
    let numeroDePaginas = 54;
    let food: any = [];
    await dl.downloadPages(numeroDePaginas, `ts-test`); // baixa as páginas, mudar pra const DIRETORIO_SAVE dps
    for (let i = 1; i < 55; i++) {
        food = food.concat(dt.getDataFromPage(i)); // extrai os dados de cada página e armazena todos os dados num único array
    }
    dl.saveFile(food, `./ts-test/valid.json`); // salva o array inteiro como um único objeto json
    await dl.downloadComplimentaryPages(food); // baixa as páginas complementares de cada alimento, tendo o código de cada alimento como referência
    for (let i = 0; i < food.length; i++) {
        dt.getDataFromEachFood(food[i].codigo); // obtém o restante das informações complementares, salvando também em arquivos individuais
    }
    for (let i = 0; i < food.length; i++) {
        // mescla os dados do array JSON com seus respectivos dados complementares e salva tudo em arquivos individuais
        dt.joinAndCreate(i, food);
    }

    console.log("Nothing else to do!"); // finish!
}

run();
