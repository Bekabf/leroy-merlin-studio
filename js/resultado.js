
document.addEventListener("DOMContentLoaded", function () {

  const needElement = document.querySelector("#recommendationNeed");
  const explanationElement = document.querySelector("#recommendationExplanation");
  const resultsElement = document.querySelector("#recommendationResults");

  if (!needElement || !explanationElement || !resultsElement) {
    console.error("Elementos da página de resultados não encontrados.");
    return;
  }

  // Protege textos exibidos dentro do HTML.
  function escapeHTML(text) {
    return String(text ?? "").replace(/[&<>"']/g, function (char) {
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

  function showEmptyState(title, description, link, buttonText) {
    resultsElement.innerHTML = `
      <div class="empty-state results-empty-state">
        <span class="results-empty-icon" aria-hidden="true">✦</span>

        <h3>${escapeHTML(title)}</h3>

        <p>${escapeHTML(description)}</p>

        <a href="${link}" class="results-empty-button">
          ${escapeHTML(buttonText)} ↗
        </a>
      </div>
    `;
  }

  // ==========================================
  // RECUPERAR RECOMENDAÇÃO
  // ==========================================

  const savedResult = sessionStorage.getItem("leroyRecommendation");

  if (!savedResult) {
    needElement.textContent = "Você ainda não descreveu seu projeto.";
    explanationElement.textContent =
      "Conte sua ideia ao assistente para receber sugestões de materiais.";

    showEmptyState(
      "Vamos começar seu projeto?",
      "Descreva o que deseja transformar e descubra materiais para começar.",
      "assistente.html",
      "Acessar assistente"
    );

    return;
  }

  let recommendation;

  try {
    recommendation = JSON.parse(savedResult);
  } catch (error) {
    console.error("Erro ao recuperar recomendações:", error);

    needElement.textContent = "Não foi possível recuperar sua solicitação.";
    explanationElement.textContent =
      "Precisamos que você informe sua ideia novamente.";

    showEmptyState(
      "Não conseguimos recuperar sua ideia.",
      "Volte ao assistente e descreva seu projeto novamente.",
      "assistente.html",
      "Tentar novamente"
    );

    return;
  }

  needElement.textContent = recommendation.need || "Projeto não informado.";

  // ==========================================
  // IDENTIFICAR PRODUTOS
  // ==========================================

  const products = Array.isArray(window.MVP_PRODUCTS)
    ? window.MVP_PRODUCTS
    : [];

  const productIds = Array.isArray(recommendation.productIds)
    ? recommendation.productIds.map(Number)
    : [];

  const recommendedProducts = products.filter(function (product) {
    return productIds.includes(Number(product.id));
  });

  if (recommendedProducts.length === 0) {
    explanationElement.textContent =
      "Ainda não identificamos materiais específicos para essa solicitação.";

    showEmptyState(
      "Não encontramos uma recomendação específica.",
      "Experimente mencionar uma atividade como pintar, instalar prateleiras, iluminar ou organizar.",
      "produtos.html",
      "Explorar catálogo"
    );

    return;
  }

  const explanations = Array.isArray(recommendation.explanations)
    ? recommendation.explanations
    : [];

  explanationElement.textContent = explanations.length
    ? explanations.join(" ")
    : "Confira os materiais sugeridos para começar seu projeto.";

  // ==========================================
  // EXIBIR CARDS DOS PRODUTOS
  // ==========================================

  resultsElement.innerHTML = recommendedProducts.map(function (product) {

    return `
      <article class="product-card results-recommendation-card">

        <div class="product-image-placeholder product-card-icon"
             aria-hidden="true">
          ${escapeHTML(product.icon || "✦")}
        </div>

        <div class="product-card-content">

          <span class="product-category">
            ${escapeHTML(product.category)}
          </span>

          <h3>${escapeHTML(product.name)}</h3>

          <p class="results-product-description">
            ${escapeHTML(product.description)}
          </p>

          <div class="results-price-area">
            <span class="results-price-label">
              VALOR DEMONSTRATIVO
            </span>

            <strong class="product-price">
              ${window.formatMoney(product.price)}
            </strong>
          </div>

          <p class="product-aisle product-location">
            <span aria-hidden="true">⌖</span>
            <strong>Localização demonstrativa:</strong>
            ${escapeHTML(product.aisle)}
          </p>

          <div class="product-actions">

            <button
              type="button"
              class="btn btn-primary add-recommended-product"
              data-product-id="${Number(product.id)}"
              aria-label="Adicionar ${escapeHTML(product.name)} ao projeto"
            >
              + Adicionar ao projeto
            </button>

            <a
              href="localizacao.html?produto=${Number(product.id)}"
              class="btn btn-secondary"
            >
              Onde encontrar ↗
            </a>

          </div>

        </div>

      </article>
    `;
  }).join("");

  // ==========================================
  // ADICIONAR PRODUTO AO PROJETO
  // ==========================================

  resultsElement.addEventListener("click", function (event) {

    const button = event.target.closest(".add-recommended-product");

    if (!button) return;

    const productId = Number(button.dataset.productId);

    if (!Number.isInteger(productId)) return;

    if (typeof window.addToProject !== "function") {
      console.error("A função addToProject não está disponível.");
      return;
    }

    window.addToProject(productId);

    // Feedback visual ao adicionar o produto.
    button.textContent = "✓ Adicionado ao projeto";
    button.classList.add("product-added");

    window.setTimeout(function () {
      if (!button.isConnected) return;

      button.textContent = "+ Adicionar ao projeto";
      button.classList.remove("product-added");
    }, 1800);

  });

});