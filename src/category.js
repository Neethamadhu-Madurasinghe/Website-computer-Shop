class UI {
    constructor(cart) {
        this.uiElements = {
                componentBodyUI: '.component-body',
                controllersUI: '.controllers',
                deviceCardUI: '.device-card',
                slideMinUI: '#slide-min',
                slideMaxUI: '#slide-max',
                slideMinLabelUI: '#slide-min-label',
                slideMaxLabelUI: '#slide-max-label',
                componentTitleUI: '.component-title',
                toastUI: '#toasts',

                brandNameSelectorUI: '.by-brand'

            }
            // Minimum and max price 
        this.minPrice = null;
        this.maxPrice = 0;
        this.cart = cart;

        this.app = null;
        this.brandNames = new Set();

        this.category = document.querySelector('#title-holder').value;
    }

    // set cart object
    setAppObject(app) {
        this.app = app;
    }


    // Return UI elements
    getUIElements() {
        return this.uiElements;
    }

    // make a notification
    createNotification(message) {
        const toast = document.createElement('div');
        toast.classList.add('toast');
        toast.innerText = message;
        document.querySelector(this.uiElements.toastUI).appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = 0;
        }, 2000);
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }


    // Fill the main area with cards
    fillMain(shopItems) {
        // Remove any previouse values
        let prevCardsUI = document.querySelectorAll('.device-card');
        prevCardsUI = Array.from(prevCardsUI);
        prevCardsUI.forEach(prevCardUI => prevCardUI.remove());

        // Set Title
        document.querySelector(this.uiElements.componentTitleUI).textContent = this.category;

        // Find only GPU/CPU  
        shopItems = shopItems.filter(shopItem => shopItem.type == this.category ? true : false);

        shopItems.forEach(shopItem => {
            // Update Brand Names
            this.brandNames.add(shopItem.brand);
            // Update maxValue
            if (this.maxPrice < shopItem.price) {
                this.maxPrice = shopItem.price;
            }

            const deviceCard = document.createElement('div');
            deviceCard.className = 'device-card';
            deviceCard.id = `${shopItem.id}`;
            const price = shopItem.offer ? shopItem.price * 0.9 : shopItem.price;
            let output = '';
            output += `
            <div class="device-card-top">
                <div class="device-image" style="background-image: url('${shopItem.image}')"></div>
                <h2>${shopItem.name}</h2>
                <h4>${shopItem.type}</h4>
            </div>
            <div class="device-card-bottom">
                <p>${this.cart.getFormattedPrice(price)} LKR</p>
            `;

            //${price}

            if (shopItem.offer) {
                output += `<small>(${this.cart.getFormattedPrice(shopItem.price)} LKR)</small>`
            }
            //${shopItem.price}

            output += `
                <i class="fa-solid fa-circle-plus add-cart"></i>
                </div>

            `
            deviceCard.innerHTML = output;
            document.querySelector(this.uiElements.componentBodyUI).append(deviceCard);
        });


        // At the end make filters - only once
        if (this.minPrice == null) {
            // set minimum pirce first
            this.minPrice = 0;

            document.querySelector(this.uiElements.slideMinUI).max = this.maxPrice;
            document.querySelector(this.uiElements.slideMaxUI).max = this.maxPrice;
            document.querySelector(this.uiElements.slideMaxUI).value = this.maxPrice;

            document.querySelector(this.uiElements.slideMaxLabelUI).textContent = `Maximum Price: ${this.cart.getFormattedPrice(this.maxPrice)} LKR`;
            //${this.maxPrice}

            this.app.setMinMax(this.minPrice, this.maxPrice);

            // set Brand name selectors
            const brandNameContainerUI = document.querySelector(this.uiElements.brandNameSelectorUI);
            let output = '';
            this.brandNames.forEach(brand => {
                output += `
            <input type="checkbox"  id="${brand}" name="brand" value="${brand}" class="brand-input">
            <label for="brand1"> ${brand}</label><br>
            `;
            });

            brandNameContainerUI.innerHTML += output;

        }


    }
}


class App {
    constructor(ui, cart) {
        this.http = new HTTP();
        this.ui = ui;
        this.uiElements = ui.getUIElements();
        this.cart = cart;
        this.category = document.querySelector('title').textContent;
        this.minPrice;
        this.maxPrice;
        this.selectedBrandNames = new Set();


    }


    getAllItems() {
        this.http.get('https://pc-shop-api.herokuapp.com/items')
            .then(data => this.ui.fillMain(data))
            .catch(err => console.log(err));
    }


    // Filter out items and display only user needed items
    getItemsByFilter() {
        this.http.get('https://pc-shop-api.herokuapp.com/items')
            .then(items => {
                items = items.filter(item => {
                    if (item.price >= this.minPrice && item.price <= this.maxPrice) {
                        return true
                    } else {
                        return false;
                    }
                })

                // this filter only works if user has selected at least one brand name - otherwise all brands are visible
                if (this.selectedBrandNames.size !== 0) {
                    items = items.filter(item => {
                        if (this.selectedBrandNames.has(item.brand)) {
                            return true;
                        } else {
                            return false;
                        }
                    })
                }

                this.ui.fillMain(items)

            })
            .catch(err => console.log(err));
    }




    setEventListners() {
        // Event Listner for addCart button - Using event propagation
        const deviceCardUI = document.querySelector('body');
        deviceCardUI.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-cart')) {
                const itemID = parseInt(e.target.parentElement.parentElement.id);
                this.cart.addItem(itemID, 1);

                // Updating the cart value
                this.setCartValue();

                this.ui.createNotification('Added to Cart');
            }
        });


        // Event listner to minimum price scroller
        const minScrollUI = document.querySelector(this.uiElements.slideMinUI);
        minScrollUI.addEventListener('change', () => {

            // Set the label value
            document.querySelector(this.uiElements.slideMinLabelUI).textContent = `Maximum Price: ${minScrollUI.value} LKR`;

            // Set class Min/Max value
            this.minPrice = parseInt(minScrollUI.value);
            this.getItemsByFilter();
        });



        // Event listner to max price scroller
        const maxScrollUI = document.querySelector(this.uiElements.slideMaxUI);
        maxScrollUI.addEventListener('change', () => {

            // Set the label value
            document.querySelector(this.uiElements.slideMaxLabelUI).textContent = `Maximum Price: ${this.cart.getFormattedPrice(maxScrollUI.value)} LKR`;
            //${maxScrollUI.value}

            // Set class Min/Max value
            this.maxPrice = parseInt(maxScrollUI.value);
            this.getItemsByFilter();
        });


        // Event listner to get brands - event propagation
        const brandNameContainerUI = document.querySelector(this.uiElements.brandNameSelectorUI);
        brandNameContainerUI.addEventListener('click', (e) => {
            // Check if user has clicked on a check box
            if (e.target.classList.contains('brand-input')) {
                if (e.target.checked) {
                    this.selectedBrandNames.add(e.target.id)
                    this.getItemsByFilter();
                } else {
                    this.selectedBrandNames.delete(e.target.id)
                    this.getItemsByFilter();
                }

            }
        })


    }


    setCartValue() {
        this.http.get('https://pc-shop-api.herokuapp.com/items')
            .then((data) => {
                this.cart.setCartValue(this.cart.getTotal(data));
            })
    }


    setMinMax(min, max) {
        this.minPrice = min;
        this.maxPrice = max;
    }

    init() {
        this.setCartValue();
        this.getAllItems();
        this.setEventListners();
        this.ui.setAppObject(this);
    }

}


const cart = new Cart();
const ui = new UI(cart)
const app = new App(ui, cart);

app.init();