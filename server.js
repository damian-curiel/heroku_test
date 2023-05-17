//Servidor simple express
const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');


const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));  //configurar el servidor para servir archivos estáticos desde la carpeta public


app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/auth', (req, res) => {
    const paymentToken = req.body.token;  // Obteniendo token ahora de pagos, desde front
  
    const options = {
      method: 'POST',
      url: 'https://api-uat.kushkipagos.com/card/v1/preAuthorization',
      headers: {
          'content-type': 'application/json',
          'Private-Merchant-Id': 'e9c24c228dbc44839bb65c7238d90b2d' 
      },
      body: {
          token: paymentToken,  // Reemplaza esto por el token obtenido
          amount: {
              subtotalIva: 0,
              subtotalIva0: 6000,
              ice: 0,
              iva: 0,
              currency: 'MXN'
          },
          orderDetails: {
              siteDomain: 'LuisMiguel.com',
              shippingDetails: {
                  name: 'Damian Curiel',
                  phone: '+525539175717',
                  address: 'Jose Luis Lagrange 103',
                  city: 'polanco',
                  region: 'cdmx',
                  country: 'México',
                  zipCode: '11510'
              },
              billingDetails: {
                name: 'Damian Curiel',
                phone: '+525539175717',
                address: 'Jose Luis Lagrange 103',
                city: 'polanco',
                region: 'cdmx',
                country: 'México',
                zipCode: '11510'
              }
          },
          fullResponse: true
      },
      json: true
    };
  
    request(options, (error, response, body) => {
        if (error) {
          res.status(500).send('Error en la pre-autorización');
          throw new Error(error);
        } else {
          res.status(200).send(body);
          console.log(body);
        }
      });
    });

    //Código para realizar la captura de la preautorización
    app.post('/capture', async (req, res) => {
        const { ticketNumber, amount } = req.body;
      
        const fetch = await import('node-fetch');
        const response = await fetch.default('https://api-uat.kushkipagos.com/card/v1/capture', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Private-Merchant-Id': 'e9c24c228dbc44839bb65c7238d90b2d', // llave privada
          },
          body: JSON.stringify({
            ticketNumber,
            amount: {
                currency: 'MXN',
                subtotalIva: 0,
                iva: 0,
                subtotalIva0: 6000
              },
            fullResponse: true,
          }),
        });
      
        const data = await response.json();
      
        res.json(data);
      });
      
          //Código para anular la preautorización
      app.post('/void', async (req, res) => {
        const { ticketNumber, amount } = req.body;
      
        const fetch = await import('node-fetch');
        const response = await fetch.default(`https://api-uat.kushkipagos.com/v1/charges/${ticketNumber}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Private-Merchant-Id': 'e9c24c228dbc44839bb65c7238d90b2d', // llave privada
          },
        });
      
        const data = await response.json();
      
        res.json(data);
      });

app.listen(3000, () => console.log('App listening on port 3000!'));