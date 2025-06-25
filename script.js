$(document).ready(function() {
  // --- STATE & CONFIG ---
  // Use sessionStorage for cart to reset on browser close, but persist across page navigation.
  let cart = JSON.parse(sessionStorage.getItem('cart')) || [];

  // For login/logout functionality: Check login status from localStorage
  let isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';

  const deliveryTimeMinutes = 45; // Estimated delivery time in minutes

  // --- MODAL & SIDEBAR INSTANCES ---
  const infoModal = new bootstrap.Modal(document.getElementById('infoModal'));
  const $cartSidebar = $('#cartSidebar');
  const $logoutNavLink = $('#logoutNavLink'); // The <li> element for Logout button
  const $loginNavLink = $('#loginNavLink');   // The <li> element for Login link

  // --- CART CORE FUNCTIONS ---
  function saveCart() {
    // Save cart to sessionStorage
    sessionStorage.setItem('cart', JSON.stringify(cart));
  }

  function addToCart(name, price, quantity, size = '') {
    const itemName = size ? `${name} (${size})` : name;
    const existingItem = cart.find(item => item.name === itemName);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({ name: itemName, price, quantity });
    }

    $('#cart-notification').fadeIn().delay(2000).fadeOut();
    saveCart(); // Save cart to sessionStorage after adding
    updateCartUI();
  }

  function removeItemFromCart(index) {
    cart.splice(index, 1);
    saveCart(); // Save cart to sessionStorage after removing
    updateCartUI();
  }

  function clearCart() {
    cart = [];
    saveCart(); // Save the empty cart to sessionStorage
    updateCartUI();
  }

  function clearCartAfterOrder() {
    cart = [];
    sessionStorage.removeItem('cart'); // Remove cart entirely from sessionStorage after order
    updateCartUI();
  }

  // --- UI UPDATE FUNCTIONS ---
  function updateCartUI() {
    updateCartBadge();
    renderCartItems();
  }

  function updateCartBadge() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    $('#cart-count').text(totalItems);
  }

  function renderCartItems() {
    const $cartItemsContainer = $('#cartItems');
    $cartItemsContainer.empty();

    if (cart.length === 0) {
      $cartItemsContainer.html('<p class="text-muted">Your cart is empty.</p>');
      $('#cartTotal').text('$0.00');
      return;
    }

    let totalCost = 0;
    cart.forEach((item, index) => {
      const itemTotal = item.price * item.quantity;
      totalCost += itemTotal;
      const itemHtml = `
        <div class="cart-item d-flex justify-content-between align-items-center">
          <div>
            <strong>${item.name}</strong><br>
            <small>$${item.price.toFixed(2)} × ${item.quantity}</small>
          </div>
          <div class="text-end">
            <span>$${itemTotal.toFixed(2)}</span><br>
            <button class="btn btn-sm btn-outline-danger mt-1 remove-item-btn" data-index="${index}">Remove</button>
          </div>
        </div>`;
      $cartItemsContainer.append(itemHtml);
    });

    $('#cartTotal').text(`$${totalCost.toFixed(2)}`);
  }

  function updateProductPrice($card) {
    const $sizeSelect = $card.find('.size-select');
    const $quantityInput = $card.find('.quantity-input');
    const $priceDisplay = $card.find('.price-display');
    const basePrice = parseFloat($sizeSelect.data('base'));
    const sizeSurcharge = parseFloat($sizeSelect.val());
    const quantity = parseInt($quantityInput.val());

    if (!isNaN(basePrice) && !isNaN(quantity)) {
      const total = (basePrice + sizeSurcharge) * quantity;
      $priceDisplay.text(`$${total.toFixed(2)}`);
    }
  }

  // --- MODAL DISPLAY FUNCTIONS ---
  function showInfoModal(title, body, footer = '') {
    $('#infoModalLabel').text(title);
    $('#infoModalBody').html(body);
    $('#infoModalFooter').html(footer || '<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>');
    infoModal.show();
  }

  // --- LOGIN/LOGOUT FUNCTIONS ---
  function updateLoginUI() {
    if (isLoggedIn) {
      $loginNavLink.hide();    // Hide the login link
      $logoutNavLink.show();   // Show the logout button
    } else {
      $loginNavLink.show();    // Show the login link
      $logoutNavLink.hide();   // Hide the logout button
    }
  }

  // Simulate a login process
  function performLogin() {
      // In a real application, this would involve sending credentials to a server
      // and receiving a successful response.
      isLoggedIn = true;
      localStorage.setItem('userLoggedIn', 'true');
      updateLoginUI();
      showInfoModal('Login Successful!', '<p>You have successfully logged in to your account!</p>');
      // Redirect to home after successful login after a short delay
      setTimeout(() => {
          window.location.href = 'index.html'; 
      }, 1500); 
  }

  // Simulate a registration process
  function performRegistration() {
      // In a real application, this would involve sending user data to a server
      // and handling the registration process.
      // For this example, we'll just simulate success.
      showInfoModal('Registration Successful!', '<p>Your account has been successfully created!</p><p>You can now log in using your new credentials.</p>');
      // Optionally redirect to login page after successful registration
      setTimeout(() => {
          window.location.href = 'login.html'; 
      }, 2000); 
  }

  function logout() {
      isLoggedIn = false;
      localStorage.removeItem('userLoggedIn'); // Clear login state from localStorage
      // Clear any other user-specific data from localStorage if stored (e.g., user profile data)

      clearCart(); // Optional: Clear cart on logout. This will also save an empty cart to sessionStorage.

      updateLoginUI();
      showInfoModal('Logged Out', '<p>You have been successfully logged out.</p>'); 
      // Redirect to home or login page after logout
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
  }


  // --- EVENT LISTENERS ---
  $('#cart-button').on('click', () => $cartSidebar.toggleClass('active'));
  $('#closeCart').on('click', () => $cartSidebar.removeClass('active'));

  $('#clearCartButton').on('click', clearCart);
  $('#cartItems').on('click', '.remove-item-btn', function () {
    removeItemFromCart($(this).data('index'));
  });

  $('.container').on('click', '.add-to-cart', function () {
    const $card = $(this).closest('.card, .card-body');
    const name = $card.find('.card-title').text();
    const quantity = parseInt($card.find('.quantity-input').val() || 1);

    if ($card.find('.size-select').length > 0) {
      const $sizeSelect = $card.find('.size-select');
      const basePrice = parseFloat($sizeSelect.data('base'));
      const sizeSurcharge = parseFloat($sizeSelect.val());
      const selectedSizeText = $sizeSelect.find('option:selected').text().split('(')[0].trim();
      addToCart(name, basePrice + sizeSurcharge, quantity, selectedSizeText);
    } else {
      const price = parseFloat($(this).data('price'));
      if (!isNaN(price)) {
        addToCart(name, price, quantity);
      }
    }
  });

  $('.card').on('change input', '.size-select, .quantity-input', function () {
    updateProductPrice($(this).closest('.card'));
  });

  // Attach event listener for the login form submission in login.html
  $(document).on('submit', '#login-page-form', function(e) {
      e.preventDefault(); // Prevent default form submission
      // In a real app, collect form data and send to server
      // For this example, just simulate successful login
      performLogin();
  });

  // Attach event listener for the register form submission in register.html
  $(document).on('submit', '#register-page-form', function(e) {
      e.preventDefault(); // Prevent default form submission
      // In a real app, collect form data and send to server
      // For this example, just simulate successful registration
      performRegistration();
  });

  // Attach event listener for the logout button (using delegation for robustness)
  $(document).on('click', '#logoutButton', logout);


  // --- CHECKOUT PROCESS ---
  $('#checkoutButton').on('click', function () {
    if (cart.length === 0) {
      showInfoModal('Cart Empty', 'Your cart is empty! Please add some items before checking out.');
      return;
    }
    $cartSidebar.removeClass('active');

    const now = new Date();
    const arrivalTime = new Date(now.getTime() + deliveryTimeMinutes * 60000);
    const arrivalString = arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const formBody = `
      <p>Please provide your delivery details. Your order will be delivered in approximately <strong>${deliveryTimeMinutes} minutes</strong>.</p>
      <p class="fw-bold">Estimated Arrival Time: ${arrivalString}</p>
      <form id="checkoutForm">
        <div class="mb-3">
          <label for="name" class="form-label">Full Name</label>
          <input type="text" class="form-control" id="name" required>
        </div>
        <div class="mb-3">
          <label for="phone" class="form-label">Phone Number</label>
          <input type="tel" class="form-control" id="phone" required>
        </div>
        <div class="mb-3">
          <label for="location" class="form-label">Delivery Address</label>
          <input type="text" class="form-control" id="location" required>
        </div>
        <div class="mb-3">
          <label for="description" class="form-label">Description (Optional)</label>
          <textarea class="form-control" id="description" rows="2"></textarea>
        </div>
      </form>
    `;
    const formFooter = `
      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
      <button type="button" class="btn btn-pink" id="confirmOrderBtn">Confirm Order</button>`;
    showInfoModal('Checkout', formBody, formFooter);
  });

  $(document).on('click', '#confirmOrderBtn', function () {
    const form = document.getElementById('checkoutForm');
    if (form.checkValidity()) {
      // Hide the current modal (checkout form)
      $('#infoModal').on('hidden.bs.modal', function () {
        $(this).off('hidden.bs.modal'); // Remove the event listener after it fires once
        clearCartAfterOrder();
        showInfoModal('Thank You!', '<p>Your order has been placed successfully!</p><p>We look forward to your next order!</p>');
      }).modal('hide'); // Trigger the hide manually to ensure the event fires

    } else {
      form.reportValidity();
    }
  });

  // --- EVENT PAGE BUTTONS ---
  $('.event-register-btn').on('click', function () {
    const eventTitle = $(this).closest('.card-body').find('.card-title').text();
    const formBody = `
      <p>Please fill in your details to register for the <strong>${eventTitle}</strong>.</p>
      <form id="eventRegisterForm">
        <div class="mb-3">
          <label for="event-name" class="form-label">Full Name</label>
          <input type="text" class="form-control" id="event-name" required>
        </div>
        <div class="mb-3">
          <label for="event-email" class="form-label">Email Address</label>
          <input type="email" class="form-control" id="event-email" required>
        </div>
      </form>
    `;
    const formFooter = `
      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
      <button type="button" class="btn btn-pink" id="confirmEventRegistrationBtn">Register</button>`;
    showInfoModal(`Register for ${eventTitle}`, formBody, formFooter);
  });

  $(document).on('click', '#confirmEventRegistrationBtn', function () {
    const form = document.getElementById('eventRegisterForm');
    if (form.checkValidity()) {
      const eventTitle = $('#infoModalLabel').text().replace('Register for ', '');
      infoModal.hide();
      const body = `<p>You have successfully registered for the <strong>${eventTitle}</strong> workshop!</p><p>A confirmation email with further details will be sent to you shortly. We look forward to seeing you!</p>`;
      showInfoModal('Registration Confirmed!', body);
    } else {
      form.reportValidity();
    }
  });

  // --- SPECIAL OFFERS PAGE BUTTONS ---
  $('.offer-btn').on('click', function () {
    const offerType = $(this).data('offer');
    const card = $(this).closest('.card-body');

    if (offerType === 'bundle') {
      addToCart('Coffee & Mug Bundle', 24.00, 1);
      showInfoModal('Offer Claimed!', '<p>The <strong>Coffee & Mug Bundle</strong> has been added to your cart at a special price of $24.00!</p>');
    } else if (offerType === 'details') {
      const title = card.find('.card-title').text();
      const body = '<p>This offer is available exclusively for in-store purchases on weekdays between 2 PM and 4 PM.</p><p>Simply order any coffee drink during this time and choose any pastry from our daily selection for free. Enjoy!</p>';
      showInfoModal(title, body);
    } else if (offerType === 'learn-more') {
      const title = card.find('.card-title').text();
      const body = '<p>To receive your 10% student discount, please present a valid student ID card at the time of purchase.</p><p>This offer is valid on all items, any day of the week. Perfect for those long study sessions!</p>';
      showInfoModal(title, body);
    }
  });

  // --- INITIALIZATION ---
  $('.card').each(function () {
    if ($(this).find('.size-select').length > 0) {
      updateProductPrice($(this));
    }
  });

  updateCartUI(); // Initial display of cart on page load
  updateLoginUI(); // Initial display of login/logout state on page load
});
