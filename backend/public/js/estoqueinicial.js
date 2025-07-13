axios.defaults.baseURL = "http://localhost:3002/";
axios.defaults.headers.common["Content-Type"] =
    "application/json;charset=utf-8";

const token = localStorage.getItem("token");
    


//Abaixo ao clicar no link de sair é feito o logout
$(document).on("click", "#logoutSair", function (e) {
  e.preventDefault();
  localStorage.removeItem("token");
  window.location.href = "login.html";
});
    



$(document).ready(() => {
    loadDataTable();
});



//Ao clicar no botão de novo é feito o submit do mainForm
$('#btnSubmit').click(function() {
    $('#mainForm').submit();
});



//Validação dos dados do mainForm
$('#mainForm').validate({
    rules: {
        codprod: {
            required: true,
            digits: true
        },
        nome: {
            required: true,
        },
        grupo: {
            required: true,
        },
        qtdest: {
            required: true,
            digits: true
        },
        validade: {
            required: true,
            digits: true
        },
        datest: {
            required: true,
        },

    },

    onfocusout: validateFiels,
    submitHandler: createAjaxPost
    
});



//Função que valida os dados do MainForm
function validateFiels(element, event) {
       $(element).valid();
}



//Função abaixo da um post do estoque
function createAjaxPost() {

    const data = {
        cod: $('#codprod')[0].value,
        nome: $('#nome')[0].value,
        grupo: $('#grupo')[0].value,
        qtdest: $('#qtdest')[0].value,
        validade: $('#validade')[0].value,
        datest: $('#datest')[0].value,
    }

    const res = axios.post('/estoqueinicial', data, {headers: {Authorization: `Bearer ${token}`}});
    res.then((query) => {
        console.log(query.data);
        alert("Estoque inicial cadastrado com sucesso!");
        // Limpar os campos do formulário após sucesso
        $('#codprod').val('');
        $('#nome').val('');
        $('#grupo').val('');
        $('#qtdest').val('');
        $('#validade').val('');
        $('#datest').val('');

        // Resetar a validação do formulário
        $('#mainForm').validate().resetForm();

        // Após inserir, buscar e exibir todos os dados
        loadDataTable();
    }).catch((error) => {
        console.log(error);
    });

    const res2 = axios.post('/historicoinicial', data, {headers: {Authorization: `Bearer ${token}`}});
    res2.then((query) => {
        console.log(query.data);
        }).catch((error) => {
        console.log(error);
    });
}



//Faz um get do estoque
function loadDataTable() {

    axios.get('/estoqueinicial', {headers: {Authorization: `Bearer ${token}`}})
        .then((response) => {
            processResults(response.data);
        })
        .catch((error) => {
            console.log('Erro ao carregar dados:', error);
        });
}


//Função abaixa converte a data que é fornecida para o padrão ANO-MÊS-DIA.
function passaDataAnoMesDia(dateString) {
   return dateString.split('T')[0];
}



