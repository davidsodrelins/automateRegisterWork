const axios = require('axios');
const express = require('express');
const cors = require('cors');
const cookieSessin = "atlassian.account.xsrf.token=a22fe062-5ec6-4f38-a866-72b9c72652d8; io=npsQhMs19698UW2kADQ_; ajs_anonymous_id=%22aea564f2-50bc-453f-9406-d367212d263a%22; ajs_anonymous_id=%22aea564f2-50bc-453f-9406-d367212d263a%22; __awc_tld_test__=tld_test; __awc_tld_test__=tld_test; atl-bsc-consent-token-fallback=0031111010; atl-bsc-banner-dismissed-time=1734974475088; atlassian.xsrf.token=c2ad773ea46c5722e1ea4f18f7dc80b3f233c30e_lin; tenant.session.token=eyJraWQiOiJzZXNzaW9uLXNlcnZpY2UvcHJvZC0xNTkyODU4Mzk0IiwiYWxnIjoiUlMyNTYifQ.eyJhc3NvY2lhdGlvbnMiOltdLCJzdWIiOiI2M2M2ZjM0YmIxMjYyNTg2NzA3YTRjZTIiLCJlbWFpbERvbWFpbiI6Im1vbml0b3JhdGVjLmNvbS5iciIsImltcGVyc29uYXRpb24iOltdLCJjcmVhdGVkIjoxNzM2MTY3MzE2LCJyZWZyZXNoVGltZW91dCI6MTczNzM5Njc0NCwidmVyaWZpZWQiOnRydWUsImlzcyI6InNlc3Npb24tc2VydmljZSIsInNlc3Npb25JZCI6Ijc1NzhiNWU2LTY5OTgtNDE4Yy1hNTQzLTU3ODViMmYxMzg4MiIsInN0ZXBVcHMiOltdLCJvcmdJZCI6IjQ5NmM0YzdjLWQ4NmItNDk5MC04YzBkLTcwMDMzMzU2MDMzOSIsImF1ZCI6ImF0bGFzc2lhbiIsIm5iZiI6MTczNzM5NjE0NCwiZXhwIjoxNzM3NDgyNTQ0LCJpYXQiOjE3MzczOTYxNDQsImVtYWlsIjoiZGF2aWQuc2lsdmFAbW9uaXRvcmF0ZWMuY29tLmJyIiwianRpIjoiNzU3OGI1ZTYtNjk5OC00MThjLWE1NDMtNTc4NWIyZjEzODgyIn0.E8pFstGUcI1QpRDOClnxBoEPOQRnSoovNWnorW2G1wsN_bIojJYCcZcRD5Z0rWVTN1PCVUNAE-JTXKVKWmqMPNGx5Uv_2ycgHInRM_dDajHRXkXy6q4J4appOdqrp_8gMwQoylqWEqSE5QC4i61ijNIPVBkqYG18C0mYMDTaAbq7vG0tT9exRncM3cYuzoooAZgBtjZzXSwDydtGfeqFtM_aHVkw2WlmqEd5mZf8ASByoI0iJ_62x76H7r40h_s7L6Hldw33ZJH2V4BU-gikzSXGaN6dnGffaeToCCVs1hv9z_8krIOr7-3VFsOJsrzfor7JBG7bUDytGRnYlgZhhg; JSESSIONID=9mLP7nvr_BJ4Qp5y22W5pH4HeqmvP2yUqM4VJOvW";

const app = express();
app.use(cors());
app.use(express.json()); 

function convert_date(date_str) {
    const [day, month, year] = date_str.split('/');
    return `${year}-${month}-${day}T09:00:00.000-0300`;
}

app.post('/registro', async (req, res) => {
    try {
        const entries = req.body.entries;

        for (const entry of entries) {
            const [date_str, time_str, task_str, card] = entry.split('#');
            console.log(date_str, time_str, task_str, card);

            const apiUrl = `https://monitoratecnologia.atlassian.net/rest/api/2/issue//${card}/worklog?adjustEstimate=new&newEstimate=0m`;
                        //  https://monitoratecnologia.atlassian.net/rest/api/2/issue/CORURIPE-69/worklog?adjustEstimate=auto&_r=1737395953240
                        //  https://monitoratecnologia.atlassian.net/rest/api/2/issue/CORURIPE-188/worklog?adjustEstimate=new&newEstimate=0h&_r=1737396217139


            const headers = {
                'Content-Type': 'application/json;charset=UTF-8',
                'Accept': 'application/json,text/javascript,*/*',
                'Cookie': cookieSessin,
                'Origin': 'https://monitoratecnologia.atlassian.net',
                'Referer': `https://monitoratecnologia.atlassian.net/jira/software/c/projects/CORURIPE/boards/249?selectedIssue=${card}`,
                //https://monitoratecnologia.atlassian.net/jira/software/c/projects/CORURIPE/boards/249?selectedIssue=CORURIPE-188

            };

            const data = {
                comment: task_str,
                started: convert_date(date_str),
                timeSpentSeconds: parseInt(time_str) * 60,
                visibility: null,
            };

            try {
                const response = await axios.post(apiUrl, data, { headers });
                console.log(`Registro enviado para o card ${card}:`, response.data);
            } catch (axiosError) {
                console.error(`Erro ao registrar entrada no card ${card}:`, axiosError.response?.data || axiosError.message);
            }
        }

        res.status(200).json({ message: 'Todas as tarefas foram registradas no Jira!' });
    } catch (error) {
        console.error("Erro ao realizar a chamada:", error.message);
        // Evita enviar o objeto `req` para o cliente
        res.status(500).json({
            error: 'Falha ao realizar a chamada para o Atlassian.',
            message: error.message,
        });
    }
});


app.listen(8083, () => {
    console.log('Server started on port 8083');
});
