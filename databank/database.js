// Importe as dependências necessárias
const { pg_query, pg_query_now, generateRedisKey } = require('./db.js'); // Importe a função pg_query do arquivo db.js
const Redis = require('ioredis');

// Conexão com o Redis
const redisClient = new Redis({
    host: '127.0.0.1',
    port: 6379,
});

// Defina a classe para operações no banco de dados
class DatabaseOperations {


    async searchPlaylist(termo, blococonsultado) {
        try {
            // Dividir o termo de pesquisa em palavras individuais
            const termoArray = termo.split(' ').filter(word => word.trim() !== ''); // Remover espaços em branco desnecessários
            
            // Criar um array contendo cada palavra com '%' ao redor para corresponder a qualquer ocorrência
            const termoLikeArray = termoArray.map(word => '%' + word.toLowerCase() + '%');
            
            // Criar uma string contendo a cláusula WHERE para múltiplas palavras-chave
            const whereClause = termoLikeArray.map((term, index) => `(album ILIKE $${index + 1} OR title ILIKE $${index + 1} OR descricao ILIKE $${index + 1} OR artista ILIKE $${index + 1})`).join(' OR ');
            
            // Unir os termos com OR para procurar qualquer ocorrência de qualquer palavra
            const dieterm = termoLikeArray.join('');
    
            blococonsultado = blococonsultado || 1;
            const zset = (blococonsultado - 1) * 20;
            const sqlEndereco = `SELECT unique_id, title, album, descricao, artista FROM videodata WHERE (${whereClause}) AND private = false OFFSET $${termoLikeArray.length + 1} LIMIT 20`;
            const params = [...termoLikeArray, zset];
    
            const resultadoEndereco = await pg_query_now(sqlEndereco, params);
    
            if (!resultadoEndereco || resultadoEndereco.length === 0) {
                return false; // Retorna falso se não houver endereço correspondente
            }
    
            return resultadoEndereco;
        } catch (error) {
            console.error('Erro ao buscar playlists:', error);
            return false;
        }
    }
    
  // Aqui está o problema... 
  
  async getAleatorios() {
    try {
        const sqlNumero = "SELECT unique_id, title, album, descricao, artista, score, private, uploadby FROM videodata  order by random() limit 25 ";
        const resultadoNumero = await pg_query_now(sqlNumero);
      
        return resultadoNumero || []; // Retorna um array vazio se não houver resultados
        
    } catch (error) {
        console.error('Erro ao gerar uma lista aleatorio', error);
        throw error;
    }
}

async getInfos(unique_id) {

try {
    const sqlNumber = `
        SELECT title,  unique_id, album, descricao, artista  FROM videodata  WHERE unique_id = $1  LIMIT 1;`;
    const resultadoNumber2 = await pg_query_now(sqlNumber, [unique_id]);
    // Verifica se o resultado é um array vazio
    if (!resultadoNumber2 || resultadoNumber2.length === 0) {
        return false; // Retorna falso se não houver resultado correspondente
    }
  //  return resultadoNumber[0]; // Retorna o primeiro resultado encontrado
  return resultadoNumber2

} catch (error) {
    console.error('Erro ao gerar uma lista aleatória', error);
    throw error;
}
}

async  getSomenteum(usuario_id) {
   
        try {
            // Consulta SQL para obter um registro aleatório que atenda aos critérios
            const sqlQuery = `
                SELECT title, unique_id, album, descricao, artista
                FROM videodata
                WHERE (
                    (private = false AND score < 30)
                    OR
                    (
                        (private = false)
                        OR
                        (uploadby = $1)
                    )
                )
                ORDER BY RANDOM()
                LIMIT 1;
            `;
            
            // Função para verificar se um registro existe na tabela lista_conteudo
            const verificarExistencia = async (unique_id) => {
                const sqlVerificacao = `
                    SELECT COUNT(*)
                    FROM lista_conteudo
                    WHERE unique_id = $1;
                `;
                const resultadoVerificacao = await pg_query_now(sqlVerificacao, [unique_id]);
                return resultadoVerificacao[0].count > 0;
            };
    
            let resultadoConsulta;
            let tentativas = 0;
            
            // Loop para tentar encontrar um registro único que não esteja na lista_conteudo
            do {
                resultadoConsulta = await pg_query_now(sqlQuery, [usuario_id]);
                
             //   const registro = resultadoConsulta.rows; // Acessar a primeira linha do resultado
                const existeNaLista = await verificarExistencia(resultadoConsulta.unique_id);
                
                if (!existeNaLista) {
                    console.log("Não existia na lista!!"); 
                    return resultadoConsulta; // Retorna o registro se não existe na lista_conteudo
                }
    
                tentativas++;
            } while (tentativas < 3);
  console.log("Bingo!! Existe na lista"); 
            return resultadoConsulta; // Retorna a última linha encontrada, se não for possível encontrar um novo registro

        } catch (error) {
            console.error('Erro ao gerar uma lista aleatória', error);
            throw error;
        }
    }
    

  
async getAlbumAleatorio() {
    try {
       
        const sqlNumero = "SELECT album FROM albuns ORDER BY random() LIMIT 1";
        const resultadoNumero = await pg_query_now(sqlNumero);
        let  albumAleatorio; 
        if (!resultadoNumero || resultadoNumero.length === 0) {
            resultadoNumero[0].album = 'Enya'; 
            albumAleatorio = []; 
            // Retorna um array vazio se não houver resultados
        } else {albumAleatorio = resultadoNumero[0].album; }

        const sqlNumer2 = "SELECT unique_id, title, album, descricao, artista, score FROM videodata WHERE private = false and album = $1 LIMIT 150";
        const resultadoNumer2 = await pg_query_now(sqlNumer2, [albumAleatorio]);
        
        return resultadoNumer2 || []; // Retorna um array vazio se não houver resultados
    } catch (error) {
        console.error('Erro ao gerar uma lista aleatória', error);
        throw error;
    }
}



/// As funções acima estão corretas, já integradas, falta as de baixo 

  
    async getsearchNew(termo) {
        try {
            termo = termo || 'descabido'; // Termo padrão
            const sqlConsulta = "SELECT unique_id, title, album, descricao, artista, score FROM videodata WHERE (album ILIKE $1 OR title ILIKE $1 OR descricao ILIKE $1 OR artista ILIKE $1) AND private = false LIMIT 100";
            console.log(sqlConsulta); 
            const redisKey = await generateRedisKey(termo, sqlConsulta);
            const cachedVideos = await redisClient.get(redisKey);

            if (cachedVideos) {
                console.log('Dados retornados do cache ' + redisKey);
                return JSON.parse(cachedVideos);
            }

            const resultadoConsulta = await pg_query_now(sqlConsulta, ['%' + termo + '%']);
            await redisClient.set(redisKey, JSON.stringify(resultadoConsulta), 'EX', 150);
            await redisClient.close();
            return resultadoConsulta && resultadoConsulta.length > 0 ? resultadoConsulta : false;
        } catch (erro) {
            throw new Error('Erro ao obter resultados da pesquisa: ' + erro);
        }
    }

