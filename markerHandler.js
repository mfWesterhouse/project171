var userNumber = null;

AFRAME.registerComponent("markerhandler", {
  init: async function() {

    if (userNumber === null) {
      this.askUserNumber();
    }

    var toys = await this.getToys();

    this.el.addEventListener("markerFound", () => {
      var markerId = this.el.id;
      this.handleMarkerFound(toys, markerId);
    });

    this.el.addEventListener("markerLost", () => {
      this.handleMarkerLost();
    });
  },

  askUserNumber: function() {
    var iconUrl = "https://raw.githubusercontent.com/whitehatjr/menu-card-app/main/hunger.png";
    swal({
      title: "Welcome to the Toy Shop!",
      icon: iconUrl,
      content: {
        content: "input",
        attributes: {
          placeHolder: "Type you user number",
          type: "number",
          min: 1,
        }
      },
      closeOnClickOutside: false,
    }).then(inputValue => {
      userNumber = inputValue;
    });
  },

  handleMarkerFound: function(toys, markerId) {
    var todaysDate = new Date();
    var todaysDay = todaysDate.getDay();

    var days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday"
    ];

    var toy = toys.filter(toy => toy.id === markerId)[0];

    if (toy.unavailable_days.includes(days[todaysDay])) {
      swal({
        icon: "warning",
        title: toy.toy_name.toUpperCase(),
        text: "This dish is not available today!!!",
        timer: 2500,
        buttons: false
      });
    } else {
      var model = document.querySelector(`#model-${toy.id}`);
      model.setAttribute("position", toy.model_geometry.position);
      model.setAttribute("rotation", toy.model_geometry.rotation);
      model.setAttribute("scale", toy.model_geometry.scale);
      model.setAttribute("visible", true);

      var descriptionContainer = document.querySelector(`#main-plane-${toy.id}`);
      descriptionContainer.setAttribute("visible", true);

      var priceplane = document.querySelector(`#price-plane-${toy.id}`);
      priceplane.setAttribute("visible", true);

      var buttonDiv = document.getElementById("button-div");
      buttonDiv.style.display = "flex";

      var ratingButton = document.getElementById("rating-button");
      var orderButtton = document.getElementById("order-button");

      ratingButton.addEventListener("click", function() {
        swal({
          icon: "warning",
          title: "Rate Toy",
          text: "Work In Progress"
        });
      });

      orderButtton.addEventListener("click", () => {
        var uNumber;
        userNumber <= 9 ? (uNumber = `T0${userNumber}`) : `T${userNumber}`;
        this.handleOrder(uNumber, toy);

        swal({
          icon: "https://i.imgur.com/4NZ6uLY.jpg",
          title: "Thanks For Order !",
          text: "Your order will serve soon arrive!",
          timer: 2000,
          buttons: false
        });
      });
    }
  },
  handleOrder: function(uNumber, toy) {
    firebase
      .firestore()
      .collection("users")
      .doc(uNumber)
      .get()
      .then(doc => {
        var details = doc.data();
        if (details["current_orders"][toy.id]){
          details["current_orders"][toy.id]["quantity"] += 1;
          var currentQuantity = details["current_orders"][toy.id]["quantity"];
          details["current_orders"][toy.id]["subtotal"] =
          currentQuantity * toy.price;
        } else{
          details["current_orders"][toy.id] = {
            item: toy.toy_name,
            price: toy.price,
            quantity: 1,
            subtotal: toy.price * 1
          };
        }

        details.total_bill += toy.price;

        firebase
          .firestore()
          .collections("users")
          .doc(doc.id)
          .update(details)
      });
  },

  getToys: async function() {
    return await firebase
      .firestore()
      .collection("toys")
      .get()
      .then(snap => {
        return snap.docs.map(doc => doc.data());
      });
  },
  handleMarkerLost: function() {
    var buttonDiv = document.getElementById("button-div");
    buttonDiv.style.display = "none";
  }
});
