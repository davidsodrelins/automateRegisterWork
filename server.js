const config = require('./config');
const cors = require('cors'); 
const express = require('express');
const puppeteer = require('puppeteer-core');

const path = require('path');

const app = express();


app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json()); 


let isAutomatic = true; 
let loginRecords = [];

async function performLogin() {
    const browser = await puppeteer.launch({
        headless: true,
        executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe'
    });
    const page = await browser.newPage();

    try {
        await page.goto(config.sites.loginSite, { waitUntil: 'networkidle0' });

        await page.type('#ContentPlaceHolder1_TextBoxUsuario', config.login.cpf);
        await page.type('#ContentPlaceHolder1_TextBoxSenha', config.login.password);

        await Promise.all([
            page.click('#ContentPlaceHolder1_ButtonLogar'),
            page.waitForNavigation({ waitUntil: 'networkidle0' })
        ]);

        await page.goto(config.sites.checkoutSite, { waitUntil: 'networkidle0' });



        
        const dateTime = await page.$eval('#divTime', el => el.textContent);
        const [date, time] = dateTime.split('  ');

        await page.click('input[value="Marcar"]');
        await page.waitForSelector('#ContentPlaceHolder1_MensagemInformacao', { timeout: 5000 });

        const modalText = await page.$eval('#ContentPlaceHolder1_LabelInformacao', el => el.textContent);

        await browser.close();

        return {
            status: "Registro com sucesso!",
            message: `${modalText}. Data e hora do registro: ${date} ${time}`
        };
    } catch (error) {
        await browser.close();
        return { status: "Error", message: error.message };
    }
}

async function performEspelho() {
    const browser = await puppeteer.launch({
        headless: true,
        executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe'
    });
    const page = await browser.newPage();

    try {
        await page.goto(config.sites.loginSite, { waitUntil: 'networkidle0' });
        await page.type('#ContentPlaceHolder1_TextBoxUsuario', config.login.cpf);
        await page.type('#ContentPlaceHolder1_TextBoxSenha', config.login.password);

        await Promise.all([
            page.click('#ContentPlaceHolder1_ButtonLogar'),
            page.waitForNavigation({ waitUntil: 'networkidle0' })
        ]);

        await page.goto(config.sites.espelho, { waitUntil: 'networkidle0' });

        const results = await page.evaluate(() => {
            function extractTimeData() {
                const rows = document.querySelectorAll("#ConteudoB_Registros table tbody tr");
                const result = [];

                rows.forEach(row => {
                    const dateElement = row.querySelector(".Marcacaoes_Data input");
                    const dayOfWeekElement = row.querySelector(".Marcacaoes_SemanaA");
                    let rowData = [];

                    if (dateElement) {
                        const dateValue = dateElement.value;
                        const dayOfWeek = dayOfWeekElement ? dayOfWeekElement.textContent.trim() : "";
                        rowData.push(dayOfWeek, dateValue);

                        const timeElements = Array.from(row.querySelectorAll('.abcder input[type="button"]'))
                            .filter(btn => btn.value.match(/^\d{2}:\d{2}$/));

                        const labelElements = Array.from(row.querySelectorAll('.abcder input[type="button"]'))
                            .filter(btn => btn.value.length === 1);

                        if (timeElements.length) {
                            if (timeElements.length % 2 !== 0) {
                                rowData.push('Batidas faltando!', 'NaNh NaNm', 'NaNm');
                            } else {
                                let totalMinutes = 0;

                                for (let i = 0; i < timeElements.length; i += 2) {
                                    const start = timeElements[i].value.split(':').map(Number);
                                    const end = (timeElements[i + 1] && timeElements[i + 1].value.split(':').map(Number)) || [0, 0];

                                    const startTime = start[0] * 60 + start[1];
                                    const endTime = end[0] * 60 + end[1];

                                    totalMinutes += (endTime - startTime);
                                }

                                const hours = Math.floor(totalMinutes / 60);
                                const minutes = totalMinutes % 60;

                                rowData.push(`${timeElements.length} Batidas`, `${hours}h ${minutes}m`, `${totalMinutes}m`);

                                timeElements.forEach(time => rowData.push(time.value));
                            }
                        } else if (labelElements.length) {
                            let labelsConcatenated = labelElements.map(btn => btn.value).join('');
                            if (labelsConcatenated === "COMPENSA") {
                                labelsConcatenated = "COMPENSADO";
                            }
                            rowData.push(labelsConcatenated, '0h 0m', '0m');
                        } else {
                            rowData.push('NaNh NaNm', '0h 0m', '0m');
                        }

                        result.push(rowData);
                    }
                });

                return result;
            }
            return extractTimeData();
        });

        await browser.close();
        return results;

    } catch (error) {
        await browser.close();
        throw error;
    }
}

