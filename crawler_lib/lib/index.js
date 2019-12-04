const puppeteer = require('puppeteer');
const { PendingXHR } = require('pending-xhr-puppeteer');
const fs = require('fs')


class Crawler{

    async loadBrowser(){
        console.log("Carregando browser...")
        const browser = await puppeteer.launch({
            args: ["--ignore-certificate-errors", "--no-sandbox", "--disable-setuid-sandbox",   "--disable-dev-shm-usage", "--start-fullscreen"],
            ignoreHTTPSErrors: true
        });

        return browser
    }
    
    async loadNewPage(browser){
        console.log("Carregando page...\n")
        const page = await browser.newPage();

        return page
    }

    async loginAnatel(page, user, password, homePage){

        const pendingXHR = new PendingXHR(page);

        var listElementsIdAuth = []
        var idSelectorLogin = ""
        var idSelectorPassword = ""

        async function getIdsAuth(){
            for (let index = 0; index < listElementsIdAuth.length; index++) {
                if(listElementsIdAuth[index].indexOf("UserNameInput") > -1)
                    idSelectorLogin = "#"+listElementsIdAuth[index]
                if(listElementsIdAuth[index].indexOf("PasswordInput") > -1)
                    idSelectorPassword = "#"+listElementsIdAuth[index]
            }
        }

        try{
            await page.goto(homePage);
            await pendingXHR.waitForAllXhrFinished();

            listElementsIdAuth = await page.evaluate(() => {
                var arrayForm = $("form")
                var listIdElements = []
                if(arrayForm.length >= 1 ){
                    for (let i = 0; i < arrayForm.length; i++) {
                        var theForm = arrayForm[i];
                        for (let index = 0; index < theForm.length; index++) {
                            listIdElements.push(theForm[index].id)
                        }
                    }
                    if (listIdElements.length < 1){
                        console.log("Nao foi identificado nenhum ID...")
                    }
                    else{
                        return listIdElements
                    }
                }else{
                    console.log("Nao foi identificado nenhum formulario na pagina...")
                }
            });

            await getIdsAuth()

            console.log("Logando na Anatel")

            await page.waitForSelector(idSelectorLogin)
            await page.type(idSelectorLogin, user)

            await page.waitForSelector(idSelectorPassword)
            await page.type(idSelectorPassword, password)

            await page.keyboard.press('Enter');

            await pendingXHR.waitForAllXhrFinished();

        } catch (error) {
            throw error
        }
        console.log("Logado com sucesso... \n")
    }

    async goToPage(page, url){
        console.log("Carregando Pagina...")
        const pendingXHR = new PendingXHR(page);

        await page.goto(url);
        await pendingXHR.waitForAllXhrFinished();
    }

    removeFile(filePath) {
        if(filePath.length) {
            console.log(`Removendo arquivo: ${filePath} \n`)
            fs.unlinkSync(filePath)
        }else{
            console.log("Nenhum arquivo encontrado nestre dir : "+ filePath)
        }
    }
    
    findFileExtension(path, extension) {
        console.log("Procurando arquivo no diretorio : " + path + ". Com a extencao: " + extension)
        return fs.readdirSync(path).filter(fn => fn.endsWith(extension))
    }

    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

}

module.exports = {
  Crawler
}