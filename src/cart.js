// const API = 'http://localhost:3000';
const API = 'https://pc-shop-api.herokuapp.com';
class Cart {
    constructor() {
        this.http = new HTTP();
        this.cartUI = new CartUI(this);
        this.globe_total = 0;
        this.AllItems;
    }

    // Add a new item (an item ID)to the local storage
    addItem(id, quantity) {
        let itemList = this.getItemList();

        // If an item is already exists in the cart increments its quantity
        let found = false;
        itemList.forEach((item) => {
            if (item.id === id) {
                item.quantity += quantity
                found = true;
            }
        });

        if (!found) {
            itemList.push({ id, quantity });
        }

        localStorage.setItem('cart', JSON.stringify(itemList));
    }


    // Remove an item from the local storage
    removeItem(itemId) {
        let itemList = this.getItemList();

        itemList = itemList.filter((item) => {
            if (item.id === itemId) {
                return false;
            }

            return true;
        })


        localStorage.setItem('cart', JSON.stringify(itemList));
    }

    // Get item list from local storage
    getItemList() {
        let itemList;
        if (localStorage.getItem('cart') == null) {
            itemList = [];

        } else {
            itemList = JSON.parse(localStorage.getItem('cart'));
        }
        return itemList;
    }

    clearCart() {
        localStorage.removeItem('cart');
    }

    // Returns formatted values
    getFormattedPrice(value) {
        return this.cartUI.getFormattedPrice(value);
    }


    // Generate the card UI

    buildCart() {
        // get the cart items from lc and all items details from api then pass them to CartUI to make GUI
        // Only executes once - fetch and store all data locally
        if (!this.AllItems) {
            this.http.get(`${API}/items`)
                .then((data) => {
                    this.AllItems = data;

                    // Remove main part
                    document.querySelector('.most-main-container').classList.add('hidden-main');
                    this.cartUI.makeCart(data, this.getItemList());

                });

        } else {
            document.querySelector('.most-main-container').classList.add('hidden-main');
            this.cartUI.makeCart(this.AllItems, this.getItemList());
        }


    }

    getTotal(shopItems) {
        let total = 0;
        const cartItems = this.getItemList();

        // find only user selected items and details and add quantity attribute then create new array
        shopItems.forEach((shopItem) => {
            cartItems.forEach(cartItem => {
                if (shopItem.id == cartItem.id) {
                    // Caclulate the total
                    const actualPrice = shopItem.offer ? shopItem.price * 0.9 : shopItem.price;
                    total += actualPrice * cartItem.quantity;
                }
            });
        });
        this.globe_total = total;
        return total;
    }

    // set Cart valur
    setCartValue(value) {
        this.cartUI.setCartValue(this.cartUI.getFormattedPrice(value));
    }
}


class CartUI {
    constructor(cart) {
        this.cart = cart;
        this.topSectionUI = document.querySelector('.top-section');
        this.setEventListners(cart);
        this.cartButtonUI = '.cart-btn';
        this.cartValueUI = '#cart-value'
    }

    //  Formats Prices with space and commas
    getFormattedPrice(value) {
        let formattedValue = '';

        if (value == 0) {
            formattedValue = '0';
        } else {
            while (value > 1000) {
                let rem = value % 1000;
                if (value / 1000 > 1) {
                    value = Math.floor(value / 1000);
                } else {
                    value = value / 1000;
                }

                if (value > 0 && rem === 0) {
                    let temp = '000';
                    formattedValue = temp + ' ' + formattedValue;
                } else {
                    if (value >= 1 && rem < 100) {
                        let temp = String(rem);
                        formattedValue = '0' + temp + ' ' + formattedValue;
                    } else {
                        let temp = String(rem);
                        formattedValue = temp + ' ' + formattedValue;
                    }
                }
            }

            if (value > 0) {
                let temp = String(value);
                formattedValue = temp + ' ' + formattedValue;
            }
            // Need this if you want , 
            // formattedValue = formattedValue.slice(0, formattedValue.length - 2);
        }
        // console.log("formatted value: ", formattedValue);
        return formattedValue;
    }

