const request = require("request-promise");
const cheerio = require("cheerio");

tableKey = ["codigo", "nome", "nomeingles", "nomecientifico", "grupo", "marca"];
jsonDB = [];

function cleanJSON(jsonstring) {
    // preserve newlines, etc - use valid JsON
    jsonstring = jsonstring
        .replace(/\\n/g, "\\n")
        .replace(/\\'/g, "\\'")
        .replace(/\\"/g, '\\"')
        .replace(/\\&/g, "\\&")
        .replace(/\\r/g, "\\r")
        .replace(/\\t/g, "\\t")
        .replace(/\\b/g, "\\b")
        .replace(/\\f/g, "\\f")
        .replace(/\\´/g, "\\´");
    // remove non-printable and other non-valid JSON chars
    jsonstring = jsonstring.replace(/[\u0000-\u0019]+/g, "");
    return jsonstring;
}

async function main() {
    let pagina = 11;
    const result = await request.get(
        `http://www.tbca.net.br/base-dados/composicao_estatistica.php?pagina=${pagina}`
    );
    const $ = cheerio.load(result);

    const table = $("body > div.wrapper > main > div > table"); // jQuery retorna um array, mas apenas o [0] é a table em si, o resto é undefined
    const tableTds = $(table).find("td");
    let counter = 0;
    var fs = require("fs");
    var logger = fs.createWriteStream(`log${pagina}.txt`, {
        flags: "a", // 'a' means appending (old data will be preserved)
    });
    console.log("LOOP FOR:");
    //for (j = 0; j < tableTds.length; j++) {

    for (i = 0; i < tableTds.length; i++) {
        if (i % 6 == 0) {
            console.log(`"${$(tableTds[i]).text()}" : { `);
            logger.write(`"${$(tableTds[i]).text()}" : { `);
            i++;
            counter++;
        }
        if (counter == 5) {
            console.log(`"${tableKey[counter]}" : "${$(tableTds[i]).text()}"`);
            logger.write(`"${tableKey[counter]}" : "${$(tableTds[i]).text()}"`);
        } else {
            console.log(`"${tableKey[counter]}" : "${$(tableTds[i]).text().replace(/["]+/g, "")}",`);
            logger.write(
                `"${tableKey[counter]}" : "${$(tableTds[i])
                    .text()
                    .replace(/["]+/g, "")}",`
            );
        }

        jsonDB.push(
            JSON.stringify(
                `"${tableKey[counter]}" : "${$(tableTds[i]).text()}",`
            )
        );
        counter++;
        if (counter > 5) {
            counter = 0;
            console.log(`} ,`);
            logger.write(`} ,`);
        }
    }

    //for (item in jsonDB) {
        //console.log(JSON.parse(jsonDB[item]));
    //}

    /*var fs = require("fs");
    var logger = fs.createWriteStream("log.txt", {
        flags: "a", // 'a' means appending (old data will be preserved)
    });
    for (item in jsonDB) {
        logger.write(JSON.parse(jsonDB[item])); // append string to your file
    }
    logger.end(); // close string*/
}
// pagina 54, atuald 6
/*
function run() {
    for (i = 1; i<54; i++) {
        main(i);
        console.log(i);
    }
}
run();*/
main();