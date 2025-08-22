const axios = require('axios');
const express = require('express');
const cors = require('cors');


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
        const apiUrl = 'https://monitoratecnologia.atlassian.net/rest/internal/3/issue/SERASA-678/worklog?adjustEstimate=new&newEstimate=0m';

        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json,text/javascript,*/*',
            'Cookie': '__awc_tld_test__=tld_test; atl-bsc-consent-token-fallback=0031111010; atlassian.account.xsrf.token=353f48f5-a47f-43fa-a2e5-ce7c30e3391a; atlassian.xsrf.token=06f7dd2d4cbb9a96dac4ad467589e186f3be263e_lin; atl-sticky-version={"currentVersion":"mrjf-prod-15003","currentVersionExpiry":"1755723882382"}; JSESSIONID=A4BE2EA432449C50E0689C09EA841369; tenant.session.token=eyJraWQiOiJzZXNzaW9uLXNlcnZpY2UvcHJvZC0xNzM4Nzk0ODc0IiwiYWxnIjoiUlMyNTYifQ.eyJhc3NvY2lhdGlvbnMiOltdLCJzdWIiOiI2M2M2ZjM0YmIxMjYyNTg2NzA3YTRjZTIiLCJlbWFpbERvbWFpbiI6Im1vbml0b3JhdGVjLmNvbS5iciIsImltcGVyc29uYXRpb24iOltdLCJjcmVhdGVkIjoxNzU1NjI4MzA1LCJyZWZyZXNoVGltZW91dCI6MTc1NTYzMjk0MiwidmVyaWZpZWQiOnRydWUsImlzcyI6InNlc3Npb24tc2VydmljZSIsInNlc3Npb25JZCI6IjdlNTRlMmE3LWE1MzktNGU2OS1iM2FiLTk4Yzk3MGI4YzM1YSIsInN0ZXBVcHMiOltdLCJvcmdJZCI6IjQ5NmM0YzdjLWQ4NmItNDk5MC04YzBkLTcwMDMzMzU2MDMzOSIsImF1ZCI6ImF0bGFzc2lhbiIsIm5iZiI6MTc1NTYzMjM0MiwiZXhwIjoxNzU1NzE4NzQyLCJpYXQiOjE3NTU2MzIzNDIsImVtYWlsIjoiZGF2aWQuc2lsdmFAbW9uaXRvcmF0ZWMuY29tLmJyIiwianRpIjoiN2U1NGUyYTctYTUzOS00ZTY5LWIzYWItOThjOTcwYjhjMzVhIn0.UQMv29Dp7TE8hEC-CuqBD3F54FMdBkz8QoRfxMpFGQaKt358g_8nfKzGIhYgrgvq29wrLhyFT0jSW1yLQn2KjKAP4v5BQu6aTyVKeDiGsypRwtKxuDkZjp7MO2JXxLY64iCF8MA2bsPWoQvroN_BtaBSnAUBnQdct7AUfGNU_5NRhfYl7U4mJZMXcHAPIwXeYg5CZlmEl_9d-UhiPL3NUXfEV65V9X5r6-FfUfpOmQ80aJXXor_eAuGZQYBxLL4eFxVHEbTLzrsi8ooAOHc6yBImUYomZddbFe_nU0j-rJMttVqdjdMwfL2SVrvIPM8tHVC-BJf879lzxXj6_VzfVw; atl-bsc-consent-token=0031111010; atl-bsc-show-banner=0',
            'Origin': 'https://monitoratecnologia.atlassian.net',
            'Referer': 'https://monitoratecnologia.atlassian.net/browse/SERASA-678',
            
        };
        for (const entry of entries) {
            const [date_str, time_str, task_str] = entry.split('#');
            
            const data = {
                "timeSpent": time_str,
                "comment": {
                    "version": 1,
                    "type": "doc",
                    "content": [
                        {
                            "type": "paragraph",
                            "content": [
                                {
                                    "type": "text",
                                    "text": task_str
                                }
                            ]
                        }
                    ]
                },
                "started": convert_date(date_str)
            };

            const response = await axios.post(apiUrl, data, { headers: headers });
            console.log(response)
                
        }

        res.status(200).json({ message: 'Todas as tarefas foram registradas no Jira!' });

    } catch (error) {
        console.error("Erro ao realizar a chamada:", error.message);

        res.status(500).json({ error: 'Falha ao realizar a chamada para o Atlassian. req ', req });
    }
});

app.listen(8082, () => {
    console.log('Server started on port 8082');
});
