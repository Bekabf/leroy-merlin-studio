
document.addEventListener("DOMContentLoaded", function () {

  const productGrid = document.querySelector("#productGrid");
  const productSearch = document.querySelector("#productSearch");
  const categoryFilter = document.querySelector("#categoryFilter");
  const productMessage = document.querySelector("#productMessage");

  if (
    !productGrid ||
    !productSearch ||
    !categoryFilter ||
    !productMessage
  ) {
    console.error("Elementos do catálogo não encontrados.");
    return;
  }

  if (
    !Array.isArray(window.MVP_PRODUCTS) ||
    typeof window.formatMoney !== "function" ||
    typeof window.addToProject !== "function"
  ) {
    productGrid.innerHTML =
      "<p>Não foi possível carregar o catálogo.</p>";

    console.error("Verifique se app.js foi carregado.");
    return;
  }

  // Remove acentos para facilitar a pesquisa.
  function normalizeText(text) {
    return String(text)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  // Protege os textos inseridos no HTML.
  function escapeHTML(text) {
    return String(text).replace(/[&<>"']/g, function (char) {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      };

      return entities[char];
    });
  }

  // ==========================================
  // MONTAR CARTÃO DE PRODUTO
  // ==========================================

  function createProductCard(product) {

    return `
      <article class="product-card">

        <div class="product-image-placeholder" aria-hidden="true">
          <span class="product-visual-icon">
            ${escapeHTML(product.icon || "✦")}
          </span>
          <span class="product-visual-label">
            PRODUTO DEMONSTRATIVO
          </span>
        </div>

        <div class="product-card-content">

          <span class="product-category">
            ${escapeHTML(product.category)}
          </span>

          <h2 class="product-name">
            ${escapeHTML(product.name)}
          </h2>

          <p class="product-description">
            ${escapeHTML(product.description)}
          </p>

          <p class="product-price">
            ${window.formatMoney(product.price)}
          </p>

          <div class="product-aisle">
            <span class="product-aisle-icon" aria-hidden="true">⌖</span>

            <span>
              <strong>Localização demonstrativa</strong>
              ${escapeHTML(product.aisle)}
            </span>
          </div>

          <div class="product-actions">

            <button
              class="btn btn-primary add-product"
              type="button"
              data-product-id="${escapeHTML(product.id)}"
            >
              <span aria-hidden="true">＋</span>
              Adicionar ao projeto
            </button>

            <a
              class="btn btn-secondary product-location-link"
              href="localizacao.html?produto=${encodeURIComponent(product.id)}"
            >
              Onde encontrar ↗
            </a>

          </div>

        </div>

      </article>
    `;
  }

  // ==========================================
  // EXIBIR PRODUTOS
  // ==========================================

  function renderProducts() {

    const searchTerm = normalizeText(
      productSearch.value.trim()
    );

    const selectedCategory = categoryFilter.value;

    const filteredProducts = window.MVP_PRODUCTS.filter(
      function (product) {

        const searchableText = normalizeText(
          product.name + " " +
          product.category + " " +
          product.description
        );

        const matchesSearch =
          searchableText.includes(searchTerm);

        const matchesCategory =
          selectedCategory === "Todas" ||
          product.category === selectedCategory;

        return matchesSearch && matchesCategory;
      }
    );

    productMessage.textContent =
      filteredProducts.length === 1
        ? "1 produto encontrado."
        : filteredProducts.length + " produtos encontrados.";

    if (filteredProducts.length === 0) {

      productGrid.innerHTML = `
        <div class="empty-state">
          <span class="empty-state-icon" aria-hidden="true">⌕</span>
          <h2>Nenhum produto encontrado</h2>
          <p>
            Tente pesquisar outro nome ou selecionar
            uma categoria diferente.
          </p>
        </div>
      `;

      return;
    }

    productGrid.innerHTML = filteredProducts
      .map(createProductCard)
      .join("");
  }

  // ==========================================
  // ADICIONAR AO PROJETO
  // ==========================================

  productGrid.addEventListener("click", function (event) {

    const button = event.target.closest(".add-product");

    if (!button) {
      return;
    }

    const productId = button.dataset.productId;

    window.addToProject(productId);

    // Confirmação visual, sem alterar o texto permanentemente.
    const originalHTML = button.innerHTML;

    button.textContent = "✓ Adicionado ao projeto";
    button.classList.add("product-added");

    setTimeout(function () {
      if (button.isConnected) {
        button.innerHTML = originalHTML;
        button.classList.remove("product-added");
      }
    }, 1500);

  });

  // ==========================================
  // EVENTOS DOS FILTROS
  // ==========================================

  productSearch.addEventListener("input", renderProducts);

  categoryFilter.addEventListener("change", renderProducts);

  // Carregamento inicial.
  renderProducts();

});