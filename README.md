# Socket-API

API criada com o propósito de fornecer eventos em Tempo Real através de uma Arquitetura construida com Node.JS e Socket.IO.

## Como usar em seus Clients:

- Conecte seu Client através de Sockets utilizando o socket.io-client:

```js
const socket = io('https://tunnel.d3t.com.br', 
  {
    extraHeaders: {
      domain: 'IP da sua API de Destino',
      authorization: 'Código o qual seus Clients são Autenticados'
    }
  }
);
```

- Crie uma função para receber Eventos:

```js
socket.on('observer', async (data) => {
  console.log(data, 'event return')
});
```
- Crie uma função para enviar dados através de um Evento:

```js
const emit = () => {
  const data = {
    // Método HTTP o qual a API irá executar.
    method: 'POST',
    endpoint: '/chat/new_message',
    
    // O que você deseja enviar caso necessite.
    content: {
      receive_id: 3,
      message: 'Teste'
    }
  }
  
  socket.emit('event', data);
};
```

## Como usar em sua API de Destino:

- Sua API receberá uma Request de acordo com o que seus Clientes enviarão.
- Para emitir outro Evento basta enviar uma Request com a seguinte estrutura:

```js
{
   content: 'Conteúdo o qual deseja retornar. Seja um Objeto/Array ou String',
   sockets: {
      clients: ['Código de Autorização o qual seus Clients estão conectados']
   }
}
```
