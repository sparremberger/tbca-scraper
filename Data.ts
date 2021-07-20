// Módulo padrão do node para acessar o filesystem do sistema operacional
var fs = require("fs");
// Cheerio é basicamente um jQuery que roda no node. Facilitará nosso trabalho.
const cheerio = require("cheerio");
import Downloader from "./Downloader";
const dl = new Downloader();

class Data {
    getDataFromPage(page_number: number): [] {
        const $ = cheerio.load(this.loadPage(page_number));
        const table = $("body > div > main > div > table > tbody > tr > td");

        // cria o array de objetos que irá armazenar os dados extraídos
        let alimento: any = [];

        /* Os dados não vem identificados, pois a tabela foi extraída como texto crú. Como sabemos que os 6 primeiros items do array irão compôr
         * o objeto que queremos criar e que a cada 6 items temos um novo objeto, fazemos com que o loop 'for' pule de 6 em 6, colocando estes 6 items
         * no nosso objeto. O 'counter', por sua vez, representa o index do array de objetos que irá armazenar cada objeto depois de pronto. */
        let counter = 0;
        for (let j = 0; j < table.length; j += 6) {
            alimento[counter] = {
                // Aplica um simples regex para substituir cada ocorrência de " por ', pra que não quebre a formatação de nosso JSON.
                codigo: $(table[j]).text().replace(/["]+/g, "'"),
                nome: $(table[j + 1])
                    .text()
                    .replace(/["]+/g, "'"),
                nomeIngles: $(table[j + 2])
                    .text()
                    .replace(/["]+/g, "'"),
                nomeCientifico: $(table[j + 3])
                    .text()
                    .replace(/["]+/g, "'"),
                grupo: $(table[j + 4])
                    .text()
                    .replace(/["]+/g, "'"),
                marca: $(table[j + 5])
                    .text()
                    .replace(/["]+/g, "'"),
            };
            counter++;
        }
        return alimento;
    }

    // Entra na página específica e obtém o restante das informações de cada alimento
    getDataFromEachFood(codigo: string) {
        let page = this.loadFoodPage(codigo);
        //console.log(page);
        const $ = cheerio.load(page);
        const table = $("#tabela1 > tbody > tr > td");

        // cria o array de objetos que irá armazenar os dados extraídos
        let objetos = [{}];

        let counter = 0;
        for (let j = 0; j < table.length; j += 9) {
            objetos[counter] = {
                componente: $(table[j]).text().replace(/["]+/g, "'"),
                unidade: $(table[j + 1])
                    .text()
                    .replace(/["]+/g, "'"),
                valorPor100g: $(table[j + 2])
                    .text()
                    .replace(/["]+/g, "'"),
                desvioPadrao: $(table[j + 3])
                    .text()
                    .replace(/["]+/g, "'"),
                valorMinimo: $(table[j + 4])
                    .text()
                    .replace(/["]+/g, "'"),
                valorMaximo: $(table[j + 5])
                    .text()
                    .replace(/["]+/g, "'"),
                numeroDeDadosUtilizados: $(table[j + 6])
                    .text()
                    .replace(/["]+/g, "'"),
                referencias: $(table[j + 7])
                    .text()
                    .replace(/["]+/g, "'"),
                tipoDeDados: $(table[j + 8])
                    .text()
                    .replace(/["]+/g, "'"),
            };
            counter++;
        }

        dl.saveFile(objetos, `./ts-test/${codigo}.txt`);
        //console.log(`Got data from ${codigo}`);
    }

    // Joina as duas páginas, a inicial e a de componentes, salvando em um arquivo json para cada alimento
    joinAndCreate(index: number, food: any) {
        let result: any;
        let componentes = JSON.parse(this.loadFoodFromCode(food[index].codigo));

        result = {
            codigo: food[index].codigo,
            nome: food[index].nome,
            nomeIngles: food[index].nomeIngles,
            nomeCientifico: food[index].nomeCientifico,
            grupo: food[index].grupo,
            marca: food[index].marca,
            componentes: [],
        };
        for (let i = 0; i < componentes.length; i++) {
            result.componentes.push(componentes[i]);
        }

        dl.saveFile(result, `./ts-test/${food[index].codigo}_final.json`);

        console.log(`${food[index].codigo} salvo...`);
    }

    // Carrega uma página única e retorna como string
    loadPage(page_number: number): string {
        let result: string = fs.readFileSync(`./ts-test/Pagina_${page_number}.html`, "utf8"); // !!! Arrumar isso
        return result;
    }

    // Carrega uma página complementar única
    loadFoodPage(codigo: string): string {
        let result: string = fs.readFileSync(`./ts-test/${codigo}.html`, "utf8");
        return result;
    }

    // !!!! deprecated, remover o quanto antes
    loadFoodFromCode(codigo: string): string {
        let result: string = fs.readFileSync(`./data/${codigo}.txt`, "utf8");
        return result;
    }
}

export default Data;
