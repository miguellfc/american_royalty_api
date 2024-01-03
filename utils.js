export const toTimestamp = (date) => {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const hour = ('0' + date.getHours()).slice(-2);
    const minute = ('0' + date.getMinutes()).slice(-2);
    const second = ('0' + date.getSeconds()).slice(-2);

    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

export const datesOfMonth = () => {
    let prevMonth = new Date();
    let lastMonth = new Date();
    let actualMonth = new Date();
    let result = [];

    lastMonth.setMonth(lastMonth.getMonth() - 1);
    prevMonth.setMonth(prevMonth.getMonth() - 2);

    [prevMonth, lastMonth, actualMonth].forEach((date) => {
        const longMonth = [1, 3, 5, 7, 8, 10, 12].indexOf(date.getMonth() + 1) !== -1;

        date.setDate(1);
        const firstDay = structuredClone(date);

        if (longMonth) {
            date.setDate(31);
        } else if (date.getMonth() === 2){
            Math.floor(date.getFullYear() % 4) === 0
                ? date.setDate(29)
                : date.setDate(28)
        } else {
            date.getDate(30);
        }

        const lastDay = date;

        result.push({
            ini: toTimestamp(firstDay),
            fin: toTimestamp(lastDay)
        });
    });

    return result;
}