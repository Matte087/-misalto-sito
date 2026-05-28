// netlify/functions/salva-pro.js
// Salva la scelta PRO (categoria/sport/città) su Brevo in modo sicuro.

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Metodo non consentito' };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: 'Body non valido' };
  }

  const { email, attributi } = body;
  if (!email || !attributi) {
    return { statusCode: 400, body: 'Parametri mancanti' };
  }

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
      body: JSON.stringify({ ok: true }),
    };
  } catch (e) {
    console.error('Errore:', e);
    return { statusCode: 500, body: 'Errore salvataggio' };
  }
};
