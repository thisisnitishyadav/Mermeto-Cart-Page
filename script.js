const cartAPI = 'https://cdn.shopify.com/s/files/1/0883/2188/4479/files/apiCartData.json?v=1728384889';

async function loadCartData() {
  const response = await fetch(cartAPI);
  const data = await response.json();

  const cartItemsContainer = document.getElementById('cart-items');
  const subtotalElement = document.getElementById('subtotal');
  const totalElement = document.getElementById('total');

  let subtotal = 0;

  data.items.forEach(item => {
    const itemSubtotal = item.presentment_price * item.quantity;
    subtotal += itemSubtotal;

    const row = `
      <tr>
        <td><img src="${item.image}" alt="${item.title}" style="width: 50px;"> ${item.title}</td>
        <td>Rs. ${item.presentment_price.toLocaleString('en-IN')}</td>
        <td><input type="number" value="${item.quantity}" min="1" data-id="${item.id}" class="quantity"></td>
        <td>Rs. ${itemSubtotal.toLocaleString('en-IN')}</td>
        <td><button class="remove" data-id="${item.id}">🗑️</button></td>
      </tr>
    `;
    cartItemsContainer.innerHTML += row;
  });

  subtotalElement.textContent = `Rs. ${subtotal.toLocaleString('en-IN')}`;
  totalElement.textContent = `Rs. ${subtotal.toLocaleString('en-IN')}`;
}

loadCartData();
