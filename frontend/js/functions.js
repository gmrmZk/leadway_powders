import { addToCart, updateCartBadge, parseCurrency } from './cart.js';
import { initMobileNav } from './navigation.js';
import {
  getProductCategory
} from './catalog.js';

const API_URL = 'https://leadway-powders.onrender.com';

let shopProducts = [];
let currentFilter = 'all';
let currentSort = 'featured';

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  updateCartBadge();
  if (document.getElementById('productGrid')) {
    initShopFilters();
    initShopSorting();
  }
  fetchProducts();
});

async function fetchProducts() {
  const productGrid = document.getElementById('productGrid');
  const homeGrid = document.getElementById('edit');
  const newArrivalsGrid = document.querySelector('#new-arrivals .product-grid');

  if (!productGrid && !homeGrid) return;
  [homeGrid, newArrivalsGrid].filter(Boolean).forEach((grid) => grid.replaceChildren());

  try {
    const response = await fetch(`${API_URL}/api/products`);

    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }

    const data = await response.json();

    const products = data.products || data;

    shopProducts = Array.isArray(products)
      ? products.filter((product) => {
          const stock = Number(product.stock || 0);
          return stock > 0;
        })
      : [];

    if (productGrid) {
      updateFilterCounts();
      renderProducts();
    }
    if (homeGrid) {
      renderHomeProducts(newArrivalsGrid);
    }
  } catch (error) {
    console.error('Failed to fetch products:', error);
    [productGrid, homeGrid].filter(Boolean).forEach((grid) => {
      grid.replaceChildren();
      const message = document.createElement('p');
      message.className = 'catalog-empty';
      message.textContent = 'Products could not be loaded. Please try again later.';
      grid.appendChild(message);
    });
  }
}

function getVisibleProducts() {
  const filteredProducts =
    currentFilter === 'all'
      ? [...shopProducts]
      : shopProducts.filter(
          (product) => getProductCategory(product) === currentFilter
        );

  if (currentSort === 'price-low') {
    return filteredProducts.sort(
      (a, b) => Number(a.price || 0) - Number(b.price || 0)
    );
  }
  if (currentSort === 'price-high') {
    return filteredProducts.sort(
      (a, b) => Number(b.price || 0) - Number(a.price || 0)
    );
  }
  if (currentSort === 'name') {
    return filteredProducts.sort((a, b) =>
      String(a.title || '').localeCompare(String(b.title || ''))
    );
  }
  return filteredProducts;
}

function createProductCard(product) {
  const stock = Number(product.stock || 0);
  const category = getProductCategory(product);
  const article = document.createElement('article');
  article.className = 'product-card';
  article.id = String(product.id);
  article.dataset.category = category.toLowerCase();

  const visual = document.createElement('a');
  visual.className = 'product-visual';
  visual.href = `product.html?id=${encodeURIComponent(product.id)}`;

  const image = document.createElement('img');
  image.src = product.image_url || '';
  image.alt = product.title || 'LEADWAY POWDERS product';
  visual.appendChild(image);

  if (stock < 5) {
    const stockMessage = document.createElement('span');
    stockMessage.className = 'product-stock-warning';
    stockMessage.textContent = stock === 1 ? 'Only 1 left' : `Only ${stock} left`;
    visual.appendChild(stockMessage);
  }

  const info = document.createElement('div');
  info.className = 'product-info';
  const infoText = document.createElement('div');
  const categoryLabel = document.createElement('p');
  categoryLabel.textContent = category;
  const title = document.createElement('h2');
  title.textContent = product.title || '';
  infoText.append(categoryLabel, title);

  const price = document.createElement('strong');
  price.textContent = `R${Number(product.price || 0).toLocaleString('en-ZA')}`;
  info.append(infoText, price);

  const addButton = document.createElement('button');
  addButton.type = 'button';
  addButton.className = 'add-cart';
  addButton.setAttribute('aria-label', `Add ${product.title || 'product'} to cart`);
  addButton.textContent = '+';

  article.append(visual, info, addButton);
  return article;
}

function renderProducts() {
  const productGrid = document.getElementById('productGrid');

  if (!productGrid) return;

  const filteredProducts = getVisibleProducts();

  productGrid.replaceChildren();

  filteredProducts.forEach((product) => {
    productGrid.appendChild(createProductCard(product));
  });

  if (filteredProducts.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'catalog-empty';
    const heading = document.createElement('h3');
    heading.textContent = 'No products in this category yet';
    const message = document.createElement('p');
    message.textContent = 'Choose another powder category or browse all products.';
    empty.append(heading, message);
    productGrid.appendChild(empty);
  }

  updateProductTotal();
  initShopCartButtons();
}

function renderHomeProducts(newArrivalsGrid) {
  const homeGrid = document.getElementById('edit');
  if (!homeGrid) return;

  homeGrid.replaceChildren();
  shopProducts.slice(0, 3).forEach((product) => {
    homeGrid.appendChild(createProductCard(product));
  });
  if (shopProducts.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'catalog-empty';
    empty.textContent = 'No products are currently available.';
    homeGrid.appendChild(empty);
  }

  if (newArrivalsGrid) {
    newArrivalsGrid.replaceChildren();
    const link = document.createElement('a');
    link.className = 'text-link';
    link.href = './components/shop.html#catalog';
    link.textContent = 'Explore all powder categories';
    newArrivalsGrid.appendChild(link);
  }
  initShopCartButtons();
}

