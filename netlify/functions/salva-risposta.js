// netlify/functions/salva-risposta.js
// Funzione serverless che salva gli attributi su Brevo in modo sicuro.
// La BREVO_KEY sta nelle Environment Variables di Netlify, MAI nel codice pubblico.

exports.handler = async (event) => {
  const params = event.queryStringParameters || {};
  const r = params.r || '';
  const email = params.e || '';

  if (!email || !r) {
    return { statusCode: 400, body: 'Parametri mancanti' };
  }

  // Mappa parametro → attributo + valore
  const MAPPA = {
    // SPAGNOLO
    sp1: { attr: 'SPAGNOLO', val: 'Non lo parlo' },
    sp2: { attr: 'SPAGNOLO', val: 'Lo capisco' },
    sp3: { attr: 'SPAGNOLO', val: 'Lo parlo bene' },
    // LAVORO
    lav1: { attr: 'LAVORO', val: 'Remote' },
    lav2: { attr: 'LAVORO', val: 'Cerco lavoro' },
    lav3: { attr: 'LAVORO', val: 'Autonomo' },
    // ALLOGGIO
    all1: { attr: 'ALLOGGIO', val: 'Trovato' },
    all2: { attr: 'ALLOGGIO', val: 'Cercando' },
    all3: { attr: 'ALLOGGIO', val: 'Non iniziato' },
    // PREOCCUPAZIONE
    pre1: { attr: 'PREOCCUPAZIONE', val: 'Burocrazia' },
    pre2: { attr: 'PREOCCUPAZIONE', val: 'Soldi' },
    pre3: { attr: 'PREOCCUPAZIONE', val: 'Casa' },
    pre4: { attr: 'PREOCCUPAZIONE', val: 'Lingua' },
    pre5: { attr: 'PREOCCUPAZIONE', val: 'Solitudine' },
    // PIANO FREE → attiva newsletter
    piano_free: { attr: 'NEWSLETTER_ATTIVA', val: 'si' },
  };

  const scelta = MAPPA[r];
  if (!scelta) {
    return { statusCode: 400, body: 'Parametro non valido' };
  }

  const attributi = { [scelta.attr]: scelta.val };

  try {
    const resp = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_KEY,
      },
      body: JSON.stringify({
        email: email,
        attributes: attributi,
        listIds: [5],
        updateEnabled: true,
      }),
    });

    if (!resp.ok && resp.status !== 204) {
      const txt = await resp.text();
      console.error('Brevo error:', txt);
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, attr: scelta.attr, val: scelta.val }),
    };
  } catch (e) {
    console.error('Errore:', e);
    return { statusCode: 500, body: 'Errore salvataggio' };
  }
};
