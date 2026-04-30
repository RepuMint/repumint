import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BusinessSetupForm } from "./_components/business-form";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ addBusiness?: string }>;
}) {
  const { addBusiness } = await searchParams;
  const isAddingBusiness = addBusiness === "true";

  if (!isAddingBusiness) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase
        .from("businesses")
        .select("id")
        .eq("owner_id", user.id)
        .eq("onboarding_completed", true)
        .maybeSingle();

      if (data) redirect("/dashboard");
    }
  }

  return <BusinessSetupForm isAddingBusiness={isAddingBusiness} />;
}
