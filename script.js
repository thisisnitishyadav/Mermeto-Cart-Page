document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "https://cdn.shopify.com/s/files/1/0883/2188/4479/files/apiCartData.json?v=1728384889";

  const cartItemsTable = document.querySelector(".cart-items tbody");
  const subtotalElement = document.querySelector(".cart-totals .span-1");
  const totalElement = document.querySelector(".cart-totals .span-2");
  const loader = document.querySelector(".loader");
  const modal = document.querySelector(".confirmation-modal");
  let cartData = JSON.parse(localStorage.getItem("cartData")) || [];

  // show loader
  const showLoader = () => loader.style.display = "block";
  const hideLoader = () => loader.style.display = "none";

  // load cart data from api
  async function loadCart() {
    try {
      if (cartData.length === 0) {
        showLoader();
        const response = await fetch(API_URL);
        const data = await response.json();
        cartData = data.items.map(item => ({ ...item, quantity: 1 })); 
        localStorage.setItem("cartData", JSON.stringify(cartData));
      }
      displayCartItems(cartData);
      updateTotals(); 
    } catch (error) {
      console.error("Error fetching cart data:", error);
    } finally {
      hideLoader();
    }
  }

  // display cart items
  function displayCartItems(items) {
    cartItemsTable.innerHTML = items.map(item => `
      <tr data-id="${item.id}" data-price="${item.presentment_price}">
        <td class="product-info">
          <img src="${item.image}" alt="${item.title}" class="product-image">
          <span>${item.title}</span>
        </td>
        <td>Rs. ${(item.presentment_price / 100).toFixed(2)}</td>
        <td>
          <input type="number" value="${item.quantity}" class="quantity-input" min="1">
        </td>
        <td>Rs. ${(item.presentment_price * item.quantity / 100).toFixed(2)}</td>
        <td><button class="remove-btn">🗑️</button></td>
      </tr>
    `).join("");
    attachEventListeners();
  }

  // attach event listeners for quantity changes and remove item
  function attachEventListeners() {
    document.querySelectorAll(".quantity-input").forEach(input =>
      input.addEventListener("change", updateItemQuantity)
    );
    document.querySelectorAll(".remove-btn").forEach(button =>
      button.addEventListener("click", handleRemoveItem)
    );
  }

  // update item quantity and recalculate totals
  function updateItemQuantity(event) {
    const input = event.target;
    const row = input.closest("tr");
    const price = parseFloat(row.dataset.price);
    const quantity = Math.max(1, parseInt(input.value));
    const itemId = row.dataset.id;

    // update the displayed subtotal for the item
    row.querySelector("td:nth-child(4)").textContent = `Rs. ${(price * quantity / 100).toFixed(2)}`;

    // find the item in cartData and update its quantity
    const item = cartData.find(item => item.id === itemId);
    if (item) {
      item.quantity = quantity;
      localStorage.setItem("cartData", JSON.stringify(cartData));
    }

    updateTotals(); 
  }

  // remove item from cart and recalculate totals
  function handleRemoveItem(event) {
    const row = event.target.closest("tr");
    const itemId = row.dataset.id;

    modal.style.display = "block";
    modal.querySelector(".confirm-btn").onclick = () => {
      cartData = cartData.filter(item => item.id !== itemId);
      row.remove();
      localStorage.setItem("cartData", JSON.stringify(cartData));
      updateTotals(); 
      modal.style.display = "none";
    };
    modal.querySelector(".cancel-btn").onclick = () => modal.style.display = "none";
  }

  // update the subtotal and total values
  function updateTotals() {
    const subtotal = cartData.reduce((sum, item) =>
      sum + (item.presentment_price * item.quantity), 0) / 100;

    // assuming no discounts
    const total = subtotal; 

    // Update the displayed totals in the UI
    subtotalElement.textContent = `Rs. ${subtotal.toFixed(2)}`;
    totalElement.textContent = `Rs. ${total.toFixed(2)}`;
  }

  // load the cart when the page loads
  loadCart();
});
