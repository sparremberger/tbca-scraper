// Request é uma biblioteca para fazer requests http (get, post, etc). Similar ao axios.
const request = require("request-promise");
// Módulo padrão do node para acessar o filesystem do sistema operacional
var fs = require("fs");

class Downloader {
    // Baixa todas as páginas da seção de composição química do site tbca.net.br
    public async downloadPages(numeroDePaginas: number, path: string) {
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
                i--; // Decrementa o index para tentar novamente com a mesma página
                continue; // Continue retorna pro início do loop.
            }
            // cria o arquivo no diretório designado usando o módulo fs
            this.saveFile(page, `./${path}/Pagina_${i + 1}.html`);
            console.log(`Página ${i + 1} baixada com sucesso. `);
        }
    }

    saveFile(data: {} | string, path: string) {
        let file = fs.createWriteStream(path);
        if (typeof data != "string") {
            file.write(JSON.stringify(data)); // Salva nosso objeto no arquivo, antes convertendo o objeto para uma string.
        } else {
            file.write(data);
        }
    }

    // Carrega uma página armazenada e retorna em formato de string
    loadPage(page_number: number, path: string): string {
        let result: string = fs.readFileSync(`./ts-test/Pagina_${page_number}.html`, "utf8"); // !!! Arrumar isso
        return result;
    }
}

export default Downloader;
