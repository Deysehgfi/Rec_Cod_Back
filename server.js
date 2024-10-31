import { createServer } from "node:http"
import { readFile, writeFile } from "node:fs"
import nodemon from "nodemon";


const PORT = 3333;

const lerDadosPessoas = (callback) => {
    //   readFile('nome','tipo',(err, data)=>{
    //   })
    readFile('Pessoas.json', 'utf-8', (err, data) => {
        if (err) {
            callback(err)
            //se ouver erro ao ler o arquivo
        } else { //se naõ der erro na leitura ai vai entra em uma condição 
            //se não der erro na leitura, vai atribuir o valor do arquivo json e se a atribuição der erro vai da erro
            try {
                const Pessoas = JSON.parse(data)
                //cria uma constante para atribuir o9 valor do objeto jason lido
                callback(null, Pessoas)
                //sempre retorna o null -> acho que seria o erro ou pessoad -> que seria os dados do arquivo json
            } catch (error) {
                callback(err)
                //indus a callback a da erro
            }
        }
    })
}

const server = createServer((request, response) => {
    const { method, url } = request

    //usuarios cadastrarem
    if (method === 'POST' && url === '/pessoas') {

        let body = ''

        request.on('data', (chunk) => {
            body += chunk
        })

        request.on('end', () => {
            if (!body) {
                response.writeHead(400, { 'Content-Type': 'application/json' })
                response.end(JSON.stringify({ message: 'Corpo da solicitação vazio' }))
                return;
            }

            //dddos jason vindos do body
            const NovaPessoa = JSON.parse(body)

            //ler arquivo json pessoas.json
            lerDadosPessoas((err, Pessoas) => {
                if (err) {
                    response.writeHead(500, { 'Content-Type': 'application/json' })
                    response.end(JSON.stringify({ message: 'Erro ao cadastrar pessoa' }))
                }

                NovaPessoa.id = Pessoas.length + 1
                Pessoas.push(NovaPessoa)
                //adicionar a o arquivo json os dados vindos do body


                //escrever no arquivo json
                writeFile('Pessoas.json', JSON.stringify(Pessoas, null, 2), (err) => {
                    if (err) {
                        response.writeHead(500, { 'Content-Type': 'application/json' })
                        response.end(JSON.stringify({ message: 'Erro ao cadastrar pessoa' }))
                        return
                    }

                    response.writeHead(201, { 'Content-Type': 'application/json' })
                    response.end(JSON.stringify(NovaPessoa))
                })
            })
        })
    }
    //usuarios cadastrem um endereço a uma pessoa
    if (method === 'POST' && url.startsWith('/pessoas/endereco/')) {

        console.log(`${method} ${url}`)

        
        const idPessoa = url.split('/')[3]

        console.log(`ID: ${idPessoa}`)

        //ler dados vindos do arquivo json Pessoas.json
        lerDadosPessoas((err, Pessoas) => {

            if (err) {
                response.writeHead(500, { 'Content-Type': 'application/json' })
                response.end(JSON.stringify({ message: 'Erro no servidor' }))
                return
            }

           
        
            let body = "";
            request.on('data', (chunk) => {
                body += chunk
            });
            request.on('end', () => {

                const NovoEndereco = JSON.parse(body)  //requisicao vindos do corpo da aplicaçao

                if(!NovoEndereco){
                    response.writeHead(400, { 'Content-Type': 'application/json' })
                    response.end(JSON.stringify({ message: 'Corpo da requisição vazio' }))
                    return;
                }

                //buscar pessoa por um id especifico
                //findIndex -> busca o indece da pessoa no array, ou seja busca a posição da pessoa no array
                const buscarPessoa = Pessoas.findIndex((pessoa) => pessoa.id == idPessoa)

                console.log(buscarPessoa,"< ===== buscar pessoa")

                //validação ----------
                if(buscarPessoa === -1 ){
                    response.writeHead(404, { 'Content-Type': 'application/json' })
                    response.end(JSON.stringify({ message: 'Erro ao buscar Pessoa, pessoa não existe ' }))
                    return;
                }

                //entrar no  arquivo json Pessoas[] 
                //buscar pessoa -> variavel que armazena a posição do array da pessoa encontrdada pelo id
                Pessoas[buscarPessoa] = {
                    ...Pessoas[buscarPessoa],
                    //os tres pontos é pra selecionar todas as propriedades do objeto
                    endereco: NovoEndereco
                    //atualizar o endereço, para novo endereço
                }

                console.log("buscarPessoa ===>"+ buscarPessoa)

                //escrever as mudanças no arquivo Json Pessoas.json
                writeFile('Pessoas.json', JSON.stringify(Pessoas, null, 2), (err) => {

                    if (err) {
                        response.writeHead(500, { 'Content-Type': 'application/json' })
                        response.end(JSON.stringify({ message: 'Erro ao cadastrar endereço' }))
                        return;
                    }

                    response.writeHead(201, { 'Content-Type': 'application/json' })
                    response.end(JSON.stringify({ usuario: Pessoas[buscarPessoa] }

                    ))
                })
            })
        })
    }



    //listar todos os ususarios
    if (method === 'GET' && url === '/pessoas') {

    }
    //listar apenas uma pessoa
    if (method === 'GET' && url.startsWith('/pessoas/')) {
        const pessoaID = url.split('/')[2]
        console.log(`id: ${pessoaID}`) //tudo certo


        lerDadosPessoas((err, Pessoas) => {
            if (err) {
                response.writeHead(500, { 'Content-Type': 'application/json' })
                response.end(JSON.stringify({ message: 'Erro no servidor' }))
            }

            const pessoaFind = Pessoas.find((pessoa) => pessoa.id == pessoaID)
            console.log(Pessoas)

            if (!pessoaFind) {
                response.writeHead(404, { 'Content-Type': 'application/json' })
                response.end(JSON.stringify({ message: 'Pessoa não encontrada' }))

            } else {
                response.writeHead(200, { 'Content-Type': 'application/json' })
                response.end(JSON.stringify(pessoaFind))
                return;
            }
            response.end()
        })
    }
})

server.listen(PORT, () => {
    console.log(`Servidor on PORt: ${PORT}`)
})