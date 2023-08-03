
const catInput = document.getElementById('newCatName')
const catInputModal = document.getElementById('catName')

function validateCategory(){

  const newName = document.getElementById('newCatName').value.trim().toUpperCase()

  if(newName.length === 0){
    catInput.placeholder = 'Category required'
    catInput.style.borderColor = 'red'
    catInput.style.textDecorationColor = 'red' 
    return false;
  }


  return true
}

function validateModalCategory(){

const newName = document.getElementById('catName').value.trim().toUpperCase()

if(newName.length === 0){
  catInputModal.placeholder = 'Category required'
  catInputModal.style.borderColor = 'red'
  catInputModal.style.textDecorationColor = 'red' 
  return false;
}

return true
}
