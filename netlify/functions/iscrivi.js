// netlify/functions/iscrivi.js
// Iscrive un contatto e/o aggiorna i suoi attributi su Brevo in modo sicuro.
// La chiave Brevo vive SOLO in process.env.BREVO_KEY (variabile Netlify), MAI nel codice.

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
  if (!email) {
    return { statusCode: 400, body: 'Email mancante' };
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
        attributes: attributi || {},
        listIds: [5],
        updateEnabled: true,
      }),
    });

    // 201 = creato, 204 = aggiornato, 400 duplicate = già esiste (ok lo stesso)
    if (!resp.ok && resp.status !== 204) {
      const txt = await resp.text();
      // Se è un duplicato, non è un errore: il contatto esiste già
      if (!txt.includes('duplicate_parameter')) {
        console.error('Brevo error:', txt);
        return { statusCode: 502, body: 'Errore Brevo' };
      }
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
