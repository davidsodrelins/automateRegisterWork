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
        const apiUrl = 'https://monitoratecnologia.atlassian.net/rest/internal/3/issue/SERASA-368/worklog?adjustEstimate=new&newEstimate=0m';

        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json,text/javascript,*/*',
            'Cookie': 'atlassian.account.xsrf.token=a22fe062-5ec6-4f38-a866-72b9c72652d8; atlassian.xsrf.token=67f53f2f30287890b426cf1e32489398069a6c83_lin; io=npsQhMs19698UW2kADQ_; ajs_anonymous_id=%22aea564f2-50bc-453f-9406-d367212d263a%22; cross.join.nudges.confluence.visited=true; tenant.session.token=eyJraWQiOiJzZXNzaW9uLXNlcnZpY2UvcHJvZC0xNTkyODU4Mzk0IiwiYWxnIjoiUlMyNTYifQ.eyJhc3NvY2lhdGlvbnMiOlt7ImFhSWQiOiI3MTIwMjA6MDQ5MDVmZjAtMDZiZi00ZDIyLWJiMjItNjk0N2JmM2M2OGVkIiwic2Vzc2lvbklkIjoiMDNhOTc5OTktYzZmNC00ZjY2LWJmZGEtNDRhMzllMjkyZmFkIiwiZW1haWwiOiJkYXZpZC5saW5zQGJhc2lzdGkuY29tLmJyIn1dLCJzdWIiOiI2M2M2ZjM0YmIxMjYyNTg2NzA3YTRjZTIiLCJlbWFpbERvbWFpbiI6Im1vbml0b3JhdGVjLmNvbS5iciIsImltcGVyc29uYXRpb24iOltdLCJjcmVhdGVkIjoxNzEwNDUxNTUxLCJyZWZyZXNoVGltZW91dCI6MTcxMDQ1Mjk5MiwidmVyaWZpZWQiOnRydWUsImlzcyI6InNlc3Npb24tc2VydmljZSIsInNlc3Npb25JZCI6IjQyZDM4ZjBhLTVjMzgtNDFlNC04YzJmLTNiMmU0YTRiNzkyYyIsInN0ZXBVcHMiOltdLCJvcmdJZCI6IjQ5NmM0YzdjLWQ4NmItNDk5MC04YzBkLTcwMDMzMzU2MDMzOSIsImF1ZCI6ImF0bGFzc2lhbiIsIm5iZiI6MTcxMDQ1MjM5MiwiZXhwIjoxNzEwNTM4NzkyLCJpYXQiOjE3MTA0NTIzOTIsImVtYWlsIjoiZGF2aWQuc2lsdmFAbW9uaXRvcmF0ZWMuY29tLmJyIiwianRpIjoiNDJkMzhmMGEtNWMzOC00MWU0LThjMmYtM2IyZTRhNGI3OTJjIn0.ff97RrH1RblDtuMh2S_8fsVVNxUpwTCnt4V26zIMcqK42hcalOeQ3Tnk13kpNDF-Su36fLhocOVy9r2EVNzjoQ69j_y-_syJYpvgOgaE6jN1XZrBFZ3Q3ZTRtzkPE0F3iMzffrV-UocikTV2_9IF32tuuIc11k6PYUevNHSCPRNA3pUbRtsoKKMHR5dJFfDdzGM7PXBTZCF76X8fylLGEFNJpfW5XTFFmS6EpR1_s2pM-2yNfDNpuvHx68CZmOfspBOSvRjk9gtuIXseSulxblMBIVdwUSJyn8Rc5d7pj2C6bSc10hv2esuZZzHrcATiddIYnEwdOV1dXYn21mPiMw; JSESSIONID=e4J-NRnscx0d71rTP2awlGpweZ8TbEU2VnBHiiKe',  
            'Origin': 'https://monitoratecnologia.atlassian.net',
            'Referer': 'https://monitoratecnologia.atlassian.net/browse/SERASA-234',
            
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
