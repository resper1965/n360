/**
 * Tickets Routes
 * CRUD para sistema de tickets
 */

const express = require('express');
const router = express.Router();

module.exports = (supabase) => {
  
  // GET /api/tickets
  router.get('/', async (req, res) => {
    try {
      const orgId = req.query.org_id || '550e8400-e29b-41d4-a716-446655440000';
      const status = req.query.status;
      
      let query = supabase
        .from('tickets')
        .select(`
          *,
          created_by:user_profiles!tickets_created_by_fkey(full_name),
          assigned_to:user_profiles!tickets_assigned_to_fkey(full_name)
        `)
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });
      
      if (status) {
        query = query.eq('status', status);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      res.json({ tickets: data || [] });
      
    } catch (error) {
      console.error('[Tickets] Error:', error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // POST /api/tickets
  router.post('/', async (req, res) => {
    try {
      const { org_id, title, description, type, priority, created_by } = req.body;
      
      const { data, error } = await supabase
        .from('tickets')
        .insert({
          org_id: org_id || '550e8400-e29b-41d4-a716-446655440000',
          title,
          description,
          type: type || 'incident',
          priority: priority || 'medium',
          created_by,
          status: 'open'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      res.json({ ticket: data });
      
    } catch (error) {
      console.error('[Tickets] Error creating:', error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // PUT /api/tickets/:id
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const { data, error } = await supabase
        .from('tickets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      res.json({ ticket: data });
      
    } catch (error) {
      console.error('[Tickets] Error updating:', error);
      res.status(500).json({ error: error.message });
    }
  });
  
  return router;
};