function initShopFilters() {
  const filterButtons =
    document.querySelectorAll(
      '.filter-link'
    );

  filterButtons.forEach((button) => {
    button.addEventListener(
      'click',
      () => {
        currentFilter =
          button.dataset.filter || 'all';

        filterButtons.forEach(
          (filterButton) => {
            filterButton.classList.remove(
              'active'
            );
          }
        );

        button.classList.add('active');

        renderProducts();
      }
    );
  });
}

function initShopSorting() {
  const sortButton = document.getElementById('sortButton');
  const dropdown = document.getElementById('sortDropdown');
  if (!sortButton || !dropdown) return;

  sortButton.addEventListener('click', () => {
    const isOpen = dropdown.classList.toggle('open');
    sortButton.setAttribute('aria-expanded', String(isOpen));
  });

  dropdown.querySelectorAll('.sort-option').forEach((option) => {
    option.addEventListener('click', () => {
      currentSort = option.dataset.sort || 'featured';
      const label = sortButton.querySelector('strong');
      if (label) label.textContent = option.textContent.trim();
      dropdown.querySelectorAll('.sort-option').forEach((item) => {
        item.classList.toggle('active', item === option);
      });
      dropdown.classList.remove('open');
      sortButton.setAttribute('aria-expanded', 'false');
      renderProducts();
    });
  });
}

function updateFilterCounts() {
  const filterButtons =
    document.querySelectorAll(
      '.filter-link'
    );

  filterButtons.forEach((button) => {
    const filter =
      button.dataset.filter || 'all';

    const countElement =
      button.querySelector('span');

    if (!countElement) return;

    let count =
      shopProducts.length;

    if (filter !== 'all') {
      count =
        shopProducts.filter(
          (product) => {
            return getProductCategory(product) === filter;
          }
        ).length;
    }

    countElement.textContent =
      String(count).padStart(2, '0');
  });
}

function updateProductTotal() {
  const productTotal =
    document.getElementById(
      'productTotal'
    );

  if (!productTotal) return;

  const filteredCount =
    currentFilter === 'all'
      ? shopProducts.length
      : shopProducts.filter(
          (product) => {
            return getProductCategory(product) === currentFilter;
          }
        ).length;

  productTotal.textContent =
    String(filteredCount).padStart(2, '0');
}

export function initShopCartButtons() {
  const addButtons =
    document.querySelectorAll(
      '.add-cart'
    );

  addButtons.forEach((btn) => {
    if (btn.dataset.cartInitialized) {
      return;
    }

    btn.dataset.cartInitialized = 'true';

    btn.addEventListener(
      'click',
      (e) => {
        e.preventDefault();
        e.stopPropagation();

        const card =
          btn.closest('.product-card') ||
          btn.closest('article');

        if (card) {
          const titleEl =
            card.querySelector(
              'h2, .product-title, h3'
            );

          const priceEl =
            card.querySelector(
              'strong, .product-price'
            );

          const imgEl =
            card.querySelector('img');

          const catEl =
            card.querySelector(
              '.product-info p, [data-category]'
            );

          const title =
            titleEl
              ? titleEl.textContent.trim()
              : 'LEADWAY POWDERS Product';

          const priceText =
            priceEl
              ? priceEl.textContent.trim()
              : '0';

          const price =
            parseCurrency(priceText);

          const image =
            imgEl
              ? imgEl.src
              : '';

          const category =
            catEl
              ? catEl.textContent.trim()
              : (
                  card.dataset.category ||
                  'LEADWAY POWDERS Goods'
                );

          const id =
            card.id ||
            title
              .toLowerCase()
              .replace(
                /[^a-z0-9]+/g,
                '-'
              );
          const product = shopProducts.find(
            (item) => String(item.id) === String(id)
          );

          addToCart({
            id,
            title,
            price,
            category,
            image,
            stock: product?.stock,
            size: 'Standard',
            quantity: 1
          });
        }

        btn.classList.add('added');

        setTimeout(() => {
          btn.classList.remove('added');
        }, 1200);
      }
    );
  });
}

const newsletterForm =
  document.getElementById(
    'newsletterForm'
  );

const newsletterFeedback =
  document.getElementById(
    'newsletterFeedback'
  );

if (newsletterForm) {
  newsletterForm.addEventListener(
    'submit',
    (e) => {
      e.preventDefault();

      const emailInput =
        document.getElementById(
          'newsletterEmail'
        );

      const email =
        emailInput
          ? emailInput.value.trim()
          : '';

      if (
        email &&
        newsletterFeedback
      ) {
        newsletterFeedback.textContent =
          'Welcome to LEADWAY POWDERS! Check your inbox for a confirmation.';

        if (emailInput) {
          emailInput.value = '';
        }

        setTimeout(() => {
          newsletterFeedback.textContent =
            '';
        }, 4000);
      }
    }
  );
}