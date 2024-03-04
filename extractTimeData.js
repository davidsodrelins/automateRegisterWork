function extractTimeData() {
    const rows = document.querySelectorAll('#ConteudoB_Registros tr');
    const result = [];

    rows.forEach(row => {
        const dateElement = row.querySelector('.Marcacaoes_Data input[type="button"]');
        const dayOfWeekElement = row.querySelector('.Marcacaoes_SemanaA');

        if (dateElement) {
            const dateValue = dateElement.value;
            const dayOfWeek = dayOfWeekElement ? dayOfWeekElement.textContent.trim() : "";

            const timeElements = Array.from(row.querySelectorAll('.abcder input[type="button"]'))
                .filter(btn => btn.value.match(/^\d{2}:\d{2}$/)); // filter out invalid or empty times
            
            const labelElements = Array.from(row.querySelectorAll('.abcder input[type="button"]'))
                .filter(btn => btn.value.length === 1); // filter buttons with single character labels
            
            if (timeElements.length) {
                if (timeElements.length % 2 !== 0) {
                    result.push(`${dayOfWeek} ${dateValue}: Batidas faltando!`);
                    return; // skip the rest of this loop iteration
                }

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

                result.push(`${dayOfWeek} ${dateValue}: ${hours}h ${minutes}m`);
            } else if (labelElements.length) {
                let labelsConcatenated = labelElements.map(btn => btn.value).join('');
                if(labelsConcatenated === "COMPENSA") {
                    labelsConcatenated = "COMPENSADO";
                }
                result.push(`${dayOfWeek} ${dateValue}: ${labelsConcatenated}`);
            } else {
                result.push(`${dayOfWeek} ${dateValue}: NaNh NaNm`); // if no valid times or labels are found
            }
        }
    });

    console.log(result.join('\n'));
}

extractTimeData();