//Mostra os dados do estoque
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
                <th scope="col">Quantidade</th>
                <th scope="col">Dias Validade</th>
                <th scope="col">Data Produção</th>
            </tr>
        </thead>
        <tbody>`;
    for (let i = 0; i < rows.length; i++) {
        resultsTable += `<tr><td> ${rows[i].cod_prod}</td>`;
        resultsTable += `<td>${rows[i].nome_prod}</td>`
        resultsTable += `<td>${rows[i].grupo_produto}</td>`
        resultsTable += `<td>${rows[i].qtd_est}</td>`
        resultsTable += `<td>${rows[i].validade_est}</td>`
        resultsTable += `<td>${passaDataAnoMesDia(rows[i].datafab_est)}</td>`
        resultsTable += `<td><div class="d-flex" style="gap: 10px;">
                          <button class="btnEdit btn btn-warning" data-id="${rows[i].cod_prod}" data-datafab="${passaDataAnoMesDia(rows[i].datafab_est)}">Editar</button>
                           <button class="btnDelete btn btn-danger" data-id="${rows[i].cod_prod}" data-datafab="${passaDataAnoMesDia(rows[i].datafab_est)}">Deletar</button>
                        </div></td></tr>`
    }
    resultsTable += `
        </tbody>
        </table>
    </div>`;

    // Manter o formulário visível e adicionar a tabela abaixo
    $(resultsTable).appendTo('#rowTable');
}



//Ao clicar no botão delete da tabela ele deleta conforme o código, data e tipo
$(document).on('click', '.btnDelete', function () {

    const id = $(this).data('id');
    const datafab = $(this).data('datafab');
  

    axios.delete(`/estoqueinicial/${id}/${datafab}`, {headers: {Authorization: `Bearer ${token}`}})
        .then((response) => {
            loadDataTable(); 
        })
        .catch((error) => {
            console.error(error);
        });

});


//Abaixo ao clicar no botão de editar criado na função processResults() é preenchido os dados conforme o código e data do estoque.
$(document).on('click', '.btnEdit', function () {

    const cod = $(this).data('id');
    const datafab = $(this).data('datafab');

    axios.get(`/estoqueinicial/${cod}/${datafab}`, {headers: {Authorization: `Bearer ${token}`}})
        .then((res) => {

            const estoque = res.data;
            $('#editCod').val(estoque.cod_prod);
            $('#editNome').val(estoque.nome_prod);
            $('#editGrupo').val(estoque.grupo_produto);
            $('#editQtdest').val(estoque.qtd_est);
            $('#editValidade').val(estoque.validade_est);
            $('#editDatest').val(passaDataAnoMesDia(estoque.datafab_est));

            //Adiciona código ao botão de salvar edição
            $('#btnSaveEdit').data('id', cod); 
            $('#btnSaveEdit').data('dtfab', datafab); 

            $('#modalEdit').modal('show');

        })
        .catch((error) => {
            console.log("Erro ao buscar estoque para edição:", error);
        });
});

//Abaixo é submitido o editForm
$('#btnSaveEdit').click(function () {
    $('#editForm').submit(); 
});



//Validação dos dados do editForm
$('#editForm').validate({

    rules: {
        editCod: {
            required: true,
            digits: true
        },
        editNome: {
            required: true,
        },
        editGrupo: {
            required: true,
        },
        editQtdest: {
            required: true,
            digits: true
        },
        editValidade: {
            required: true,
            digits: true
        },
        editDatest: {
            required: true,
        },

    },

    onfocusout: validateFiels,
    submitHandler: createAjaxPut  

});


//Update do estoque inicial
function createAjaxPut() {

    const cod = $('#btnSaveEdit').data('id');
    const datafab = $('#btnSaveEdit').data('dtfab');

    const data = {

        cod: $('#editCod').val(),
        datest: passaDataAnoMesDia($('#editDatest').val()),
        validade: $('#editValidade').val(),
        qtdest: $('#editQtdest').val()

    };
    
    axios.put(`/estoqueinicial/${cod}/${datafab}`, data, {headers: {Authorization: `Bearer ${token}`}})
        .then(() => {

            $('#modalEdit').modal('hide');
            $('#editForm').validate().resetForm();
            loadDataTable();

        })
        .catch((error) => {

            console.error("Erro ao atualizar estoque:", error);
        });
}


//Prenchimento automático dos dados ao pesquisar um código de produto
document.getElementById("codprod").addEventListener("input", async function () {
     const cod = this.value;
    
     if (cod.trim() === "") {
        document.getElementById("sugestoes").innerHTML = "";
        $('#codprod').val('');
        $('#nome').val('');
        $('#grupo').val('');
        return; 
     }

     try {

         const resposta = await axios.get(`/filtraprodutos/${cod}`, {headers: {Authorization: `Bearer ${token}`}});
         const produtos = resposta.data;
         const sugestoesDiv = document.getElementById("sugestoes");
         sugestoesDiv.innerHTML = "";   

         produtos.forEach(produto => {
             const item = document.createElement("a");
             item.classList.add("list-group-item", "list-group-item-action");
             item.textContent = `${produto.cod_prod} - ${produto.nome_prod}`;
             item.addEventListener("click", () => {
             document.getElementById("codprod").value = produto.cod_prod;
             document.getElementById("nome").value = produto.nome_prod;
             document.getElementById("grupo").value = produto.grupo_produto;
             sugestoesDiv.innerHTML = "";
     });
       sugestoesDiv.appendChild(item); });
     } catch (error) {
        console.error("Erro ao buscar produto:", error);
    }

});

