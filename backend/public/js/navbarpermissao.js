//Adiciona um listenar ao carregar o dom.
document.addEventListener("DOMContentLoaded", () => {

  //Pega o token gerado ao logar
  const token = localStorage.getItem("token");
  if (!token) return;
 
  //Pegas a permissão do token
  const payload = JSON.parse(atob(token.split('.')[1]));
  const permissao = payload.permissao;

  const permissoesPorLink = {
    "produto.html": ["ADM", "PRD"],
    "estoqueinicial.html": ["ADM", "PRD", "VEN", "CON"],
    "estoquecontado.html": ["ADM", "CON"],
    "estoqueproducao.html": ["ADM", "PRD"],
    "vendas.html": ["ADM", "VEN"],
    "usuarios.html": ["ADM"]
  };
  
 //Percorre o navbar da tela index.html para esconder os links que não estão disponíveis.
  document.querySelectorAll("a.nav-link").forEach(link => {
    const href = link.getAttribute("href");
    if (permissoesPorLink[href] && !permissoesPorLink[href].includes(permissao)) {
      link.style.display = "none";
    }
  });
});