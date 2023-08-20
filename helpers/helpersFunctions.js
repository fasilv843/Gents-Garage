
function getMonthName(monthNumber) {
    if (monthNumber < 1 || monthNumber > 12) {
        return "Invalid month number";
    }

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    return monthNames[monthNumber - 1];
}

module.exports = { getMonthName }