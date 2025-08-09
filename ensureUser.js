const { createClient } = require('@supabase/supabase-js');
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  const { userId, email } = req.body || {};
  if (!userId) return res.status(400).json({ error: 'Missing userId' });
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  try {
    // create credit row if missing
    const { data } = await supabase.from('user_credits').select('*').eq('user_id', userId).single();
    if (!data) {
      await supabase.from('user_credits').insert({ user_id: userId, credits: 100 });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};
