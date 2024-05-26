// Importe as dependências necessárias
const { pg_query, pg_query_now, generateRedisKey } = require('./db.js'); // Importe a função pg_query do arquivo db.js

// Defina a classe para operações no banco de dados
class DatabaseFavoritos {

    async getSomenteum() {
        try {
        
            const sqlNumber = `SELECT title,  unique_id, album, descricao, artista, private, uploadby   FROM videodata where score <20 ORDER BY RANDOM()  LIMIT 1`;
            const resultadoNumber = await pg_query_now(sqlNumber);
            // Verifica se o resultado é um array vazio
            if (!resultadoNumber || resultadoNumber.length === 0) {
                return false; // Retorna falso se não houver resultado correspondente
            }
            return resultadoNumber[0]; // Retorna o primeiro resultado encontrado
        } catch (error) {
            console.error('Erro ao gerar uma lista aleatória', error);
            throw error;
        }
    }

        async insertPlaylist(usuario_id, playlist_id) {
        try {
            const sqlEndereco = "SELECT usuario_id  FROM lista_principal WHERE usuario_id = $1 and nomedalista = $2 LIMIT 1";
            const resultadoEndereco = await pg_query_now(sqlEndereco, [usuario_id, playlist_id]);

            if (!resultadoEndereco || resultadoEndereco.length === 1) {
                return false; // Retorna falso se já houver endereço correspondente
            }

            const consulta2 = "INSERT INTO lista_principal (usuario_id, nomedalista, totalvideos) VALUES ($1, $2, 0)";
            return await pg_query_now(consulta2, [usuario_id, playlist_id]);
        } catch (error) {
            console.error('Erro ao inserir playlist:', error);
            throw error;
        }
    }


async insertVideos(id, playlist_id, unique_id) {

    // Verificar se o vídeo existe no banco de dados
    const videoExistQuery = 'SELECT tipo FROM videodata WHERE unique_id = $1 AND tipo = $2 AND private = $3';
    const videoExistResult = await pg_query_now(videoExistQuery, [unique_id, 'mp4', false]);

    if (!videoExistResult || videoExistResult.length === 0) {
        return false;
    }

    // Verificar se a playlist existe no banco de dados
    let lista_id;
    const playlistExistQuery = 'SELECT totalvideos, id_lista FROM lista_principal WHERE nomedalista = $1 and usuario_id = $2 ';
    const playlistExistResult = await pg_query_now(playlistExistQuery, [playlist_id, id]);

    if (!playlistExistResult || playlistExistResult.length === 0) {
        return false;
    } else {
        lista_id = playlistExistResult[0].id_lista;
    }

    // Verificar se o vídeo já existe na playlist desejada/
//    const videoInPlaylistQuery = 'SELECT * FROM lista_conteudo WHERE id_lista = $1 AND unique_id = $2';
//    const videoInPlaylistResult = await pg_query_now(videoInPlaylistQuery, [lista_id, unique_id]);

 //   if (videoInPlaylistResult && videoInPlaylistResult.length > 0) {
 //       return false;
 //   }

    // Gravar o registro na lista_conteudo
    const insertQuery = 'INSERT INTO lista_conteudo (id_lista, unique_id) VALUES ($1, $2)';
    const insertResult = await pg_query_now(insertQuery, [lista_id, unique_id]);

    // Retornar positivo se a gravação for bem-sucedida
    return insertResult ? true : false;
}

async sqlparcialVideos(id, playlist_id, offset) {
    let lista_id;

    const playlistExistQuery2 = 'SELECT totalvideos, id_lista FROM lista_principal WHERE UPPER(nomedalista) = UPPER($1) and usuario_id = $2';
    const playlistExistResult2 = await pg_query_now(playlistExistQuery2, [playlist_id, id]);
    if (!playlistExistResult2 || playlistExistResult2.length === 0) {
        return false;
    } else {
        lista_id = playlistExistResult2[0].id_lista; // Corrigido para playlistExistResult2
    }

    const procurarParcial = "SELECT v.unique_id, v.title, v.album, v.descricao, v.artista  FROM lista_conteudo l INNER JOIN videodata v ON v.unique_id = l.unique_id WHERE v.private = false and l.id_lista =" + lista_id + " ORDER BY l.sequencia  OFFSET " + offset + " LIMIT 1";

    const videoInmotionResult = await pg_query_now(procurarParcial); // Ajustado OFFSET


    if (!videoInmotionResult || videoInmotionResult.length === 0) {
        return false;
    }
    //console.log (videoInmotionResult);
    return videoInmotionResult;
}

async sqlDeleteregister(id, playlist_id, unique_id) {
    let lista_id;

    const playlistExistQuery2 = 'SELECT id_lista FROM lista_principal WHERE UPPER(nomedalista) = UPPER($1) AND usuario_id = $2 limit 1';


    try {
        const playlistExistResult2 = await pg_query_now(playlistExistQuery2, [playlist_id, id]);
        if (!playlistExistResult2 || playlistExistResult2.length === 0) {
            console.log("Nada encontrado aqui");
            return false;
        } else {
            lista_id = playlistExistResult2[0].id_lista;
        }

        const deletesql = "DELETE FROM lista_conteudo WHERE id_lista = $1 AND unique_id = $2";

        const deleteforme = await pg_query_now(deletesql, [lista_id, unique_id]);

        return deleteforme;
    } catch (error) {
        console.error("Erro ao executar a consulta SQL:", error);
        return "Erro no sistema";
    }
}


async sqlList (id, playlist_id)

{
     let lista_id;
     const playlistExistQuery3 = 'SELECT id_lista FROM lista_principal WHERE UPPER(nomedalista) = UPPER($1) AND usuario_id = $2 limit 1';

    try {
        const playlistExistResult3 = await pg_query_now(playlistExistQuery3, [playlist_id, id]);
        if (!playlistExistResult3 || playlistExistResult3.length === 0) {
            console.log("Nada encontrado aqui");
            return false;
        } else {
            lista_id = playlistExistResult3[0].id_lista;
        }

        const somentelistas = "SELECT v.unique_id, v.title, v.album, v.descricao, v.artista, l.quando, l.sequencia  from videodata v inner join lista_conteudo l on l.unique_id = v.unique_id WHERE l.id_lista = $1 and v.private = false order by l.quando desc";
        const querolistas = await pg_query_now(somentelistas, [lista_id]);
       if (!querolistas || querolistas.length === 0) {
        return false;
    }
              return querolistas;
    } catch (error) {
        console.error("Erro ao executar a consulta SQL:", error);
        return "Erro no sistema";
    }



}




}

// Exporte a classe para ser utilizada em outros arquivos
module.exports =DatabaseFavoritos;


