"use client";

import { AuthUser } from "@supabase/supabase-js";
import { Subscription } from "../supabase/supabase.types";
import { createContext, useContext, useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { getUserSubscriptionStatus } from "../supabase/queries";
import { toast, useToast } from "@/components/ui/use-toast";

type SupabaseUserContextType = {
  user: AuthUser | null;
  subscription: Subscription | null;
};

const SupbaseUserContext = createContext<SupabaseUserContextType>({
  user: null,
  subscription: null,
});

export const useSupabaseUser = () => {
  return useContext(SupbaseUserContext);
};
interface SupabaseUserProviderProps {
  children: React.ReactNode;
}
export const SupbaseUserProvider: React.FC<SupabaseUserProviderProps> = ({
  children,
}) => {
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const { toast } = useToast();
  //fetching user details
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        console.log(user);
        setUser(user);
        const { data, error } = await getUserSubscriptionStatus(user.id);
        if (data) setSubscription(data);
        if (error) {
          toast({
            title: "Unexpected Error",
            description: "Opps! An unexpected error Happened.Try again later.",
          });
        }
      }
    };
    getUser();
  }, [supabase, toast]);
  return (
    <SupbaseUserContext.Provider value={{ user, subscription }}>
      {children}
    </SupbaseUserContext.Provider>
  );
};
