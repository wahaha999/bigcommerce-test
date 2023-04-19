import PageManager from '../page-manager';
import 'regenerator-runtime/runtime';

export default class AddRemoveProduct extends PageManager {
    constructor(context) {
        super(context);
        this.cart = null;
        this.productIDsFromCart = [];
        this.productItems = [];
        this.removableItems = [];
        this.addAllProductsToCart = this.addAllProductsToCart.bind(this);
        this.removeAllItems = this.removeAllItems.bind(this);
        this.getCartAndProductsProperty = this.getCartAndProductsProperty.bind(this);
    }
    async getCartAndProductsProperty() {
        try {
            const options = {method: 'GET', headers: {'Content-Type': 'application/json'}};
            const response = await fetch(this.context.cartApiPrefixUrl, options);
            if (!response.ok) {
                throw new Error('Failed to fetch cart');
            }
            
           
            const cartData = await response.json();
            if (cartData.length > 0) {
                this.cart = cartData[0];
                const physicalIDs = this.cart.lineItems.physicalItems.map((item) => {
                    return { productId: item.productId, itemId: item.id}
                });
                const digitalIDs = this.cart.lineItems.digitalItems.map((item) => {
                    return { productId: item.productId, itemId: item.id}
                });
                this.productIDsFromCart = [...physicalIDs, ...digitalIDs];
            }
            const articleElems = document.querySelectorAll('article[data-test]');
            const productIds = Array.from(articleElems).map((articleElem) => {
                let dataTestValue = articleElem.getAttribute('data-test');
                return dataTestValue.match(/\d+/)[0];
            });
            this.productItems = productIds.map((productId) => {
               
                return {
                    productId: Number(productId),
                    quantity: 1,
                };
            });
            this.removableItems = this.productIDsFromCart.filter(item1 => this.productItems.some(item2 => item2.productId === item1.productId));
            if(this.removableItems.length){
                document.querySelector('.remove-all-items').style.display = "inline-block";
            }
        } catch (error) {
            alert('Error retrieving cart:', error);
        }
        

    }
    async addAllProductsToCart() {
        try {let options = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: `{"lineItems":${JSON.stringify(this.productItems)}}`
        };
        let url = this.context.cartApiPrefixUrl;
        if(this.cart && this.cart.id){
            url += `/${this.cart.id}/items`;
        }
        const result = await fetch(url, options);
        if (result.ok) {
            window.location.href = "/cart.php";
        }
        
    } catch (error) {
            alert(error)
        }
       
    }
    async removeAllItems () {
        try {
            let url = `${this.context.cartApiPrefixUrl}/${this.cart.id}/items`;
            let options = {method: 'DELETE', headers: {'Content-Type': 'application/json'}};
            for (const item of this.removableItems) {
                const result = await fetch(`${url}/${item.itemId}`, options);
                if (!result.ok) {
                    throw new Error('Failed to delete cart item');
                }
            }
            window.location.href = "/cart.php";
        } catch (error) {
           alert(error);
        }
    }

    async onReady() {
        await this.getCartAndProductsProperty();
        document.querySelector('.add-all-to-cart').addEventListener('click', this.addAllProductsToCart);
        document.querySelector('.remove-all-items').addEventListener('click', this.removeAllItems);
    }   
}