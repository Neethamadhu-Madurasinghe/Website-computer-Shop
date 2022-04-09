class UI {
    constructor(cart) {
        this.uiElements = {
            newsContainerUI: '.news-container',
            newsNavigationLeftUI: '.news-left',
            newsNavigationRightUI: '.news-right',

            offerContainerUI: '.offer-set',
            offerNavigationLeftUI: '.offer-left',
            offerNavigationRightUI: '.offer-right',

            toastUI: '#toasts',


        }

        this.cart = cart;

        // Contains all the news cards
        this.newsCards = []
        this.currentNewsCard;

        // To keep track of offer Card container position
        this.offerSetPos = 0;
    }

    // Files the news section at the startup
    fillNews(newsRecords) {
        if (newsRecords != '') {
            // console.log(newsRecords)
            newsRecords.forEach(newsRecord => {
                const newsCardUI = document.createElement('div');
                newsCardUI.className = 'news-card hidden-right-news';
                newsCardUI.id = `${newsRecord.id}`;

                newsCardUI.innerHTML = `
                <div class="news-description">
                <h1>${newsRecord.title}</h1>
                <p>${newsRecord.discription}</p>
            </div>
            <div class="news-image">
                <div class="news-image-container" style="background-image: url('${newsRecord.image}')"></div>
            </div>
                `;

                this.newsCards.push(newsCardUI);
                document.querySelector(this.uiElements.newsContainerUI).insertBefore(newsCardUI, document.querySelector(this.uiElements.newsNavigationRightUI));
            });

            // Set first news card visisble
            this.currentNewsCard = this.newsCards[0]
            this.currentNewsCard.classList.remove('hidden-right-news')

        }
    }

    // set the next news card visible 
    displayNextNewsCard() {
        if ((this.newsCards.indexOf(this.currentNewsCard) + 1) < this.newsCards.length) {
            this.currentNewsCard.classList.add('hidden-left-news')
            this.currentNewsCard = this.newsCards[(this.newsCards.indexOf(this.currentNewsCard) + 1)];
            this.currentNewsCard.classList.remove('hidden-right-news')
        }
    }

    // set the prev news card visible
    displayPrevioustNewsCard() {
        if ((this.newsCards.indexOf(this.currentNewsCard) - 1) >= 0) {
            this.currentNewsCard.classList.add('hidden-right-news')
            this.currentNewsCard = this.newsCards[(this.newsCards.indexOf(this.currentNewsCard) - 1)];
            this.currentNewsCard.classList.remove('hidden-left-news')
        }
    }

    // Auto rotate news
    autoRotateNews() {
        let forward = true;
        setInterval(() => {
            const currentNewsCardIndex = this.newsCards.indexOf(this.currentNewsCard);
            if (forward) {
                this.displayNextNewsCard();

                if (currentNewsCardIndex === this.newsCards.length - 1) {
                    forward = false;
                }
            } else {
                this.displayPrevioustNewsCard();
                if (currentNewsCardIndex === 0) {
                    forward = true;
                }
            }

        }, 3000)



    }

    // Fill Special offers
    fillSpecialOffers(offerRecords) {
        if (offerRecords != '') {
            console.log(offerRecords)

            // Filterout data that only are tagged at offer
            offerRecords.filter(offerRecord => {
                    if (offerRecord.offer) {
                        return offerRecord
                    }
                })
                .forEach((offerRecord, index) => {
                    console.log(offerRecord.image);
                    const offerCardUI = document.createElement('div');
                    offerCardUI.className = "offer-card";
                    offerCardUI.id = `${offerRecord.id}`;
                    offerCardUI.innerHTML = `
                    <div class="offer-card-top">
                            <div class="offer-image"  style="background-image: url('${offerRecord.image}')"></div>
                            <h2>${offerRecord.name}</h2>
                            <h4>${offerRecord.type}</h4>
                        </div>
                        <div class="offer-card-bottom">
                            <p>${this.cart.getFormattedPrice(offerRecord.price*0.9)} LKR</p>
                            <small>(${this.cart.getFormattedPrice(offerRecord.price)} LKR)</small>
                            <i class="fa-solid fa-circle-plus add-cart"></i>
                        </div>
                    `;

                    //${offerRecord.price*0.9}
                    //${(offerRecord.price)}

                    document.querySelector(this.uiElements.offerContainerUI).appendChild(offerCardUI);
                });

        }
    }

    // set the next offer card visible 
    displayNextOfferCard() {
        const container = document.querySelector(this.uiElements.offerContainerUI);
        if (this.offerSetPos < 100) {
            this.offerSetPos += 20;
            container.style.transform = `translateX(-${this.offerSetPos}%)`
        }


    }

    // set the prev offer card visible
    displayPrevioustOfferCard() {
        const container = document.querySelector(this.uiElements.offerContainerUI);
        if (this.offerSetPos > 0) {
            this.offerSetPos -= 20;
            container.style.transform = `translateX(-${this.offerSetPos}%)`
        }
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





    getUIElements() {
        return this.uiElements;
    }
}



class APP {
    constructor(ui, cart) {
        this.http = new HTTP();
        this.ui = ui;
        this.cart = cart;
        this.uiElements = ui.getUIElements();
    }

    setEventListners() {
        // Load next and previous news cards when user clicks on arrow buttons
        function loadNextNewsCard() {
            ui.displayNextNewsCard();
        }

        function loadprevNewsCard() {
            ui.displayPrevioustNewsCard();
        }
        const newsRightButtonUI = document.querySelector(this.uiElements.newsNavigationRightUI);
        newsRightButtonUI.addEventListener('click', loadNextNewsCard)

        const newsLeftButtonUI = document.querySelector(this.uiElements.newsNavigationLeftUI);
        newsLeftButtonUI.addEventListener('click', loadprevNewsCard)




        // Load next and previous offer cards when user clicks on arrow buttons
        function loadNextOfferCard() {
            ui.displayNextOfferCard();
        }

        function loadprevOffersCard() {
            ui.displayPrevioustOfferCard();
        }
        const offerRightButtonUI = document.querySelector(this.uiElements.offerNavigationRightUI);
        offerRightButtonUI.addEventListener('click', loadNextOfferCard)

        const offerLeftButtonUI = document.querySelector(this.uiElements.offerNavigationLeftUI);
        offerLeftButtonUI.addEventListener('click', loadprevOffersCard)




        // Event Listner for addCart button - Using event propagation
        const offerCardUI = document.querySelector(this.uiElements.offerContainerUI);
        offerCardUI.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-cart')) {
                const itemID = parseInt(e.target.parentElement.parentElement.id);
                this.cart.addItem(itemID, 1);

                // Updating the cart value
                this.setCartValue();

                // Make notification
                this.ui.createNotification('Added to Cart');
            }
        });


    }



    getNews() {
        this.http.get('https://pc-shop-api.herokuapp.com/news')
            .then(data => this.ui.fillNews(data))
            .catch(err => console.log(err));
    }


    getSpecialOffers() {
        this.http.get('https://pc-shop-api.herokuapp.com/items')
            .then(data => this.ui.fillSpecialOffers(data))
            .catch(err => console.log(err));
    }


    setCartValue() {
        this.http.get('https://pc-shop-api.herokuapp.com/items')
            .then((data) => {
                this.cart.setCartValue(this.cart.getTotal(data));
            })
    }

    init() {
        app.setEventListners();
        app.getNews();
        app.getSpecialOffers();
        app.setCartValue();
        app.ui.autoRotateNews();
    }

}



const cart = new Cart();
const ui = new UI(cart)
const app = new APP(ui, cart);

app.init();