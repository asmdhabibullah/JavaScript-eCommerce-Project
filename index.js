import "./app.sass";
import "@babel/polyfill";

const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');

const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartContentDOM = document.querySelector('.cart-content');
const cartTotalAmounts = document.querySelector('.cart-total-amounts')
const cartTotalItems = document.querySelector('.cart-total-items');
const productsDOM = document.querySelector('.products-center');


// Cart Items
let cart = [];

// Buttons DOM
let buttonsDOM = [];

// Get Products in API

class Products {
    async getProducts() {
        try {
            let result = await fetch("products.json");
            let data = await result.json();
            let products = data.items;
            products = products.map(product => {
                const { id } = product.sys;
                const { title, price } = product.fields;
                const image = product.fields.image.fields.file.url;
                return { id, title, price, image }
            });
            return products
        }
        catch (error) {
            console.log(error);
        }
    }
}


// Display App Products

class UI {
    displayProduct(products) {
        let result = '';
        products.forEach(product => {
            result += `
            <article class="product">
                <div class="img-container">
                    <img src=${product.image} alt="Product" class="product-img">
                    <button class="bag-btn" data-id=${product.id}>
                        <i class="fas fa-shopping-cart"></i>
                        Add to cart
                    </button>
                </div>
                <h3>${product.title}</h3>
                <h4>$${product.price}</h4>
            </article>
            `
        });
        productsDOM.innerHTML = result
    }
    getBackBtn() {
        let buttons = [...document.querySelectorAll('.bag-btn')];
        buttonsDOM = buttons;

        buttons.forEach(button => {
            let id = button.dataset.id;
            let inCart = cart.find(product => product.id === id);
            if (inCart) {
                button.innerText = 'In Cart';
                button.disabled = true
            }
            button.addEventListener('click', event => {
                event.target.innerText = 'In Cart'
                event.target.disabled = true

                // Get products
                let cartItems = { ...LocalStorage.getProductsFromLocalStore(id), totalItems: 1 }

                // Add products in cart
                cart = [...cart, cartItems]

                // Save cart items in local stoar
                LocalStorage.setCardItemsInLocal(cart);
                // Set cart values
                this.setCartValues(cart);
                // Display cart item
                this.cartItemsDisply(cartItems)

            })
        });
    };
    setCartValues(cart) {
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item => {
            tempTotal += item.price * item.totalItems;
            itemsTotal += item.totalItems;
        })
        cartTotalItems.innerText = itemsTotal;
        cartTotalAmounts.innerText = parseFloat(tempTotal.toFixed(2));
    };
    cartItemsDisply(items) {
        let cartItem = document.createElement('div');
        cartItem.classList.add('cart-item')
        cartItem.innerHTML = `
            <img src=${items.image}>
            <div class="">
                <h4>${items.title}</h4>
                <h5>$${items.price}</h5>
                <span class="remove-item">Remove</span>
            </div>
            <div class="">
                <i class="fas fa-chevron-up"></i>
                <p class="item-amount">${items.totalItems}</p>
                <i class="fas fa-chevron-down"></i>
            </div>
        `
        cartContentDOM.appendChild(cartItem);
    };
    populateCart(cart) {
        cart.forEach(items => this.cartItemsDisply(items))
    }
    cartShow() {
        cartOverlay.classList.add('overlayVV');
        cartDOM.classList.add('cartTT')
    }

    hideCard() {
        cartOverlay.classList.remove('overlayVV');
        cartDOM.classList.remove('cartTT')
    };

    setupAPP() {
        cart = LocalStorage.getCart()
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener('click', this.cartShow);
        closeCartBtn.addEventListener('click', this.hideCard);
    };

    cartLogic() {
        clearCartBtn.addEventListener('click', () => {
            this.clearCart();
        });
        cartContentDOM.addEventListener('click', event => {
            if (event.target.classList.contains('remove-item')) {
                let removeItem = event.target;
                let id = removeItem.dataset.id;
                console.log(id);

                cartContentDOM.removeChild(removeItem.parentElement.parentElement);
                this.removeItem(id)
            }
            else if (event.target.classList.contains('fa-chevron-up')) {
                let addAmount = event.target;
                let id = addAmount.dataset.id;

            }

        })

    };
    clearCart() {
        let cartItems = cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id));
        console.log(cartItems);

        while (cartContentDOM.children.length > 0) {
            cartContentDOM.removeChild(cartContentDOM.children[0])
        };
        this.hideCard();
    }

    removeItem(id) {
        cart = cart.filter(item => item.id !== id);
        this.setCartValues(cart);
        LocalStorage.setCardItemsInLocal(cart);
        let sigButton = this.getSingleButtons(id)
        sigButton.disabled = false;
        sigButton.innerHTML = `<i class="fas fa-shoping-card"></> add to card`;
    }
    getSingleButtons(id) {
        return buttonsDOM.find(button => button.dataset.id === id)
    }
}



// Local Storage

class LocalStorage {
    static storeProductsInLocal(products) {
        localStorage.setItem("Products", JSON.stringify(products));
    };
    static getProductsFromLocalStore(id) {
        let products = JSON.parse(localStorage.getItem("Products"));
        return products.find(product => product.id === id);
    };
    static setCardItemsInLocal(cart) {
        localStorage.setItem('CartItems', JSON.stringify(cart));
    };
    static getCart() {
        return localStorage.getItem('CartItems') ? JSON.parse(localStorage.getItem('CartItems')) : []
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI();
    const products = new Products();

    // Setup APP
    ui.setupAPP()

    // Get App Products
    products.getProducts()
        .then(products => {
            ui.displayProduct(products);
            LocalStorage.storeProductsInLocal(products)
        })
        .then(
            () => {
                ui.getBackBtn();
                ui.cartLogic();
            }
        );
})