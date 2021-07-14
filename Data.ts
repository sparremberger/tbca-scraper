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
        //console.log(alimento); // !!!!!! excluir, só teste
        //saveFile(alimento, `./${DIRETORIO_SAVE}/alimentos.txt`);
    }

    // URGENTE!!! Implementar função para sanitizar o JSON. ( [] }{ )
    loadPage(page_number: number): string {
        let result: string = fs.readFileSync(`./ts-test/Pagina_${page_number}.html`, "utf8"); // !!! Arrumar isso
        return result;
    }
}

export default Data;
