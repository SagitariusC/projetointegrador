axios.defaults.baseURL = "http://localhost:3002/";
axios.defaults.headers.common["Content-Type"] =
    "application/json;charset=utf-8";

const token = localStorage.getItem("token");


//Abaxio ao clicar no link de sair é feito o logout
$(document).on("click", "#logoutSair", function (e) {
  e.preventDefault();
  localStorage.removeItem("token");
  window.location.href = "login.html";
});
    

    
$(document).ready(() => {
    loadDataTable();
    
    //Pega a data de hoje e adiciona no modal impedindo que o usuário digite do MainForm
    const hoje = new Date().toLocaleDateString('en-CA');
    $('#dataven').val(hoje);
    $('#dataven').attr('readonly', true); 
    $('#dataven').on('keydown click', (e) => {
        e.preventDefault();
    });

     //Pega a data de hoje e adiciona no modal impedindo que o usuário digite do editForm
    $('#editDataven').val(hoje);
    $('#editDataven').attr('readonly', true);
    $('#editDataven').on('keydown click', (e) => {
        e.preventDefault();
    });
    
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
        qtdven: {
            required: true,
            digits: true
        },
        dataven: {
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



//Função abaixo da um post da venda
function createAjaxPost() {

    const data = {
        cod: $('#codprod')[0].value,
        nome: $('#nome')[0].value,
        grupo: $('#grupo')[0].value,
        qtdven: $('#qtdven')[0].value,
        dataven: $('#dataven')[0].value,
    }
   
    const codProd = data.cod;
    const qtdVendas = parseInt(data.qtdven);

    const res = axios.post('/vendas', data, {headers: {Authorization: `Bearer ${token}`}});
    res.then((query) => {
        console.log(query.data);
        
        // Limpar os campos do formulário após sucesso
        $('#codprod').val('');
        $('#nome').val('');
        $('#grupo').val('');
        $('#qtdven').val('');
        $('#dataven').val('');

        // Resetar a validação do formulário
        $('#mainForm').validate().resetForm();

        // Após inserir, buscar e exibir todos os dados
        loadDataTable();
    }).catch((error) => {
        console.log(error);
    });
    
    //Abaixo verificar se tem historico estoque do produto no dia, caso sim então é feito a atualização conforme o valor e caso não é inserido no historico.
    axios.get(`/contagemhistoricoestoque/${codProd}`, {headers: {Authorization: `Bearer ${token}`}}).then((response) => {
          const quantidade = response.data;
          if (quantidade.qtd === "0") {
            axios.post('/historicoestoque', {
                cod: codProd,
                qtdest: 0,
                qtdVendas: qtdVendas
            }, {headers: {Authorization: `Bearer ${token}`}});  
          } else{
            axios.put('/historicoestoquevendas', { cod: codProd }, {headers: {Authorization: `Bearer ${token}`}});
          }

        })
          .catch((error) => {
            console.error("Erro na requisição:", error);
    });
}



//Faz um get da vendas
function loadDataTable() {

    axios.get('/vendas', {headers: {Authorization: `Bearer ${token}`}})
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



//Mostra os dados das vendas
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
                <th scope="col">Data Venda</th>
            </tr>
        </thead>
        <tbody>`;
    for (let i = 0; i < rows.length; i++) {
        resultsTable += `<tr><td> ${rows[i].cod_prod}</td>`;
        resultsTable += `<td>${rows[i].nome_prod}</td>`
        resultsTable += `<td>${rows[i].grupo_produto}</td>`
        resultsTable += `<td>${rows[i].qtd_ven}</td>`
        resultsTable += `<td>${passaDataAnoMesDia(rows[i].data_ven)}</td>`
        resultsTable += `<td><div class="d-flex" style="gap: 10px;">
                          <button class="btnEdit btn btn-warning" data-id="${rows[i].cod_prod}" data-dataven="${passaDataAnoMesDia(rows[i].data_ven)}">Editar</button>
                           <button class="btnDelete btn btn-danger" data-id="${rows[i].cod_prod}" data-dataven="${passaDataAnoMesDia(rows[i].data_ven)}" data-qtdvenda="${rows[i].qtd_ven}">Deletar</button>
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
    const dataven = $(this).data('dataven');
    const qtd_vend = $(this).data('qtdvenda');
    
    data = {
        cod: id,
        datavenda : dataven,
        qtd_venda : qtd_vend
    }
    axios.delete(`/vendas/${id}/${dataven}`, {headers: {Authorization: `Bearer ${token}`}})
        .then((response) => {
            loadDataTable(); 
    })
        .catch((error) => {
            console.error(error);
    });
    
    //Atuliza dados do histórico de estoque sem as vendas referente a data que foi deletada a venda.
    axios.put(`/historicoestoqueaodeletarvenda`, data, {headers: {Authorization: `Bearer ${token}`}})
        .then((response) => {
            loadDataTable(); 
        })
        .catch((error) => {
            console.error(error);
    });

});


//Abaixo ao clicar no botão de editar criado na função processResults() é preenchido os dados conforme o código e data da venda.
$(document).on('click', '.btnEdit', function () {

    const cod = $(this).data('id');
    const dataven = $(this).data('dataven');

    axios.get(`/vendas/${cod}/${dataven}`, {headers: {Authorization: `Bearer ${token}`}})
        .then((res) => {

            const venda = res.data;
            $('#editCod').val(venda.cod_prod);
            $('#editNome').val(venda.nome_prod);
            $('#editGrupo').val(venda.grupo_produto);
            $('#editQtdven').val(venda.qtd_ven);
            $('#editDataven').val(passaDataAnoMesDia(venda.data_ven));

            //Adiciona código ao botão de salvar edição
            $('#btnSaveEdit').data('id', cod); 
            $('#btnSaveEdit').data('dtven', dataven); 
            $('#btnSaveEdit').data('qtd_venda', venda.qtd_ven); 


            $('#modalEdit').modal('show');

        })
        .catch((error) => {
            console.log("Erro ao buscar venda para edição:", error);
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
        editQtdven: {
            required: true,
            digits: true
        },
        editDataven: {
            required: true,
        },

    },

    onfocusout: validateFiels,
    submitHandler: createAjaxPut  

});


//Atualiza vendas
function createAjaxPut() {

    const cod = $('#btnSaveEdit').data('id');
    const dtven = $('#btnSaveEdit').data('dtven');
    const qtd_anterior = $('#btnSaveEdit').data('qtd_venda');

    const data_ant = {

        cod: cod ,
        dataven: dtven,
        qtd_ant: qtd_anterior,
        qtd_novo: $('#editQtdven').val()

    };

    const data = {

        cod: $('#editCod').val(),
        dataven: passaDataAnoMesDia($('#editDataven').val()),
        qtdven: $('#editQtdven').val()

    };
    
    axios.put(`/vendas/${cod}/${dtven}`, data, {headers: {Authorization: `Bearer ${token}`}})
        .then(() => {

            $('#modalEdit').modal('hide');
            $('#editForm').validate().resetForm();
            loadDataTable();

        })
        .catch((error) => {

            console.error("Erro ao atualizar venda:", error);
        });


    axios.put(`\historicoestoquevendaedicao`, data_ant, {headers: {Authorization: `Bearer ${token}`}})
        .then(() => {
             console.log("Editado historico de estoque.")
        })
        .catch((error) => {

            console.error("Erro ao atualizar venda:", error);
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
        console.error("Erro ao buscar venda:", error);
    }

});

