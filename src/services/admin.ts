import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const supabase = createClient( 
  SUPABASE_URL!,
  import.meta.env.VITE_SERVICE_ROLE_KEY!);

async function createAdmin() {
  const { data, error } = await supabase.auth.admin.createUser({
    email: "admin@gmail.com",
    password: "superSecure123",
    email_confirm: false,
  });

  if (error) {
    console.error(error);
    return;
  }

  await supabase.from("profiles").insert({
    id: data.user.id,
    role: "admin",
  });

  console.log("Admin created:", data.user);
}

createAdmin();