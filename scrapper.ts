// Request é uma biblioteca para fazer requests http (get, post, etc). Similar ao axios.
const request = require("request-promise");
// Cheerio é basicamente um jQuery que roda no node. Facilitará nosso trabalho.
const cheerio = require("cheerio");
// Módulo padrão do node para acessar o filesystem do sistema operacional
var fs = require("fs");

async function main() {
    //downloadPages();
    getDataFromPage();
    console.log("I ran!");
}

// Baixa todas as páginas da seção de composição química do site tbca.net.br
async function downloadPages() {
    // considerando que a seção contém 54 páginas, começando na página 1
    for (let i = 1; i < 55; i++) {
        // a página a ser baixada será uma string contendo todo o html
        let page: string;
        try {
            page = await request.get(`http://tbca.net.br/base-dados/composicao_estatistica.php?pagina=${i}`, { timeout: 5000 });
        } catch (error) {
            // nossa implementação será insistente. se der timeout após 5 segundos, ela tentará novamente até conseguir
            console.log(error);
            i--;
            console.log(`Tentando novamente...`);
            continue;
        }
        // cria o arquivo no diretório designado usando o módulo fs
        let file = fs.createWriteStream(`./pages/pagina${i}.html`, {
            flags: "a", // 'a' significa appending (dados anteriores serão preservados)
        });
        file.write(page);
        console.log(`Página ${i} baixada com sucesso. `);
    }
}

// Carrega a página armazenada
function loadPage(page: number): string {
    let result: string = fs.readFileSync(`./pages/pagina${page}.html`, "utf8");
    return result;
}

// Obtém as informações iniciais dos alimentos contidos na própria página de listagem
function getDataFromPage() {
    const $ = cheerio.load(loadPage(1));
    const table = $("body > div > main > div > table > tbody > tr > td");
    //console.log($(table[6]).text());
    let linha = [{}];
    //let dados = { codigo: $(table[0]).text(), nome: $(table[1]).text() }; //; nomeIngles : string; nomeCientifico : string; grupo : string; marca : string; }
    //console.log(dados.codigo);
    //console.log(dados.nome);
    //linha[0] = dados;
    //console.log(linha[0]);
    console.log(table.length);
    //console.log($(table[0]).text());
    let counter = 0;
    for (let j = 0; j < table.length; j+=6) {
        
            linha[counter] = {
                codigo: $(table[j]).text().replace(/["]+/g, "'"),
                nome: $(table[j + 1]).text().replace(/["]+/g, "'"),
                nomeIngles: $(table[j + 2]).text().replace(/["]+/g, "'"),
                nomeCientifico: $(table[j + 3]).text().replace(/["]+/g, "'"),
                grupo: $(table[j + 4]).text().replace(/["]+/g, "'"),
                marca: $(table[j + 5]).text().replace(/["]+/g, "'"),
            }
        counter++;
        
    }
    
    console.log(linha[99]);
    let file = fs.createWriteStream(`./pages/json.txt`, {
        flags: "a", // 'a' significa appending (dados anteriores serão preservados)
    });
    file.write(JSON.stringify(linha));
}

// Entra na página específica e obtém o restante das informações de cada alimento
function getDataFromEachFood() {}

main();
