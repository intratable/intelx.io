import express from 'express';
import fetch from 'node-fetch';
import fs from 'fs';

const app = express();
const port = 3000; 

app.get('/', async (req, res) => {
  const term = req.query.url;

  if (!term) {
    return res.status(400).json({ error: 'falta url' });
  }

  const initialUrl = `https://2.intelx.io/phonebook/search?k=49ba0e2d-244a-4d18-b7ff-159be4e966f0`;
  const headers = {
    "accept": "*/*",
    "accept-language": "es-ES,es;q=0.6",
    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    "sec-ch-ua": "\"Chromium\";v=\"116\", \"Not)A;Brand\";v=\"24\", \"Brave\";v=\"116\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "cross-site",
    "sec-gpc": "1",
  };

  const referrer = "https://phonebook.cz";
  const referrerPolicy = "strict-origin-when-cross-origin";

  const body = JSON.stringify({
    "term": term,
    "maxresults": 100000,
    "media": 0,
    "target": 3,
    "terminate": [null],
    "timeout": 200
  });

  const method = "POST";
  const mode = "cors";
  const credentials = "omit";

  try {
    const response = await fetch(initialUrl, {
      method,
      headers,
      referrer,
      referrerPolicy,
      body,
      mode,
      credentials,
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const id = data.id; 


    const nextUrl = `https://2.intelx.io/phonebook/search/result?k=49ba0e2d-244a-4d18-b7ff-159be4e966f0&id=${id}&limit=10000`;
    const nextResponse = await fetch(nextUrl, {
      method: "GET",
      headers,
      referrer,
      referrerPolicy,
      body: null,
      mode,
      credentials,
    });

    if (!nextResponse.ok) {
      throw new Error(`Error en la segunda solicitud: ${nextResponse.status} ${nextResponse.statusText}`);
    }

    const nextData = await nextResponse.json();

    const selectorValues = nextData.selectors.map(selector => selector.selectorvalue);

    const fileName = `${term}.json`;
    fs.writeFileSync(fileName, JSON.stringify({ selectorValues }));

    res.json({ selectorValues });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

app.listen(port, () => {
  console.log(`puerto ${port}`);
});
