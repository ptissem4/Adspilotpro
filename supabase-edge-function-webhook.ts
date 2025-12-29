// Deploy this as a Supabase Edge Function named 'webhook-sio'
// Command: supabase functions deploy webhook-sio

// Fix: Removed problematic deno.ns reference causing compilation errors
/**
 * Fix: Declare Deno global for environments where Deno types are not natively available
 */
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Gestion du CORS (Preflight)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Vérification du secret via l'URL (Query Parameter)
    // Utile car Systeme.io ne permet pas facilement d'ajouter des Headers personnalisés
    const url = new URL(req.url);
    const secret = url.searchParams.get('secret');
    const APP_SECRET = "ADS_PILOT_PRO_2026_SECURE";

    if (secret !== APP_SECRET) {
      console.error("Tentative d'accès non autorisée : secret invalide ou manquant.");
      return new Response(JSON.stringify({ error: 'Unauthorized: Invalid secret in URL' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    // 2. Récupération des données SIO
    // Systeme.io envoie les données en JSON lors d'un webhook de règle d'automatisation
    const body = await req.json()
    const { email, product_id } = body

    if (!email) throw new Error("Email client manquant dans le payload SIO")

    // 3. Initialisation client Supabase avec Service Role (pour bypasser RLS)
    // Fix: Accessing Deno.env which is now recognized via declaration
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const cleanEmail = email.toLowerCase().trim()
    const productTag = product_id || 'PRODUIT_INCONNU'

    console.log(`Traitement achat pour ${cleanEmail} - Produit: ${productTag}`);

    // 4. Recherche du profil existant
    const { data: profile, error: fetchError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('email', cleanEmail)
      .maybeSingle()

    if (fetchError) throw fetchError

    if (profile) {
      // MISE À JOUR : Ajout du produit et changement de statut
      const currentProducts = profile.purchased_products || []
      const newProducts = currentProducts.includes(productTag) 
        ? currentProducts 
        : [...currentProducts, productTag]

      const { error: updateError } = await supabaseClient
        .from('profiles')
        .update({ 
          purchased_products: newProducts,
          status: 'buyer'
        })
        .eq('id', profile.id)

      if (updateError) throw updateError
      console.log(`Profil ${cleanEmail} mis à jour avec succès.`);
    } else {
      // CRÉATION : Si le client achète avant d'avoir créé un compte sur l'app
      const { error: insertError } = await supabaseClient
        .from('profiles')
        .insert({
          email: cleanEmail,
          full_name: 'Client SIO (Attente Inscription)',
          purchased_products: [productTag],
          status: 'buyer',
          role: 'user'
        })

      if (insertError) throw insertError
      console.log(`Nouveau profil créé pour ${cleanEmail} via achat SIO.`);
    }

    return new Response(JSON.stringify({ 
      message: 'Webhook processed successfully',
      email: cleanEmail,
      product: productTag
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    console.error("Erreur Webhook:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})