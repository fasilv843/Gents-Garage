        //Validations
        const brandErr = document.getElementById('brandErr')
        const nameErr = document.getElementById('nameErr')
        const descriptionErr = document.getElementById('descriptionErr')
        const quantityErr = document.getElementById('quantityErr')
        const priceErr = document.getElementById('priceErr')
        const dpriceErr = document.getElementById('dpriceErr')
        const imageErr = document.getElementById('imageErr')

        // function validateImage(){
        //     const images = document.getElementById('image')
        // }

        function validateBrand(){
            const brand = document.getElementById('brand').value.trim()

            if(brand.length === 0){
                brandErr.innerHTML = 'Brand Name required';
                return false
            }else{
                brandErr.innerHTML = ''
            }

            return true;
        }

        function validateName(){
            const name = document.getElementById('name').value.trim()

            if(name.length === 0){
                nameErr.innerHTML = 'Product Name required';
                return false
            }else{
                nameErr.innerHTML = ''
            }

            return true;
        }

        function validateDescription(){
            const description = document.getElementById('description').value.trim()

            if(description.length === 0){
                descriptionErr.innerHTML = 'Description required';
                return false
            }else{
                descriptionErr.innerHTML = ''
            }

            return true;
        }

        function validateQuantity(){
            const quantity = document.getElementById('quantity').value.trim()

            if(quantity <= 0){
                quantityErr.innerHTML = 'Quantity required';
                return false
            }else if(quantity > 1000){
                quantityErr.innerHTML = 'Quantity must be less than 1000';
                return false
            }else{
                quantityErr.innerHTML = ''
            }

            return true;
        }

        function validatePrice(){
            const price = document.getElementById('price').value.trim()

            if(price <= 0 ){
                priceErr.innerHTML = 'Price cannot be a negative number or zero';
                return false
            }else if(price < 500){
                priceErr.innerHTML = 'Price must be greater than 500';
                return false
            }else if(price > 10000){
                priceErr.innerHTML = 'Price must be less than 10000';
                return false
            }else{
                priceErr.innerHTML = ''
            }

            return true;
        }

        function validateDiscoundPrice(){
            const price = document.getElementById('price').value.trim()
            const dprice = document.getElementById('dprice').value.trim()

            if(dprice < 0 ){
                dpriceErr.innerHTML = 'Discount Price cannot be a negative number';
                return false
            }else if((price - dprice) < 100){
                dpriceErr.innerHTML = 'Purchase Price must be greater than 100';
                return false
            }else if(dprice > 8000){
                dpriceErr.innerHTML = 'Discount Price must be less than 8000';
                return false
            }else{
                dpriceErr.innerHTML = ''
            }

            return true;

        }

        function validateImage(){


            return true;
        }

        function validateProduct(){
            return ( 
                validateBrand() && 
                validateName() &&
                validateDescription() &&
                validateQuantity() &&
                validatePrice() &&
                validateDiscoundPrice()
            );
        }
