const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  const { prompt, mode='text2img', userId } = req.body || {};
  if (!userId) return res.status(400).json({ error: 'Missing userId' });
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) return res.status(500).json({ error: 'Server misconfigured' });

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

  // Check credits
  const { data: creditRow, error: credErr } = await supabase.from('user_credits').select('*').eq('user_id', userId).single();
  if (credErr) return res.status(500).json({ error: 'DB error', detail: credErr.message });
  if (!creditRow || creditRow.credits <= 0) return res.status(403).json({ error: 'No credits' });

  try {
    // Call Gemini (this is a placeholder POST - adjust to your actual endpoint/payload)
    if (!process.env.GEMINI_API_KEY) throw new Error('Missing GEMINI_API_KEY');
    const aiResp = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-image-alpha-1:generateImage?key=' + process.env.GEMINI_API_KEY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: prompt,
        // Add model-specific options here (size, style)
      })
    });
    const aiJson = await aiResp.json();
    // NOTE: adapt parsing to actual Gemini response; this returns a placeholder image for now
    // For now we'll use a placeholder image URL if Gemini doesn't return a usable image directly.
    let imageUrl = aiJson?.data?.[0]?.url || 'https://via.placeholder.com/512';

    // Upload to Supabase Storage if needed (optional)
    // Here we assume Gemini returned a URL; if you get binary, convert and upload.
    const { error: insertErr } = await supabase.from('images').insert({ user_id: userId, public_url: imageUrl });
    if (insertErr) console.error('insert err', insertErr);

    // Deduct 1 credit
    await supabase.from('user_credits').upsert({ user_id: userId, credits: creditRow.credits - 1 });

    return res.status(200).json({ imageUrl, raw: aiJson });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'AI or upload failed', detail: err.message });
  }
};
