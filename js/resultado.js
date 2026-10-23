
document.addEventListener("DOMContentLoaded", function () {
  const needElement = document.querySelector("#recommendationNeed");
  const explanationElement = document.querySelector("#recommendationExplanation");
  const resultsElement = document.querySelector("#recommendationResults");

  if (!needElement || !resultsElement) return;

  const savedResult = sessionStorage.getItem("leroyRecommendation");

  if (!savedResult) {
    needElement.textContent = "Nenhuma solicitação encontrada.";
    resultsElement.innerHTML = `
      <div class="empty-state">
        <h3>Vamos começar?</h3>
        <p>Conte ao assistente o que você deseja fazer.</p>
        <a href="assistente.html" class="btn btn-primary">
          Acessar assistente
        </a>
      </div>
    `;
    return;
  }

  let recommendation;

  try {
    recommendation = JSON.parse(savedResult);
  } catch (error) {
    needElement.textContent = "Não foi possível recuperar sua solicitação.";
    resultsElement.textContent = "Tente novamente pelo assistente.";
    return;
  }

  needElement.textContent = recommendation.need || "";

  const recommendedProducts = window.MVP_PRODUCTS.filter(product =>
    (recommendation.productIds || []).includes(product.id)
  );

  if (recommendedProducts.length === 0) {
    explanationElement.textContent =
      "Ainda não identificamos produtos específicos para essa solicitação.";

    resultsElement.innerHTML = `
      <div class="empty-state">
        <h3>Não encontramos uma recomendação específica</h3>
        <p>
          Tente mencionar uma atividade, como pintar,
          instalar prateleiras, iluminar ou organizar.
        </p>
        <a href="produtos.html" class="btn btn-secondary">
          Explorar catálogo
        </a>
      </div>
    `;
    return;
  }

  explanationElement.textContent =
    (recommendation.explanations || []).join(" ");

  resultsElement.innerHTML = recommendedProducts.map(product => `
    <article class="product-card">
      <div class="product-image-placeholder" aria-hidden="true">
        ${product.icon}
      </div>

      <div class="product-card-content">
        <span class="product-category">${product.category}</span>

        <h3>${product.name}</h3>

        <p>${product.description}</p>

        <p class="product-price">
          ${window.formatMoney(product.price)}
        </p>

        <p class="product-aisle">
          <strong>Localização demonstrativa:</strong>
          ${product.aisle}
        </p>

        <div class="product-actions">
          <button
            type="button"
            class="btn btn-primary add-recommended-product"
            data-product-id="${product.id}"
          >
            + Adicionar ao projeto
          </button>

          <a
            href="localizacao.html?produto=${product.id}"
            class="btn btn-secondary"
          >
            Onde encontrar
          </a>
        </div>
      </div>
    </article>
  `).join("");

  resultsElement.addEventListener("click", function (event) {
    const button = event.target.closest(".add-recommended-product");

    if (!button) return;

    window.addToProject(button.dataset.productId);
  });
});
