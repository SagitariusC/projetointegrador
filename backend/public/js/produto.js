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
        stat: {
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



//Função abaixo da um post de um novo produto
function createAjaxPost() {
    const data = {
        cod: $('#codprod')[0].value,
        nome: $('#nome')[0].value,
        grupo: $('#grupo')[0].value,
        stat: $('#stat')[0].value
    }



    const res = axios.post('/produtos', data, {headers: {Authorization: `Bearer ${token}`}});
    res.then((query) => {
        console.log(query.data);
 
        alert("Produto cadastrado com sucesso!");
        // Limpar os campos do formulário após sucesso
        $('#codprod').val('');
        $('#nome').val('');
        $('#grupo').val('');

        // Resetar a validação do formulário
        $('#mainForm').validate().resetForm();

        // Após inserir, buscar e exibir todos os dados
        loadDataTable();
    }).catch((error) => {
        console.log(error);
    });
}



//Faz um get dos produtos
function loadDataTable() {
    axios.get('/produtos', {headers: {Authorization: `Bearer ${token}`}})
        .then((response) => {
            processResults(response.data);
        })
        .catch((error) => {
            console.log('Erro ao carregar dados:', error);
        });
}



//Mostra os dados do produto em formato de tabela
function processResults(rows) {
    // Limpar conteúdo anterior da tabela
    $('#rowTable').empty();

    let resultsTable = `
    <div class="col-12 mt-4">
        <table id="resultsTable" class="table table-striped">
        <thead>
            <tr>
                <th scope="col">Código</th>
                <th scope="col">Nome</th>
                <th scope="col">Grupo</th>
                <th scope="col">Status</th>
            </tr>
        </thead>
        <tbody>`;
    for (let i = 0; i < rows.length; i++) {
        resultsTable += `<tr><td> ${rows[i].cod_prod}</td>`;
        resultsTable += `<td>${rows[i].nome_prod}</td>`
        resultsTable += `<td>${rows[i].grupo_produto}</td>`
        resultsTable += `<td>${rows[i].status_prod}</td>`
        resultsTable += `<td><div class="d-flex" style="gap: 10px;">
                          <button class="btnEdit btn btn-warning" data-id="${rows[i].cod_prod}">Editar</button>
                           <button class="btnDelete btn btn-danger" data-id="${rows[i].cod_prod}">Deletar</button>
                        </div></td></tr>`
    }
    resultsTable += `
        </tbody>
        </table>
    </div>`;

    // Manter o formulário visível e adicionar a tabela abaixo
    $(resultsTable).appendTo('#rowTable');
}



//Ao clicar no botão delete da tabela criada na função processResults ele deleta conforme o valor do código do produto desse botão
$(document).on('click', '.btnDelete', function () {
    const id = $(this).data('id');
    
    axios.delete(`/produtos/${id}`,{headers: {Authorization: `Bearer ${token}`}})
        .then((response) => {
            loadDataTable(); 
        })
        .catch((error) => {
            console.error(error);
    });

});


//Abaixo ao clicar no botão que é gerado no processResult() abre um formulário preenchido com os dado confore o id do btnedit
$(document).on('click', '.btnEdit', function () {
    const cod = $(this).data('id');

    axios.get(`/produtos/${cod}`,{headers: {Authorization: `Bearer ${token}`}})
        .then((res) => {
            const produto = res.data;
            $('#editCod').val(produto.cod_prod);
            $('#editNome').val(produto.nome_prod);
            $('#editGrupo').val(produto.grupo_produto);
            $('#editStatus').val(produto.status_prod);
             
            //Adiciona código ao botão de salvar edição
            $('#btnSaveEdit').data('id', cod); 

            $('#modalEdit').modal('show');
        })
        .catch((error) => {
            console.log("Erro ao buscar produto para edição:", error);
        });
});


//Abaixo ocorre o submit do editForm
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
        editStatus: {
            required: true,
        },
    },
    onfocusout: validateFiels,
    submitHandler: createAjaxPut  
});


//Abaixo ao clicar em salvar no formulário e edição é feito o update dos dados
function createAjaxPut() {

    const cod = $('#btnSaveEdit').data('id');

    const data = {
        cod: $('#editCod').val(),
        nome: $('#editNome').val(),
        grupo: $('#editGrupo').val(),
        stat: $('#editStatus').val()
    };
    
    axios.put(`/produtos/${cod}`, data, {headers: {Authorization: `Bearer ${token}`}})
        .then(() => {
            $('#modalEdit').modal('hide');
            $('#editForm').validate().resetForm();
            loadDataTable();
        })
        .catch((error) => {
            console.error("Erro ao atualizar produto:", error);
        });
}