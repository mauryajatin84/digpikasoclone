const { createClient } = require('@supabase/supabase-js');
module.exports = async (req, res) => {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) return res.status(500).send('Server misconfigured');
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  try {
    await supabase.from('user_credits').update({ credits: 100, updated_at: new Date().toISOString() }).neq('credits', 100);
    return res.status(200).send('Credits reset');
  } catch (err) {
    console.error(err);
    return res.status(500).send('Reset failed');
  }
};
