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
        const apiUrl = 'https://monitoratecnologia.atlassian.net/rest/internal/3/issue/MONITORA-1109/worklog?adjustEstimate=new&newEstimate=0m';

        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json,text/javascript,*/*',
            'Cookie': 'atlassian.account.xsrf.token=6b10bc9b-016c-4db3-8c74-826034fa98cb; ajs_anonymous_id=%227a46c88d-feee-45a9-b9d2-0a26800bdf93%22; marketplace-launch-darkly=%7B%22userKey%22%3A%22a94c02aa-e4c7-462e-b93a-e34bf9c2a9e1%22%2C%22aaid%22%3A%2263c6f34bb1262586707a4ce2%22%7D; atlassian.xsrf.token=885f06241bab677838eda7e274c6d0cc547e8f2e_lin; io=8R13wZQLAmm6HwGmAH7B; JSESSIONID=-LPQLSix6MVihWhRVT1maxW-JZ284atf1vCWFAoP; tenant.session.token=eyJraWQiOiJzZXNzaW9uLXNlcnZpY2UvcHJvZC0xNTkyODU4Mzk0IiwiYWxnIjoiUlMyNTYifQ.eyJhc3NvY2lhdGlvbnMiOltdLCJzdWIiOiI2M2M2ZjM0YmIxMjYyNTg2NzA3YTRjZTIiLCJlbWFpbERvbWFpbiI6Im1vbml0b3JhdGVjLmNvbS5iciIsImltcGVyc29uYXRpb24iOltdLCJjcmVhdGVkIjoxNzA5MjA4MDYwLCJyZWZyZXNoVGltZW91dCI6MTcwOTIwODY4OCwidmVyaWZpZWQiOnRydWUsImlzcyI6InNlc3Npb24tc2VydmljZSIsInNlc3Npb25JZCI6IjQzYTY5ZDc5LTdmNGItNDMyNy05ZWY5LWYyOGY5YTU2NjM0ZSIsInN0ZXBVcHMiOltdLCJvcmdJZCI6IjQ5NmM0YzdjLWQ4NmItNDk5MC04YzBkLTcwMDMzMzU2MDMzOSIsImF1ZCI6ImF0bGFzc2lhbiIsIm5iZiI6MTcwOTIwODA4OCwiZXhwIjoxNzA5Mjk0NDg4LCJpYXQiOjE3MDkyMDgwODgsImVtYWlsIjoiZGF2aWQuc2lsdmFAbW9uaXRvcmF0ZWMuY29tLmJyIiwianRpIjoiNDNhNjlkNzktN2Y0Yi00MzI3LTllZjktZjI4ZjlhNTY2MzRlIn0.zVSCvvgLaq0IQ_ZP8bke-cGde0p-4oatWd9pOU-hi9_rOkdE6KM3iMLHYpIE8yVdnkOZedqqkaWG95X_r_3I0SVwWk6_f0a6R0HmOItcjOF9qjFWfYjC9tnKuDFawOanxd6feH-JhbZnwLthieRn744VVOPISrpAtfynxrJQbr2AMTm-TGCHtua5T3K0q7SdJcIjTeDpeA73NGZOYQu2j3-ezQzqIu11ORJq92ZZLwADEkL6WEYMpv-Azzo0aQf5xfhlhppKPXW4sH1ILalNoOdF_F9f9hOHBvg5f5TdcK54KM9G9S0Ykb8wq7LRL7V9Hh6xHteIl9eQCWIiHfybBA',  
            'Origin': 'https://monitoratecnologia.atlassian.net',
            'Referer': 'https://monitoratecnologia.atlassian.net/browse/MONITORA-1109',
            
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
