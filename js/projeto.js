alert("O JavaScript do Meu Projeto carregou!");
document.addEventListener("DOMContentLoaded", function () {

  const projectItems = document.querySelector("#projectItems");
  const totalQuantity = document.querySelector("#totalQuantity");
  const subtotalElement = document.querySelector("#projectSubtotal");
  const totalElement = document.querySelector("#projectTotal");
  const clearButton = document.querySelector("#clearProject");

  if (
    !projectItems ||
    !totalQuantity ||
    !subtotalElement ||
    !totalElement ||
    !clearButton
  ) {
    console.error("Elementos da página Meu Projeto não encontrados.");
    return;
  }

  if (
    typeof window.getProject !== "function" ||
    typeof window.saveProject !== "function" ||
    typeof window.updateProjectCount !== "function" ||
    typeof window.formatMoney !== "function" ||
    !Array.isArray(window.MVP_PRODUCTS)
  ) {
    projectItems.textContent =
      "Não foi possível carregar seu projeto. Verifique o app.js.";

    return;
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
  // EXIBIR PROJETO
  // ==========================================

  function renderProject() {

    const project = window.getProject();
    const products = window.MVP_PRODUCTS;

    let total = 0;
    let quantity = 0;

    const validItems = project
      .map(function (item) {

        const product = products.find(
          p => p.id === Number(item.id)
        );

        const itemQuantity = Number(item.quantity);

        if (
          !product ||
          !Number.isInteger(itemQuantity) ||
          itemQuantity < 1
        ) {
          return null;
        }

        return {
          ...product,
          quantity: itemQuantity
        };
      })
      .filter(Boolean);

    // PROJETO VAZIO
    if (validItems.length === 0) {

      projectItems.innerHTML = `
        <div class="empty-state project-empty-state">

          <span class="project-empty-icon" aria-hidden="true">
            ✦
          </span>

          <h3>Seu projeto está esperando por você.</h3>

          <p>
            Comece explorando nosso catálogo ou conte
            sua ideia ao assistente para descobrir
            os materiais ideais.
          </p>

          <a href="produtos.html" class="project-empty-button">
            Explorar produtos ↗
          </a>

        </div>
      `;

    } else {

      projectItems.innerHTML = validItems.map(function (product) {

        const itemTotal = product.price * product.quantity;

        total += itemTotal;
        quantity += product.quantity;

        return `
          <article class="project-item">

            <div class="project-item-icon" aria-hidden="true">
              ${escapeHTML(product.icon || "✦")}
            </div>

            <div class="project-item-info">

              <span class="project-item-category">
                ${escapeHTML(product.category)}
              </span>

              <h3>${escapeHTML(product.name)}</h3>

              <p class="project-item-location">
                <span aria-hidden="true">⌖</span>
                Localização demonstrativa:
                ${escapeHTML(product.aisle)}
              </p>

              <p class="project-item-unit-price">
                Valor unitário:
                <strong>${window.formatMoney(product.price)}</strong>
              </p>

              <div class="project-item-bottom">

                <div class="project-quantity-area">

                  <span class="project-quantity-label">
                    Quantidade
                  </span>

                  <div class="quantity-control">

                    <button
                      type="button"
                      class="decrease-quantity"
                      data-product-id="${product.id}"
                      aria-label="Diminuir quantidade de ${escapeHTML(product.name)}"
                    >
                      −
                    </button>

                    <span class="quantity-value">
                      ${product.quantity}
                    </span>

                    <button
                      type="button"
                      class="increase-quantity"
                      data-product-id="${product.id}"
                      aria-label="Aumentar quantidade de ${escapeHTML(product.name)}"
                    >
                      +
                    </button>

                  </div>

                </div>

                <div class="project-item-price-area">
                  <span>Total do produto</span>

                  <strong class="project-item-total">
                    ${window.formatMoney(itemTotal)}
                  </strong>
                </div>

              </div>

              <button
                type="button"
                class="remove-product"
                data-product-id="${product.id}"
              >
                Remover produto
              </button>

            </div>

          </article>
        `;
      }).join("");
    }

    // ATUALIZAR ORÇAMENTO
    totalQuantity.textContent = quantity;
    subtotalElement.textContent = window.formatMoney(total);
    totalElement.textContent = window.formatMoney(total);

    clearButton.disabled = validItems.length === 0;

    window.updateProjectCount();
  }

  // ==========================================
  // ALTERAR QUANTIDADE
  // ==========================================

  function changeQuantity(productId, amount) {

    const project = window.getProject();

    const item = project.find(
      p => Number(p.id) === Number(productId)
    );

    if (!item) return;

    item.quantity = Number(item.quantity) + amount;

    const updatedProject = project.filter(
      p => Number(p.quantity) > 0
    );

    window.saveProject(updatedProject);
    renderProject();
  }

  // ==========================================
  // REMOVER PRODUTO
  // ==========================================

  function removeProduct(productId) {

    const project = window.getProject();

    const updatedProject = project.filter(
      p => Number(p.id) !== Number(productId)
    );

    window.saveProject(updatedProject);
    renderProject();
  }

  // ==========================================
  // CLIQUES NOS BOTÕES
  // ==========================================

  projectItems.addEventListener("click", function (event) {

    const button = event.target.closest("button");

    if (!button) return;

    const productId = button.dataset.productId;

    if (button.classList.contains("increase-quantity")) {
      changeQuantity(productId, 1);
    }

    if (button.classList.contains("decrease-quantity")) {
      changeQuantity(productId, -1);
    }

    if (button.classList.contains("remove-product")) {
      removeProduct(productId);
    }

  });

  // ==========================================
  // LIMPAR PROJETO
  // ==========================================

  clearButton.addEventListener("click", function () {

    const project = window.getProject();

    if (project.length === 0) return;

    const confirmed = window.confirm(
      "Deseja realmente remover todos os produtos do projeto?"
    );

    if (!confirmed) return;

    window.saveProject([]);
    renderProject();

  });

  // CARREGAMENTO INICIAL
  try {
    renderProject();
  } catch (error) {
    console.error("Erro ao carregar o projeto:", error);
    projectItems.textContent =
      "Ocorreu um erro ao carregar seu projeto.";
  }

});