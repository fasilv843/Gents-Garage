const fromDateError = document.getElementById('fromDateErr')
const toDateError = document.getElementById('toDateErr')


function validateSalesDate(){

    const fromDate = document.getElementById('fromDate').value
    const toDate = document.getElementById('toDate').value

    if(!fromDate || !toDate){
        toDateError.innerHTML = 'Dates are required'
        return false
    }
    
    if(fromDate > new Date() || fromDate >= toDate ){
        toDateError.innerHTML = 'Select Valid Dates';
        return false
    }
    
    toDateError.innerHTML = '';
    return true;
}