app.get('/currentDayRecords', async (req, res) => {
    const browser = await puppeteer.launch({
        headless: true,
        executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe'
    });
    const page = await browser.newPage();

    try {
        await page.goto(config.sites.loginSite, { waitUntil: 'networkidle0' });
        await page.type('#ContentPlaceHolder1_TextBoxUsuario', config.login.cpf);
        await page.type('#ContentPlaceHolder1_TextBoxSenha', config.login.password);

        await Promise.all([
            page.click('#ContentPlaceHolder1_ButtonLogar'),
            page.waitForNavigation({ waitUntil: 'networkidle0' })
        ]);

        await page.goto(config.sites.espelho, { waitUntil: 'networkidle0' });

        
        const today = new Date();
        const formattedToday = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;

        const todayRecords = await page.evaluate((formattedToday) => {
            const rows = document.querySelectorAll('#ConteudoB_Registros tr');
            const records = [];

            for (let row of rows) {
                const dateElement = row.querySelector('.Marcacaoes_Data input[type="button"]');
                if (dateElement && dateElement.value === formattedToday) {
                    const timeElements = Array.from(row.querySelectorAll('.abcder input[type="button"]'))
                        .filter(btn => btn.value.match(/^\d{2}:\d{2}$/));
                    for (let timeEl of timeElements) {
                        records.push(timeEl.value);
                    }
                    break;  
                }
            }
            return records;
        }, formattedToday);

        res.json(todayRecords);
    } catch (error) {
        await browser.close();
        res.status(500).send({ status: "Error", message: error.message });
    }
});

app.post('/login', async (req, res) => {
    const result = await performLogin();
    res.json(result);
});

app.get('/records', (req, res) => {
    
    
    res.json(loginRecords);
});


app.get('/espelho', async (req, res) => {
    try {
        const result = await performEspelho();
        res.json(result);
    } catch (error) {
        res.status(500).send({ status: "Error", message: error.message });
    }
});


function getRandomMinute(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

let lastMinuteFor12 = null;

async function checkTime() {
    if (!isAutomatic) {
        return;  
    }

    if (isAutomatic) {
        const currentTime = new Date();
        const currentHour = currentTime.getHours();
        const currentMinute = currentTime.getMinutes();

        let shouldLogin = false;

        
        try {
            const todayRecords = await performEspelho();

            
            if (todayRecords.length >= 4) {
                return;
            }

            switch (currentHour) {
                case 8:
                    if (currentMinute >= 29 && currentMinute <= 55 && !todayRecords.includes("08:" + currentMinute)) {
                        shouldLogin = true;
                    }
                    break;
                case 12:
                    if (currentMinute >= 1 && currentMinute <= 14 && !todayRecords.includes("12:" + currentMinute)) {
                        lastMinuteFor12 = currentMinute; 
                        shouldLogin = true;
                    }
                    break;
                case 13:
                    if (lastMinuteFor12 !== null) {
                        
                        const addedMinutes = 1 + Math.floor(Math.random() * 4); 
                        if (currentMinute === lastMinuteFor12 + addedMinutes && !todayRecords.includes("13:" + currentMinute)) {
                            shouldLogin = true;
                        }
                    }
                    break;
                case 18:
                    if (currentMinute >= 0 && currentMinute <= 37 && !todayRecords.includes("18:" + currentMinute)) {
                        shouldLogin = true;
                    }
                    break;
            }
        } catch (error) {
            console.error("Erro ao buscar registros do dia:", error);
        }

        if (shouldLogin) {
            
            performLogin();
        }
    }

    
    setTimeout(checkTime, 30000); 
}
checkTime(); 

app.get('/setMode/:mode', (req, res) => {
    const mode = req.params.mode;

    if (mode === "automatico") {
        isAutomatic = true;
        checkTime();  
    } else if (mode === "manual") {
        isAutomatic = false;
    }

    console.log(isAutomatic);
    res.redirect('/'); 
});


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
    res.render('login');
});



app.listen(8081, () => {
    console.log('Server started on http://localhost:8081');
});