    // set the value of the cart
    setCartValue(value) {
        document.querySelector(this.cartValueUI).textContent = `${value} LKR`;

    }

    makeCart(shopItems, cartItems) {
        let total = 0;
        let items = [];

        // Remove previous cart UIs if there are any
        if (document.querySelector('.cart-container')) {
            document.querySelector('.cart-container').remove();
        }

        // find only user selected items and details and add quantity attribute then create new array
        shopItems.forEach((shopItem) => {
            cartItems.forEach(cartItem => {
                if (shopItem.id == cartItem.id) {
                    // Create a news object  (shop item details + quantity)
                    const newItem = shopItem;
                    newItem.quantity = cartItem.quantity;
                    items.push(newItem)
                        // Caclulate the total
                    const actualPrice = newItem.offer ? newItem.price * 0.9 : newItem.price;
                    total += actualPrice * cartItem.quantity;
                }
            });
        });

        this.getFormattedPrice(total);
        // Create div
        const cartUI = document.createElement('div');
        cartUI.className = 'cart-container';

        let cartUIInside = `
        <div class="cart-top">
        <i class="fa-solid fa-circle-xmark cart-close"></i>
        <h1>Quatation</h1>
        <div class="total">Total:\t ${this.getFormattedPrice(total)} LKR</div>
        <hr></hr>
        </div>

        <div class="cart-body">
        `;

        //${total}


        items.forEach(item => {
            let actualUnitPrice = item.offer ? item.price * 0.9 : item.price;
            let actualPrice = actualUnitPrice * item.quantity;

            cartUIInside += `
            <div class="cart-item" id="${item.id}">
            <div class="cart-image" style="background-image: url('${item.image}')"></div>
            <div class="cart-info">
                <p>${item.name}</p>
                <small>${item.type}</small>
                <br>
                
                <small>${this.getFormattedPrice(actualUnitPrice)} LKR</small>
            </div>

            <div class="increse-decrease-amount">
                <i class="fa-solid fa-minus cart-less"></i> ${item.quantity}
                <i class="fa-solid fa-plus cart-more"></i>
            </div>

            <div class="item-price">
                ${this.getFormattedPrice(actualPrice)} LKR
            </div>
        </div>
            `;

        });
        //${actualUnitPrice}
        //${actualPrice}

        cartUIInside += `
            </div>
        `

        cartUI.innerHTML = cartUIInside;
        document.querySelector('body').insertBefore(cartUI, this.topSectionUI);
        // document.querySelector('.temp').appendChild(cartUI);

        this.globe_total = total;
    }


    setEventListners(that) {
        // To quantity increase button
        document.querySelector('body').addEventListener('click', (e) => {
            if (e.target.classList.contains('cart-less')) {

                // Decrese quantity only if quantity is more than 1

                // Get item id and update the storage
                const itemID = parseInt(e.target.parentElement.parentElement.id);
                this.cart.addItem(itemID, -1)

                if (parseInt(e.target.parentElement.textContent) <= 1) {
                    this.cart.removeItem(itemID);

                }
                this.cart.buildCart()

            }
        });

        // To quantity decrease button
        document.querySelector('body').addEventListener('click', (e) => {
            if (e.target.classList.contains('cart-more')) {
                // Get item id and update the storage
                const itemID = parseInt(e.target.parentElement.parentElement.id);
                this.cart.addItem(itemID, 1)

                // Update the UI
                this.cart.buildCart();


            }
        });


        // To close button
        document.querySelector('body').addEventListener('click', (e) => {
            if (e.target.classList.contains('cart-close')) {
                document.querySelector('.cart-container').remove();
                setTimeout(() => {
                    document.querySelector('.most-main-container').classList.remove('hidden-main');
                }, 1);

                document.querySelector('#cart-value').textContent = `${this.getFormattedPrice(this.globe_total)} LKR`;
                //this.globe_total


            }
        });


        // To cart button
        // Set Shopping cart display button
        const shoppingCartBtnUI = document.querySelector('.cart-btn');
        shoppingCartBtnUI.addEventListener('click', makeShoppingCart)


        function makeShoppingCart() {
            that.buildCart();
        }
    }
}