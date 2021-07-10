// Request é uma biblioteca para fazer requests http (get, post, etc). Similar ao axios.
const request = require("request-promise");
// Cheerio é basicamente um jQuery que roda no node. Facilitará nosso trabalho.
const cheerio = require("cheerio");
// Módulo padrão do node para acessar o filesystem do sistema operacional
var fs = require("fs");

const DIRETORIO = "teste"; // ou então pages

// script run
async function run() {
    let numeroDePaginas = 54;
    //downloadPages(numeroDePaginas); // o site possui 54 páginas //check!
    /*for (let i = 1; i < 55; i++) { //check!
        getDataFromPage(i); // o método é executado para cada uma das páginas e no final ele nos salva tudo num arquivo JSON
    }*/
    /*for (let i = 0; i < objects.length; i++) {
        getDataFromEachFood(objects[i].codigo);
    }*/ // check!
    joinAndCreate();
    console.log("Nothing else to do!");
}

async function main() {
    //downloadPages();
    /*for (let i = 1; i < 55; i++ ) {
        getDataFromPage(i);
    }*/

    console.log("Pronto!");
}

// Baixa todas as páginas da seção de composição química do site tbca.net.br
async function downloadPages(numeroDePaginas: number) {
    // considerando que a seção contém 54 páginas, começando na página 1
    for (let i = 0; i < numeroDePaginas; i++) {
        // a página a ser baixada será uma string contendo todo o html
        let page: string;
        try {
            page = await request.get(`http://tbca.net.br/base-dados/composicao_estatistica.php?pagina=${i + 1}`, { timeout: 5000 }); // !!! esse i+1 precisa ser corrigido
        } catch (error) {
            // nossa implementação será insistente. se der timeout após 5 segundos, ela tentará novamente até conseguir
            console.log(error);
            console.log(`Tentando novamente...`);
            continue; // Continue retorna pro início do loop, sem incrementar i. Basicamente ele reseta a iteração atual.
        }
        // cria o arquivo no diretório designado usando o módulo fs
        let file = fs.createWriteStream(`./${DIRETORIO}/Pagina_${i + 1}.html`, {
            flags: "a", // 'a' significa appending (dados anteriores serão preservados)
        });
        file.write(page);
        console.log(`Página ${i + 1} baixada com sucesso. `);
    }
}

// Baixa as páginas complementares de acordo com os códigos recebidos
async function downloadComplimentaryPages() {
    for (let i = 0; i < objects.length; i++) {
        let page: string;
        try {
            page = await request.get(`http://tbca.net.br/base-dados/int_composicao_estatistica.php?cod_produto=${objects[i].codigo}`, { timeout: 5000 });
        } catch (error) {
            // nossa implementação será insistente. se der timeout após 5 segundos, ela tentará novamente até conseguir
            console.log(error);
            i--;
            console.log(`Tentando novamente...`);
            continue;
        }
        // cria o arquivo no diretório designado usando o módulo fs
        let file = fs.createWriteStream(`./pages/${objects[i].codigo}.html`, {
            flags: "a", // 'a' significa appending (dados anteriores serão preservados)
        });
        file.write(page);
        console.log(`Página ${i} baixada com sucesso. `);
    }
}

// Carrega uma página armazenada e retorna em formato de string
function loadPage(page: number): string {
    let result: string = fs.readFileSync(`./${DIRETORIO}/Pagina_${page}.html`, "utf8"); // !!! Arrumar isso
    return result;
}

// Obtém as informações iniciais dos alimentos contidos na própria página de listagem
function getDataFromPage(page: number) {
    const $ = cheerio.load(loadPage(page));
    const table = $("body > div > main > div > table > tbody > tr > td");

    // cria o array de objetos que irá armazenar os dados extraídos
    let alimento = [{}];

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

    //console.log(alimento[0]); // !!!!!! excluir, só teste
    let file = fs.createWriteStream(`./${DIRETORIO}/alimentos.txt`, {
        flags: "a", // 'a' significa appending (dados anteriores serão preservados)
    });
    file.write(JSON.stringify(alimento)); // Salva nosso objeto no arquivo, antes convertendo o objeto para uma string.
}

// URGENTE!!! Implementar função para sanitizar o JSON. ( [] }{ )

// Entra na página específica e obtém o restante das informações de cada alimento
function getDataFromEachFood(codigo: string) {
    let page = loadFoodPage(codigo);
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

    //console.log(objetos); // !!pode tirar que é teste!
    let file = fs.createWriteStream(`./${DIRETORIO}/${codigo}.txt`);
    file.write(JSON.stringify(objetos));
    console.log(`Got data from ${codigo}`);
}

// Carrega uma página complementar única
function loadFoodPage(codigo: string): string {
    let result: string = fs.readFileSync(`./pages/${codigo}.html`, "utf8");
    return result;
}

function loadFoodFromCode(codigo : string) : string {
    let result : string = fs.readFileSync(`./teste/${codigo}.txt`, "utf8");
    return result;
}

// Lê os dados salvos do arquivo JSON e cria um array com os códigos
function loadJSON(): string {
    let result: string = fs.readFileSync(`./pages/data.json`, "utf8");
    return result;
}

// Joina os dois
function joinAndCreate() {
    let result : any;
    //console.log(objects[0]);
    //console.log(objects[1].codigo);
    let componentes = JSON.parse(loadFoodFromCode(objects[1].codigo));
    result = {
        codigo: objects[1].codigo,
        nome: objects[1].nome,
        nomeIngles: objects[1].nomeIngles,
        nomeCientifico: objects[1].nomeCientifico,
        grupo: objects[1].grupo,
        marca: objects[1].marca,
        componentes : [],
    };
    for (let i = 0; i < componentes.length; i++) {
        result.componentes.push(componentes[i]);
    }
    let file = fs.createWriteStream(`./${DIRETORIO}/datadata.txt`)
    file.write(JSON.stringify(result)); // Salva nosso objeto no arquivo, antes convertendo o objeto para uma string.
    
    
    console.log(result);
    //console.log(result[0]);
    //console.log(componentes[1]);
    
}

let objects = JSON.parse(loadJSON());
/*console.log(objects[5307]);
console.log(objects[5307].codigo);
//console.log(loadFoodPage());
getDataFromEachFood();
main();*/
run();
