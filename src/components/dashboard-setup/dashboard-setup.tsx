"use client";
import { AuthUser } from "@supabase/supabase-js";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { v4 } from "uuid";
import EmojiPicker from "../global/emoji-picker";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  FieldValue,
  FieldValues,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { Subscription, workspace } from "@/lib/supabase/supabase.types";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useAppState } from "@/lib/providers/state-providers";
import { useToast } from "../ui/use-toast";
import { createWorkspace } from "@/lib/supabase/queries";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import Loader from "../loader";
interface DashboardSetupProps {
  user: AuthUser;
  subscription: Subscription | null;
}

export const DashboardSetup: React.FC<DashboardSetupProps> = ({
  subscription,
  user,
}) => {
  const [selectedEmoji, setSelectedEmoji] = React.useState("💼");
  // Create a Supabase client instance
  const supabase = createClientComponentClient();
  const { toast } = useToast();
  const { dispatch } = useAppState();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting: isLoading, errors },
  } = useForm<FieldValues>({
    mode: "onChange",
    defaultValues: {
      logo: "",
      workspaceName: "",
    },
  });
  // Define the form submission logic
  const onSubmit: SubmitHandler<FieldValues> = async (value) => {
    //get the file itself
    const file = value.logo?.[0];
    ////creating the path
    let filePath = null;
    //get a new valid ID
    const workspaceUUID = v4();

    // Check if a file (logo) is provided and handle its upload
    if (file) {
      try {
        //uploading to buckets
        const fileUUID = v4();
        const { data, error } = await supabase.storage
          .from("workspace-logos")
          .upload(`workspaceLogo.${workspaceUUID}.${fileUUID}`, file, {
            //1 minute
            cacheControl: "3600",
            //overwrite if exists
            upsert: false,
          });
        if (error) throw new Error("");
        //set new file path
        filePath = data.path;
      } catch (storageError) {
        console.log(storageError);
        toast({
          variant: "destructive",
          title: "Error! Could not upload your workspace picture",
        });
      }
    }
  };

  return (
    <Card className="w-[800px] h-screen sm:h-auto">
      <CardHeader>
        <CardTitle>Create A Workspace</CardTitle>
        <CardDescription>
          Lets create a private workspace to get you started.You can add
          collaborators later from the workspace settings tab.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-4">
            <div className="text-5xl">
              <EmojiPicker
                getValue={(emoji) => {
                  setSelectedEmoji(emoji);
                }}
              >
                {selectedEmoji}
              </EmojiPicker>
            </div>
            <div className="w-full">
              <Label
                htmlFor="workspaceName"
                className="text-sm text-muted-foreground"
              >
                Name
              </Label>
              <Input
                id="workspaceName"
                type="text"
                placeholder="Workspace Name"
                disabled={isLoading}
                {...register("WorkspaceName", {
                  required: "Workspace name is required",
                })}
              />
              <small className="text-red-600">
                {errors?.workspaceName?.message?.toString()}
              </small>
            </div>
            <div>
              <Label htmlFor="logo" className="text-sm text-muted-foreground">
                Workspace Logo
              </Label>
              <Input
                id="workspaceLogo"
                type="file"
                accept="image/*"
                placeholder="Workspace Name"
                disabled={isLoading || subscription?.status !== "active"}
                {...register("logo", {
                  required: "Workspace name is required",
                })}
              />
              <small className="text-red-600">
                {errors?.logo?.message?.toString()}
              </small>
            </div>
            <div className="self-end">
              <Button disabled={isLoading} type="submit">
                {!isLoading ? "Create Workspace" : <Loader />}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
