axios.defaults.baseURL = "http://localhost:3002/";
axios.defaults.headers.common["Content-Type"] =
    "application/json;charset=utf-8";

const token = localStorage.getItem("token");


//Abaxio ao clicar no link de sair é feito o logout
$(document).on("click", "#logoutSair", function (e) {
  e.preventDefault();
  localStorage.removeItem("token");
  window.location.href = "index.html";
});
    


    
$(document).ready(() => {
    
    const teste = "";
    const hoje = new Date().toLocaleDateString('en-CA'); 
    $('#filtroDataBalanco').val(hoje);
    $('#filtroGeral').val(hoje);

    // Só carrega a tabela depois de setar a data
    loadDataTable();


});


//Ao mudar o filtro geral é feito uma nova chamada e atualizado os dados.
$('#filtroDataBalanco').on('change', function () {
        loadDataTable();
});



//Função abaixa converte a data que é fornecida para o padrão ANO-MÊS-DIA.
function passaDataAnoMesDia(dateString) {
   return dateString.split('T')[0];
}



//Faz um get do balanco de estoque
function loadDataTable() {
    
    const datafiltro = document.getElementById("filtroDataBalanco").value;
    axios.get(`/balancoestoque/${datafiltro}`, {headers: {Authorization: `Bearer ${token}`}})
        .then((response) => {
            processResults(response.data);
        })
        .catch((error) => {
            console.log('Erro ao carregar dados:', error);
        });
}



//Mostra os dados de balanco
function processResults(rows) {

    // Limpar conteúdo anterior da tabela
    $('#rowTable').empty();

    let resultsTable = `
    <div class="col-12 mt-4">
        <table id="resultsTable" class="table table-striped">
        <thead>
            <tr>
                <th scope="col">Código</th>
                <th scope="col">Produto</th>
                <th scope="col">Grupo</th>
                <th scope="col">Estoque Dia Anterior</th>
                <th scope="col">Produção</th>
                <th scope="col">Vendas</th>
                <th scope="col">Estoque Calculado</th>
                <th scope="col">Estoque Contado</th>
                <th scope="col">Delta</th>
                <th scope="col">Data</th>
            </tr>
        </thead>
        <tbody>`;
    for (let i = 0; i < rows.length; i++) {
        resultsTable += `<tr><td> ${rows[i].cod_prod}</td>`;
        resultsTable += `<td>${rows[i].nome_prod}</td>`
        resultsTable += `<td>${rows[i].grupo_produto}</td>`
        resultsTable += `<td>${rows[i].qtd_estoque_anterior}</td>`
        resultsTable += `<td>${rows[i].qtd_producao}</td>`
        resultsTable += `<td>${rows[i].qtd_vendas}</td>`
        resultsTable += `<td>${rows[i].qtd_estoque_calculado}</td>`
        resultsTable += `<td>${rows[i].qtd_contado}</td>`
        resultsTable += `<td>${rows[i].qtd_balanco}</td>`
        resultsTable += `<td>${passaDataAnoMesDia(rows[i].dt_referencia)}</td></tr>`
    }
    resultsTable += `
        </tbody>
        </table>
    </div>`;

    // Manter o formulário visível e adicionar a tabela abaixo
    
    $(resultsTable).appendTo('#rowTable');
}



//Função de lgout ao clicar no <a> do navber para deslogar 
$(document).on("click", "#logoutSair", function (e) {
  e.preventDefault();
  localStorage.removeItem("token"); 
  window.location.href = "login.html"; 
});

