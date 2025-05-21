
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// Import the Python code (FastAPI app)
import { app } from "./index.py"

serve(async (req: Request) => {
  try {
    // Extract environment variables for Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

    // Validate required environment variables
    if (!supabaseUrl) {
      throw new Error("SUPABASE_URL environment variable is not set")
    }
    
    if (!supabaseKey) {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY environment variable is not set")
    }

    // Pass the request to the FastAPI app
    return await app.handle(req)
  } catch (error) {
    console.error("Error handling request:", error)
    return new Response(JSON.stringify({ 
      error: error.message,
      details: "Please ensure all required environment variables are set in your Supabase project"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
})