    // Método para inserir o ID, o número do vídeo e o unique_id na tabela 'online'
  //  async insertOnline(usuario_id, unique_id) {
  //      try {
   //         const consulta2 = "INSERT INTO online (usuario_id, unique_id) VALUES ($1, $2)";
   //         return await pg_query(consulta2, [usuario_id, unique_id]);
    //    } catch (error) {
    //        console.error('Erro ao inserir dados na tabela online:', error);
    //        throw error;
    //    }
  //  }

    async insertPlaylist(unique_id, usuario_id, playlist_id) {
        try {
           // const sqlEndereco = "SELECT endereco FROM videodata WHERE private = false and unique_id = $1 and usuario_id = $2 LIMIT 1";

            const sqlEndereco = `SELECT endereco  FROM videodata  WHERE unique_id = $1  AND (  (private = false)    OR (usuario_id = $2)    )     LIMIT 1;`;
    

            const resultadoEndereco = await pg_query_now(sqlEndereco, [unique_id, usuario_id]);

            if (!resultadoEndereco || resultadoEndereco.length === 0) {
                return false; // Retorna falso se não houver endereço correspondente
            }

            const consulta2 = "INSERT INTO playlists (unique_id, usuario_id, playlist_name) VALUES ($1, $2, $3)";
            return await pg_query_now(consulta2, [unique_id, usuario_id, playlist_id]);
        } catch (error) {
            console.error('Erro ao inserir playlist:', error);
            throw error;
        }
    }

    async getPlaylist(unique_id, id, Playlist) {
        try {
            const sqlNumero = "SELECT unique_id, playlist_name  FROM playlists WHERE playlist_name = $1 AND unique_id = $2 AND usuario_id = $3 LIMIT 1";
            const resultadoNumero = await pg_query_now(sqlNumero, [Playlist, unique_id, id]);
            return resultadoNumero && resultadoNumero.length > 0;
        } catch (error) {
            console.error('Erro ao verificar se a playlist já está inserida:', error);
            throw error;
        }
    }

    async getVideoAddress(unique_id) {
        try {
            const sqlEndereco = "SELECT endereco FROM videodata WHERE unique_id = $1 LIMIT 1";
            const resultadoEndereco = await pg_query_now(sqlEndereco, [unique_id]);
            return resultadoEndereco && resultadoEndereco.length > 0 ? resultadoEndereco[0].endereco : null;
        } catch (error) {
            console.error('Erro ao buscar endereço do vídeo:', error);
            throw error;
        }
    }
 
async incrementScore(unique_id) {
    try {
        // Consulta para verificar se o unique_id já existe na tabela videodata
        const consultaSelect = "SELECT unique_id, score FROM videodata WHERE unique_id='" + unique_id + "' limit 1";
        const resultado = await pg_query(consultaSelect);

        if (resultado && resultado.length > 0) {
            // O unique_id já existe na tabela, então incrementa o score
          // Consulta para atualizar o score na tabela videodata
                const consultaUpdate = "UPDATE videodata SET score = (score + 1) WHERE unique_id = $1";
                await pg_query_now(consultaUpdate, [unique_id]);
                return true;

            }   else {
            // O unique_id não existe na tabela, então não faz nada
            console.log('unique_id não encontrado na tabela videodata:', unique_id);
            }
    } catch (error) {
        console.error('Erro ao incrementar score:', error);
       // throw error;
    }

}

    async getOnline(id) {
        try {
            id = id || 9999; // ID padrão
            const sqlConsulta = "SELECT o.unique_id, o.quando, o.usuario_id, v.title, v.album, v.artista, v.descricao,  v.score  FROM online o INNER JOIN videodata v ON o.unique_id = v.unique_id WHERE o.usuario_id = $1 order by o.quando desc limit 20";
             const resultadoConsulta = await pg_query_now(sqlConsulta, [id]);
             return resultadoConsulta && resultadoConsulta.length > 0 ? resultadoConsulta : false;
        } catch (erro) {
            throw new Error('Erro ao obter resultados da pesquisa: ' + erro);
        }
    }
}

// Exporte a classe para ser utilizada em outros arquivos
module.exports =DatabaseOperations;  
