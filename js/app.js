
const MVP_PRODUCTS = [
  {
    id: 1,
    name: "Tinta para parede 3,6 L",
    category: "Pintura",
    price: 89.90,
    description: "Ideal para renovar o visual dos ambientes.",
    aisle: "Corredor 04",
    icon: "🎨"
  },
  {
    id: 2,
    name: "Kit de pincéis",
    category: "Pintura",
    price: 24.90,
    description: "Para pintura e acabamento.",
    aisle: "Corredor 04",
    icon: "🖌️"
  },
  {
    id: 3,
    name: "Furadeira compacta",
    category: "Ferramentas",
    price: 199.90,
    description: "Para pequenos reparos e instalações.",
    aisle: "Corredor 08",
    icon: "🛠️"
  },
  {
    id: 4,
    name: "Kit de buchas e parafusos",
    category: "Ferragens",
    price: 18.90,
    description: "Para fixação de objetos em diferentes superfícies.",
    aisle: "Corredor 09",
    icon: "🔩"
  },
  {
    id: 5,
    name: "Lâmpada LED",
    category: "Iluminação",
    price: 14.90,
    description: "Uma opção para iluminar sua casa.",
    aisle: "Corredor 02",
    icon: "💡"
  },
  {
    id: 6,
    name: "Torneira para banheiro",
    category: "Banheiro",
    price: 79.90,
    description: "Para renovar a pia do banheiro.",
    aisle: "Corredor 12",
    icon: "🚰"
  },
  {
    id: 7,
    name: "Organizador multiuso",
    category: "Organização",
    price: 39.90,
    description: "Ajuda a manter seus objetos organizados.",
    aisle: "Corredor 06",
    icon: "🧺"
  },
  {
    id: 8,
    name: "Vaso decorativo",
    category: "Decoração",
    price: 34.90,
    description: "Um detalhe para valorizar seu ambiente.",
    aisle: "Corredor 15",
    icon: "🪴"
  },
  {
    id: 9,
    name: "Silicone vedante",
    category: "Ferragens",
    price: 22.90,
    description: "Auxilia na vedação de frestas e juntas.",
    aisle: "Corredor 09",
    icon: "🧰"
  }
];

// Disponibiliza os produtos para os outros arquivos JavaScript.
window.MVP_PRODUCTS = MVP_PRODUCTS;

// Formata valores no padrão brasileiro: R$ 89,90.
window.formatMoney = function (value) {
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
};

// Recupera o projeto salvo no navegador.
window.getProject = function () {
  try {
    const savedProject = localStorage.getItem("leroyMVPProject");
    return savedProject ? JSON.parse(savedProject) : [];
  } catch (error) {
    console.error("Não foi possível carregar o projeto:", error);
    return [];
  }
};

// Salva o projeto no navegador.
window.saveProject = function (project) {
  localStorage.setItem("leroyMVPProject", JSON.stringify(project));
  window.updateProjectCount();
};

// Adiciona um produto ao projeto ou aumenta sua quantidade.
window.addToProject = function (productId) {
  const product = MVP_PRODUCTS.find(
    item => item.id === Number(productId)
  );

  if (!product) {
    alert("Não encontramos esse produto.");
    return;
  }

  const project = window.getProject();
  const existingItem = project.find(
    item => item.id === product.id
  );

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    project.push({
      id: product.id,
      quantity: 1
    });
  }

  window.saveProject(project);
  alert(`${product.name} foi adicionado ao seu projeto!`);
};

// Atualiza o contador de itens no cabeçalho, se ele existir.
window.updateProjectCount = function () {
  const counter = document.querySelector("#projectCount");

  if (!counter) return;

  const totalItems = window.getProject().reduce(
    (total, item) => total + item.quantity,
    0
  );

  counter.textContent = totalItems;
};

// Configura elementos comuns da página inicial.
document.addEventListener("DOMContentLoaded", function () {
  window.updateProjectCount();

  const menuButton = document.querySelector("#menuToggle");
  const navigation = document.querySelector(".main-nav");

  if (menuButton && navigation) {
    menuButton.addEventListener("click", function () {
      navigation.classList.toggle("active");
    });
  }
});
