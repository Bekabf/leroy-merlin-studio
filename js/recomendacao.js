
document.addEventListener("DOMContentLoaded", function () {

  const form = document.querySelector("#assistantForm");
  const needText = document.querySelector("#needText");
  const output = document.querySelector("#assistantOutput");

  if (!form || !needText || !output) {
    return;
  }

  // ==========================================
  // REGRAS DE RECOMENDAÇÃO
  // ==========================================

  const rules = [
    {
      category: "pintura",
      keywords: [
        "pintar",
        "pintura",
        "tinta",
        "pincel",
        "repintar"
      ],
      products: [1, 2],
      explanation:
        "Para seu projeto de pintura, recomendamos tinta para parede e um kit de pincéis."
    },

    {
      category: "instalacao",
      keywords: [
        "instalar",
        "instalacao",
        "prateleira",
        "furar",
        "furadeira",
        "parafuso",
        "parafusos",
        "bucha",
        "buchas",
        "fixar",
        "pendurar"
      ],
      products: [3, 4],
      explanation:
        "Para instalar ou fixar objetos, recomendamos uma furadeira e um kit de buchas e parafusos."
    },

    {
      category: "iluminacao",
      keywords: [
        "iluminar",
        "iluminacao",
        "lampada",
        "luz",
        "clarear",
        "claridade"
      ],
      products: [5],
      explanation:
        "Para melhorar a iluminação do ambiente, recomendamos uma lâmpada LED."
    },

    {
      category: "banheiro",
      keywords: [
        "banheiro",
        "torneira",
        "pia",
        "vedar",
        "vedacao",
        "silicone"
      ],
      products: [6, 9],
      explanation:
        "Para pequenas melhorias no banheiro, sugerimos uma torneira e um silicone vedante."
    },

    {
      category: "organizacao",
      keywords: [
        "organizar",
        "organizacao",
        "guardar",
        "armazenar",
        "arrumar",
        "organizador"
      ],
      products: [7],
      explanation:
        "Para organizar melhor seu ambiente, recomendamos um organizador multiuso."
    },

    {
      category: "decoracao",
      keywords: [
        "decorar",
        "decoracao",
        "vaso",
        "enfeitar",
        "ornamentar"
      ],
      products: [8],
      explanation:
        "Para complementar a decoração, recomendamos um vaso decorativo."
    }
  ];

  // ==========================================
  // NORMALIZAR TEXTO
  // Remove acentos e diferenciação de maiúsculas
  // ==========================================

  function normalizeText(text) {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  // ==========================================
  // IDENTIFICAR PALAVRAS-CHAVE
  // ==========================================

  function hasKeyword(text, keyword) {

    const normalizedKeyword = normalizeText(keyword);

    // Evita correspondências dentro de outras palavras.
    const escapedKeyword = normalizedKeyword.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    const pattern = new RegExp(
      "(^|[^a-z0-9])" + escapedKeyword + "(?=$|[^a-z0-9])"
    );

    return pattern.test(text);
  }

  // ==========================================
  // PROCESSAR RECOMENDAÇÕES
  // ==========================================

  function getRecommendations(need) {

    const normalizedNeed = normalizeText(need);

    const recommendedIds = new Set();
    const explanations = [];

    rules.forEach(function (rule) {

      const matches = rule.keywords.some(function (keyword) {
        return hasKeyword(normalizedNeed, keyword);
      });

      if (matches) {

        rule.products.forEach(function (id) {
          recommendedIds.add(id);
        });

        explanations.push(rule.explanation);
      }

    });

    return {
      productIds: Array.from(recommendedIds),
      explanations: explanations
    };
  }

  // ==========================================
  // ENVIO DO FORMULÁRIO
  // ==========================================

  form.addEventListener("submit", function (event) {

    event.preventDefault();

    const need = needText.value.trim();

    output.textContent = "";

    if (!need) {
      output.textContent =
        "Por favor, descreva o que deseja realizar.";
      needText.focus();
      return;
    }

    const recommendations = getRecommendations(need);

    // Se nenhuma palavra-chave for reconhecida,
    // não recomenda produtos aleatórios.
    if (recommendations.productIds.length === 0) {

      output.textContent =
        "Ainda não encontramos produtos específicos para essa ideia. " +
        "Tente descrever o que deseja fazer com mais detalhes, " +
        "como pintar, instalar, iluminar, organizar ou decorar.";

      return;
    }

    // Mantém o formato esperado pelo resultado.js.
    const result = {
      need: need,
      productIds: recommendations.productIds,
      explanations: recommendations.explanations
    };

    sessionStorage.setItem(
      "leroyRecommendation",
      JSON.stringify(result)
    );

    // Redireciona para a página de resultados.
    window.location.href = "resultado.html";

  });

});
