
document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.querySelector("#locationSearch");
  const results = document.querySelector("#locationResults");
  const storeMap = document.querySelector("#storeMap");

  if (!searchInput || !results || !storeMap) return;

  const products = window.MVP_PRODUCTS;

  const aisles = [
    "02", "04", "06", "08",
    "09", "12", "15"
  ];

  let selectedProductId = null;

  function normalizeText(text) {
    return text.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function renderMap(selectedAisle = null) {
    storeMap.innerHTML = `
      <div class="store-entrance">
        🚪 ENTRADA DA LOJA
      </div>

      <div class="store-aisles">
        ${aisles.map(aisle => `
          <div class="store-aisle ${
            selectedAisle === aisle ? "highlight-aisle" : ""
          }">
            <span>Corredor</span>
            <strong>${aisle}</strong>
          </div>
        `).join("")}
      </div>

      <p class="map-info">
        ${
          selectedAisle
            ? `📍 Produto localizado no corredor ${selectedAisle}.`
            : "Selecione um produto para visualizar seu corredor."
        }
      </p>
    `;
  }

  function selectProduct(productId) {
    const product = products.find(
      item => item.id === Number(productId)
    );

    if (!product) return;

    selectedProductId = product.id;

    const aisleNumber = product.aisle.replace("Corredor ", "");

    renderMap(aisleNumber);
    renderProducts();

    storeMap.scrollIntoView({
      behavior: "smooth",
      block: "nearest"
    });
  }

  function renderProducts() {
    const term = normalizeText(searchInput.value.trim());

    const filtered = products.filter(product =>
      normalizeText(product.name).includes(term) ||
      normalizeText(product.category).includes(term)
    );

    if (filtered.length === 0) {
      results.innerHTML = `
        <p>Nenhum produto encontrado. Tente outra busca.</p>
      `;
      return;
    }

    results.innerHTML = filtered.map(product => `
      <article class="location-product-card">
        <div>
          <h3>${product.icon} ${product.name}</h3>
          <p>${product.category} — ${product.aisle}</p>
        </div>

        <button
          type="button"
          class="btn btn-primary select-location"
          data-product-id="${product.id}"
          ${selectedProductId === product.id ? "disabled" : ""}
        >
          ${selectedProductId === product.id
            ? "Selecionado"
            : "Ver no mapa"}
        </button>
      </article>
    `).join("");
  }

  results.addEventListener("click", function (event) {
    const button = event.target.closest(".select-location");

    if (!button) return;

    selectProduct(button.dataset.productId);
  });

  searchInput.addEventListener("input", function () {
    selectedProductId = null;
    renderMap();
    renderProducts();
  });

  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("produto");

  renderMap();
  renderProducts();

  if (productId) {
    const product = products.find(
      item => item.id === Number(productId)
    );

    if (product) {
      searchInput.value = product.name;
      selectProduct(product.id);
    }
  }
});
